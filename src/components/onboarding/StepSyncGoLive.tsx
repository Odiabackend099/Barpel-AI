'use client';

import { useState } from 'react';
import { mutate } from 'swr';
import { motion } from 'framer-motion';
import { Zap, Loader2, Phone, Bot, Copy, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/lib/store/onboardingStore';
import { authedBackendFetch } from '@/lib/authed-backend-fetch';
import ConfettiEffect from './ConfettiEffect';

export default function StepSyncGoLive() {
  const {
    direction, phoneNumber, vapiPhoneId,
    agentName, businessName,
    syncComplete, setSyncComplete,
  } = useOnboardingStore();
  const router = useRouter();

  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    setError(null);

    try {
      // Step 1: Bind phone ↔ agent via existing assign-number endpoint
      const syncResult = await authedBackendFetch<{ success: boolean; error?: string }>(
        '/api/integrations/vapi/assign-number',
        {
          method: 'POST',
          body: JSON.stringify({
            phoneNumberId: vapiPhoneId,
            role: direction,
          }),
        }
      );

      if (!syncResult?.success) {
        setError(syncResult?.error || 'Failed to sync. Please try again.');
        setSyncing(false);
        return;
      }

      // Step 2: Mark onboarding complete
      await authedBackendFetch('/api/onboarding/complete', {
        method: 'POST',
        body: JSON.stringify({
          clinic_name: businessName,
        }),
      });

      setSyncComplete(true);
      // Invalidate onboarding status cache so dashboard doesn't redirect back
      mutate('/api/onboarding/status', { needs_onboarding: false }, false);
    } catch (err: any) {
      setError(err.message || 'Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const handleCopyNumber = () => {
    if (phoneNumber) {
      navigator.clipboard.writeText(phoneNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGoDashboard = () => {
    router.replace('/dashboard');
  };

  // Post-sync: Celebration screen
  if (syncComplete) {
    return (
      <>
        <ConfettiEffect duration={4000} particleCount={150} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.4, 0.0, 0.2, 1.0] }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-barpel-teal/10 border border-barpel-border mb-6"
          >
            <Zap className="w-10 h-10 text-barpel-teal" />
          </motion.div>

          <h1 className="text-3xl font-bold text-barpel-slate tracking-tighter mb-3">
            Barpel is Live!
          </h1>
          <p className="text-base text-barpel-slate/60 mb-6">
            {direction === 'inbound'
              ? 'Your AI receptionist is now answering calls on:'
              : 'Your AI sales agent is ready to make calls from:'}
          </p>

          {/* Phone number with copy */}
          <div className="bg-barpel-teal/10 border border-barpel-teal/30 rounded-xl p-5 mb-6 max-w-sm mx-auto">
            <p className="text-3xl font-mono font-bold text-barpel-teal mb-2">{phoneNumber}</p>
            <button
              type="button"
              onClick={handleCopyNumber}
              className="inline-flex items-center gap-1.5 text-sm text-barpel-teal/70 hover:text-barpel-teal transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy number
                </>
              )}
            </button>
          </div>

          {direction === 'inbound' && (
            <p className="text-sm text-barpel-slate/50 mb-6">
              Call your business number right now to hear the AI answer.
            </p>
          )}

          <button
            type="button"
            onClick={handleGoDashboard}
            className="w-full max-w-xs mx-auto block px-6 py-3 rounded-xl bg-barpel-teal text-white font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-100 transition-all"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </>
    );
  }

  // Pre-sync: Summary + Activate button
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="text-center"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-barpel-teal/10 border border-barpel-border mb-6">
        <Zap className="w-8 h-8 text-barpel-teal" />
      </div>

      <h1 className="text-3xl font-bold text-barpel-slate tracking-tighter mb-3">
        Ready to Go Live
      </h1>
      <p className="text-base text-barpel-slate/60 mb-6">
        Review your setup and activate your AI agent.
      </p>

      {/* Summary Card */}
      <div className="border-2 border-barpel-teal/30 bg-white rounded-xl p-5 mb-6 max-w-sm mx-auto text-left space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-barpel-teal/10 flex items-center justify-center flex-shrink-0">
            <Phone className="w-4 h-4 text-barpel-teal" />
          </div>
          <div>
            <p className="text-xs text-barpel-slate/50">Phone Number</p>
            <p className="font-mono font-medium text-barpel-slate text-sm">{phoneNumber || 'Not set'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-barpel-teal/10 flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-barpel-teal" />
          </div>
          <div>
            <p className="text-xs text-barpel-slate/50">AI Agent</p>
            <p className="font-medium text-barpel-slate text-sm">{agentName || 'Default Agent'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-barpel-teal/10 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-barpel-teal" />
          </div>
          <div>
            <p className="text-xs text-barpel-slate/50">Type</p>
            <p className="font-medium text-barpel-slate text-sm capitalize">
              {direction === 'inbound' ? 'Inbound Receptionist' : 'Outbound Sales Agent'}
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-4 max-w-sm mx-auto">
          {error}
        </p>
      )}

      {/* Activate */}
      <button
        type="button"
        onClick={handleSync}
        disabled={syncing || !vapiPhoneId}
        className="w-full max-w-xs mx-auto block px-6 py-4 rounded-xl bg-barpel-teal text-white font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
      >
        {syncing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Activating...
          </>
        ) : (
          'Activate AI'
        )}
      </button>

      {!vapiPhoneId && (
        <p className="text-xs text-barpel-slate/40 mt-3">
          Phone number not yet linked to Vapi. Please go back and re-provision.
        </p>
      )}
    </motion.div>
  );
}
