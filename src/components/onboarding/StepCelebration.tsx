'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PartyPopper } from 'lucide-react';
import { useOnboardingStore } from '@/lib/store/onboardingStore';
import { authedBackendFetch } from '@/lib/authed-backend-fetch';
import ConfettiEffect from './ConfettiEffect';

export default function StepCelebration() {
  const {
    areaCode,
    nextStep,
    setPhoneNumber,
    setProvisioningInProgress,
    provisioningInProgress,
    phoneNumber,
  } = useOnboardingStore();

  const [showButton, setShowButton] = useState(false);
  const [provisionError, setProvisionError] = useState<string | null>(null);
  // Ref-based flag prevents re-trigger when provisioningInProgress state flips
  const hasAttempted = useRef(false);

  // Show "Continue" button after confetti
  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 3200);
    return () => clearTimeout(timer);
  }, []);

  // Auto-provision phone number — runs at most once per mount
  useEffect(() => {
    // Already have a number or already attempted this mount — do nothing
    if (phoneNumber || hasAttempted.current) return;
    hasAttempted.current = true;

    const provision = async () => {
      setProvisioningInProgress(true);

      // Allow 2s for Stripe webhook to credit the wallet before first attempt
      await new Promise(r => setTimeout(r, 2000));

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const result = await authedBackendFetch<{
            success: boolean;
            phoneNumber?: string;
            error?: string;
          }>('/api/onboarding/provision-number', {
            method: 'POST',
            body: JSON.stringify({ area_code: areaCode || undefined }),
          });

          if (result?.phoneNumber) {
            setPhoneNumber(result.phoneNumber);
            setProvisioningInProgress(false);
            return;
          }

          // Got a response but no number (e.g. 402 balance not credited yet)
          if (attempt < 3) await new Promise(r => setTimeout(r, 3000));
        } catch (err: any) {
          if (attempt < 3) {
            await new Promise(r => setTimeout(r, 3000));
          } else {
            setProvisionError('Could not provision automatically. Set up your number from the dashboard.');
          }
        }
      }

      setProvisioningInProgress(false);
    };

    provision();
    // provisioningInProgress intentionally excluded — it must not re-trigger this effect
  }, [areaCode, phoneNumber, setPhoneNumber, setProvisioningInProgress]);

  return (
    <>
      <ConfettiEffect duration={3000} particleCount={120} />

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
          <PartyPopper className="w-10 h-10 text-barpel-teal" />
        </motion.div>

        <h1 className="text-3xl font-bold text-barpel-slate tracking-tighter mb-3">
          Your AI Receptionist is officially hired!
        </h1>
        <p className="text-base text-barpel-slate/60 mb-8">
          {provisioningInProgress
            ? 'Setting up your phone number...'
            : provisionError
              ? 'We had trouble setting up your number, but you can do it from the dashboard.'
              : 'Your new phone number is being prepared.'}
        </p>

        {showButton && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onClick={nextStep}
            className="px-8 py-3 rounded-xl bg-barpel-teal text-white font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-100 transition-all"
          >
            Continue
          </motion.button>
        )}
      </motion.div>
    </>
  );
}
