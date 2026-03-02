import { Router } from 'express';
import { requireAuthOrDev } from '../middleware/auth';
import { supabase } from '../services/supabase-client';
import { sanitizeError } from '../utils/error-sanitizer';

const router = Router();

// E.164: +[1-15 digits], minimum 7 total digits after +
const E164_REGEX = /^\+\d{7,15}$/;

// provider value used to identify the transfer settings row per org
const TRANSFER_PROVIDER = 'transfer';

// Mask phone for display: +2348012345678 → +234801*****
function maskPhone(phone: string | null): string {
    if (!phone) return 'Unknown';
    if (phone.length <= 7) return phone;
    return phone.slice(0, 7) + '*'.repeat(phone.length - 7);
}

/**
 * GET /api/transfer-settings
 * Returns the org's transfer phone number and when it was last updated.
 */
router.get('/', requireAuthOrDev, async (req, res) => {
    try {
        const { orgId } = req.user!;

        const { data, error } = await supabase
            .from('integration_settings')
            .select('transfer_phone_number, updated_at')
            .eq('org_id', orgId)
            .eq('provider', TRANSFER_PROVIDER)
            .maybeSingle();

        if (error) throw error;

        return res.json({
            transfer_number: data?.transfer_phone_number ?? null,
            last_updated: data?.updated_at ?? null,
        });
    } catch (err) {
        const userMessage = sanitizeError(err, 'TransferSettings', 'Failed to load transfer settings');
        return res.status(500).json({ error: userMessage });
    }
});

/**
 * PUT /api/transfer-settings
 * Saves the org's transfer phone number (upserts the transfer row).
 * Body: { transfer_number: string } — must be E.164 format
 */
router.put('/', requireAuthOrDev, async (req, res) => {
    try {
        const { orgId } = req.user!;
        const { transfer_number } = req.body;

        if (!transfer_number || typeof transfer_number !== 'string') {
            return res.status(400).json({ error: 'transfer_number is required' });
        }

        const trimmed = transfer_number.trim();
        if (!E164_REGEX.test(trimmed)) {
            return res.status(400).json({
                error: 'Phone number must be in E.164 format (e.g. +2348012345678)',
            });
        }

        // UPSERT on (org_id, provider) unique constraint
        const { error } = await supabase
            .from('integration_settings')
            .upsert(
                {
                    org_id: orgId,
                    provider: TRANSFER_PROVIDER,
                    transfer_phone_number: trimmed,
                    is_active: true,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'org_id,provider' }
            );

        if (error) throw error;

        return res.json({ success: true });
    } catch (err) {
        const userMessage = sanitizeError(err, 'TransferSettings', 'Failed to save transfer settings');
        return res.status(500).json({ error: userMessage });
    }
});

/**
 * GET /api/transfer-settings/history
 * Returns last 10 calls where the transferCall tool was used, with masked caller numbers.
 * Uses the Golden Record calls table — no separate transfer_queue needed.
 */
router.get('/history', requireAuthOrDev, async (req, res) => {
    try {
        const { orgId } = req.user!;

        const { data, error } = await supabase
            .from('calls')
            .select('id, created_at, from_number, status, ended_reason')
            .eq('org_id', orgId)
            .filter('tools_used', 'cs', '["transferCall"]')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        const history = (data || []).map((call: any) => ({
            id: call.id,
            created_at: call.created_at,
            from_number: maskPhone(call.from_number),
            status: call.status,
            outcome: call.ended_reason,
        }));

        return res.json(history);
    } catch (err) {
        const userMessage = sanitizeError(err, 'TransferSettings', 'Failed to load transfer history');
        return res.status(500).json({ error: userMessage });
    }
});

export default router;
