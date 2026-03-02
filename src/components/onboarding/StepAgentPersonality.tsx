'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Loader2 } from 'lucide-react';
import { useOnboardingStore } from '@/lib/store/onboardingStore';
import { useOnboardingTelemetry } from '@/hooks/useOnboardingTelemetry';
import { authedBackendFetch } from '@/lib/authed-backend-fetch';
import { PROMPT_TEMPLATES } from '@/lib/prompt-templates';

export default function StepAgentPersonality() {
  const {
    direction, businessName,
    agentName, setAgentName,
    agentId, setAgentId,
    vapiAssistantId, setVapiAssistantId,
    voiceList, setVoiceList,
    nextStep,
  } = useOnboardingStore();
  const { track } = useOnboardingTelemetry();

  // Default agent name
  const defaultName = businessName
    ? `${businessName} AI ${direction === 'inbound' ? 'Receptionist' : 'Sales Agent'}`
    : `AI ${direction === 'inbound' ? 'Receptionist' : 'Sales Agent'}`;

  const [localAgentName, setLocalAgentName] = useState(agentName || defaultName);
  const [selectedVoiceId, setSelectedVoiceId] = useState('');
  const [greeting, setGreeting] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use the first prompt template as default
  const defaultTemplate = PROMPT_TEMPLATES[0];
  const [systemPrompt, setSystemPrompt] = useState(
    defaultTemplate?.systemPrompt || ''
  );

  // Set default greeting based on direction
  useEffect(() => {
    if (!greeting) {
      setGreeting(
        defaultTemplate?.firstMessage ||
        (direction === 'inbound'
          ? `Thank you for calling ${businessName || 'our office'}. How can I help you today?`
          : `Hi, this is the AI assistant from ${businessName || 'our company'}. I'm calling to follow up with you.`)
      );
    }
  }, [direction, businessName, greeting, defaultTemplate]);

  // Fetch voices if not pre-fetched in Step 3
  useEffect(() => {
    if (voiceList.length > 0) return;
    const fetchVoices = async () => {
      try {
        const data = await authedBackendFetch<{ voices?: Array<{ id: string; name: string }> }>(
          '/api/founder-console/voices'
        );
        if (data?.voices?.length) {
          setVoiceList(data.voices);
        }
      } catch {
        // Will use default voice
      }
    };
    fetchVoices();
  }, [voiceList.length, setVoiceList]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);

    try {
      const result = await authedBackendFetch<{
        success: boolean;
        agentId?: string;
        vapiAssistantId?: string;
        error?: string;
      }>('/api/founder-console/agents/save', {
        method: 'POST',
        body: JSON.stringify({
          name: localAgentName.trim() || defaultName,
          role: direction,
          systemPrompt,
          firstMessage: greeting,
          voiceId: selectedVoiceId || undefined,
        }),
      });

      if (result?.agentId) {
        setAgentName(localAgentName.trim() || defaultName);
        setAgentId(result.agentId);
        if (result.vapiAssistantId) setVapiAssistantId(result.vapiAssistantId);
        track('test_call_completed', 3);
        nextStep();
      } else {
        setError(result?.error || 'Failed to save agent. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // If already saved (came back), allow continue
  const canContinue = !!agentId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-barpel-teal/10 border border-barpel-border mb-4">
          <Bot className="w-8 h-8 text-barpel-teal" />
        </div>

        <h1 className="text-3xl font-bold text-barpel-slate tracking-tighter mb-2">
          Customize Your AI Agent
        </h1>
        <p className="text-base text-barpel-slate/60">
          Give your agent a name, personality, and voice.
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        {/* Agent Name */}
        <div>
          <label className="block text-sm font-medium text-barpel-slate/70 mb-1.5">
            Agent Name
          </label>
          <input
            type="text"
            value={localAgentName}
            onChange={(e) => setLocalAgentName(e.target.value)}
            placeholder={defaultName}
            className="w-full px-4 py-2.5 rounded-xl border border-barpel-border bg-white text-barpel-slate placeholder:text-barpel-slate/40 focus:outline-none focus:ring-2 focus:ring-barpel-teal/30 focus:border-barpel-teal/50 transition-all text-sm"
            maxLength={100}
          />
        </div>

        {/* Voice */}
        {voiceList.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-barpel-slate/70 mb-1.5">
              Voice
            </label>
            <select
              value={selectedVoiceId}
              onChange={(e) => setSelectedVoiceId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-barpel-border bg-white text-barpel-slate focus:outline-none focus:ring-2 focus:ring-barpel-teal/30 focus:border-barpel-teal/50 transition-all text-sm appearance-none"
            >
              <option value="">Default Voice</option>
              {voiceList.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Greeting */}
        <div>
          <label className="block text-sm font-medium text-barpel-slate/70 mb-1.5">
            Opening Greeting
          </label>
          <input
            type="text"
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            placeholder="How the AI greets callers..."
            className="w-full px-4 py-2.5 rounded-xl border border-barpel-border bg-white text-barpel-slate placeholder:text-barpel-slate/40 focus:outline-none focus:ring-2 focus:ring-barpel-teal/30 focus:border-barpel-teal/50 transition-all text-sm"
            maxLength={500}
          />
        </div>

        {/* System Prompt */}
        <div>
          <label className="block text-sm font-medium text-barpel-slate/70 mb-1.5">
            System Prompt
            <span className="text-xs text-barpel-slate/40 ml-1">(instructions for the AI)</span>
          </label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={6}
            className="w-full px-4 py-2.5 rounded-xl border border-barpel-border bg-white text-barpel-slate placeholder:text-barpel-slate/40 focus:outline-none focus:ring-2 focus:ring-barpel-teal/30 focus:border-barpel-teal/50 transition-all text-sm resize-none"
            placeholder="Describe your AI agent's behavior..."
          />
          <p className="text-xs text-barpel-slate/40 mt-1">
            Pre-filled with a professional template. Customize as needed.
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Save / Continue */}
        <button
          type="button"
          onClick={canContinue ? nextStep : handleSave}
          disabled={saving}
          className="w-full px-6 py-3 rounded-xl bg-barpel-teal text-white font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving Agent...
            </>
          ) : canContinue ? (
            'Continue'
          ) : (
            'Save Agent & Continue'
          )}
        </button>
      </div>
    </motion.div>
  );
}
