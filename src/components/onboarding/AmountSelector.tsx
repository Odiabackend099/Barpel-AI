'use client';

import { useState } from 'react';
import { formatPence } from '@/utils/currency';

const DEFAULT_MIN_PENCE = parseInt(process.env.NEXT_PUBLIC_WALLET_MIN_TOPUP_PENCE || '2500', 10);
const PHONE_COST_PENCE = 1000;
const PENCE_PER_MINUTE = 56;

interface AmountSelectorProps {
  selectedPence: number;
  onSelect: (pence: number) => void;
  presets?: number[];
  minPence?: number;
}

export default function AmountSelector({
  selectedPence,
  onSelect,
  presets = [2500, 5000, 10000, 50000],
  minPence = DEFAULT_MIN_PENCE,
}: AmountSelectorProps) {
  const [customAmount, setCustomAmount] = useState('');
  const [customError, setCustomError] = useState<string | null>(null);

  const getEstimatedMinutes = (pence: number) => {
    const credits = Math.max(0, pence - PHONE_COST_PENCE);
    return Math.floor(credits / PENCE_PER_MINUTE);
  };

  const handlePresetClick = (pence: number) => {
    setCustomAmount('');
    setCustomError(null);
    onSelect(pence);
  };

  const handleCustomChange = (value: string) => {
    setCustomAmount(value);
    setCustomError(null);

    if (!value) return;

    const pounds = parseFloat(value);
    if (isNaN(pounds) || pounds <= 0) {
      setCustomError('Enter a valid amount.');
      return;
    }

    const pence = Math.round(pounds * 100);
    if (pence < minPence) {
      setCustomError(`Minimum is ${formatPence(minPence)}.`);
      return;
    }

    onSelect(pence);
  };

  const isCustomActive = customAmount !== '' && !customError;

  return (
    <div className="max-w-xs mx-auto mb-6">
      <label className="block text-sm font-medium text-barpel-slate/70 mb-3 text-left">
        Choose your top-up amount
      </label>

      {/* Preset grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {presets.map((pence) => {
          const isSelected = selectedPence === pence && !isCustomActive;
          const minutes = getEstimatedMinutes(pence);
          return (
            <button
              key={pence}
              type="button"
              onClick={() => handlePresetClick(pence)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                isSelected
                  ? 'border-barpel-teal bg-barpel-teal/10'
                  : 'border-barpel-border hover:border-barpel-teal/30'
              }`}
            >
              <div className="font-bold text-lg text-barpel-slate">
                {formatPence(pence)}
              </div>
              <div className="text-xs text-barpel-slate/50">
                ~{minutes} min
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom amount input */}
      <div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-barpel-slate/40 font-medium">
            £
          </span>
          <input
            type="number"
            min={(minPence / 100).toFixed(0)}
            step="1"
            value={customAmount}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder={`Custom (min ${formatPence(minPence)})`}
            className={`w-full pl-8 pr-4 py-2.5 rounded-xl border-2 bg-white text-barpel-slate text-sm placeholder:text-barpel-slate/40 focus:outline-none transition-all ${
              isCustomActive
                ? 'border-barpel-teal bg-barpel-teal/5 focus:ring-2 focus:ring-barpel-teal/30'
                : 'border-barpel-border focus:ring-2 focus:ring-barpel-teal/30 focus:border-barpel-teal/50'
            }`}
          />
        </div>
        {customError && (
          <p className="text-xs text-red-500 mt-1 text-left">{customError}</p>
        )}
      </div>
    </div>
  );
}
