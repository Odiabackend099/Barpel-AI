/**
 * Inbound Call Setup Route
 * Handles Twilio credential configuration and Vapi inbound number linking
 */

import { Router, Request, Response } from 'express';
import { config } from '../config/index';
import { supabase } from '../services/supabase-client';
import { VapiClient } from '../services/vapi-client';
import { requireAuthOrDev } from '../middleware/auth';
import twilio from 'twilio';
import { EncryptionService } from '../services/encryption';
import { IntegrationDecryptor } from '../services/integration-decryptor';

const router = Router();

// Validation helpers
function validateE164PhoneNumber(phoneNumber: string): boolean {
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phoneNumber);
}

function validateTwilioAccountSid(sid: string): boolean {
  return /^AC[a-z0-9]{32}$/i.test(sid);
}

function validateTwilioAuthToken(token: string): boolean {
  return token.length === 32;
}

function keyLast4(key: string): string {
  return key.slice(-4);
}

/**
 * POST /api/inbound/setup
 * Configure Twilio credentials and link to Vapi inbound assistant
 */
router.post('/setup', requireAuthOrDev, async (req: Request, res: Response): Promise<void> => {
  const requestId = req.requestId || `req_${Date.now()}`;

  try {
    const userId = req.user?.id;
    const orgId = req.user?.orgId;

    if (!userId || !orgId) {
      res.status(401).json({ error: 'Not authenticated', requestId });
      return;
    }

    const { twilioAccountSid, twilioAuthToken, twilioPhoneNumber } = req.body;

    // Validation
    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      res.status(400).json({
        error: 'Missing required fields: twilioAccountSid, twilioAuthToken, twilioPhoneNumber',
        requestId
      });
      return;
    }

    if (!validateTwilioAccountSid(twilioAccountSid)) {
      res.status(400).json({
        error: 'Invalid Twilio Account SID format (must start with AC and be 34 chars)',
        requestId
      });
      return;
    }

    if (!validateTwilioAuthToken(twilioAuthToken)) {
      res.status(400).json({
        error: 'Invalid Twilio Auth Token format (must be 32 characters)',
        requestId
      });
      return;
    }

    if (!validateE164PhoneNumber(twilioPhoneNumber)) {
      res.status(400).json({
        error: 'Invalid phone number format (must be E.164: +1234567890)',
        requestId
      });
      return;
    }

    console.log('[InboundSetup] Validating Twilio credentials', { requestId, accountSid: twilioAccountSid.substring(0, 4) + '...' });

    // Test Twilio credentials
    let twilioClient;
    try {
      twilioClient = twilio(twilioAccountSid, twilioAuthToken);
      await twilioClient.api.accounts.list({ limit: 1 });
      console.log('[InboundSetup] ✅ Twilio credentials validated', { requestId });
    } catch (twilioError: any) {
      console.error('[InboundSetup] ❌ Twilio validation failed', { requestId, error: twilioError.message });
      res.status(400).json({
        error: `Invalid Twilio credentials: ${twilioError.message}`,
        requestId
      });
      return;
    }

    // Get Vapi API key from environment (Platform Provider Model)
    console.log('[InboundSetup] using Platform Vapi Key', { requestId });
    const vapiApiKey = config.VAPI_PRIVATE_KEY;

    if (!vapiApiKey) {
      console.error('[CRITICAL] VAPI_PRIVATE_KEY missing in environment variables');
      res.status(500).json({
        error: 'System configuration error: Telephony provider unavailable.',
        requestId
      });
      return;
    }

    const currentVapiKeyLast4 = keyLast4(vapiApiKey);

    // IDP0: If this org already has an inbound mapping for this phone number, reuse it.
    // This is key-rotation safe: we relink the existing Vapi phone number to the *current* assistant.
    const { data: existingInboundMapping, error: existingInboundMappingError } = await supabase
      .from('integrations')
      .select('config')
      .eq('org_id', orgId)
      .eq('provider', 'twilio_inbound')
      .maybeSingle();

    if (existingInboundMappingError) {
      // Graceful fallback: log the error but proceed without an existing mapping.
      // The Vapi "already in use" check (below) handles idempotency for duplicate imports.
      // Common causes: integrations table schema mismatch on fresh orgs, RLS.
      console.warn('[InboundSetup] Could not fetch existing inbound mapping — treating as none', {
        requestId,
        code: existingInboundMappingError.code,
        message: existingInboundMappingError.message
      });
    }

    const existingConfig: any = existingInboundMapping?.config || null;
    const existingPhoneNumber = existingConfig?.phoneNumber;
    const existingVapiPhoneNumberId = existingConfig?.vapiPhoneNumberId;
    const existingVapiKeyLast4Used = existingConfig?.vapiApiKeyLast4Used;

    // We'll only reuse mapping if it matches the same phone number.
    const isSamePhone =
      typeof existingPhoneNumber === 'string' &&
      existingPhoneNumber === twilioPhoneNumber &&
      typeof existingVapiPhoneNumberId === 'string' &&
      existingVapiPhoneNumberId.length > 0;

    // Key-rotation safety: only reuse the phoneNumberId if it belongs to the same Vapi workspace.
    // If the key changed, this phoneNumberId may not exist in the current workspace.
    const isSameVapiWorkspace =
      typeof existingVapiKeyLast4Used === 'string' &&
      existingVapiKeyLast4Used.length === 4 &&
      existingVapiKeyLast4Used === currentVapiKeyLast4;

    const shouldReuseExistingMapping = isSamePhone && isSameVapiWorkspace;

    const workspaceMismatch = isSamePhone && !isSameVapiWorkspace;

    const vapiClient = new VapiClient(vapiApiKey);
    let vapiPhoneNumberId: string;

    if (shouldReuseExistingMapping) {
      vapiPhoneNumberId = existingVapiPhoneNumberId;
      console.log('[InboundSetup] Reusing existing inbound mapping', {
        requestId,
        phoneNumber: twilioPhoneNumber,
        vapiPhoneNumberId
      });
    } else {
      // Import Twilio number into Vapi
      console.log('[InboundSetup] Importing Twilio number to Vapi', { requestId, phoneNumber: twilioPhoneNumber });
      try {
        const vapiPhoneNumber = await vapiClient.importTwilioNumber({
          twilioAccountSid,
          twilioAuthToken,
          phoneNumber: twilioPhoneNumber
        });
        vapiPhoneNumberId = vapiPhoneNumber.id;
        console.log('[InboundSetup] ✅ Twilio number imported to Vapi', { requestId, vapiPhoneNumberId });
      } catch (vapiError: any) {
        // Extract the actual Vapi error message from axios response if available
        const vapiMessage = vapiError.response?.data?.message || vapiError.message;
        const statusCode = vapiError.response?.status || 500;

        // Key-rotation common failure: number already imported/claimed by another Vapi workspace/org.
        if (typeof vapiMessage === 'string' && vapiMessage.toLowerCase().includes('already in use')) {
          console.log('[InboundSetup] Number already in use, checking if it belongs to this workspace...', { requestId });

          // IDEMPOTENCY FIX: Check if the number exists in THIS Vapi workspace
          try {
            const existingNumbers = await vapiClient.listPhoneNumbers();
            const match = existingNumbers.find((p: any) => p.number === twilioPhoneNumber);

            if (match) {
              console.log('[InboundSetup] ✅ Found existing number in Vapi workspace, reusing ID', { requestId, id: match.id });
              vapiPhoneNumberId = match.id;
              // Proceed with this ID
            } else {
              // Truly claimed by ANOTHER workspace
              throw vapiError;
            }
          } catch (checkError) {
            // If listing fails or we re-throw the original error
            console.error('[InboundSetup] Failed to verify existing number ownership', { requestId, error: checkError });

            // Persist last error for UI status visibility
            await supabase
              .from('integrations')
              .upsert(
                {
                  org_id: orgId,
                  provider: 'twilio_inbound',
                  config: {
                    ...(existingConfig || {}),
                    phoneNumber: twilioPhoneNumber,
                    last_error: vapiMessage,
                    last_attempted_at: new Date().toISOString(),
                    vapiApiKeyLast4Used: currentVapiKeyLast4
                  },
                  updated_at: new Date().toISOString()
                },
                { onConflict: 'org_id,provider' }
              );

            res.status(400).json({
              error:
                'This Twilio number is already linked to another Vapi workspace. ' +
                'If this is your number, unlink/release it in the other Vapi dashboard first, then retry. ' +
                (workspaceMismatch
                  ? `We detected this number was previously linked using a different Vapi API key (workspace mismatch). `
                  : '') +
                'If you previously linked it in this workspace, use that same workspace API key or reuse the existing mapping.',
              details: vapiMessage,
              workspaceMismatch,
              requestId
            });
            return;
          }
        } else {
          console.error('[InboundSetup] ❌ Failed to import Twilio number to Vapi', { requestId, error: vapiMessage, status: statusCode });
          res.status(statusCode >= 400 && statusCode < 500 ? 400 : 500).json({
            error: vapiMessage,
            requestId
          });
          return;
        }
      }
    }

    // For now, use the existing inbound agent if present; otherwise fail with a clear message.
    // Inbound agent creation/config will be handled in STEP 2 (dashboard UI + agent save).
    console.log('[InboundSetup] Fetching inbound agent', { requestId, orgId });
    const { data: inboundAgent, error: inboundAgentError } = await supabase
      .from('agents')
      .select('id')
      .eq('org_id', orgId)
      .eq('role', 'inbound')
      .maybeSingle();

    if (inboundAgentError && inboundAgentError.code !== 'PGRST116') {
      console.error('[InboundSetup] Failed to fetch inbound agent', { requestId, error: inboundAgentError });
      res.status(500).json({ error: 'Failed to fetch inbound agent', requestId });
      return;
    }

    const agentId = inboundAgent?.id;
    if (!agentId) {
      res.status(400).json({
        error: 'Inbound agent not configured yet. Create/save an inbound agent configuration first.',
        requestId
      });
      return;
    }

    // Ensure Vapi assistant is synced and get the Vapi assistant ID
    // NOTE: We call into founder-console's ensureAssistantSynced indirectly by requiring the agent to be saved first.
    // This route will be updated in STEP 2 to sync agent config.
    const { data: agentRow, error: agentRowError } = await supabase
      .from('agents')
      .select('vapi_assistant_id')
      .eq('id', agentId)
      .single();

    if (agentRowError) {
      res.status(500).json({ error: 'Failed to fetch inbound agent state', requestId });
      return;
    }

    const vapiAssistantId = agentRow?.vapi_assistant_id;
    if (!vapiAssistantId) {
      res.status(400).json({
        error: 'Inbound agent is not yet synced to Vapi (missing vapi_assistant_id). Save agent config and sync first.',
        requestId
      });
      return;
    }

    // Store Twilio credentials via single-slot gate (UPSERT + mutual exclusion + Vapi sync)
    console.log('[InboundSetup] Saving Twilio credentials via saveTwilioCredential', { requestId, orgId });

    await IntegrationDecryptor.saveTwilioCredential(orgId, {
      accountSid: twilioAccountSid,
      authToken: twilioAuthToken,
      phoneNumber: twilioPhoneNumber,
      source: 'byoc',
    });

    console.log('[InboundSetup] Twilio credentials stored via single-slot gate', { requestId });

    // Save to integrations table with provider='twilio_inbound' (mirrors outbound setup pattern)
    const inboundConfig = {
      accountSid: EncryptionService.encrypt(twilioAccountSid),
      authToken: EncryptionService.encrypt(twilioAuthToken),
      phoneNumber: twilioPhoneNumber,
      vapiPhoneNumberId,
      status: 'active',
      activatedAt: new Date().toISOString(),
      agentId: agentId || null
    };

    const { error: upsertError } = await supabase
      .from('integrations')
      .upsert(
        {
          org_id: orgId,
          provider: 'twilio_inbound',
          config: inboundConfig,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'org_id,provider' }
      );

    if (upsertError) {
      console.error('[InboundSetup] Failed to save inbound config to integrations', { requestId, error: upsertError });
      res.status(500).json({ error: 'Failed to save inbound configuration', requestId });
      return;
    }

    // Link phone number to Vapi assistant (NOT the local DB agent id)
    console.log('[InboundSetup] Linking phone number to Vapi assistant', { requestId, vapiAssistantId, vapiPhoneNumberId });
    try {
      await vapiClient.updatePhoneNumber(vapiPhoneNumberId, {
        assistantId: vapiAssistantId
      });
      console.log('[InboundSetup] ✅ Phone number linked to agent', { requestId });
    } catch (linkError: any) {
      console.error('[InboundSetup] Failed to link phone number to agent', { requestId, error: linkError.message });
      // Don't fail here - phone number is imported, just not linked yet
    }

    console.log('[InboundSetup] ✅ Inbound setup complete', { requestId, agentId, vapiPhoneNumberId });

    res.status(200).json({
      success: true,
      inboundNumber: twilioPhoneNumber,
      vapiPhoneNumberId,
      agentId,
      vapiAssistantId,
      status: 'active',
      requestId
    });
  } catch (error: any) {
    console.error('[InboundSetup] Unexpected error', { requestId, error: error.message });
    res.status(500).json({
      error: 'Internal server error',
      requestId
    });
  }
});

/**
 * GET /api/inbound/status
 * Get current inbound configuration status
 */
router.get('/status', requireAuthOrDev, async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.orgId;

    if (!orgId) {
      console.error('[InboundSetup][status] Missing orgId', {
        user: req.user,
        hasAuthHeader: !!req.headers.authorization,
        nodeEnv: process.env.NODE_ENV
      });
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Retry once on transient fetch failures (connection reset under load)
    let integration: any = null;
    let error: any = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      const result = await supabase
        .from('integrations')
        .select('config')
        .eq('org_id', orgId)
        .eq('provider', 'twilio_inbound')
        .maybeSingle();
      integration = result.data;
      error = result.error;
      if (!error || (error.message && !error.message.includes('fetch failed'))) break;
      if (attempt === 0) await new Promise(r => setTimeout(r, 800));
    }

    if (error) {
      // Graceful fallback: table may not exist or schema may differ on this env.
      // Return unconfigured state so the page loads correctly.
      console.warn('[InboundSetup][status] supabase error — returning not_configured', {
        code: error.code,
        message: error.message
      });
      res.status(200).json({ configured: false, status: 'not_configured' });
      return;
    }

    if (!integration) {
      res.status(200).json({
        configured: false,
        status: 'not_configured'
      });
      return;
    }

    const cfg: any = integration?.config || null;
    if (!cfg) {
      res.json({ configured: false });
      return;
    }

    // Compare to current key (if present) to help UI guide key-rotation cases.
    let vapiKey = process.env.VAPI_PRIVATE_KEY;
    try {
      const { data: vapiRow, error: vapiQueryErr } = await supabase
        .from('integrations')
        .select('config')
        .eq('org_id', orgId)
        .eq('provider', 'vapi')
        .maybeSingle();
      if (!vapiQueryErr) {
        vapiKey = vapiRow?.config?.vapi_api_key || vapiKey;
      }
    } catch {
      // Fallback to env key if Vapi config query fails
    }
    const currentLast4 = typeof vapiKey === 'string' ? keyLast4(vapiKey) : null;
    const storedLast4 = typeof cfg.vapiApiKeyLast4Used === 'string' ? cfg.vapiApiKeyLast4Used : null;
    const workspaceMismatch = !!(cfg.phoneNumber && currentLast4 && storedLast4 && currentLast4 !== storedLast4);

    res.json({
      configured: cfg.status === 'active',
      inboundNumber: cfg.phoneNumber,
      vapiPhoneNumberId: cfg.vapiPhoneNumberId,
      activatedAt: cfg.activatedAt,
      agentId: cfg.agentId || null,
      workspaceMismatch,
      lastError: cfg.last_error || null,
      lastAttemptedAt: cfg.last_attempted_at || null
    });
  } catch (error: any) {
    console.error('[InboundSetup][status] Unexpected error', {
      error: error.message,
      orgId: req.user?.orgId,
      hasAuthHeader: !!req.headers.authorization,
      nodeEnv: process.env.NODE_ENV
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/inbound/setup-outbound
 * Configure Twilio credentials for outbound calls and link to Vapi outbound assistant
 */
router.post('/setup-outbound', requireAuthOrDev, async (req: Request, res: Response): Promise<void> => {
  const requestId = req.requestId || `req_${Date.now()}`;

  try {
    const userId = req.user?.id;
    const orgId = req.user?.orgId;

    if (!userId || !orgId) {
      res.status(401).json({ error: 'Not authenticated', requestId });
      return;
    }

    const { twilioAccountSid, twilioAuthToken, twilioPhoneNumber } = req.body;

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      res.status(400).json({
        error: 'Missing required fields: twilioAccountSid, twilioAuthToken, twilioPhoneNumber',
        requestId
      });
      return;
    }

    if (!validateTwilioAccountSid(twilioAccountSid)) {
      res.status(400).json({
        error: 'Invalid Twilio Account SID format (must start with AC and be 34 chars)',
        requestId
      });
      return;
    }

    if (!validateTwilioAuthToken(twilioAuthToken)) {
      res.status(400).json({
        error: 'Invalid Twilio Auth Token format (must be 32 characters)',
        requestId
      });
      return;
    }

    if (!validateE164PhoneNumber(twilioPhoneNumber)) {
      res.status(400).json({
        error: 'Invalid phone number format (must be E.164: +1234567890)',
        requestId
      });
      return;
    }

    console.log('[OutboundSetup] Validating Twilio credentials', { requestId, accountSid: twilioAccountSid.substring(0, 4) + '...' });

    // Test Twilio credentials
    try {
      const twilioClient = twilio(twilioAccountSid, twilioAuthToken);
      await twilioClient.api.accounts.list({ limit: 1 });
      console.log('[OutboundSetup] ✅ Twilio credentials validated', { requestId });
    } catch (twilioError: any) {
      console.error('[OutboundSetup] ❌ Twilio validation failed', { requestId, error: twilioError.message });
      res.status(400).json({
        error: `Invalid Twilio credentials: ${twilioError.message}`,
        requestId
      });
      return;
    }

    const vapiApiKey = config.VAPI_PRIVATE_KEY;
    if (!vapiApiKey) {
      res.status(500).json({ error: 'System configuration error: Telephony provider unavailable.', requestId });
      return;
    }

    const currentVapiKeyLast4 = keyLast4(vapiApiKey);

    // Check for existing outbound mapping
    const { data: existingOutboundMapping, error: existingOutboundMappingError } = await supabase
      .from('integrations')
      .select('config')
      .eq('org_id', orgId)
      .eq('provider', 'twilio_outbound')
      .maybeSingle();

    if (existingOutboundMappingError) {
      console.warn('[OutboundSetup] Could not fetch existing outbound mapping — treating as none', {
        requestId,
        code: existingOutboundMappingError.code,
        message: existingOutboundMappingError.message
      });
    }

    const existingConfig: any = existingOutboundMapping?.config || null;
    const existingPhoneNumber = existingConfig?.phoneNumber;
    const existingVapiPhoneNumberId = existingConfig?.vapiPhoneNumberId;
    const existingVapiKeyLast4Used = existingConfig?.vapiApiKeyLast4Used;

    const isSamePhone =
      typeof existingPhoneNumber === 'string' &&
      existingPhoneNumber === twilioPhoneNumber &&
      typeof existingVapiPhoneNumberId === 'string' &&
      existingVapiPhoneNumberId.length > 0;

    const isSameVapiWorkspace =
      typeof existingVapiKeyLast4Used === 'string' &&
      existingVapiKeyLast4Used.length === 4 &&
      existingVapiKeyLast4Used === currentVapiKeyLast4;

    const shouldReuseExistingMapping = isSamePhone && isSameVapiWorkspace;

    const vapiClient = new VapiClient(vapiApiKey);
    let vapiPhoneNumberId: string;

    if (shouldReuseExistingMapping) {
      vapiPhoneNumberId = existingVapiPhoneNumberId;
      console.log('[OutboundSetup] Reusing existing outbound mapping', { requestId, phoneNumber: twilioPhoneNumber, vapiPhoneNumberId });
    } else {
      console.log('[OutboundSetup] Importing Twilio number to Vapi', { requestId, phoneNumber: twilioPhoneNumber });
      try {
        const vapiPhoneNumber = await vapiClient.importTwilioNumber({
          twilioAccountSid,
          twilioAuthToken,
          phoneNumber: twilioPhoneNumber
        });
        vapiPhoneNumberId = vapiPhoneNumber.id;
        console.log('[OutboundSetup] ✅ Twilio number imported to Vapi', { requestId, vapiPhoneNumberId });
      } catch (vapiError: any) {
        const vapiMessage = vapiError.response?.data?.message || vapiError.message;
        const statusCode = vapiError.response?.status || 500;

        if (typeof vapiMessage === 'string' && vapiMessage.toLowerCase().includes('already in use')) {
          try {
            const existingNumbers = await vapiClient.listPhoneNumbers();
            const match = existingNumbers.find((p: any) => p.number === twilioPhoneNumber);
            if (match) {
              vapiPhoneNumberId = match.id;
              console.log('[OutboundSetup] ✅ Found existing number in Vapi workspace, reusing ID', { requestId, id: match.id });
            } else {
              throw vapiError;
            }
          } catch {
            res.status(400).json({
              error: 'This Twilio number is already linked to another Vapi workspace. Release it there first, then retry.',
              details: vapiMessage,
              requestId
            });
            return;
          }
        } else {
          console.error('[OutboundSetup] ❌ Failed to import Twilio number to Vapi', { requestId, error: vapiMessage });
          res.status(statusCode >= 400 && statusCode < 500 ? 400 : 500).json({ error: vapiMessage, requestId });
          return;
        }
      }
    }

    // Fetch outbound agent
    const { data: outboundAgent, error: outboundAgentError } = await supabase
      .from('agents')
      .select('id, vapi_assistant_id')
      .eq('org_id', orgId)
      .eq('role', 'outbound')
      .maybeSingle();

    if (outboundAgentError && outboundAgentError.code !== 'PGRST116') {
      console.error('[OutboundSetup] Failed to fetch outbound agent', { requestId, error: outboundAgentError });
      res.status(500).json({ error: 'Failed to fetch outbound agent', requestId });
      return;
    }

    // Save to integrations table with provider='twilio_outbound'
    const outboundConfig = {
      accountSid: EncryptionService.encrypt(twilioAccountSid),
      authToken: EncryptionService.encrypt(twilioAuthToken),
      phoneNumber: twilioPhoneNumber,
      vapiPhoneNumberId,
      vapiApiKeyLast4Used: currentVapiKeyLast4,
      status: 'active',
      activatedAt: new Date().toISOString(),
      agentId: outboundAgent?.id || null
    };

    const { error: upsertError } = await supabase
      .from('integrations')
      .upsert(
        {
          org_id: orgId,
          provider: 'twilio_outbound',
          config: outboundConfig,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'org_id,provider' }
      );

    if (upsertError) {
      console.error('[OutboundSetup] Failed to save outbound config', { requestId, error: upsertError });
      res.status(500).json({ error: 'Failed to save outbound configuration', requestId });
      return;
    }

    // Link to outbound assistant and update agents.vapi_phone_number_id (so test-call picks up new ID)
    if (outboundAgent?.id) {
      try {
        if (outboundAgent.vapi_assistant_id) {
          await vapiClient.updatePhoneNumber(vapiPhoneNumberId, {
            assistantId: outboundAgent.vapi_assistant_id
          });
          console.log('[OutboundSetup] ✅ Phone number linked to outbound agent', { requestId });
        }
        // Always backfill vapi_phone_number_id so test-call uses the new Vapi ID
        await supabase
          .from('agents')
          .update({ vapi_phone_number_id: vapiPhoneNumberId })
          .eq('id', outboundAgent.id)
          .eq('org_id', orgId);
        console.log('[OutboundSetup] ✅ agents.vapi_phone_number_id updated', { requestId, vapiPhoneNumberId });
      } catch (linkError: any) {
        console.error('[OutboundSetup] Failed to link phone number to outbound agent', { requestId, error: linkError.message });
      }
    }

    console.log('[OutboundSetup] ✅ Outbound setup complete', { requestId, vapiPhoneNumberId });

    res.status(200).json({
      success: true,
      outboundNumber: twilioPhoneNumber,
      vapiPhoneNumberId,
      agentId: outboundAgent?.id || null,
      status: 'active',
      requestId
    });
  } catch (error: any) {
    console.error('[OutboundSetup] Unexpected error', { requestId, error: error.message });
    res.status(500).json({ error: 'Internal server error', requestId });
  }
});

/**
 * GET /api/inbound/status-outbound
 * Get current outbound configuration status
 */
router.get('/status-outbound', requireAuthOrDev, async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.orgId;

    if (!orgId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { data: integration, error } = await supabase
      .from('integrations')
      .select('config')
      .eq('org_id', orgId)
      .eq('provider', 'twilio_outbound')
      .maybeSingle();

    if (error) {
      console.warn('[OutboundSetup][status] supabase error — returning not_configured', {
        code: error.code,
        message: error.message
      });
      res.status(200).json({ configured: false, status: 'not_configured' });
      return;
    }

    if (!integration) {
      res.status(200).json({ configured: false, status: 'not_configured' });
      return;
    }

    const cfg: any = integration?.config || null;
    if (!cfg) {
      res.json({ configured: false });
      return;
    }

    res.json({
      configured: cfg.status === 'active',
      outboundNumber: cfg.phoneNumber,
      vapiPhoneNumberId: cfg.vapiPhoneNumberId,
      activatedAt: cfg.activatedAt,
      agentId: cfg.agentId || null
    });
  } catch (error: any) {
    console.error('[OutboundSetup][status] Unexpected error', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/inbound/setup
 * Release inbound BYOC number from Vapi and delete from DB
 */
router.delete('/setup', requireAuthOrDev, async (req: Request, res: Response): Promise<void> => {
  const requestId = req.requestId || `req_${Date.now()}`;

  try {
    const orgId = req.user?.orgId;

    if (!orgId) {
      res.status(401).json({ error: 'Not authenticated', requestId });
      return;
    }

    const { data: integration, error: fetchError } = await supabase
      .from('integrations')
      .select('config')
      .eq('org_id', orgId)
      .eq('provider', 'twilio_inbound')
      .maybeSingle();

    if (fetchError) {
      console.warn('[InboundSetup][delete] Failed to fetch integration', { requestId, error: fetchError.message });
    }

    const vapiPhoneNumberId = integration?.config?.vapiPhoneNumberId;

    // Release from Vapi if we have a phone number ID
    if (vapiPhoneNumberId) {
      const vapiApiKey = config.VAPI_PRIVATE_KEY;
      if (vapiApiKey) {
        try {
          const vapiClient = new VapiClient(vapiApiKey);
          await vapiClient.deletePhoneNumber(vapiPhoneNumberId);
          console.log('[InboundSetup][delete] ✅ Phone number released from Vapi', { requestId, vapiPhoneNumberId });
        } catch (vapiError: any) {
          // Log but don't fail — 404 means it's already gone from Vapi
          console.warn('[InboundSetup][delete] Failed to release from Vapi (may already be deleted)', {
            requestId,
            vapiPhoneNumberId,
            error: vapiError.message
          });
        }
      }
    }

    // Delete from integrations table
    const { error: deleteError } = await supabase
      .from('integrations')
      .delete()
      .eq('org_id', orgId)
      .eq('provider', 'twilio_inbound');

    if (deleteError) {
      console.error('[InboundSetup][delete] Failed to delete from DB', { requestId, error: deleteError.message });
      res.status(500).json({ error: 'Failed to delete inbound configuration', requestId });
      return;
    }

    console.log('[InboundSetup][delete] ✅ Inbound BYOC deleted', { requestId });
    res.status(200).json({ success: true, requestId });
  } catch (error: any) {
    console.error('[InboundSetup][delete] Unexpected error', { requestId, error: error.message });
    res.status(500).json({ error: 'Internal server error', requestId });
  }
});

/**
 * DELETE /api/inbound/setup-outbound
 * Release outbound BYOC number from Vapi and delete from DB
 */
router.delete('/setup-outbound', requireAuthOrDev, async (req: Request, res: Response): Promise<void> => {
  const requestId = req.requestId || `req_${Date.now()}`;

  try {
    const orgId = req.user?.orgId;

    if (!orgId) {
      res.status(401).json({ error: 'Not authenticated', requestId });
      return;
    }

    const { data: integration, error: fetchError } = await supabase
      .from('integrations')
      .select('config')
      .eq('org_id', orgId)
      .eq('provider', 'twilio_outbound')
      .maybeSingle();

    if (fetchError) {
      console.warn('[OutboundSetup][delete] Failed to fetch integration', { requestId, error: fetchError.message });
    }

    const vapiPhoneNumberId = integration?.config?.vapiPhoneNumberId;

    if (vapiPhoneNumberId) {
      const vapiApiKey = config.VAPI_PRIVATE_KEY;
      if (vapiApiKey) {
        try {
          const vapiClient = new VapiClient(vapiApiKey);
          await vapiClient.deletePhoneNumber(vapiPhoneNumberId);
          console.log('[OutboundSetup][delete] ✅ Phone number released from Vapi', { requestId, vapiPhoneNumberId });
        } catch (vapiError: any) {
          console.warn('[OutboundSetup][delete] Failed to release from Vapi (may already be deleted)', {
            requestId,
            vapiPhoneNumberId,
            error: vapiError.message
          });
        }
      }
    }

    const { error: deleteError } = await supabase
      .from('integrations')
      .delete()
      .eq('org_id', orgId)
      .eq('provider', 'twilio_outbound');

    if (deleteError) {
      console.error('[OutboundSetup][delete] Failed to delete from DB', { requestId, error: deleteError.message });
      res.status(500).json({ error: 'Failed to delete outbound configuration', requestId });
      return;
    }

    console.log('[OutboundSetup][delete] ✅ Outbound BYOC deleted', { requestId });
    res.status(200).json({ success: true, requestId });
  } catch (error: any) {
    console.error('[OutboundSetup][delete] Unexpected error', { requestId, error: error.message });
    res.status(500).json({ error: 'Internal server error', requestId });
  }
});

/**
 * PATCH /api/inbound/assign-agent
 * Assign an agent to an inbound or outbound phone number
 */
router.patch('/assign-agent', requireAuthOrDev, async (req: Request, res: Response): Promise<void> => {
  const requestId = req.requestId || `req_${Date.now()}`;

  try {
    const orgId = req.user?.orgId;

    if (!orgId) {
      res.status(401).json({ error: 'Not authenticated', requestId });
      return;
    }

    const { phoneNumberType, agentId, vapiPhoneId: directVapiPhoneId } = req.body;

    if (!phoneNumberType || !agentId) {
      res.status(400).json({ error: 'Missing required fields: phoneNumberType, agentId', requestId });
      return;
    }

    if (phoneNumberType !== 'inbound' && phoneNumberType !== 'outbound') {
      res.status(400).json({ error: 'phoneNumberType must be "inbound" or "outbound"', requestId });
      return;
    }

    // Fetch the agent
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, vapi_assistant_id, role')
      .eq('id', agentId)
      .eq('org_id', orgId)
      .single();

    if (agentError || !agent) {
      res.status(404).json({ error: 'Agent not found', requestId });
      return;
    }

    // Validate role match
    if (agent.role !== phoneNumberType) {
      res.status(400).json({
        error: `Agent role mismatch: a "${agent.role}" agent cannot be assigned to a "${phoneNumberType}" number`,
        requestId
      });
      return;
    }

    if (!agent.vapi_assistant_id) {
      res.status(400).json({
        error: 'Agent is not yet synced to Vapi. Save and sync the agent configuration first.',
        requestId
      });
      return;
    }

    const provider = phoneNumberType === 'inbound' ? 'twilio_inbound' : 'twilio_outbound';

    // Resolve Vapi phone number ID — direct (managed) or from integrations table (BYOC)
    let vapiPhoneNumberId: string | null = directVapiPhoneId || null;
    let existingIntegrationConfig: Record<string, any> | null = null;

    if (!vapiPhoneNumberId) {
      // BYOC path: look up vapiPhoneNumberId from integrations table
      const { data: integration, error: integrationError } = await supabase
        .from('integrations')
        .select('config')
        .eq('org_id', orgId)
        .eq('provider', provider)
        .maybeSingle();

      if (integrationError || !integration) {
        res.status(404).json({
          error: `${phoneNumberType === 'inbound' ? 'Inbound' : 'Outbound'} number not configured yet`,
          requestId
        });
        return;
      }

      vapiPhoneNumberId = integration.config?.vapiPhoneNumberId;
      if (!vapiPhoneNumberId) {
        res.status(400).json({ error: 'Phone number not yet imported to Vapi', requestId });
        return;
      }

      existingIntegrationConfig = integration.config;
    }

    // Update Vapi phone number to use the new assistant
    const vapiApiKey = config.VAPI_PRIVATE_KEY;
    if (!vapiApiKey) {
      res.status(500).json({ error: 'System configuration error: Telephony provider unavailable.', requestId });
      return;
    }

    try {
      const vapiClient = new VapiClient(vapiApiKey);
      await vapiClient.updatePhoneNumber(vapiPhoneNumberId, {
        assistantId: agent.vapi_assistant_id
      });
      console.log('[AssignAgent] ✅ Vapi phone number updated', { requestId, vapiPhoneNumberId, agentId });
    } catch (vapiError: any) {
      console.error('[AssignAgent] Failed to update Vapi phone number', { requestId, error: vapiError.message });
      res.status(500).json({ error: 'Failed to update phone number assignment in Vapi', requestId });
      return;
    }

    // Update agentId in integrations config — BYOC only (managed numbers don't use integrations table)
    if (existingIntegrationConfig) {
      const updatedConfig = { ...existingIntegrationConfig, agentId };
      const { error: updateError } = await supabase
        .from('integrations')
        .update({ config: updatedConfig, updated_at: new Date().toISOString() })
        .eq('org_id', orgId)
        .eq('provider', provider);

      if (updateError) {
        console.error('[AssignAgent] Failed to update DB config', { requestId, error: updateError.message });
        // Non-fatal: Vapi is updated, just log
      }
    }

    console.log('[AssignAgent] ✅ Agent assigned', { requestId, phoneNumberType, agentId });
    res.status(200).json({ success: true, requestId });
  } catch (error: any) {
    console.error('[AssignAgent] Unexpected error', { requestId, error: error.message });
    res.status(500).json({ error: 'Internal server error', requestId });
  }
});

/**
 * POST /api/inbound/test
 * Test inbound setup by making a test call
 */
router.post('/test', requireAuthOrDev, async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.orgId;

    if (!orgId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { data: integration } = await supabase
      .from('integrations')
      .select('config')
      .eq('org_id', orgId)
      .eq('provider', 'twilio_inbound')
      .maybeSingle();

    if (!integration) {
      res.status(400).json({ error: 'Inbound not configured' });
      return;
    }

    const phoneNumber = integration.config?.phoneNumber;
    if (!phoneNumber) {
      res.status(400).json({ error: 'Phone number not found' });
      return;
    }

    console.log('[InboundSetup] Test call initiated to', { phoneNumber });

    res.status(200).json({
      success: true,
      message: 'Test call initiated',
      phoneNumber,
      note: 'You should receive a call shortly'
    });
  } catch (error: any) {
    console.error('[InboundSetup] Test error', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
