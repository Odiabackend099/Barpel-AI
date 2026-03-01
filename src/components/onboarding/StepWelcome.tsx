'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import { useOnboardingStore } from '@/lib/store/onboardingStore';
import { useOnboardingTelemetry } from '@/hooks/useOnboardingTelemetry';

export default function StepWelcome() {
  const { businessName, setBusinessName, nextStep } = useOnboardingStore();
  const { track } = useOnboardingTelemetry();
  const [localName, setLocalName] = useState(businessName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = localName.trim();
    if (!trimmed) return;

    setBusinessName(trimmed);
    track('clinic_named', 0, { clinic_name: trimmed });
    nextStep();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="text-center"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-barpel-teal/10 border border-barpel-border mb-6">
        <Building2 className="w-8 h-8 text-barpel-teal" />
      </div>

      <h1 className="text-3xl font-bold text-barpel-slate tracking-tighter mb-3">
        What is the name of your business?
      </h1>
      <p className="text-base text-barpel-slate/60 mb-8">
        We&apos;ll personalize your AI receptionist for your practice.
      </p>

      <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
        <input
          type="text"
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
          placeholder="e.g. Ace Auto Dealers"
          className="w-full px-4 py-3 rounded-xl border border-barpel-border bg-white text-barpel-slate placeholder:text-barpel-slate/40 focus:outline-none focus:ring-2 focus:ring-barpel-teal/30 focus:border-barpel-teal/50 transition-all text-center text-lg"
          autoFocus
          maxLength={200}
        />

        <button
          type="submit"
          disabled={!localName.trim()}
          className="mt-6 w-full px-6 py-3 rounded-xl bg-barpel-teal text-white font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
        >
          Continue
        </button>
      </form>
    </motion.div>
  );
}
