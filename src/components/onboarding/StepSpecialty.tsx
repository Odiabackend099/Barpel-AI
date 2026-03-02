'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Car,
  Home,
  Scale,
  Scissors,
  ShoppingBag,
  Stethoscope,
  MoreHorizontal,
} from 'lucide-react';
import { useOnboardingStore } from '@/lib/store/onboardingStore';
import { useOnboardingTelemetry } from '@/hooks/useOnboardingTelemetry';

const SPECIALTIES = [
  { id: 'auto_dealer', label: 'Auto Dealer', icon: Car },
  { id: 'real_estate', label: 'Real Estate', icon: Home },
  { id: 'legal', label: 'Legal', icon: Scale },
  { id: 'salon_spa', label: 'Salon / Spa', icon: Scissors },
  { id: 'medical', label: 'Medical Clinic', icon: Stethoscope },
  { id: 'retail', label: 'Retail', icon: ShoppingBag },
  { id: 'other', label: 'Other', icon: MoreHorizontal },
] as const;

export default function StepSpecialty() {
  const { nextStep } = useOnboardingStore();
  const { track } = useOnboardingTelemetry();
  const [selected, setSelected] = useState<string | null>(null);
  // Ref prevents calling nextStep() on an already-unmounted component
  const advanceTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => clearTimeout(advanceTimer.current);
  }, []);

  const handleSelect = (specialtyId: string) => {
    setSelected(specialtyId);
    track('specialty_chosen', 1, { specialty: specialtyId });

    // Auto-advance after a brief delay for visual feedback
    advanceTimer.current = setTimeout(() => {
      nextStep();
    }, 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="text-center"
    >
      <h1 className="text-3xl font-bold text-barpel-slate tracking-tighter mb-3">
        What type of business are you?
      </h1>
      <p className="text-base text-barpel-slate/60 mb-8">
        This helps us tailor your AI&apos;s knowledge and tone.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-md mx-auto">
        {SPECIALTIES.map(({ id, label, icon: Icon }) => {
          const isSelected = selected === id;
          return (
            <motion.button
              key={id}
              onClick={() => handleSelect(id)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`
                flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 cursor-pointer transition-all
                ${
                  isSelected
                    ? 'border-barpel-teal bg-barpel-teal/10 shadow-md'
                    : 'border-barpel-border bg-white hover:border-surgical-300 hover:shadow-sm'
                }
              `}
            >
              <Icon
                className={`w-7 h-7 ${
                  isSelected ? 'text-barpel-teal' : 'text-barpel-slate/50'
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  isSelected ? 'text-barpel-teal' : 'text-barpel-slate/70'
                }`}
              >
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
