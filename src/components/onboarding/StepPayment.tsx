'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
import { useOnboardingStore } from '@/lib/store/onboardingStore';
import { useOnboardingTelemetry } from '@/hooks/useOnboardingTelemetry';
import { authedBackendFetch } from '@/lib/authed-backend-fetch';
import { formatPence } from '@/utils/currency';
import AmountSelector from './AmountSelector';

/**
 * Maps marketing plan slugs to the closest preset top-up amount in pence.
 * Values MUST match the presets passed to AmountSelector [2500, 5000, 10000, 50000]
 * so the corresponding button appears pre-selected in the UI.
 */
const PLAN_AMOUNT_MAP: Record<string, number> = {
  starter: 2500,    // £25 — minimum top-up, matches PAYG plan
  business: 10000,  // £100 — closest preset to the £99 Growth Bundle price
  enterprise: 50000, // £500 — large credit block for high-volume enterprise users
};

export default function StepPayment() {
  const {
    selectedNumber, areaCode, direction,
    businessName, setBusinessName,
    paymentComplete, setPaymentComplete,
    phoneNumber, setPhoneNumber,
    vapiPhoneId, setVapiPhoneId,
    provisioningInProgress, setProvisioningInProgress,
    plan,
    nextStep,
  } = useOnboardingStore();
  const { track } = useOnboardingTelemetry();

  const [localName, setLocalName] = useState(businessName);
  // Pre-select the amount based on the plan param from the marketing site, defaulting to £25.
  const [selectedAmountPence, setSelectedAmountPence] = useState(
    plan ? (PLAN_AMOUNT_MAP[plan] ?? 2500) : 2500
  );
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provisionError, setProvisionError] = useState<string | null>(null);
  const hasAttemptedProvision = useRef(false);

  const PHONE_COST_PENCE = 1000;
  const PENCE_PER_MINUTE = 56;
  const creditsPence = Math.max(0, selectedAmountPence - PHONE_COST_PENCE);
  const estimatedMinutes = Math.floor(creditsPence / PENCE_PER_MINUTE);

  // Fire telemetry on mount
  useEffect(() => {
    track('payment_viewed', 1);
  }, [track]);

  // Auto-provision after payment return
  useEffect(() => {
    if (!paymentComplete || phoneNumber || hasAttemptedProvision.current) return;
    hasAttemptedProvision.current = true;

    const provision = async () => {
      setProvisioningInProgress(true);

      // Wait for Stripe webhook to credit wallet
      await new Promise(r => setTimeout(r, 2000));

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const result = await authedBackendFetch<{
            success: boolean;
            phoneNumber?: string;
            vapiPhoneId?: string;
            error?: string;
            alreadyProvisioned?: boolean;
          }>('/api/onboarding/provision-number', {
            method: 'POST',
            body: JSON.stringify({
              area_code: areaCode || undefined,
              phone_number: selectedNumber || undefined,
              direction,
            }),
          });

          if (result?.phoneNumber) {
            setPhoneNumber(result.phoneNumber);
            if (result.vapiPhoneId) setVapiPhoneId(result.vapiPhoneId);
            setProvisioningInProgress(false);
            return;
          }

          if (attempt < 3) await new Promise(r => setTimeout(r, 3000));
        } catch {
          if (attempt >= 3) {
            setProvisionError('Could not provision your number. Please try again from the dashboard.');
          } else {
            await new Promise(r => setTimeout(r, 3000));
          }
        }
      }
      setProvisioningInProgress(false);
    };

    provision();
  }, [paymentComplete, phoneNumber, areaCode, selectedNumber, direction, setPhoneNumber, setVapiPhoneId, setProvisioningInProgress]);

  const handleCheckout = async () => {
    if (checkoutLoading) return;

    // Save business name before redirect
    const trimmed = localName.trim();
    if (trimmed) setBusinessName(trimmed);

    setCheckoutLoading(true);
    setError(null);

    try {
      const response = await authedBackendFetch<{ url?: string }>('/api/billing/wallet/topup', {
        method: 'POST',
        body: JSON.stringify({
          amount_pence: selectedAmountPence,
          // The plan is persisted to sessionStorage via the Zustand store before
          // this redirect, so it survives the Stripe round-trip without needing
          // to be encoded in the return URL (which is validated against an allowlist
          // in billing-api.ts and must be an exact match of '/dashboard/onboarding').
          return_url: '/dashboard/onboarding',
        }),
      });

      if (response?.url) {
        window.location.href = response.url;
      } else {
        setError('Unable to create checkout session. Please try again.');
        setCheckoutLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setCheckoutLoading(false);
    }
  };

  const handleContinue = () => {
    const trimmed = localName.trim();
    if (trimmed) setBusinessName(trimmed);
    track('payment_success', 1);
    nextStep();
  };

  // Phase B: Post-payment provisioning view
  if (paymentComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-barpel-teal/10 border border-barpel-border mb-6">
          {phoneNumber ? (
            <CheckCircle2 className="w-8 h-8 text-barpel-teal" />
          ) : (
            <Loader2 className="w-8 h-8 text-barpel-teal animate-spin" />
          )}
        </div>

        <h1 className="text-3xl font-bold text-barpel-slate tracking-tighter mb-3">
          {phoneNumber ? 'Your Number is Ready!' : 'Setting Up Your Number...'}
        </h1>

        {phoneNumber ? (
          <>
            <div className="bg-barpel-teal/10 border border-barpel-teal/30 rounded-xl p-4 mb-6 max-w-xs mx-auto">
              <p className="text-xs text-barpel-slate/50 mb-1">Your AI Phone Number</p>
              <p className="text-2xl font-mono font-bold text-barpel-teal">{phoneNumber}</p>
            </div>
            <button
              type="button"
              onClick={handleContinue}
              className="w-full max-w-xs mx-auto block px-6 py-3 rounded-xl bg-barpel-teal text-white font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-100 transition-all"
            >
              Continue Setup
            </button>
          </>
        ) : provisionError ? (
          <>
            <p className="text-sm text-barpel-slate/60 mb-6">{provisionError}</p>
            <button
              type="button"
              onClick={() => {
                hasAttemptedProvision.current = false;
                setProvisionError(null);
                setPaymentComplete(true); // re-trigger
              }}
              className="w-full max-w-xs mx-auto block px-6 py-3 rounded-xl bg-barpel-teal text-white font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-100 transition-all"
            >
              Retry Provisioning
            </button>
          </>
        ) : (
          <p className="text-base text-barpel-slate/60">
            Provisioning your phone number. This usually takes a few seconds...
          </p>
        )}
      </motion.div>
    );
  }

  // Phase A: Pre-payment view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="text-center"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-barpel-teal/10 border border-barpel-border mb-6">
        <CreditCard className="w-8 h-8 text-barpel-teal" />
      </div>

      <h1 className="text-3xl font-bold text-barpel-slate tracking-tighter mb-3">
        Activate Your AI Number
      </h1>
      <p className="text-base text-barpel-slate/60 mb-6">
        Get your dedicated AI phone number with call credits included.
      </p>

      {/* Selected number display */}
      {selectedNumber && (
        <div className="bg-gray-50 border border-barpel-border rounded-xl p-3 mb-6 max-w-xs mx-auto">
          <p className="text-xs text-barpel-slate/50 mb-0.5">Selected Number</p>
          <p className="text-lg font-mono font-bold text-barpel-slate">{selectedNumber}</p>
        </div>
      )}

      {/* Business name */}
      <div className="max-w-xs mx-auto mb-6">
        <label className="block text-sm font-medium text-barpel-slate/70 mb-2 text-left">
          Business Name
        </label>
        <input
          type="text"
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
          placeholder="e.g. Ace Auto Dealers"
          className="w-full px-4 py-3 rounded-xl border border-barpel-border bg-white text-barpel-slate placeholder:text-barpel-slate/40 focus:outline-none focus:ring-2 focus:ring-barpel-teal/30 focus:border-barpel-teal/50 transition-all text-sm"
          maxLength={200}
        />
      </div>

      {/* Amount selector */}
      <AmountSelector
        selectedPence={selectedAmountPence}
        onSelect={setSelectedAmountPence}
        presets={[2500, 5000, 10000, 50000]}
      />

      {/* Pricing breakdown */}
      <div className="bg-white border border-barpel-border rounded-xl p-4 mb-6 max-w-xs mx-auto text-left">
        <div className="flex justify-between text-sm text-barpel-slate/70 mb-1">
          <span>Your top-up</span>
          <span>{formatPence(selectedAmountPence)}</span>
        </div>
        <div className="flex justify-between text-sm text-barpel-slate/70 mb-1">
          <span>AI Phone Number</span>
          <span className="text-barpel-slate/50">-{formatPence(PHONE_COST_PENCE)}</span>
        </div>
        <div className="flex justify-between text-sm text-barpel-slate/70 mb-2">
          <span>Call Credits</span>
          <span>{formatPence(creditsPence)}</span>
        </div>
        <div className="border-t border-barpel-border pt-2 flex justify-between font-semibold text-barpel-slate">
          <span>Total</span>
          <span>{formatPence(selectedAmountPence)}</span>
        </div>
        <p className="text-xs text-barpel-slate/40 mt-1">
          ≈ {estimatedMinutes} minutes of calls
        </p>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={handleCheckout}
        disabled={checkoutLoading || !localName.trim()}
        className="w-full max-w-xs mx-auto block px-6 py-4 rounded-xl bg-barpel-teal text-white font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {checkoutLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Redirecting to checkout...
          </span>
        ) : (
          `Get My AI Number \u2014 ${formatPence(selectedAmountPence)}`
        )}
      </button>

      <p className="text-xs text-barpel-slate/40 mt-3">
        Secure payment via Stripe. Cancel anytime.
      </p>

      {error && (
        <p className="text-sm text-red-500 mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}
    </motion.div>
  );
}
