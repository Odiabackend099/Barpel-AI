'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import useSWR from 'swr';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useOnboardingStore } from '@/lib/store/onboardingStore';
import { useOnboardingTelemetry } from '@/hooks/useOnboardingTelemetry';
import { authedBackendFetch } from '@/lib/authed-backend-fetch';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';
import StepNumberSelection from '@/components/onboarding/StepNumberSelection';
import StepPayment from '@/components/onboarding/StepPayment';
import StepTelecomRouting from '@/components/onboarding/StepTelecomRouting';
import StepAgentPersonality from '@/components/onboarding/StepAgentPersonality';
import StepSyncGoLive from '@/components/onboarding/StepSyncGoLive';

const slideVariants = {
  enter: (animDirection: number) => ({
    x: animDirection > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (animDirection: number) => ({
    x: animDirection > 0 ? -300 : 300,
    opacity: 0,
  }),
};

// New 5-step "Instant Value" wizard
const STEP_COMPONENTS = [
  StepNumberSelection,   // Step 0: Direction + country + area code + pick number
  StepPayment,           // Step 1: Pricing + Stripe checkout + auto-provision
  StepTelecomRouting,    // Step 2: Call forwarding (inbound) or caller ID (outbound)
  StepAgentPersonality,  // Step 3: Agent name, prompt, voice
  StepSyncGoLive,        // Step 4: Sync phone ↔ agent + celebration
];
const TOTAL_STEPS = STEP_COMPONENTS.length;

/**
 * Inner component uses useSearchParams — must be wrapped in <Suspense>.
 */
function OnboardingPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentStep, animDirection, goToStep, setPaymentComplete, prevStep, reset } = useOnboardingStore();
  const { track } = useOnboardingTelemetry();
  const hasTrackedStart = useRef(false);
  const hasHandledReturn = useRef(false);
  const hasResetStale = useRef(false);

  // Guard: redirect users who already completed onboarding.
  // Uses onboarding_completed_at (the PRD-defined ONLY gate) — not managed_phone_numbers count.
  const { data: onboardingStatus, isLoading: statusLoading, error: statusError } = useSWR(
    '/api/onboarding/status',
    (url: string) => authedBackendFetch<{ needs_onboarding: boolean }>(url),
    { revalidateOnMount: true }
  );

  useEffect(() => {
    if (onboardingStatus && !onboardingStatus.needs_onboarding) {
      router.replace('/dashboard');
    }
  }, [onboardingStatus, router]);

  // Reset stale sessionStorage state for new sessions (prevents jumping to wrong step)
  // BUT preserve state if returning from Stripe redirect (?topup=success)
  useEffect(() => {
    if (hasResetStale.current) return;
    hasResetStale.current = true;
    const topup = searchParams.get('topup');
    if (!topup) {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fire "started" telemetry once on mount
  useEffect(() => {
    if (!hasTrackedStart.current) {
      hasTrackedStart.current = true;
      track('started', 0);
    }
  }, [track]);

  // Detect Stripe return (?topup=success) → jump to Step 1 (Payment) post-payment phase
  useEffect(() => {
    if (hasHandledReturn.current) return;

    const topup = searchParams.get('topup');
    if (topup === 'success') {
      hasHandledReturn.current = true;
      setPaymentComplete(true);
      track('payment_success', 1);
      // Jump to Payment step (index 1) which will show the auto-provisioning phase
      goToStep(1);

      // Clean up URL params without reload
      const url = new URL(window.location.href);
      url.searchParams.delete('topup');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams, setPaymentComplete, goToStep, track]);

  const handleSkip = async () => {
    try {
      await authedBackendFetch('/api/onboarding/complete', { method: 'POST' });
    } catch {
      // Ignore — redirect regardless
    }
    router.replace('/dashboard');
  };

  const StepComponent = STEP_COMPONENTS[currentStep];

  // Show loading spinner while checking onboarding status (prevents wizard flash).
  // On SWR error: fall through to show wizard (safe fallback — better to show wizard
  // than block a new user; backend validates provisioning independently).
  if (statusLoading && !statusError) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-barpel-teal animate-spin" />
      </div>
    );
  }

  // While redirect is in-flight, keep showing spinner
  if (onboardingStatus && !onboardingStatus.needs_onboarding) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-barpel-teal animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col">
      {/* Top navigation: back | progress | skip */}
      <div className="pt-8 px-4 flex items-start gap-4">
        {/* Back button — steps 1–3 only */}
        <div className="w-16 pt-1">
          {currentStep > 0 && currentStep < 4 && (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center gap-0.5 text-sm text-barpel-slate/40 hover:text-barpel-slate/70 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}
        </div>

        {/* Progress bar — centered */}
        <div className="flex-1">
          <OnboardingProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        </div>

        {/* Skip button — steps 0–3 only */}
        <div className="w-16 pt-1 text-right">
          {currentStep < 4 && (
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm text-barpel-slate/40 hover:text-barpel-slate/70 transition-colors"
            >
              Skip
            </button>
          )}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-12 overflow-hidden">
        <AnimatePresence mode="wait" custom={animDirection}>
          <motion.div
            key={currentStep}
            custom={animDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="w-full max-w-lg"
          >
            <StepComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Suspense boundary required by Next.js 15 for useSearchParams() in App Router.
 */
export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingPageInner />
    </Suspense>
  );
}
