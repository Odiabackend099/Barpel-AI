'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PhoneForwarded, ShieldCheck, Loader2 } from 'lucide-react';
import { useOnboardingStore } from '@/lib/store/onboardingStore';
import { useOnboardingTelemetry } from '@/hooks/useOnboardingTelemetry';
import { authedBackendFetch } from '@/lib/authed-backend-fetch';
import CarrierForwardingInstructions from '@/app/dashboard/phone-settings/components/CarrierForwardingInstructions';

// E.164 phone format validation
const E164_REGEX = /^\+[1-9]\d{1,14}$/;

export default function StepTelecomRouting() {
  const {
    direction, phoneNumber,
    routingConfigured, setRoutingConfigured,
    setVoiceList,
    nextStep,
  } = useOnboardingStore();
  const { track } = useOnboardingTelemetry();

  // Outbound caller ID verification state
  const [callerNumber, setCallerNumber] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verified, setVerified] = useState(routingConfigured && direction === 'outbound');

  // Pre-fetch voice list during this step (optimization for Step 4)
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const data = await authedBackendFetch<{ voices?: Array<{ id: string; name: string }> }>(
          '/api/founder-console/voices'
        );
        if (data?.voices?.length) {
          setVoiceList(data.voices);
        }
      } catch {
        // Non-critical — Step 4 will retry if needed
      }
    };
    fetchVoices();
  }, [setVoiceList]);

  const handleSendVerification = async () => {
    if (!E164_REGEX.test(callerNumber)) {
      setVerificationError('Please enter a valid phone number in E.164 format (e.g. +12125551234)');
      return;
    }

    setSendingVerification(true);
    setVerificationError(null);

    try {
      const result = await authedBackendFetch<{ success: boolean; error?: string }>(
        '/api/telephony/verify-caller-id/initiate',
        {
          method: 'POST',
          body: JSON.stringify({ phoneNumber: callerNumber }),
        }
      );

      if (result?.success) {
        setVerificationSent(true);
      } else {
        setVerificationError(result?.error || 'Failed to send verification call.');
      }
    } catch (err: any) {
      setVerificationError(err.message || 'Network error. Please try again.');
    } finally {
      setSendingVerification(false);
    }
  };

  const handleVerifyCode = async () => {
    if (otpCode.length !== 6) return;

    setVerifying(true);
    setVerificationError(null);

    try {
      const result = await authedBackendFetch<{ success: boolean; error?: string }>(
        '/api/telephony/verify-caller-id/confirm',
        {
          method: 'POST',
          body: JSON.stringify({ phoneNumber: callerNumber, code: otpCode }),
        }
      );

      if (result?.success) {
        setVerified(true);
        setRoutingConfigured(true);
        track('test_call_completed', 2);
      } else {
        setVerificationError(result?.error || 'Invalid verification code.');
      }
    } catch (err: any) {
      setVerificationError(err.message || 'Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleConfirmForwarding = () => {
    setRoutingConfigured(true);
    track('test_call_completed', 2);
    nextStep();
  };

  const handleContinue = () => {
    nextStep();
  };

  const handleSkip = () => {
    nextStep();
  };

  // INBOUND: Show call forwarding instructions
  if (direction === 'inbound') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-barpel-teal/10 border border-barpel-border mb-6">
          <PhoneForwarded className="w-8 h-8 text-barpel-teal" />
        </div>

        <h1 className="text-3xl font-bold text-barpel-slate tracking-tighter mb-3">
          Forward Calls to Your AI
        </h1>
        <p className="text-base text-barpel-slate/60 mb-4">
          When someone calls your existing business number, this sends those calls
          to your AI receptionist instead. Your number stays exactly the same.
        </p>

        {/* Plain-language explanation before carrier-specific instructions */}
        <div className="bg-barpel-teal/5 border border-barpel-teal/20 rounded-xl p-4 mb-4 max-w-md mx-auto text-left">
          <p className="text-sm font-medium text-barpel-slate mb-2">How it works:</p>
          <ol className="text-sm text-barpel-slate/70 space-y-1.5 list-decimal list-inside">
            <li>You dial a short code on your phone (takes 30 seconds)</li>
            <li>Incoming calls get routed to your AI receptionist</li>
            <li>You can undo this at any time from Phone Settings</li>
          </ol>
        </div>

        {/* Reuse the existing standalone component */}
        {phoneNumber && (
          <div className="text-left mb-6 bg-white border border-barpel-border rounded-xl p-4 max-w-md mx-auto">
            <CarrierForwardingInstructions managedNumber={phoneNumber} />
          </div>
        )}

        <button
          type="button"
          onClick={handleConfirmForwarding}
          className="w-full max-w-xs mx-auto block px-6 py-3 rounded-xl bg-barpel-teal text-white font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-100 transition-all"
        >
          I&apos;ve Set Up Forwarding
        </button>

        <p className="text-xs text-barpel-slate/40 mt-2">
          You can change or disable forwarding at any time in Phone Settings.
        </p>

        <button
          type="button"
          onClick={handleSkip}
          className="mt-3 text-sm text-barpel-slate/40 hover:text-barpel-slate/60 transition-colors"
        >
          Skip for now — I&apos;ll set this up later
        </button>
      </motion.div>
    );
  }

  // OUTBOUND: Show caller ID verification
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="text-center"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-barpel-teal/10 border border-barpel-border mb-6">
        <ShieldCheck className="w-8 h-8 text-barpel-teal" />
      </div>

      <h1 className="text-3xl font-bold text-barpel-slate tracking-tighter mb-3">
        Verify Your Caller ID
      </h1>
      <p className="text-base text-barpel-slate/60 mb-6">
        Verify the phone number that will appear as the caller ID when your AI makes outbound calls.
      </p>

      <div className="max-w-xs mx-auto">
        {verified ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <div className="bg-barpel-teal/10 border border-barpel-teal/30 rounded-xl p-4">
              <ShieldCheck className="w-8 h-8 text-barpel-teal mx-auto mb-2" />
              <p className="font-medium text-barpel-slate">Number Verified</p>
              <p className="text-sm text-barpel-slate/60 font-mono">{callerNumber}</p>
            </div>
            <button
              type="button"
              onClick={handleContinue}
              className="mt-4 w-full px-6 py-3 rounded-xl bg-barpel-teal text-white font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-100 transition-all"
            >
              Continue
            </button>
          </motion.div>
        ) : !verificationSent ? (
          <>
            <input
              type="tel"
              value={callerNumber}
              onChange={(e) => setCallerNumber(e.target.value.replace(/[^+\d]/g, ''))}
              placeholder="+12125551234"
              className="w-full px-4 py-3 rounded-xl border border-barpel-border bg-white text-barpel-slate placeholder:text-barpel-slate/40 focus:outline-none focus:ring-2 focus:ring-barpel-teal/30 focus:border-barpel-teal/50 transition-all text-center font-mono text-lg mb-4"
              maxLength={16}
            />
            <button
              type="button"
              onClick={handleSendVerification}
              disabled={sendingVerification || !callerNumber}
              className="w-full px-6 py-3 rounded-xl bg-barpel-teal text-white font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {sendingVerification ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Verification Call'
              )}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-barpel-slate/60 mb-4">
              We&apos;re calling <span className="font-mono font-medium">{callerNumber}</span>.
              Enter the 6-digit code you hear:
            </p>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full px-4 py-3 rounded-xl border border-barpel-border bg-white text-barpel-slate placeholder:text-barpel-slate/40 focus:outline-none focus:ring-2 focus:ring-barpel-teal/30 focus:border-barpel-teal/50 transition-all text-center font-mono text-2xl tracking-[0.3em] mb-4"
              maxLength={6}
              autoFocus
            />
            <button
              type="button"
              onClick={handleVerifyCode}
              disabled={verifying || otpCode.length !== 6}
              className="w-full px-6 py-3 rounded-xl bg-barpel-teal text-white font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </button>
          </>
        )}

        {verificationError && (
          <p className="text-sm text-red-500 mt-3">{verificationError}</p>
        )}

        {!verified && (
          <button
            type="button"
            onClick={handleSkip}
            className="mt-4 text-sm text-barpel-slate/40 hover:text-barpel-slate/60 transition-colors"
          >
            Skip for now — I&apos;ll verify later
          </button>
        )}
      </div>
    </motion.div>
  );
}
