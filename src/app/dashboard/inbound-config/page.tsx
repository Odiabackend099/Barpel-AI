'use client';
export const dynamic = "force-dynamic";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import {
  Phone, Save, Loader2, Check, AlertCircle, Lock, Trash2, ChevronDown, X, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authedBackendFetch } from '@/lib/authed-backend-fetch';

interface PhoneStatus {
  configured: boolean;
  inboundNumber?: string;
  outboundNumber?: string;
  vapiPhoneNumberId?: string;
  activatedAt?: string;
  agentId?: string | null;
  workspaceMismatch?: boolean;
  lastError?: string | null;
}

interface AIAgent {
  id: string;
  name: string;
  role: 'inbound' | 'outbound';
  vapiAssistantId?: string | null;
}

interface ByocFormState {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

const emptyForm: ByocFormState = { accountSid: '', authToken: '', phoneNumber: '' };

function validateForm(f: ByocFormState): string | null {
  if (!f.accountSid.match(/^AC[a-z0-9]{32}$/i)) return 'Account SID must start with "AC" and be 34 characters';
  if (f.authToken.length !== 32) return 'Auth Token must be exactly 32 characters';
  if (!/^\+[1-9]\d{1,14}$/.test(f.phoneNumber)) return 'Phone number must be E.164 format (e.g. +442012345678)';
  return null;
}

// ─── Credential Form ──────────────────────────────────────────────────────────
function ByocForm({
  title,
  description,
  form,
  setForm,
  saving,
  onSave,
}: {
  title: string;
  description: string;
  form: ByocFormState;
  setForm: React.Dispatch<React.SetStateAction<ByocFormState>>;
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-surgical-200 p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Lock className="w-5 h-5 text-barpel-slate/40" />
        <div>
          <h2 className="text-base font-semibold text-barpel-slate">{title}</h2>
          <p className="text-xs text-barpel-slate/60">{description}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-barpel-slate/60 mb-1">Account SID</label>
          <input
            type="text"
            value={form.accountSid}
            onChange={e => setForm(p => ({ ...p, accountSid: e.target.value }))}
            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full px-3 py-2 border border-surgical-200 rounded-lg focus:ring-2 focus:ring-surgical-500 focus:border-surgical-500 outline-none font-mono text-sm text-barpel-slate bg-white placeholder-barpel-gray/50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-barpel-slate/60 mb-1">Auth Token</label>
          <input
            type="password"
            value={form.authToken}
            onChange={e => setForm(p => ({ ...p, authToken: e.target.value }))}
            placeholder="••••••••••••••••••••••••••••••••"
            className="w-full px-3 py-2 border border-surgical-200 rounded-lg focus:ring-2 focus:ring-surgical-500 focus:border-surgical-500 outline-none font-mono text-sm text-barpel-slate bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-barpel-slate/60 mb-1">Phone Number (E.164)</label>
          <input
            type="text"
            value={form.phoneNumber}
            onChange={e => setForm(p => ({ ...p, phoneNumber: e.target.value }))}
            placeholder="+442012345678"
            className="w-full px-3 py-2 border border-surgical-200 rounded-lg focus:ring-2 focus:ring-surgical-500 focus:border-surgical-500 outline-none font-mono text-sm text-barpel-slate bg-white"
          />
          <p className="text-xs text-barpel-slate/50 mt-1">Include country code, e.g. +1 for US</p>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onSave}
            disabled={saving}
            className="px-5 py-2 bg-barpel-teal text-white rounded-lg hover:bg-barpel-teal-dark transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Configuring…</>
            ) : (
              <><Save className="w-4 h-4" /> Save and Activate</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Active Number Card ───────────────────────────────────────────────────────
function ActiveNumberCard({
  label,
  phoneNumber,
  agentId,
  agents,
  onAssignAgent,
  onTestCall,
  onDelete,
  deleting,
  assigning,
}: {
  label: string;
  phoneNumber: string;
  agentId: string | null | undefined;
  agents: AIAgent[];
  onAssignAgent: (agentId: string) => void;
  onTestCall?: () => void;
  onDelete: () => void;
  deleting: boolean;
  assigning: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const assignedAgent = agents.find(a => a.id === agentId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-surgical-200 p-5"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-surgical-50 flex items-center justify-center flex-shrink-0">
            <Check className="w-5 h-5 text-surgical-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-barpel-slate/60 uppercase tracking-wide">{label}</p>
            <p className="text-base font-semibold text-barpel-slate font-mono">{phoneNumber}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {onTestCall && (
            <button
              onClick={onTestCall}
              className="px-3 py-1.5 text-xs border border-surgical-200 text-barpel-slate rounded-lg hover:bg-surgical-50 transition-colors flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" /> Test Call
            </button>
          )}
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Release
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-red-600 font-medium">Release number?</span>
              <button
                onClick={onDelete}
                disabled={deleting}
                className="px-2.5 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1 text-xs border border-surgical-200 text-barpel-slate rounded-lg hover:bg-surgical-50 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Agent assignment dropdown */}
      <div className="mt-4 pt-4 border-t border-surgical-100">
        <div className="flex items-center justify-between gap-3">
          <label className="text-xs font-medium text-barpel-slate/60">Assigned Agent</label>
          <div className="relative flex-1 max-w-xs">
            <select
              value={agentId || ''}
              onChange={e => e.target.value && onAssignAgent(e.target.value)}
              disabled={assigning || agents.length === 0}
              className="w-full appearance-none pl-3 pr-8 py-1.5 text-sm border border-surgical-200 rounded-lg bg-white text-barpel-slate focus:ring-2 focus:ring-surgical-500 focus:border-surgical-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {agents.length === 0 ? (
                <option value="">No agent configured yet</option>
              ) : (
                <>
                  <option value="">— Select agent —</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name}{!a.vapiAssistantId ? ' (not synced)' : ''}
                    </option>
                  ))}
                </>
              )}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-barpel-slate/40 pointer-events-none" />
            {assigning && (
              <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-barpel-teal" />
            )}
          </div>
        </div>
        {assignedAgent && (
          <p className="text-xs text-barpel-slate/50 mt-1.5 text-right">
            Currently: <span className="font-medium text-barpel-slate/70">{assignedAgent.name}</span>
            {!assignedAgent.vapiAssistantId && (
              <span className="text-amber-500 ml-1">(save agent config to sync)</span>
            )}
          </p>
        )}

        {/* Re-sync button — re-links the assigned agent to Vapi (useful after agent config changes) */}
        {agentId && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => onAssignAgent(agentId)}
              disabled={assigning || !assignedAgent?.vapiAssistantId}
              title={!assignedAgent?.vapiAssistantId ? 'Save agent config first to enable sync' : 'Re-link this agent to the Vapi phone number'}
              className="px-3 py-1.5 text-xs border border-barpel-teal/30 text-barpel-teal rounded-lg hover:bg-barpel-teal/5 transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {assigning ? (
                <><Loader2 className="w-3 h-3 animate-spin" /> Syncing…</>
              ) : (
                <><RefreshCw className="w-3 h-3" /> Sync Agent to Number</>
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function InboundConfigPage() {
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToast();

  // Status state
  const [inboundStatus, setInboundStatus] = useState<PhoneStatus | null>(null);
  const [outboundStatus, setOutboundStatus] = useState<PhoneStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Agents for dropdowns
  const [inboundAgents, setInboundAgents] = useState<AIAgent[]>([]);
  const [outboundAgents, setOutboundAgents] = useState<AIAgent[]>([]);

  // Form state
  const [inboundForm, setInboundForm] = useState<ByocFormState>(emptyForm);
  const [outboundForm, setOutboundForm] = useState<ByocFormState>(emptyForm);

  // Loading flags
  const [savingInbound, setSavingInbound] = useState(false);
  const [savingOutbound, setSavingOutbound] = useState(false);
  const [deletingInbound, setDeletingInbound] = useState(false);
  const [deletingOutbound, setDeletingOutbound] = useState(false);
  const [assigningInbound, setAssigningInbound] = useState(false);
  const [assigningOutbound, setAssigningOutbound] = useState(false);

  // Managed phone conflict warning
  const [telephonyMode, setTelephonyMode] = useState<string | null>(null);
  const [managedPhone, setManagedPhone] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const [inbound, outbound, agentConfig, telephony] = await Promise.allSettled([
        authedBackendFetch<PhoneStatus>('/api/inbound/status'),
        authedBackendFetch<PhoneStatus>('/api/inbound/status-outbound'),
        authedBackendFetch<{ agents: AIAgent[] }>('/api/founder-console/agent/config'),
        authedBackendFetch<{ mode: string; phoneNumber?: string }>('/api/integrations/telephony-mode'),
      ]);

      if (inbound.status === 'fulfilled') setInboundStatus(inbound.value);
      if (outbound.status === 'fulfilled') setOutboundStatus(outbound.value);
      if (agentConfig.status === 'fulfilled') {
        const all = agentConfig.value.agents || [];
        setInboundAgents(all.filter(a => a.role === 'inbound'));
        setOutboundAgents(all.filter(a => a.role === 'outbound'));
      }
      if (telephony.status === 'fulfilled') {
        setTelephonyMode(telephony.value.mode);
        setManagedPhone(telephony.value.phoneNumber || null);
      }
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Inbound handlers ───────────────────────────────────────────────────────
  const handleSaveInbound = async () => {
    const err = validateForm(inboundForm);
    if (err) { showError(err); return; }
    setSavingInbound(true);
    try {
      await authedBackendFetch('/api/inbound/setup', {
        method: 'POST',
        body: JSON.stringify({
          twilioAccountSid: inboundForm.accountSid,
          twilioAuthToken: inboundForm.authToken,
          twilioPhoneNumber: inboundForm.phoneNumber,
        }),
        timeoutMs: 30000,
        retries: 1,
      });
      showSuccess('Inbound number activated! Your agent will answer calls on this number.');
      setInboundForm(emptyForm);
      await fetchAll();
    } catch (e: any) {
      showError(e.message || 'Failed to configure inbound number');
    } finally {
      setSavingInbound(false);
    }
  };

  const handleDeleteInbound = async () => {
    setDeletingInbound(true);
    try {
      await authedBackendFetch('/api/inbound/setup', { method: 'DELETE', timeoutMs: 15000 });
      showSuccess('Inbound number released.');
      setInboundStatus(null);
      await fetchAll();
    } catch (e: any) {
      showError(e.message || 'Failed to release inbound number');
    } finally {
      setDeletingInbound(false);
    }
  };

  const handleTestCall = async () => {
    try {
      const data = await authedBackendFetch<any>('/api/inbound/test', { method: 'POST', timeoutMs: 30000 });
      showSuccess(data?.note || 'Test call initiated!');
    } catch {
      showError('Failed to initiate test call');
    }
  };

  const handleAssignInboundAgent = async (agentId: string) => {
    setAssigningInbound(true);
    try {
      await authedBackendFetch('/api/inbound/assign-agent', {
        method: 'PATCH',
        body: JSON.stringify({ phoneNumberType: 'inbound', agentId }),
        timeoutMs: 15000,
      });
      showSuccess('Agent assigned to inbound number.');
      await fetchAll();
    } catch (e: any) {
      showError(e.message || 'Failed to assign agent');
    } finally {
      setAssigningInbound(false);
    }
  };

  // ── Outbound handlers ──────────────────────────────────────────────────────
  const handleSaveOutbound = async () => {
    const err = validateForm(outboundForm);
    if (err) { showError(err); return; }
    setSavingOutbound(true);
    try {
      await authedBackendFetch('/api/inbound/setup-outbound', {
        method: 'POST',
        body: JSON.stringify({
          twilioAccountSid: outboundForm.accountSid,
          twilioAuthToken: outboundForm.authToken,
          twilioPhoneNumber: outboundForm.phoneNumber,
        }),
        timeoutMs: 30000,
        retries: 1,
      });
      showSuccess('Outbound number activated! Your agent will use this number for outbound calls.');
      setOutboundForm(emptyForm);
      await fetchAll();
    } catch (e: any) {
      showError(e.message || 'Failed to configure outbound number');
    } finally {
      setSavingOutbound(false);
    }
  };

  const handleDeleteOutbound = async () => {
    setDeletingOutbound(true);
    try {
      await authedBackendFetch('/api/inbound/setup-outbound', { method: 'DELETE', timeoutMs: 15000 });
      showSuccess('Outbound number released.');
      setOutboundStatus(null);
      await fetchAll();
    } catch (e: any) {
      showError(e.message || 'Failed to release outbound number');
    } finally {
      setDeletingOutbound(false);
    }
  };

  const handleAssignOutboundAgent = async (agentId: string) => {
    setAssigningOutbound(true);
    try {
      await authedBackendFetch('/api/inbound/assign-agent', {
        method: 'PATCH',
        body: JSON.stringify({ phoneNumberType: 'outbound', agentId }),
        timeoutMs: 15000,
      });
      showSuccess('Agent assigned to outbound number.');
      await fetchAll();
    } catch (e: any) {
      showError(e.message || 'Failed to assign agent');
    } finally {
      setAssigningOutbound(false);
    }
  };

  if (loadingStatus) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-surgical-600" />
      </div>
    );
  }

  const inboundActive = inboundStatus?.configured === true;
  const outboundActive = outboundStatus?.configured === true;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-barpel-slate">Phone Settings</h1>
        <p className="text-barpel-slate/60 mt-1 text-sm">
          Connect your Twilio numbers for inbound call handling and outbound dialling
        </p>
      </div>

      {/* Managed number conflict warning */}
      {telephonyMode === 'managed' && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Managed number active{managedPhone ? `: ${managedPhone}` : ''}
            </p>
            <p className="text-sm text-amber-700 mt-0.5">
              You have a Barpel-managed number. Saving BYOC credentials will replace it as the active number.
            </p>
          </div>
        </div>
      )}

      {/* ── BYOC Inbound ───────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-barpel-slate">BYOC Inbound</h2>
            <p className="text-xs text-barpel-slate/60">Receives inbound calls on your Twilio number</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
            inboundActive
              ? 'bg-surgical-50 text-surgical-600'
              : 'bg-surgical-50 text-barpel-slate/50'
          }`}>
            {inboundActive ? <><Check className="w-3.5 h-3.5" /> Active</> : 'Not configured'}
          </span>
        </div>

        {/* Prerequisite */}
        {!inboundActive && inboundAgents.length === 0 && (
          <div className="bg-surgical-50 border border-surgical-200 rounded-lg p-3 text-xs text-barpel-slate/70 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Create and save an <strong>Inbound Agent</strong> in Agent Config before activating this number.</span>
          </div>
        )}

        {inboundActive && inboundStatus ? (
          <ActiveNumberCard
            label="Inbound number"
            phoneNumber={inboundStatus.inboundNumber!}
            agentId={inboundStatus.agentId}
            agents={inboundAgents}
            onAssignAgent={handleAssignInboundAgent}
            onTestCall={handleTestCall}
            onDelete={handleDeleteInbound}
            deleting={deletingInbound}
            assigning={assigningInbound}
          />
        ) : (
          <ByocForm
            title="Inbound Twilio Credentials"
            description="Your Twilio number will answer calls via your inbound AI agent"
            form={inboundForm}
            setForm={setInboundForm}
            saving={savingInbound}
            onSave={handleSaveInbound}
          />
        )}

        {/* Workspace mismatch warning */}
        {inboundStatus?.workspaceMismatch && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            Vapi workspace key has changed since this number was imported. Re-save credentials to re-link.
          </div>
        )}
      </section>

      <div className="border-t border-surgical-100" />

      {/* ── BYOC Outbound ──────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-barpel-slate">BYOC Outbound</h2>
            <p className="text-xs text-barpel-slate/60">Used as caller ID for outbound AI calls</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
            outboundActive
              ? 'bg-surgical-50 text-surgical-600'
              : 'bg-surgical-50 text-barpel-slate/50'
          }`}>
            {outboundActive ? <><Check className="w-3.5 h-3.5" /> Active</> : 'Not configured'}
          </span>
        </div>

        {/* Prerequisite */}
        {!outboundActive && outboundAgents.length === 0 && (
          <div className="bg-surgical-50 border border-surgical-200 rounded-lg p-3 text-xs text-barpel-slate/70 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Create and save an <strong>Outbound Agent</strong> in Agent Config before activating this number.</span>
          </div>
        )}

        {outboundActive && outboundStatus ? (
          <ActiveNumberCard
            label="Outbound caller ID"
            phoneNumber={outboundStatus.outboundNumber!}
            agentId={outboundStatus.agentId}
            agents={outboundAgents}
            onAssignAgent={handleAssignOutboundAgent}
            onDelete={handleDeleteOutbound}
            deleting={deletingOutbound}
            assigning={assigningOutbound}
          />
        ) : (
          <ByocForm
            title="Outbound Twilio Credentials"
            description="Your Twilio number will be used as the caller ID for outbound AI calls"
            form={outboundForm}
            setForm={setOutboundForm}
            saving={savingOutbound}
            onSave={handleSaveOutbound}
          />
        )}
      </section>
    </div>
  );
}
