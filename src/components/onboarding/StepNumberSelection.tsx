'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, PhoneOutgoing, Globe, Search, Loader2, Check } from 'lucide-react';
import { useOnboardingStore, CallDirection } from '@/lib/store/onboardingStore';
import { useOnboardingTelemetry } from '@/hooks/useOnboardingTelemetry';
import { authedBackendFetch } from '@/lib/authed-backend-fetch';

// Client-side format validation (mirrors backend regexes)
const ACCOUNT_SID_REGEX = /^AC[a-f0-9]{32}$/i;
const AUTH_TOKEN_REGEX = /^[a-f0-9]{32}$/i;
const E164_REGEX = /^\+[1-9]\d{7,14}$/;

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
    numberSource, setNumberSource,
    byocAccountSid, setByocAccountSid,
    byocPhoneNumber, setByocPhoneNumber,
    byocSaved, setByocSaved,
    setPhoneNumber, setVapiPhoneId,
    nextStep, goToStep, resetFromStep,
  } = useOnboardingStore();
  const { track } = useOnboardingTelemetry();

  const [searchResults, setSearchResults] = useState<AvailableNumber[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // BYOC — auth token stays in local state only (never stored in Zustand/sessionStorage)
  const [byocAuthToken, setByocAuthToken] = useState('');
  const [byocError, setByocError] = useState<string | null>(null);
  const [byocSaving, setByocSaving] = useState(false);

  const byocCanVerify =
    ACCOUNT_SID_REGEX.test(byocAccountSid) &&
    AUTH_TOKEN_REGEX.test(byocAuthToken) &&
    E164_REGEX.test(byocPhoneNumber);

  const handleDirectionChange = (d: CallDirection) => {
    if (d !== direction) {
      setDirection(d);
      setSelectedNumber(null); // Clear stale number from previous direction search
      resetFromStep(1); // Clear downstream state
      setByocSaved(false); // Direction change invalidates prior BYOC verification
      setSearchResults([]);
      setHasSearched(false);
    }
  };

  const handleByocVerify = async () => {
    if (byocSaving) return;
    setByocSaving(true);
    setByocError(null);
    try {
      const result = await authedBackendFetch<{
        success: boolean;
        phoneNumber?: string;
        direction?: string;
        vapiPhoneId?: string;
        error?: string;
      }>('/api/integrations/twilio/byoc', {
        method: 'POST',
        body: JSON.stringify({
          accountSid: byocAccountSid,
          authToken: byocAuthToken,
          phoneNumber: byocPhoneNumber,
          direction,
        }),
      });

      if (!result?.success) {
        setByocError(result?.error || 'Verification failed. Please try again.');
        return;
      }

      // Wire into store — required for StepSyncGoLive Activate button
      setVapiPhoneId(result.vapiPhoneId!);
      setPhoneNumber(result.phoneNumber!);
      setByocSaved(true);
      // Clear auth token from memory — it's no longer needed
      setByocAuthToken('');
    } catch (err: any) {
      setByocError(err.message || 'Network error. Please try again.');
    } finally {
      setByocSaving(false);
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
    if (numberSource === 'byoc') {
      track('started', 0, { direction, source: 'byoc' });
      nextStep(); // Go to Step 1 (wallet top-up) — BYOC users need call credits
    } else {
      if (!selectedNumber) return;
      track('started', 0, { direction, country: selectedCountry, areaCode });
      nextStep();
    }
  };

  const canAdvance = numberSource === 'byoc' ? byocSaved : !!selectedNumber;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="text-center"
    >
      <h1 className="text-3xl font-bold text-barpel-slate tracking-tighter mb-3">
        Set Up Your AI Phone Number
      </h1>
      <p className="text-base text-barpel-slate/60 mb-6">
        Select the type of AI agent and choose your number source.
      </p>

      {/* Source Toggle: Managed vs BYOC */}
      <div className="flex gap-3 mb-6">
        {([
          { value: 'managed', label: 'Get an AI Number' },
          { value: 'byoc', label: 'Use My Own Twilio' },
        ] as const).map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setNumberSource(value);
              setByocError(null);
              setByocSaved(false); // Source switch invalidates prior BYOC verification
              if (value === 'managed') resetFromStep(1);
            }}
            className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${
              numberSource === value
                ? 'bg-barpel-teal text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-100'
                : 'bg-white text-barpel-slate/60 border-2 border-barpel-border hover:border-barpel-teal/40 hover:text-barpel-slate'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

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

      {/* Managed: Country + Area Code + Search */}
      {numberSource === 'managed' && (
        <>
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

          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            className="w-full px-6 py-3 rounded-xl bg-white border border-barpel-border text-barpel-slate font-medium hover:border-barpel-teal/50 hover:bg-barpel-teal/5 transition-all disabled:opacity-40 flex items-center justify-center gap-2 mb-4"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {searching ? 'Searching...' : 'Search Available Numbers'}
          </button>

          {searchError && <p className="text-sm text-red-500 mb-4">{searchError}</p>}

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

          {hasSearched && searchResults.length === 0 && !searchError && (
            <p className="text-sm text-barpel-slate/50 mb-6">No numbers found. Try a different area code.</p>
          )}
        </>
      )}

      {/* BYOC: Account SID + Auth Token + Phone Number */}
      {numberSource === 'byoc' && (
        <div className="space-y-3 mb-6 text-left">
          <div>
            <input
              type="text"
              value={byocAccountSid}
              onChange={(e) => { setByocAccountSid(e.target.value); setByocError(null); setByocSaved(false); }}
              placeholder="Account SID (ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)"
              autoComplete="off"
              spellCheck={false}
              className="w-full px-4 py-3 rounded-xl border border-barpel-border bg-white text-barpel-slate placeholder:text-barpel-slate/30 focus:outline-none focus:ring-2 focus:ring-barpel-teal/30 focus:border-barpel-teal/50 transition-all text-sm font-mono"
            />
            {byocAccountSid && !ACCOUNT_SID_REGEX.test(byocAccountSid) && (
              <p className="text-xs text-red-500 mt-1 pl-1">Must start with AC and be 34 characters</p>
            )}
          </div>

          <div>
            <input
              type="password"
              value={byocAuthToken}
              onChange={(e) => { setByocAuthToken(e.target.value); setByocError(null); setByocSaved(false); }}
              placeholder="Auth Token (32 hex characters)"
              autoComplete="new-password"
              className="w-full px-4 py-3 rounded-xl border border-barpel-border bg-white text-barpel-slate placeholder:text-barpel-slate/30 focus:outline-none focus:ring-2 focus:ring-barpel-teal/30 focus:border-barpel-teal/50 transition-all text-sm font-mono"
            />
            {byocAuthToken && !AUTH_TOKEN_REGEX.test(byocAuthToken) && (
              <p className="text-xs text-red-500 mt-1 pl-1">Must be 32 hexadecimal characters</p>
            )}
          </div>

          <div>
            <input
              type="tel"
              value={byocPhoneNumber}
              onChange={(e) => { setByocPhoneNumber(e.target.value); setByocError(null); setByocSaved(false); }}
              placeholder="Phone Number (+12025551234)"
              className="w-full px-4 py-3 rounded-xl border border-barpel-border bg-white text-barpel-slate placeholder:text-barpel-slate/30 focus:outline-none focus:ring-2 focus:ring-barpel-teal/30 focus:border-barpel-teal/50 transition-all text-sm font-mono"
            />
            {byocPhoneNumber && !E164_REGEX.test(byocPhoneNumber) && (
              <p className="text-xs text-red-500 mt-1 pl-1">Use E.164 format (e.g., +12025551234)</p>
            )}
          </div>

          {byocError && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {byocError}
            </p>
          )}

          {byocSaved ? (
            <div className="flex items-center justify-center gap-2 text-barpel-teal font-medium text-sm py-2">
              <Check className="w-4 h-4" />
              Verified and saved
            </div>
          ) : (
            <button
              type="button"
              onClick={handleByocVerify}
              disabled={byocSaving || !byocCanVerify}
              className="w-full px-6 py-3 rounded-xl bg-white border-2 border-barpel-teal text-barpel-teal font-medium hover:bg-barpel-teal/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {byocSaving ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Verifying...</>
              ) : (
                'Verify & Save'
              )}
            </button>
          )}
        </div>
      )}

      {/* Continue */}
      <button
        type="button"
        onClick={handleContinue}
        disabled={!canAdvance}
        className="w-full px-6 py-3 rounded-xl bg-barpel-teal text-white font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
      >
        {numberSource === 'byoc'
          ? (byocSaved ? `Continue with ${byocPhoneNumber}` : 'Verify your number to continue')
          : (selectedNumber ? `Continue with ${selectedNumber}` : 'Select a number to continue')
        }
      </button>
    </motion.div>
  );
}
