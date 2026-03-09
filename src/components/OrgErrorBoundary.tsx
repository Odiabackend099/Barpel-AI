'use client';

import React, { useRef, useEffect, useState } from 'react';
import { mutate } from 'swr';
import { useOrgValidation, clearCachedValidation } from '@/hooks/useOrgValidation';
import { useAuth } from '@/contexts/AuthContext';

const MAX_POLL_ATTEMPTS = 8;
const POLL_INTERVAL_MS = 6000;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';
const POLL_START_KEY = 'barpel_error_boundary_poll_start';

/**
 * OrgErrorBoundary Component (2026 Optimized)
 *
 * Wraps dashboard and protected routes with optimistic rendering:
 * - Shows children immediately if we have an orgId (trust JWT)
 * - Only shows loader on TRUE cold start (never rendered before)
 * - Background validation catches any issues without blocking UI
 *
 * Key 2026 Best Practice: Optimistic rendering with background validation
 *
 * Usage:
 * ```tsx
 * <OrgErrorBoundary>
 *   <Dashboard />
 * </OrgErrorBoundary>
 * ```
 */
export function OrgErrorBoundary({ children }: { children: React.ReactNode }) {
  const { orgId, orgValid, orgError, isNetworkError, loading } = useOrgValidation();
  const { signOut, user } = useAuth();

  // Track if we've ever successfully rendered children
  // This persists across re-renders but resets on page refresh
  const hasRenderedChildrenRef = useRef(false);

  // Update ref when validation passes
  useEffect(() => {
    if (orgValid) {
      hasRenderedChildrenRef.current = true;
    }
  }, [orgValid]);

  // Health polling state — only active when isNetworkError is true
  const [pollAttempt, setPollAttempt] = useState(0);
  const [pollExhausted, setPollExhausted] = useState(false);
  const [pollStartTime, setPollStartTime] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isNetworkError) {
      // Reset polling state when error clears
      setPollAttempt(0);
      setPollExhausted(false);
      setPollStartTime(null);
      return;
    }

    // Track when polling started (survives tab switches via sessionStorage)
    let startTime: number;
    try {
      const stored = sessionStorage.getItem(POLL_START_KEY);
      startTime = stored ? parseInt(stored, 10) : Date.now();
      if (!stored) sessionStorage.setItem(POLL_START_KEY, String(startTime));
    } catch {
      startTime = Date.now();
    }
    setPollStartTime(startTime);

    let cancelled = false;

    const poll = async (attempt: number) => {
      if (cancelled) return;

      if (attempt >= MAX_POLL_ATTEMPTS) {
        setPollExhausted(true);
        try { sessionStorage.removeItem(POLL_START_KEY); } catch {}
        return;
      }

      setPollAttempt(attempt + 1);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await fetch(`${BACKEND_URL}/health`, {
          signal: controller.signal,
          cache: 'no-store',
        });

        if (res.ok && !cancelled) {
          // Backend is live — clear session cache so SWR key re-activates, then broadcast
          clearCachedValidation();
          mutate(() => true, undefined, { revalidate: true });
          try { sessionStorage.removeItem(POLL_START_KEY); } catch {}
          return;
        }
      } catch (err) {
        // AbortError means cleanup already ran — stop polling
        if ((err as Error).name === 'AbortError' || cancelled) return;
        // Other fetch errors (network down) — continue polling
      }

      // Schedule next attempt
      pollTimeoutRef.current = setTimeout(() => poll(attempt + 1), POLL_INTERVAL_MS);
    };

    // Start immediately
    poll(0);

    return () => {
      cancelled = true;
      abortControllerRef.current?.abort();
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    };
  }, [isNetworkError]);

  // OPTIMISTIC RENDERING LOGIC:
  // 1. If validation passed (orgValid) -> show children
  // 2. If we rendered before AND have orgId AND no error -> show children (trust cached/JWT state)
  // 3. Otherwise, check if we should show loader or error
  const shouldShowChildren = orgValid || (hasRenderedChildrenRef.current && orgId && !orgError);

  // Show loading state ONLY on TRUE cold start:
  // - Still loading
  // - Never rendered children before
  // - Don't have an orgId yet (JWT not parsed)
  if (loading && !hasRenderedChildrenRef.current && !orgId) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-14 h-14 mx-auto border-4 border-[#E5E7EB] border-t-[#37A195] rounded-full animate-spin"></div>
          </div>
          <h1 className="text-xl font-semibold text-[#102A33] mb-2 tracking-tight">Loading dashboard...</h1>
          <p className="text-sm text-[#6B7280] tracking-tight">Setting up your workspace</p>
        </div>
      </div>
    );
  }

  // Show children optimistically if conditions met
  if (shouldShowChildren) {
    return children;
  }

  // Show network error state: health-polling "warming up" screen (auto-retries up to 8×)
  if (!loading && isNetworkError) {
    const secondsElapsed = pollStartTime ? Math.floor((Date.now() - pollStartTime) / 1000) : 0;
    const showWarmingMessage = secondsElapsed >= 10;

    if (pollExhausted) {
      // All 8 attempts failed — show hard fallback with manual reload
      return (
        <div className="flex items-center justify-center h-screen bg-white">
          <div className="max-w-md w-full mx-auto px-6 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 11-12.728 0M12 9v4m0 4h.01" />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl font-semibold text-[#102A33] mb-3 tracking-tight">Service Unavailable</h1>

            <p className="text-sm text-[#6B7280] mb-6 leading-relaxed tracking-tight">
              Unable to reach the server after {MAX_POLL_ATTEMPTS} attempts. Your account is fine &mdash; the server may be experiencing issues.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-3 bg-[#37A195] hover:bg-[#2F8E88] text-white font-medium rounded-lg transition-all shadow-sm tracking-tight"
              >
                Retry Connection
              </button>

              <button
                onClick={() => signOut()}
                className="w-full px-4 py-3 bg-white hover:bg-gray-50 border border-[#E5E7EB] text-[#6B7280] font-medium rounded-lg transition-all tracking-tight text-sm"
              >
                Sign Out
              </button>
            </div>

            <p className="text-xs text-[#9CA3AF] mt-6 tracking-tight">
              Error ID: NETWORK_ERROR
            </p>
          </div>
        </div>
      );
    }

    // Auto-retry in progress
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-14 h-14 mx-auto border-4 border-[#E5E7EB] border-t-[#37A195] rounded-full animate-spin"></div>
          </div>
          <h1 className="text-xl font-semibold text-[#102A33] mb-2 tracking-tight">
            {showWarmingMessage ? 'Server is waking up...' : 'Connecting to server...'}
          </h1>
          <p className="text-sm text-[#6B7280] mb-1 tracking-tight">
            {pollAttempt > 0 ? `Attempt ${pollAttempt} of ${MAX_POLL_ATTEMPTS}` : 'Checking connection...'}
          </p>
          <p className="text-xs text-[#9CA3AF] mb-6 tracking-tight">
            This may take up to a minute on first load
          </p>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-white hover:bg-gray-50 border border-[#E5E7EB] text-[#6B7280] font-medium rounded-lg transition-all tracking-tight text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Show error state ONLY if validation definitively failed (not loading, has error, user is logged in)
  // Guard on `user` prevents a flash of this screen during logout when user becomes null
  // before the /login redirect fires from onAuthStateChange
  if (!loading && user && (!orgValid || orgError)) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="max-w-md w-full mx-auto px-6 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-red-50 border border-red-200 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0-6a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-[#102A33] mb-3 tracking-tight">Account Setup Incomplete</h1>

          {!orgId ? (
            <p className="text-sm text-[#6B7280] mb-2 leading-relaxed tracking-tight">
              Your account exists but has not been linked to an organization yet. This is a provisioning issue — signing out will not fix it.
            </p>
          ) : (
            orgError && (
              <p className="text-sm text-[#6B7280] mb-2 leading-relaxed tracking-tight">
                {orgError}
              </p>
            )
          )}

          <p className="text-sm text-[#9CA3AF] mb-6 leading-relaxed tracking-tight">
            Contact your administrator and ask them to run{' '}
            <code className="bg-gray-100 border border-[#E5E7EB] px-1.5 py-0.5 rounded text-xs font-mono text-[#37A195]">
              npm run verify:demo
            </code>{' '}
            on the backend to diagnose and repair your account.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-3 bg-[#37A195] hover:bg-[#2F8E88] text-white font-medium rounded-lg transition-all shadow-sm tracking-tight"
            >
              Retry
            </button>

            <button
              onClick={() => signOut()}
              className="w-full px-4 py-3 bg-white hover:bg-gray-50 border border-[#E5E7EB] text-[#6B7280] font-medium rounded-lg transition-all tracking-tight text-sm"
            >
              Sign Out
            </button>
          </div>

          <p className="text-xs text-[#9CA3AF] mt-6 tracking-tight">
            Error ID: {orgId ? 'VALIDATION_FAILED' : 'NO_ORG_ID'}
          </p>
        </div>
      </div>
    );
  }

  // Validation passed - render children
  return children;
}
