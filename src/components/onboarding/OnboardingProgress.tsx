'use client';

import { motion } from 'framer-motion';

const STEP_LABELS = [
  'Choose Number',
  'Payment',
  'Routing',
  'AI Agent',
  'Go Live',
];

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="h-1.5 bg-barpel-teal/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-barpel-teal rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1.0] }}
        />
      </div>
      <div className="flex justify-between mt-2 px-1">
        {STEP_LABELS.slice(0, totalSteps).map((label, i) => (
          <span
            key={label}
            className={`text-[10px] transition-colors ${
              i <= currentStep ? 'text-barpel-teal font-medium' : 'text-barpel-slate/30'
            }`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
