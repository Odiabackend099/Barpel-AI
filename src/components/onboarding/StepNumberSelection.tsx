'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, PhoneOutgoing, Globe, Search, Loader2 } from 'lucide-react';
import { useOnboardingStore, CallDirection } from '@/lib/store/onboardingStore';
import { useOnboardingTelemetry } from '@/hooks/useOnboardingTelemetry';
import { authedBackendFetch } from '@/lib/authed-backend-fetch';

const COUNTRIES = [
  { code: 'US', label: 'United States', flag: '🇺🇸' },
  { code: 'GB', label: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', label: 'Canada', flag: '🇨🇦' },
];

interface AvailableNumber {
  phoneNumber: string;
  locality?: string;
  region?: string;
  friendlyName?: string;
}

export default function StepNumberSelection() {
  const {
    direction, setDirection,
    selectedCountry, setSelectedCountry,
    areaCode, setAreaCode,
    selectedNumber, setSelectedNumber,
    nextStep, resetFromStep,
  } = useOnboardingStore();
  const { track } = useOnboardingTelemetry();

  const [searchResults, setSearchResults] = useState<AvailableNumber[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleDirectionChange = (d: CallDirection) => {
    if (d !== direction) {
      setDirection(d);
      setSelectedNumber(null); // Clear stale number from previous direction search
      resetFromStep(1); // Clear downstream state
      setSearchResults([]);
      setHasSearched(false);
    }
  };

  const handleSearch = async () => {
    setSearching(true);
    setSearchError(null);
    setSearchResults([]);
    setSelectedNumber(null);

    try {
      const params = new URLSearchParams({
        country: selectedCountry,
        numberType: 'local',
        limit: '5',
        ...(areaCode ? { areaCode } : {}),
      });
      const data = await authedBackendFetch<{
        numbers?: AvailableNumber[];
        error?: string;
      }>(`/api/managed-telephony/available-numbers?${params.toString()}`);

      if (data?.error) {
        setSearchError(data.error);
        return;
      }

      setSearchResults(data?.numbers || []);
      setHasSearched(true);

      if (!data?.numbers?.length) {
        setSearchError(areaCode
          ? `No numbers available in area code ${areaCode}. Try a different area code.`
          : 'No numbers available. Try a different country or area code.');
      }
    } catch (err: any) {
      setSearchError(err.message || 'Network error. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleContinue = () => {
    if (!selectedNumber) return;
    track('started', 0, { direction, country: selectedCountry, areaCode });
    nextStep();
  };

  const canAdvance = !!selectedNumber;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="text-center"
    >
      <h1 className="text-3xl font-bold text-barpel-slate tracking-tighter mb-3">
        Choose Your AI Phone Number
      </h1>
      <p className="text-base text-barpel-slate/60 mb-8">
        Select the type of AI agent and find a number for your business.
      </p>

      {/* Direction Toggle */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { value: 'inbound' as CallDirection, label: 'Inbound Receptionist', desc: 'AI answers your calls', icon: Phone },
          { value: 'outbound' as CallDirection, label: 'Outbound Sales', desc: 'AI makes calls for you', icon: PhoneOutgoing },
        ].map(({ value, label, desc, icon: Icon }) => (
          <motion.button
            key={value}
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleDirectionChange(value)}
            className={`p-4 rounded-xl border-2 transition-all text-left relative ${
              direction === value
                ? 'border-barpel-teal bg-barpel-teal/10'
                : 'border-barpel-border hover:border-barpel-teal/30'
            }`}
          >
            {direction === value && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-barpel-teal flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
              direction === value ? 'bg-barpel-teal/20' : 'bg-gray-100'
            }`}>
              <Icon className={`w-5 h-5 ${direction === value ? 'text-barpel-teal' : 'text-barpel-slate/40'}`} />
            </div>
            <div className="font-medium text-barpel-slate text-sm">{label}</div>
            <div className="text-xs text-barpel-slate/50 mt-0.5">{desc}</div>
          </motion.button>
        ))}
      </div>

      {/* Country + Area Code */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-barpel-slate/40" />
          <select
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              setSearchResults([]);
              setHasSearched(false);
              setSelectedNumber(null);
            }}
            className="w-full pl-9 pr-3 py-3 rounded-xl border border-barpel-border bg-white text-barpel-slate focus:outline-none focus:ring-2 focus:ring-barpel-teal/30 focus:border-barpel-teal/50 transition-all text-sm appearance-none"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.label}
              </option>
            ))}
          </select>
        </div>

        <input
          type="text"
          value={areaCode}
          onChange={(e) => {
            setAreaCode(e.target.value);
            setSearchResults([]);
            setHasSearched(false);
            setSelectedNumber(null);
          }}
          placeholder="Area code"
          className="w-28 px-3 py-3 rounded-xl border border-barpel-border bg-white text-barpel-slate placeholder:text-barpel-slate/40 focus:outline-none focus:ring-2 focus:ring-barpel-teal/30 focus:border-barpel-teal/50 transition-all text-sm text-center"
          maxLength={3}
        />
      </div>

      {/* Search Button */}
      <button
        type="button"
        onClick={handleSearch}
        disabled={searching}
        className="w-full px-6 py-3 rounded-xl bg-white border border-barpel-border text-barpel-slate font-medium hover:border-barpel-teal/50 hover:bg-barpel-teal/5 transition-all disabled:opacity-40 flex items-center justify-center gap-2 mb-4"
      >
        {searching ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Search className="w-4 h-4" />
        )}
        {searching ? 'Searching...' : 'Search Available Numbers'}
      </button>

      {/* Error */}
      {searchError && (
        <p className="text-sm text-red-500 mb-4">{searchError}</p>
      )}

      {/* Results */}
      {searchResults.length > 0 && (
        <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
          {searchResults.map((num) => (
            <motion.button
              key={num.phoneNumber}
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelectedNumber(num.phoneNumber, num.locality || num.region)}
              className={`w-full p-3 rounded-xl border-2 text-left flex items-center justify-between transition-all ${
                selectedNumber === num.phoneNumber
                  ? 'border-barpel-teal bg-barpel-teal/10'
                  : 'border-barpel-border hover:border-barpel-teal/30'
              }`}
            >
              <div>
                <div className="font-mono font-medium text-barpel-slate">{num.friendlyName || num.phoneNumber}</div>
                {num.locality && (
                  <div className="text-xs text-barpel-slate/50">{num.locality}{num.region ? `, ${num.region}` : ''}</div>
                )}
              </div>
              {selectedNumber === num.phoneNumber && (
                <div className="w-5 h-5 rounded-full bg-barpel-teal flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* No results message */}
      {hasSearched && searchResults.length === 0 && !searchError && (
        <p className="text-sm text-barpel-slate/50 mb-6">No numbers found. Try a different area code.</p>
      )}

      {/* Continue */}
      <button
        type="button"
        onClick={handleContinue}
        disabled={!canAdvance}
        className="w-full px-6 py-3 rounded-xl bg-barpel-teal text-white font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
      >
        {selectedNumber ? `Continue with ${selectedNumber}` : 'Select a number to continue'}
      </button>
    </motion.div>
  );
}
