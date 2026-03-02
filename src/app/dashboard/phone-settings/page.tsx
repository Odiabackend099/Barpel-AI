'use client';
export const dynamic = "force-dynamic";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import {
  Phone,
  Smartphone,
  CheckCircle,
  AlertCircle,
  ShoppingCart,
  Loader2,
  Trash2,
  User,
  Lock,
  Save,
  RefreshCw
} from 'lucide-react';
import { BuyNumberModal } from '@/components/dashboard/BuyNumberModal';
import CarrierForwardingInstructions from './components/CarrierForwardingInstructions';
import { authedBackendFetch } from '@/lib/authed-backend-fetch';
import { PHONE_NUMBER_PRICING } from '@/lib/constants';

interface ForwardingConfig {
  forwardingType: 'total_ai' | 'safety_net';
  carrier: string;
  status: string;
  ringTimeSeconds: number;
  activationCode: string;
  deactivationCode: string;
}

interface PhoneSettingsStatus {
  inbound: {
    hasManagedNumber: boolean;
    managedNumber: string | null;
    managedNumberStatus: string | null;
    vapiPhoneId: string | null;
    countryCode: string | null;
    forwardingConfig: ForwardingConfig | null;
    // BYOC inbound (shown when no managed number)
    hasByocInboundNumber?: boolean;
    byocInboundNumber?: string | null;
    byocInboundVapiPhoneId?: string | null;
    byocInboundAgentId?: string | null;
  };
  outbound: {
    hasVerifiedNumber: boolean;
    verifiedNumber: string | null;
    verifiedAt: string | null;
    verifiedId: string | null;
    vapiLinked: boolean;
    pendingVerification?: {
      phoneNumber: string;
      createdAt: string;
      id: string;
    } | null;
    // New: outbound managed number support
    hasManagedOutboundNumber?: boolean;
    managedOutboundNumber?: string | null;
    managedOutboundVapiPhoneId?: string | null;
    // BYOC outbound (shown when no managed outbound number)
    hasByocOutboundNumber?: boolean;
    byocOutboundNumber?: string | null;
    byocOutboundVapiPhoneId?: string | null;
    byocOutboundAgentId?: string | null;
  };
  mode: 'managed' | 'byoc' | 'none';
  numbers?: {
    inbound: Array<{ phoneNumber: string; status: string; vapiPhoneId: string | null; countryCode: string; routingDirection: string }>;
    outbound: Array<{ phoneNumber: string; status: string; vapiPhoneId: string | null; countryCode: string; routingDirection: string }>;
    all: Array<{ phoneNumber: string; status: string; vapiPhoneId: string | null; countryCode: string; routingDirection: string }>;
  };
}

type VerificationStep = 'input' | 'verify' | 'success';

function detectCountryCode(phone: string): string {
  if (phone.startsWith('+234')) return 'NG';
  if (phone.startsWith('+44')) return 'GB';
  if (phone.startsWith('+1')) return 'US';
  if (phone.startsWith('+90')) return 'TR';
  if (phone.startsWith('+91')) return 'IN';
  if (phone.startsWith('+61')) return 'AU';
  if (phone.startsWith('+49')) return 'DE';
  if (phone.startsWith('+33')) return 'FR';
  if (phone.startsWith('+81')) return 'JP';
  if (phone.startsWith('+86')) return 'CN';
  if (phone.startsWith('+55')) return 'BR';
  if (phone.startsWith('+27')) return 'ZA';
  if (phone.startsWith('+254')) return 'KE';
  if (phone.startsWith('+971')) return 'AE';
  return 'US';
}

function getCountryName(code: string): string {
  const countryNames: Record<string, string> = {
    'NG': 'Nigeria',
    'GB': 'United Kingdom',
    'US': 'United States',
    'TR': 'Turkey',
    'IN': 'India',
    'AU': 'Australia',
    'DE': 'Germany',
    'FR': 'France',
    'JP': 'Japan',
    'CN': 'China',
    'BR': 'Brazil',
    'ZA': 'South Africa',
    'KE': 'Kenya',
    'AE': 'UAE'
  };
  return countryNames[code] || code;
}

interface ByocForm { accountSid: string; authToken: string; phoneNumber: string; }
const emptyByocForm: ByocForm = { accountSid: '', authToken: '', phoneNumber: '' };

function validateByocForm(f: ByocForm): string | null {
  if (!f.accountSid.match(/^AC[a-z0-9]{32}$/i)) return 'Account SID must start with "AC" and be 34 characters';
  if (f.authToken.length !== 32) return 'Auth Token must be exactly 32 characters';
  if (!/^\+[1-9]\d{1,14}$/.test(f.phoneNumber)) return 'Phone number must be E.164 format (e.g. +442012345678)';
  return null;
}

export default function PhoneSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const [status, setStatus] = useState<PhoneSettingsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buy number modal
  const [showBuyNumberModal, setShowBuyNumberModal] = useState(false);
  const [buyModalDirection, setBuyModalDirection] = useState<'inbound' | 'outbound'>('inbound');

  // Verification flow
  const [verificationStep, setVerificationStep] = useState<VerificationStep>('input');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [isValidPhoneFormat, setIsValidPhoneFormat] = useState(false);

  // Auto-recovery: prevent double-attempts on re-render
  const autoRecoveryAttempted = useRef(false);
  const [recovering, setRecovering] = useState(false);

  // Delete confirmations (managed)
  const [confirmDeleteManaged, setConfirmDeleteManaged] = useState(false);
  const [confirmDeleteManagedOutbound, setConfirmDeleteManagedOutbound] = useState(false);
  const [confirmDeleteVerified, setConfirmDeleteVerified] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Agent linking (managed numbers)
  const [agents, setAgents] = useState<{
    inbound: { id: string; name: string; vapiAssistantId: string | null } | null;
    outbound: { id: string; name: string; vapiAssistantId: string | null; vapiPhoneNumberId: string | null } | null;
  }>({ inbound: null, outbound: null });
  const [assigningAgent, setAssigningAgent] = useState<'inbound' | 'outbound' | null>(null);

  // BYOC forms
  const [byocInboundForm, setByocInboundForm] = useState<ByocForm>(emptyByocForm);
  const [byocOutboundForm, setByocOutboundForm] = useState<ByocForm>(emptyByocForm);
  const [savingByocInbound, setSavingByocInbound] = useState(false);
  const [savingByocOutbound, setSavingByocOutbound] = useState(false);
  const [deletingByocInbound, setDeletingByocInbound] = useState(false);
  const [deletingByocOutbound, setDeletingByocOutbound] = useState(false);
  const [assigningByocInbound, setAssigningByocInbound] = useState(false);
  const [assigningByocOutbound, setAssigningByocOutbound] = useState(false);
  const [confirmDeleteByocInbound, setConfirmDeleteByocInbound] = useState(false);
  const [confirmDeleteByocOutbound, setConfirmDeleteByocOutbound] = useState(false);

  // All agents arrays (for BYOC assignment dropdowns)
  const [allInboundAgents, setAllInboundAgents] = useState<Array<{ id: string; name: string; vapiAssistantId: string | null }>>([]);
  const [allOutboundAgents, setAllOutboundAgents] = useState<Array<{ id: string; name: string; vapiAssistantId: string | null }>>([]);

  // Fetch phone settings status
  useEffect(() => {
    fetchPhoneSettings();
    fetchAgents();
  }, []);

  // Real-time country detection (Stripe pattern)
  useEffect(() => {
    if (phoneNumber.startsWith('+') && phoneNumber.length >= 4) {
      const countryCode = detectCountryCode(phoneNumber);
      setDetectedCountry(countryCode);
      // Basic validation: must start with + and have at least 10 digits
      const isValid = /^\+\d{10,15}$/.test(phoneNumber);
      setIsValidPhoneFormat(isValid);
    } else {
      setDetectedCountry(null);
      setIsValidPhoneFormat(false);
    }
  }, [phoneNumber]);

  const fetchPhoneSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authedBackendFetch<PhoneSettingsStatus>('/api/phone-settings/status');
      setStatus(data);

      // Auto-recovery: if there's a pending verification and no verified number,
      // restore the verify step so the user can complete setup.
      // This handles the "navigated away before clicking confirm" scenario.
      if (
        data.outbound.pendingVerification &&
        !data.outbound.hasVerifiedNumber &&
        !autoRecoveryAttempted.current
      ) {
        autoRecoveryAttempted.current = true;
        const pendingPhone = data.outbound.pendingVerification.phoneNumber;
        setPhoneNumber(pendingPhone);
        setRecovering(true);

        // Try auto-confirming (user may have already entered code on phone)
        try {
          await authedBackendFetch('/api/verified-caller-id/confirm', {
            method: 'POST',
            body: JSON.stringify({ phoneNumber: pendingPhone })
          });
          // Auto-confirmed! Twilio had it verified.
          setVerificationStep('success');
          showSuccessToast('Your number was verified! Setup completed automatically.', 3000);
          // Re-fetch to get the verified state
          const refreshed = await authedBackendFetch<PhoneSettingsStatus>('/api/phone-settings/status');
          setStatus(refreshed);
        } catch {
          // Not yet verified in Twilio — show the verify step so user can complete
          setVerificationStep('verify');
        } finally {
          setRecovering(false);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch phone settings:', err);
      setError(err.message || 'Failed to load phone settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const data = await authedBackendFetch<{ agents: Array<{ id: string; name: string; role: string; vapiAssistantId: string | null; vapiPhoneNumberId?: string | null }> }>('/api/founder-console/agent/config');
      if (data?.agents) {
        const inbound = data.agents.find(a => a.role === 'inbound') || null;
        const outbound = data.agents.find(a => a.role === 'outbound') || null;
        setAgents({
          inbound: inbound ? { id: inbound.id, name: inbound.name, vapiAssistantId: inbound.vapiAssistantId } : null,
          outbound: outbound ? { id: outbound.id, name: outbound.name, vapiAssistantId: outbound.vapiAssistantId, vapiPhoneNumberId: outbound.vapiPhoneNumberId ?? null } : null,
        });
        // Populate arrays for BYOC assignment dropdowns
        setAllInboundAgents(
          data.agents
            .filter(a => a.role === 'inbound')
            .map(a => ({ id: a.id, name: a.name, vapiAssistantId: a.vapiAssistantId }))
        );
        setAllOutboundAgents(
          data.agents
            .filter(a => a.role === 'outbound')
            .map(a => ({ id: a.id, name: a.name, vapiAssistantId: a.vapiAssistantId }))
        );
      }
    } catch {
      // Non-critical — agent info is best-effort
    }
  };

  const handleAssignManagedAgent = async (direction: 'inbound' | 'outbound', agentId: string) => {
    const vapiPhoneId = direction === 'inbound'
      ? status?.inbound.vapiPhoneId
      : status?.outbound.managedOutboundVapiPhoneId;

    if (!vapiPhoneId) {
      showErrorToast('Phone number not yet linked to Vapi. Please contact support.');
      return;
    }

    setAssigningAgent(direction);
    try {
      await authedBackendFetch('/api/inbound/assign-agent', {
        method: 'PATCH',
        body: JSON.stringify({ phoneNumberType: direction, agentId, vapiPhoneId }),
      });
      showSuccessToast('Agent linked successfully');
      await Promise.all([fetchPhoneSettings(), fetchAgents()]);
    } catch (e: any) {
      showErrorToast(e.message || 'Failed to link agent. Please try again.');
    } finally {
      setAssigningAgent(null);
    }
  };

  // Verification handlers (outbound lane)
  const handleSendVerification = async () => {
    setVerifying(true);
    setVerificationError(null);

    try {
      const response: any = await authedBackendFetch('/api/verified-caller-id/verify', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber,
          countryCode: detectCountryCode(phoneNumber)
        })
      });

      // Auto-verified path: number was already verified in Twilio
      if (response.verified) {
        showSuccessToast(`${phoneNumber} is already verified!`, 3000);
        setVerificationStep('success');
        await fetchPhoneSettings();
        return;
      }

      // CRITICAL: Capture the validation code from Twilio
      if (response.validationCode) {
        setVerificationCode(response.validationCode);
      }

      // Immediate success feedback (ChatGPT pattern)
      showSuccessToast(`Calling ${phoneNumber} now...`, 2000);
      setVerificationStep('verify');
    } catch (err: any) {
      setVerificationError(err.message || 'Failed to send verification call. Check that your phone number is correct and try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleConfirmVerification = async () => {
    setVerifying(true);
    setVerificationError(null);

    try {
      await authedBackendFetch('/api/verified-caller-id/confirm', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber })
      });
      setVerificationStep('success');
      // Refresh status to show the new verified number
      await fetchPhoneSettings();
    } catch (err: any) {
      setVerificationError(err.message || 'Verification not yet complete. Wait 30 seconds after entering the code on your phone, then click "Verify & Complete Setup" again.');
    } finally {
      setVerifying(false);
    }
  };

  const resetVerification = async () => {
    // Clean up the pending DB record so it doesn't linger
    if (phoneNumber) {
      try {
        await authedBackendFetch('/api/verified-caller-id', {
          method: 'DELETE',
          body: JSON.stringify({ phoneNumber })
        });
      } catch {
        // Best-effort cleanup — don't block the UI reset
      }
    }
    setVerificationStep('input');
    setPhoneNumber('');
    setVerificationCode('');
    setVerificationError(null);
    autoRecoveryAttempted.current = false;
  };

  // Delete handlers
  const handleDeleteManaged = async () => {
    if (!status?.inbound.managedNumber) return;

    try {
      setDeleting(true);
      await authedBackendFetch(
        `/api/managed-telephony/numbers/${encodeURIComponent(status.inbound.managedNumber)}`,
        { method: 'DELETE' }
      );
      setConfirmDeleteManaged(false);
      await fetchPhoneSettings();

      // Success confirmation (Stripe pattern)
      showSuccessToast(`${status.inbound.managedNumber} successfully deleted`, 3000);
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to delete number');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteManagedOutbound = async () => {
    if (!status?.outbound.managedOutboundNumber) return;

    try {
      setDeleting(true);
      await authedBackendFetch(
        `/api/managed-telephony/numbers/${encodeURIComponent(status.outbound.managedOutboundNumber)}`,
        { method: 'DELETE' }
      );
      setConfirmDeleteManagedOutbound(false);
      await fetchPhoneSettings();
      showSuccessToast(`${status.outbound.managedOutboundNumber} successfully deleted`, 3000);
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to delete number');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteVerified = async () => {
    if (!status?.outbound.verifiedNumber) return;

    try {
      setDeleting(true);
      await authedBackendFetch('/api/verified-caller-id', {
        method: 'DELETE',
        body: JSON.stringify({ phoneNumber: status.outbound.verifiedNumber })
      });
      setConfirmDeleteVerified(false);
      await fetchPhoneSettings();

      // Success confirmation (Stripe pattern)
      showSuccessToast(`${status.outbound.verifiedNumber} successfully deleted`, 3000);
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to delete verified number');
    } finally {
      setDeleting(false);
    }
  };

  // BYOC handlers
  const handleSaveByocInbound = async () => {
    const err = validateByocForm(byocInboundForm);
    if (err) { showErrorToast(err); return; }
    setSavingByocInbound(true);
    try {
      await authedBackendFetch('/api/inbound/setup', {
        method: 'POST',
        body: JSON.stringify({
          accountSid: byocInboundForm.accountSid,
          authToken: byocInboundForm.authToken,
          phoneNumber: byocInboundForm.phoneNumber,
        }),
      });
      showSuccessToast('Inbound number connected');
      setByocInboundForm(emptyByocForm);
      await fetchPhoneSettings();
    } catch (e: any) {
      showErrorToast(e.message || 'Failed to activate BYOC inbound number');
    } finally {
      setSavingByocInbound(false);
    }
  };

  const handleSaveByocOutbound = async () => {
    const err = validateByocForm(byocOutboundForm);
    if (err) { showErrorToast(err); return; }
    setSavingByocOutbound(true);
    try {
      await authedBackendFetch('/api/inbound/setup-outbound', {
        method: 'POST',
        body: JSON.stringify({
          accountSid: byocOutboundForm.accountSid,
          authToken: byocOutboundForm.authToken,
          phoneNumber: byocOutboundForm.phoneNumber,
        }),
      });
      showSuccessToast('Outbound number connected');
      setByocOutboundForm(emptyByocForm);
      await fetchPhoneSettings();
    } catch (e: any) {
      showErrorToast(e.message || 'Failed to activate BYOC outbound number');
    } finally {
      setSavingByocOutbound(false);
    }
  };

  const handleDeleteByocInbound = async () => {
    setDeletingByocInbound(true);
    try {
      await authedBackendFetch('/api/inbound/setup', { method: 'DELETE' });
      setConfirmDeleteByocInbound(false);
      showSuccessToast('Inbound number disconnected');
      await fetchPhoneSettings();
    } catch (e: any) {
      showErrorToast(e.message || 'Failed to remove BYOC inbound number');
    } finally {
      setDeletingByocInbound(false);
    }
  };

  const handleDeleteByocOutbound = async () => {
    setDeletingByocOutbound(true);
    try {
      await authedBackendFetch('/api/inbound/setup-outbound', { method: 'DELETE' });
      setConfirmDeleteByocOutbound(false);
      showSuccessToast('Outbound number disconnected');
      await fetchPhoneSettings();
    } catch (e: any) {
      showErrorToast(e.message || 'Failed to remove BYOC outbound number');
    } finally {
      setDeletingByocOutbound(false);
    }
  };

  const handleAssignByocInboundAgent = async (agentId: string) => {
    setAssigningByocInbound(true);
    try {
      await authedBackendFetch('/api/inbound/assign-agent', {
        method: 'PATCH',
        body: JSON.stringify({ phoneNumberType: 'inbound', agentId }),
      });
      showSuccessToast('Agent linked to inbound number');
      await fetchPhoneSettings();
    } catch (e: any) {
      showErrorToast(e.message || 'Failed to assign agent');
    } finally {
      setAssigningByocInbound(false);
    }
  };

  const handleAssignByocOutboundAgent = async (agentId: string) => {
    setAssigningByocOutbound(true);
    try {
      await authedBackendFetch('/api/inbound/assign-agent', {
        method: 'PATCH',
        body: JSON.stringify({ phoneNumberType: 'outbound', agentId }),
      });
      showSuccessToast('Agent linked to outbound number');
      await fetchPhoneSettings();
    } catch (e: any) {
      showErrorToast(e.message || 'Failed to assign agent');
    } finally {
      setAssigningByocOutbound(false);
    }
  };

  if (authLoading || loading || recovering) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-barpel-teal mx-auto" />
          {recovering && (
            <p className="text-sm text-barpel-slate/60 mt-3">Checking pending verification...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-barpel-teal/5 flex items-center justify-center border border-barpel-slate/10">
          <Phone className="w-6 h-6 text-barpel-teal" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-barpel-slate">
            Phone Settings
          </h1>
          <p className="text-barpel-slate/60">
            Configure how you <strong>receive</strong> calls (inbound) and how customers <strong>see</strong> your calls (outbound)
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">Failed to load phone settings</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={fetchPhoneSettings}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Two-Lane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LANE 1: INBOUND - AI Phone Number */}
        <div className="bg-white border border-barpel-slate/10 rounded-xl p-6">
          {/* PROMINENT INBOUND HEADER */}
          <div className="mb-6 pb-4 border-b border-barpel-slate/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-barpel-teal/10 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-barpel-teal" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-barpel-slate">
                  Inbound Calls
                </h2>
                <p className="text-sm text-barpel-slate/60 mt-1">
                  Forward calls TO your AI receptionist
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-base font-semibold text-barpel-slate">
              Your AI Phone Number
            </h3>
          </div>

          {status?.inbound.hasManagedNumber ? (
            // Active managed number
            <div className="space-y-4">
              <div className="bg-barpel-teal/5 border border-barpel-slate/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-2xl font-mono font-bold text-barpel-teal">
                    {status.inbound.managedNumber}
                  </p>
                  <div className="flex items-center gap-2">
                    {status.inbound.forwardingConfig ? (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        status.inbound.forwardingConfig.forwardingType === 'total_ai'
                          ? 'bg-barpel-teal/10 text-barpel-teal-dark border border-barpel-slate/10'
                          : 'bg-barpel-teal/5 text-barpel-slate/70 border border-barpel-slate/10'
                      }`}>
                        {status.inbound.forwardingConfig.forwardingType === 'total_ai' ? 'AI Handles All Calls' : 'AI + Human Backup'}
                      </span>
                    ) : null}
                    <span className="text-xs bg-barpel-teal/10 text-barpel-teal px-2 py-1 rounded-full font-medium">
                      Active
                    </span>
                  </div>
                </div>
                <p className="text-xs text-barpel-slate/60">
                  {status.inbound.countryCode} • Hosted by Barpel AI
                </p>
              </div>

              {/* Agent Assignment — always visible */}
              <div className="bg-white border border-barpel-slate/10 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-3.5 h-3.5 text-barpel-teal" />
                  <p className="text-xs text-barpel-slate/60 font-medium">AI Agent</p>
                </div>
                {allInboundAgents.length > 0 ? (
                  <div className="flex gap-2">
                    <select
                      value={agents.inbound?.id || ''}
                      onChange={(e) => e.target.value && handleAssignManagedAgent('inbound', e.target.value)}
                      disabled={assigningAgent === 'inbound'}
                      className="flex-1 px-3 py-2 border border-barpel-slate/10 rounded-lg text-sm text-barpel-slate bg-white focus:ring-2 focus:ring-barpel-teal outline-none disabled:opacity-50"
                    >
                      <option value="">Select an agent…</option>
                      {allInboundAgents.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                    {agents.inbound && (
                      <button
                        onClick={() => handleAssignManagedAgent('inbound', agents.inbound!.id)}
                        disabled={assigningAgent === 'inbound'}
                        title="Sync agent to Vapi"
                        className="px-3 py-2 border border-barpel-teal/30 text-barpel-teal rounded-lg hover:bg-barpel-teal/5 transition-colors text-xs flex items-center gap-1.5 disabled:opacity-40"
                      >
                        {assigningAgent === 'inbound' ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        Sync
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-barpel-slate/50 py-1">No agents configured yet — go to <strong>Agent Configuration</strong> to set one up.</p>
                )}
                {assigningAgent === 'inbound' && (
                  <p className="text-xs text-barpel-teal">Linking agent to phone number…</p>
                )}
              </div>

              {/* What happens next */}
              <div className="bg-barpel-teal/5 border border-barpel-slate/10 rounded-lg p-3">
                <p className="text-xs font-medium text-barpel-slate mb-1">✓ Number active and ready</p>
                <p className="text-xs text-barpel-slate/60">Forward your office calls to this number using the carrier code below</p>
              </div>

              <CarrierForwardingInstructions
                managedNumber={status.inbound.managedNumber!}
                savedConfig={status.inbound.forwardingConfig}
              />

              <button
                onClick={() => setConfirmDeleteManaged(true)}
                className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Number
              </button>
            </div>
          ) : status?.inbound.hasByocInboundNumber ? (
            // Active BYOC inbound number
            <div className="space-y-4">
              <div className="bg-barpel-teal/5 border border-barpel-slate/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-2xl font-mono font-bold text-barpel-teal">
                    {status.inbound.byocInboundNumber}
                  </p>
                  <span className="text-xs bg-barpel-teal/10 text-barpel-teal px-2 py-1 rounded-full font-medium border border-barpel-slate/10">
                    Active
                  </span>
                </div>
                <p className="text-xs text-barpel-slate/60">Your number</p>
              </div>

              <div className="bg-barpel-teal/5 border border-barpel-slate/10 rounded-lg p-3">
                <p className="text-xs font-medium text-barpel-slate mb-1">✓ Number active and ready</p>
                <p className="text-xs text-barpel-slate/60">Forward your office calls to this number using the carrier code below</p>
              </div>

              <CarrierForwardingInstructions
                managedNumber={status.inbound.byocInboundNumber!}
                savedConfig={status.inbound.forwardingConfig}
              />

              {/* Agent Assignment — always visible */}
              <div className="bg-white border border-barpel-slate/10 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-3.5 h-3.5 text-barpel-teal" />
                  <p className="text-xs text-barpel-slate/60 font-medium">AI Agent</p>
                </div>
                {allInboundAgents.length > 0 ? (
                  <div className="flex gap-2">
                    <select
                      value={status.inbound.byocInboundAgentId || ''}
                      onChange={(e) => e.target.value && handleAssignByocInboundAgent(e.target.value)}
                      disabled={assigningByocInbound}
                      className="flex-1 px-3 py-2 border border-barpel-slate/10 rounded-lg text-sm text-barpel-slate bg-white focus:ring-2 focus:ring-barpel-teal outline-none disabled:opacity-50"
                    >
                      <option value="">Select an agent…</option>
                      {allInboundAgents.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                    {status.inbound.byocInboundAgentId && (
                      <button
                        onClick={() => handleAssignByocInboundAgent(status.inbound.byocInboundAgentId!)}
                        disabled={assigningByocInbound}
                        title="Sync agent to Vapi"
                        className="px-3 py-2 border border-barpel-teal/30 text-barpel-teal rounded-lg hover:bg-barpel-teal/5 transition-colors text-xs flex items-center gap-1.5 disabled:opacity-40"
                      >
                        {assigningByocInbound ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        Sync
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-barpel-slate/50 py-1">No agents configured yet — go to <strong>Agent Configuration</strong> to set one up.</p>
                )}
                {assigningByocInbound && (
                  <p className="text-xs text-barpel-teal">Linking agent to phone number…</p>
                )}
              </div>

              <button
                onClick={() => setConfirmDeleteByocInbound(true)}
                className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Disconnect Number
              </button>
            </div>
          ) : (
            // Empty state - buy number or connect BYOC
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-barpel-teal/5 mx-auto flex items-center justify-center mb-4 border border-barpel-slate/10">
                  <Smartphone className="w-8 h-8 text-barpel-teal/40" />
                </div>
                <h3 className="text-lg font-semibold text-barpel-slate mb-2">
                  Get Your AI Phone Number
                </h3>
                <p className="text-sm text-barpel-slate/60 mb-6 max-w-sm mx-auto">
                  Purchase a dedicated number for your AI receptionist. Forward your office calls using a simple carrier code.
                </p>
                <button
                  onClick={() => { setBuyModalDirection('inbound'); setShowBuyNumberModal(true); }}
                  className="px-6 py-3 bg-barpel-teal text-white rounded-lg hover:bg-barpel-teal-dark transition-colors font-medium inline-flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Buy Inbound Number
                </button>
                <p className="text-xs text-barpel-slate/60 mt-3">
                  {PHONE_NUMBER_PRICING.costDisplay} {PHONE_NUMBER_PRICING.costType} + usage-based pricing
                </p>
              </div>

              {/* Connect your own number option */}
              <div className="border-t border-barpel-slate/10 pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-4 h-4 text-barpel-slate/40" />
                  <p className="text-sm font-semibold text-barpel-slate">Use your own phone number</p>
                </div>
                <p className="text-xs text-barpel-slate/50 mb-4">Connect a Twilio number you already own</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-barpel-slate/60 mb-1">Twilio Account SID</label>
                    <input
                      type="text"
                      value={byocInboundForm.accountSid}
                      onChange={e => setByocInboundForm(p => ({ ...p, accountSid: e.target.value }))}
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-3 py-2 border border-barpel-slate/10 rounded-lg focus:ring-2 focus:ring-barpel-teal outline-none font-mono text-sm text-barpel-slate bg-white placeholder-barpel-slate/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-barpel-slate/60 mb-1">Twilio Auth Token</label>
                    <input
                      type="password"
                      value={byocInboundForm.authToken}
                      onChange={e => setByocInboundForm(p => ({ ...p, authToken: e.target.value }))}
                      placeholder="••••••••••••••••••••••••••••••••"
                      className="w-full px-3 py-2 border border-barpel-slate/10 rounded-lg focus:ring-2 focus:ring-barpel-teal outline-none font-mono text-sm text-barpel-slate bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-barpel-slate/60 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={byocInboundForm.phoneNumber}
                      onChange={e => setByocInboundForm(p => ({ ...p, phoneNumber: e.target.value }))}
                      placeholder="+442012345678"
                      className="w-full px-3 py-2 border border-barpel-slate/10 rounded-lg focus:ring-2 focus:ring-barpel-teal outline-none font-mono text-sm text-barpel-slate bg-white placeholder-barpel-slate/30"
                    />
                    <p className="text-xs text-barpel-slate/40 mt-1">Include country code, e.g. +1 (US), +44 (UK), +234 (Nigeria)</p>
                  </div>
                  <button
                    onClick={handleSaveByocInbound}
                    disabled={savingByocInbound || !byocInboundForm.accountSid || !byocInboundForm.authToken || !byocInboundForm.phoneNumber}
                    className="w-full px-4 py-2 bg-barpel-teal text-white rounded-lg hover:bg-barpel-teal-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {savingByocInbound ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />Connecting…</>
                    ) : (
                      <><Save className="w-4 h-4" />Connect Number</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* LANE 2: OUTBOUND - Verified Caller ID */}
        <div className="bg-white border border-barpel-slate/10 rounded-xl p-6">
          {/* PROMINENT OUTBOUND HEADER */}
          <div className="mb-6 pb-4 border-b border-barpel-slate/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-barpel-teal/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-barpel-teal" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-barpel-slate">
                  Outbound Calls
                </h2>
                <p className="text-sm text-barpel-slate/60 mt-1">
                  Set what customers see when AI calls them
                </p>
              </div>
            </div>
          </div>

          {/* Managed Outbound Number */}
          {status?.outbound.hasManagedOutboundNumber ? (
            <div className="mb-6 space-y-3">
              <h3 className="text-base font-semibold text-barpel-slate">Outbound Number</h3>
              <div className="bg-barpel-teal/5 border border-barpel-slate/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-2xl font-mono font-bold text-barpel-teal">
                    {status.outbound.managedOutboundNumber}
                  </p>
                  <span className="text-xs bg-barpel-teal/10 text-barpel-teal px-2 py-1 rounded-full font-medium">
                    Active
                  </span>
                </div>
                <p className="text-xs text-barpel-slate/60">Hosted by Barpel AI</p>
              </div>

              {/* Agent Assignment — always visible */}
              <div className="bg-white border border-barpel-slate/10 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-3.5 h-3.5 text-barpel-teal" />
                  <p className="text-xs text-barpel-slate/60 font-medium">AI Agent</p>
                </div>
                {allOutboundAgents.length > 0 ? (
                  <div className="flex gap-2">
                    <select
                      value={agents.outbound?.id || ''}
                      onChange={(e) => e.target.value && handleAssignManagedAgent('outbound', e.target.value)}
                      disabled={assigningAgent === 'outbound'}
                      className="flex-1 px-3 py-2 border border-barpel-slate/10 rounded-lg text-sm text-barpel-slate bg-white focus:ring-2 focus:ring-barpel-teal outline-none disabled:opacity-50"
                    >
                      <option value="">Select an agent…</option>
                      {allOutboundAgents.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                    {agents.outbound && (
                      <button
                        onClick={() => handleAssignManagedAgent('outbound', agents.outbound!.id)}
                        disabled={assigningAgent === 'outbound'}
                        title="Sync agent to Vapi"
                        className="px-3 py-2 border border-barpel-teal/30 text-barpel-teal rounded-lg hover:bg-barpel-teal/5 transition-colors text-xs flex items-center gap-1.5 disabled:opacity-40"
                      >
                        {assigningAgent === 'outbound' ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        Sync
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-barpel-slate/50 py-1">No agents configured yet — go to <strong>Agent Configuration</strong> to set one up.</p>
                )}
                {assigningAgent === 'outbound' && (
                  <p className="text-xs text-barpel-teal">Linking agent to phone number…</p>
                )}
              </div>

              <button
                onClick={() => setConfirmDeleteManagedOutbound(true)}
                className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Outbound Number
              </button>
            </div>
          ) : status?.outbound.hasByocOutboundNumber ? (
            // Active BYOC outbound number
            <div className="mb-6 space-y-3">
              <h3 className="text-base font-semibold text-barpel-slate">Outbound Number</h3>
              <div className="bg-barpel-teal/5 border border-barpel-slate/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-2xl font-mono font-bold text-barpel-teal">
                    {status.outbound.byocOutboundNumber}
                  </p>
                  <span className="text-xs bg-barpel-teal/10 text-barpel-teal px-2 py-1 rounded-full font-medium border border-barpel-slate/10">
                    Active
                  </span>
                </div>
                <p className="text-xs text-barpel-slate/60">Your number — customers see this when AI calls them</p>
              </div>

              {/* Agent Assignment — always visible */}
              <div className="bg-white border border-barpel-slate/10 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-3.5 h-3.5 text-barpel-teal" />
                  <p className="text-xs text-barpel-slate/60 font-medium">AI Agent</p>
                </div>
                {allOutboundAgents.length > 0 ? (
                  <div className="flex gap-2">
                    <select
                      value={status.outbound.byocOutboundAgentId || ''}
                      onChange={(e) => e.target.value && handleAssignByocOutboundAgent(e.target.value)}
                      disabled={assigningByocOutbound}
                      className="flex-1 px-3 py-2 border border-barpel-slate/10 rounded-lg text-sm text-barpel-slate bg-white focus:ring-2 focus:ring-barpel-teal outline-none disabled:opacity-50"
                    >
                      <option value="">Select an agent…</option>
                      {allOutboundAgents.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                    {status.outbound.byocOutboundAgentId && (
                      <button
                        onClick={() => handleAssignByocOutboundAgent(status.outbound.byocOutboundAgentId!)}
                        disabled={assigningByocOutbound}
                        title="Sync agent to Vapi"
                        className="px-3 py-2 border border-barpel-teal/30 text-barpel-teal rounded-lg hover:bg-barpel-teal/5 transition-colors text-xs flex items-center gap-1.5 disabled:opacity-40"
                      >
                        {assigningByocOutbound ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        Sync
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-barpel-slate/50 py-1">No agents configured yet — go to <strong>Agent Configuration</strong> to set one up.</p>
                )}
                {assigningByocOutbound && (
                  <p className="text-xs text-barpel-teal">Linking agent to phone number…</p>
                )}
              </div>

              <button
                onClick={() => setConfirmDeleteByocOutbound(true)}
                className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Disconnect Number
              </button>
            </div>
          ) : (
            <div className="mb-6 space-y-6">
              <div>
                <button
                  onClick={() => { setBuyModalDirection('outbound'); setShowBuyNumberModal(true); }}
                  className="w-full px-6 py-3 bg-barpel-teal text-white rounded-lg hover:bg-barpel-teal-dark transition-colors font-medium inline-flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Buy Outbound Number
                </button>
                <p className="text-xs text-barpel-slate/60 mt-2 text-center">
                  Purchase a dedicated number for outbound AI calls
                </p>
              </div>

              {/* Connect your own number option */}
              <div className="border-t border-barpel-slate/10 pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-4 h-4 text-barpel-slate/40" />
                  <p className="text-sm font-semibold text-barpel-slate">Use your own phone number</p>
                </div>
                <p className="text-xs text-barpel-slate/50 mb-4">Connect a Twilio number you already own</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-barpel-slate/60 mb-1">Twilio Account SID</label>
                    <input
                      type="text"
                      value={byocOutboundForm.accountSid}
                      onChange={e => setByocOutboundForm(p => ({ ...p, accountSid: e.target.value }))}
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-3 py-2 border border-barpel-slate/10 rounded-lg focus:ring-2 focus:ring-barpel-teal outline-none font-mono text-sm text-barpel-slate bg-white placeholder-barpel-slate/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-barpel-slate/60 mb-1">Twilio Auth Token</label>
                    <input
                      type="password"
                      value={byocOutboundForm.authToken}
                      onChange={e => setByocOutboundForm(p => ({ ...p, authToken: e.target.value }))}
                      placeholder="••••••••••••••••••••••••••••••••"
                      className="w-full px-3 py-2 border border-barpel-slate/10 rounded-lg focus:ring-2 focus:ring-barpel-teal outline-none font-mono text-sm text-barpel-slate bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-barpel-slate/60 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={byocOutboundForm.phoneNumber}
                      onChange={e => setByocOutboundForm(p => ({ ...p, phoneNumber: e.target.value }))}
                      placeholder="+442012345678"
                      className="w-full px-3 py-2 border border-barpel-slate/10 rounded-lg focus:ring-2 focus:ring-barpel-teal outline-none font-mono text-sm text-barpel-slate bg-white placeholder-barpel-slate/30"
                    />
                    <p className="text-xs text-barpel-slate/40 mt-1">Include country code, e.g. +1 (US), +44 (UK), +234 (Nigeria)</p>
                  </div>
                  <button
                    onClick={handleSaveByocOutbound}
                    disabled={savingByocOutbound || !byocOutboundForm.accountSid || !byocOutboundForm.authToken || !byocOutboundForm.phoneNumber}
                    className="w-full px-4 py-2 bg-barpel-teal text-white rounded-lg hover:bg-barpel-teal-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {savingByocOutbound ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />Connecting…</>
                    ) : (
                      <><Save className="w-4 h-4" />Connect Number</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-base font-semibold text-barpel-slate">
              Verified Caller ID
            </h3>
          </div>

          {status?.outbound.hasVerifiedNumber && verificationStep !== 'success' ? (
            // Active verified number
            <div className="space-y-4">
              <div className="bg-barpel-teal/5 border border-barpel-slate/10 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-barpel-teal" />
                  <p className="text-2xl font-mono font-bold text-barpel-teal-dark">
                    {status.outbound.verifiedNumber}
                  </p>
                </div>
                <p className="text-xs text-barpel-slate/60">
                  Verified on {new Date(status.outbound.verifiedAt!).toLocaleDateString()}
                </p>
              </div>

              <div className={`border rounded-lg p-4 ${status.outbound.vapiLinked ? 'bg-barpel-teal/5 border-barpel-slate/10' : 'bg-barpel-teal/5 border-barpel-slate/10'}`}>
                {status.outbound.vapiLinked ? (
                  <p className="text-sm text-barpel-slate">
                    <strong>Ready for outbound calls.</strong> When your AI calls customers, they see <strong>{status.outbound.verifiedNumber}</strong>.
                  </p>
                ) : (
                  <p className="text-sm text-barpel-slate/70">
                    <strong>Linking to call system...</strong> This usually completes within a few seconds. Refresh the page if this persists.
                  </p>
                )}
              </div>

              <button
                onClick={() => setConfirmDeleteVerified(true)}
                className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Remove Verification
              </button>
            </div>
          ) : (
            // Verification wizard
            <div className="space-y-4">
              {verificationStep === 'input' && (
                <>
                  {/* Value proposition */}
                  <div className="space-y-3">
                    <p className="text-sm text-barpel-slate">
                      When your AI calls customers, they'll see this number on their caller ID.
                    </p>

                    <div className="bg-barpel-teal/5 border border-barpel-slate/10 rounded-lg p-3 space-y-2">
                      <p className="text-xs font-medium text-barpel-slate">Why this matters:</p>
                      <ul className="text-xs text-barpel-slate/70 space-y-1">
                        <li>• Customers recognize YOUR number (not "Unknown")</li>
                        <li>• Higher answer rates (people trust known numbers)</li>
                        <li>• Professional appearance</li>
                      </ul>
                    </div>
                  </div>

                  {/* Input field - Progressive disclosure: show detailed steps only when needed (step 2) */}
                  <div className="border-t border-barpel-slate/10 pt-4">
                    <label className="block text-sm font-medium text-barpel-slate mb-2">
                      Your Business Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+1234567890"
                        className={`w-full px-4 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-barpel-teal outline-none font-mono transition-colors ${
                          isValidPhoneFormat
                            ? 'border-barpel-teal/50 focus:border-barpel-teal/50'
                            : 'border-barpel-slate/10 focus:border-barpel-teal/50'
                        }`}
                      />
                      {isValidPhoneFormat && detectedCountry && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <CheckCircle className="w-5 h-5 text-barpel-teal" />
                        </div>
                      )}
                    </div>
                    {isValidPhoneFormat && detectedCountry ? (
                      <p className="text-xs text-barpel-teal mt-1 flex items-center gap-1">
                        ✓ Valid {getCountryName(detectedCountry)} number detected
                      </p>
                    ) : (
                      <p className="text-xs text-barpel-slate/60 mt-1">Must include country code: +1 (US), +234 (Nigeria), +44 (UK), +91 (India), etc.</p>
                    )}
                  </div>

                  {verificationError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                      {verificationError}
                    </div>
                  )}

                  <button
                    onClick={handleSendVerification}
                    disabled={!phoneNumber || verifying}
                    className="w-full px-4 py-2 bg-barpel-teal text-white rounded-lg hover:bg-barpel-teal-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Calling...
                      </>
                    ) : (
                      <>
                        <Phone className="w-4 h-4" />
                        Start Verification
                      </>
                    )}
                  </button>
                </>
              )}

              {verificationStep === 'verify' && (
                <>
                  {/* Status header — different message if recovered from navigation */}
                  <div className="border border-barpel-slate/10 rounded-lg p-3 bg-barpel-teal/5">
                    {verificationCode ? (
                      <>
                        <p className="text-sm font-medium text-barpel-slate mb-1">
                          Verification call sent!
                        </p>
                        <p className="text-xs text-barpel-slate/60">
                          Calling: {phoneNumber}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-barpel-slate mb-1">
                          Verification in progress for {phoneNumber}
                        </p>
                        <p className="text-xs text-barpel-slate/60">
                          If you already entered the code on your phone, click "Verify & Complete Setup" below.
                          Otherwise, click "Resend" to get a new verification call.
                        </p>
                      </>
                    )}
                  </div>

                  {/* VALIDATION CODE DISPLAY - CRITICAL */}
                  {verificationCode && (
                    <div className="bg-barpel-teal/5 border-2 border-barpel-teal/50 rounded-lg p-6 text-center">
                      <p className="text-sm font-medium text-barpel-slate mb-3">
                        🔑 Your Verification Code
                      </p>
                      <div className="bg-white border-2 border-barpel-teal/40 rounded-lg p-4 mb-3">
                        <p className="text-4xl font-bold text-barpel-teal tracking-widest font-mono">
                          {verificationCode}
                        </p>
                      </div>
                      <p className="text-xs text-barpel-slate/60">
                        Enter this code on your phone keypad when Twilio calls
                      </p>
                    </div>
                  )}

                  {/* Phone will ring notice */}
                  <div className="bg-barpel-teal/5 border border-barpel-slate/10 rounded-lg p-4">
                    <p className="text-sm text-barpel-slate font-medium mb-2">
                      📞 Your phone will ring in ~30 seconds
                    </p>

                    <div className="space-y-3 mt-3">
                      <p className="text-xs font-medium text-barpel-slate">What to do next:</p>

                      <div className="space-y-2 text-xs text-barpel-slate/70">
                        <div className="flex gap-2">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-barpel-teal/10 text-barpel-teal-dark flex items-center justify-center text-xs font-bold">1</span>
                          <p className="pt-0.5">Answer the call from Twilio (+14157234000)</p>
                        </div>
                        <div className="flex gap-2">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-barpel-teal/10 text-barpel-teal-dark flex items-center justify-center text-xs font-bold">2</span>
                          <p className="pt-0.5">Automated voice will ask: "Please enter your verification code"</p>
                        </div>
                        <div className="flex gap-2">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-barpel-teal/10 text-barpel-teal-dark flex items-center justify-center text-xs font-bold">3</span>
                          <p className="pt-0.5">Enter the code shown above using your phone's keypad<br/><span className="text-barpel-slate/50">(Enter it on your PHONE, not on this screen)</span></p>
                        </div>
                        <div className="flex gap-2">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-barpel-teal/10 text-barpel-teal-dark flex items-center justify-center text-xs font-bold">4</span>
                          <p className="pt-0.5">Once you've entered it, click "Verify & Complete Setup" below</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Troubleshooting */}
                  <div className="text-center">
                    <p className="text-xs text-barpel-slate/60">
                      ⏱️ Call not received after 2 minutes?
                    </p>
                    <button
                      onClick={handleSendVerification}
                      className="text-xs text-barpel-teal hover:text-barpel-teal-dark font-medium mt-1"
                    >
                      Resend Verification Call
                    </button>
                  </div>

                  {verificationError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                      {verificationError}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={resetVerification}
                      className="flex-1 px-4 py-2 border border-barpel-slate/10 text-barpel-slate rounded-lg hover:bg-barpel-teal/5 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmVerification}
                      disabled={verifying}
                      className="flex-1 px-4 py-2 bg-barpel-teal text-white rounded-lg hover:bg-barpel-teal-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {verifying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Verify & Complete Setup
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}

              {verificationStep === 'success' && (
                <div className="space-y-4">
                  {/* Success header */}
                  <div className="text-center py-6">
                    <div className="w-16 h-16 rounded-full bg-barpel-teal/5 mx-auto flex items-center justify-center mb-3 border border-barpel-slate/10">
                      <CheckCircle className="w-8 h-8 text-barpel-teal" />
                    </div>
                    <h3 className="text-lg font-semibold text-barpel-slate mb-2">
                      🎉 Verification Complete!
                    </h3>
                    <p className="text-sm text-barpel-slate font-medium">
                      Your caller ID is now set to: {phoneNumber}
                    </p>
                  </div>

                  {/* What this means */}
                  <div className="bg-barpel-teal/5 border border-barpel-slate/10 rounded-lg p-4 space-y-3">
                    <p className="text-xs font-medium text-barpel-slate">What this means:</p>

                    <div className="space-y-2 text-xs text-barpel-slate/70">
                      <div className="flex gap-2">
                        <span className="text-barpel-teal">✓</span>
                        <p>When your AI calls customers, they see YOUR business number</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-barpel-teal">✓</span>
                        <p>No more "Unknown Number" or random phone numbers</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-barpel-teal">✓</span>
                        <p>Higher answer rates = more conversations</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      resetVerification();
                      fetchPhoneSettings();
                    }}
                    className="w-full px-4 py-2 bg-barpel-teal text-white rounded-lg hover:bg-barpel-teal-dark transition-colors font-medium"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Buy Number Modal */}
      {showBuyNumberModal && (
        <BuyNumberModal
          onClose={() => {
            setShowBuyNumberModal(false);
            fetchPhoneSettings();
          }}
          currentMode={status?.mode || 'none'}
          defaultDirection={buyModalDirection}
        />
      )}

      {/* Delete Managed Number Confirmation */}
      {confirmDeleteManaged && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-barpel-slate mb-2">
              Delete AI Phone Number?
            </h3>
            <p className="text-sm text-barpel-slate/60 mb-4">
              This will release {status?.inbound.managedNumber} and disconnect all forwarding.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteManaged(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-barpel-slate/10 text-barpel-slate rounded-lg hover:bg-barpel-teal/5 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteManaged}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Number'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Outbound Managed Number Confirmation */}
      {confirmDeleteManagedOutbound && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-barpel-slate mb-2">
              Delete Outbound Number?
            </h3>
            <p className="text-sm text-barpel-slate/60 mb-4">
              This will release {status?.outbound.managedOutboundNumber} and disconnect it from outbound calls. Your agent will need a new number configured before making calls.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteManagedOutbound(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-barpel-slate/10 text-barpel-slate rounded-lg hover:bg-barpel-teal/5 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteManagedOutbound}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Number'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete BYOC Inbound Confirmation */}
      {confirmDeleteByocInbound && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-barpel-slate mb-2">
              Disconnect Inbound Number?
            </h3>
            <p className="text-sm text-barpel-slate/60 mb-4">
              This will disconnect {status?.inbound.byocInboundNumber} from your AI receptionist. Your Twilio number itself won't be deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteByocInbound(false)}
                disabled={deletingByocInbound}
                className="flex-1 px-4 py-2 border border-barpel-slate/10 text-barpel-slate rounded-lg hover:bg-barpel-teal/5 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteByocInbound}
                disabled={deletingByocInbound}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingByocInbound ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Removing…</>
                ) : (
                  'Remove Number'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete BYOC Outbound Confirmation */}
      {confirmDeleteByocOutbound && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-barpel-slate mb-2">
              Disconnect Outbound Number?
            </h3>
            <p className="text-sm text-barpel-slate/60 mb-4">
              This will disconnect {status?.outbound.byocOutboundNumber} from outbound AI calls. Your Twilio number itself won't be deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteByocOutbound(false)}
                disabled={deletingByocOutbound}
                className="flex-1 px-4 py-2 border border-barpel-slate/10 text-barpel-slate rounded-lg hover:bg-barpel-teal/5 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteByocOutbound}
                disabled={deletingByocOutbound}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingByocOutbound ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Removing…</>
                ) : (
                  'Remove Number'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Verified Number Confirmation */}
      {confirmDeleteVerified && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-barpel-slate mb-2">
              Remove Verified Number?
            </h3>
            <p className="text-sm text-barpel-slate/60 mb-4">
              This will remove {status?.outbound.verifiedNumber} from Twilio, disconnect it from outbound calls, and allow you to verify a different number.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteVerified(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-barpel-slate/10 text-barpel-slate rounded-lg hover:bg-barpel-teal/5 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteVerified}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                {deleting ? 'Removing...' : 'Remove Verification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
