'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';
import Logo from '@/components/Logo';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FadeIn from '@/components/ui/FadeIn';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useAuthRateLimit } from '@/hooks/useAuthRateLimit';
import { normalizeAuthError } from '@/lib/auth-errors';

function getPasswordStrength(p: string): { score: number; label: string; color: string } {
  if (p.length < 8) return { score: 0, label: 'Too short', color: 'bg-red-400' };
  let score = 1;
  if (p.length >= 12 || (/[A-Z]/.test(p) && /[a-z]/.test(p))) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  score = Math.min(score, 4);
  const levels = [
    { score: 1, label: 'Weak', color: 'bg-red-400' },
    { score: 2, label: 'Fair', color: 'bg-amber-400' },
    { score: 3, label: 'Strong', color: 'bg-[#37A195]' },
    { score: 4, label: 'Very strong', color: 'bg-[#37A195]' },
  ];
  return levels[score - 1];
}

export default function SignUpPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorLink, setErrorLink] = useState<{ label: string; href: string } | null>(null);

  const strength = password.length > 0 ? getPasswordStrength(password) : null;
  const { lockedOut, timerLabel, recordFailure, reset } = useAuthRateLimit('signup');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorLink(null);

    if (!strength || strength.score < 2) {
      setError(strength?.score === 0
        ? 'Password must be at least 8 characters.'
        : 'Password is too weak — use 8+ characters with a mix of letters and numbers.');
      return;
    }

    setLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
      if (!backendUrl && isProduction) {
        setError('Service configuration error. Please contact support@barpel.ai.');
        setLoading(false);
        return;
      }
      const resolvedBackendUrl = backendUrl || 'http://localhost:8001';

      let csrfToken: string | null = null;
      try {
        const csrfRes = await fetch(`${resolvedBackendUrl}/api/csrf-token`);
        if (csrfRes.ok) {
          const csrfData = await csrfRes.json();
          csrfToken = csrfData.csrfToken ?? null;
        }
      } catch {
        setError('Unable to reach the server. Please check your connection and try again.');
        setLoading(false);
        return;
      }
      if (!csrfToken) {
        setError('Unable to reach the server. Please try again.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${resolvedBackendUrl}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
        }),
      });

      const result: { success?: boolean; error?: string } = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setError('An account with this email already exists.');
          setErrorLink({ label: 'Sign in instead', href: '/login' });
        } else {
          setError(result.error ?? 'Failed to create account. Please try again.');
          setErrorLink(null);
          recordFailure();
        }
        setLoading(false);
        return;
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError || !signInData.session) {
        setError('Account created! Auto sign-in failed — please sign in manually.');
        setErrorLink({ label: 'Sign in now →', href: '/login' });
        setLoading(false);
        return;
      }

      reset();
      router.push('/dashboard/onboarding');
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setErrorLink(null);
      recordFailure();
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError(null);
    setErrorLink(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      setError(normalizeAuthError(err));
      setErrorLink(null);
      recordFailure();
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden grid lg:grid-cols-[55%_45%]">
      {/* Left Column: Brand Showcase */}
      <div className="hidden lg:flex relative bg-gradient-to-br from-[#102A33] via-[#244B52] to-[#37A195] items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(#37A195 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />

        <div className="relative z-10 max-w-lg px-12 text-center">
          <FadeIn delay={0.1}>
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <div className="w-24 h-24">
                <Image
                  src="/images/logos/logo_white.png"
                  alt="Barpel AI"
                  width={96}
                  height={96}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-3xl font-bold text-white mb-2">Barpel AI</h2>
            <p className="text-white/80 text-lg mb-8">Never miss another customer call</p>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                <p className="text-2xl font-bold text-white">10K+</p>
                <p className="text-white/70 text-xs mt-1">Calls Handled</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                <p className="text-2xl font-bold text-white">&lt;2s</p>
                <p className="text-white/70 text-xs mt-1">Response Time</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                <p className="text-2xl font-bold text-white">98.7%</p>
                <p className="text-white/70 text-xs mt-1">Pickup Rate</p>
              </div>
            </div>

            {/* Feature List */}
            <div className="space-y-3 mb-10 text-left">
              {[
                '24/7 AI receptionist',
                'Books appointments automatically',
                'Qualifies and routes leads',
                'Works with your existing calendar'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-white">
                  <Check className="w-5 h-5 text-[#6FE7DC] flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="bg-white/5 border border-white/20 rounded-lg p-6 mb-8">
              <p className="text-white italic text-sm mb-4">
                &quot;Barpel increased our booking rate by 40% in the first month. It&apos;s like having a perfect receptionist 24/7.&quot;
              </p>
              <p className="text-white/70 text-xs font-medium">— Dr. Sarah Chen, MedSpa Owner</p>
            </div>

            {/* Trusted By */}
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-white/10">
              <span className="text-white/60 text-xs">Trusted by:</span>
              <div className="flex -space-x-2">
                {[
                  { name: 'Twilio', logo: '/integrations/twilio.png' },
                  { name: 'Vapi', logo: '/integrations/vapi.png' },
                  { name: 'Google Calendar', logo: '/integrations/google-calendar.png' }
                ].map((integration) => (
                  <div key={integration.name} className="h-8 w-8 rounded-full border-2 border-white/30 bg-white overflow-hidden flex items-center justify-center p-1">
                    <Image
                      src={integration.logo}
                      alt={integration.name}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Right Column: Sign Up Form */}
      <div className="flex flex-col justify-center px-8 py-12 lg:px-12 xl:px-16 bg-white relative overflow-y-auto">
        <FadeIn>
          <div className="mb-8 flex items-center justify-between">
            <Logo
              width={120}
              height={32}
              showText={true}
              variant="dark"
            />
            <Link
              href="https://barpelai.odia.dev"
              className="text-sm font-medium text-[#37A195] hover:text-[#2F8E88] transition-colors"
            >
              ← Back to home
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#102A33] tracking-tight mb-2">
              Create your account
            </h1>
            <p className="text-[#6B7280]">
              Start free, upgrade anytime
            </p>
          </div>

          {error && (
            <div role="alert" aria-live="assertive" className="bg-red-900/20 border border-red-500/30 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
              {error}{' '}
              {errorLink && (
                <Link href={errorLink.href} className="font-semibold underline hover:no-underline">
                  {errorLink.label} →
                </Link>
              )}
            </div>
          )}

          {/* Google OAuth */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 gap-3 text-[#102A33] border-2 border-[#E5E7EB] rounded-lg bg-white shadow-sm hover:shadow-md hover:bg-gray-50 hover:scale-[1.02] active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#37A195]/30 focus:ring-offset-2 transition-all duration-200 mb-4"
            onClick={handleGoogleSignUp}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#6B7280]" />
            ) : (
              <>
                <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="font-semibold">Continue with Google</span>
              </>
            )}
          </Button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E7EB]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-[#6B7280] font-medium">or sign up with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="firstName" className="text-sm font-medium text-[#102A33]">
                  First name
                </label>
                <Input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={loading}
                  className="border border-[#E5E7EB] rounded-lg focus:border-[#37A195] focus:ring-[#37A195]/10"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="lastName" className="text-sm font-medium text-[#102A33]">
                  Last name
                </label>
                <Input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Smith"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={loading}
                  className="border border-[#E5E7EB] rounded-lg focus:border-[#37A195] focus:ring-[#37A195]/10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-[#102A33]">
                Work email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="border border-[#E5E7EB] rounded-lg focus:border-[#37A195] focus:ring-[#37A195]/10"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-[#102A33]">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-describedby={password.length > 0 ? 'password-strength' : undefined}
                  required
                  disabled={loading}
                  className="border border-[#E5E7EB] rounded-lg focus:border-[#37A195] focus:ring-[#37A195]/10"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#102A33] transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {strength && (
                <div
                  role="progressbar"
                  aria-valuenow={strength.score}
                  aria-valuemin={0}
                  aria-valuemax={4}
                  aria-label="Password strength"
                  className="mt-1.5 space-y-1"
                >
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-colors duration-200 ${
                          strength.score >= i ? strength.color : 'bg-[#E5E7EB]'
                        }`}
                      />
                    ))}
                  </div>
                  <p id="password-strength" className="text-xs text-[#6B7280]">{strength.label}</p>
                </div>
              )}
            </div>

            {lockedOut && (
              <p className="text-sm text-center text-[#6B7280] mb-3">
                Too many attempts. Retry in {timerLabel}, or{' '}
                <a
                  href="mailto:support@barpel.ai"
                  className="font-medium text-[#37A195] underline hover:no-underline"
                >
                  contact support
                </a>.
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold bg-[#37A195] text-white rounded-lg shadow-lg shadow-[#37A195]/25 hover:shadow-xl hover:shadow-[#37A195]/35 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#37A195]/50 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
              disabled={
                loading ||
                lockedOut ||
                !firstName.trim() ||
                !lastName.trim() ||
                !email.trim() ||
                (password.length > 0 && (!strength || strength.score < 2))
              }
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : lockedOut ? (
                'Try again later'
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-[#6B7280] leading-relaxed">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-[#37A195] hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-[#37A195] hover:underline">Privacy Policy</Link>.
          </p>

          <p className="mt-4 text-center text-sm text-[#6B7280]">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-[#37A195] hover:text-[#2F8E88]">
              Sign In
            </Link>
          </p>
        </FadeIn>
      </div>
    </div>
  );
}
