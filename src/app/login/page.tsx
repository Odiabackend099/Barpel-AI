"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";
import { useState, Suspense } from "react";
import FadeIn from "@/components/ui/FadeIn";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthRateLimit } from "@/hooks/useAuthRateLimit";
import { normalizeAuthError } from "@/lib/auth-errors";

const ERROR_MESSAGES: Record<string, string> = {
    'no_org': 'Your account setup is incomplete — your workspace was not created correctly. Please sign out and sign up again, or contact support@barpel.ai.',
    'no_org_id': 'Your account setup is incomplete. Please sign out and sign up again, or contact support@barpel.ai.',
    'invalid_org_id': 'Your organization ID is invalid. Please sign out and sign up again, or contact support@barpel.ai.',
    'validation_failed': 'Account validation failed. Please try signing in again.',
};

function LoginContent() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    const errorCode = searchParams.get('error');
    const queryError = errorCode
        ? (ERROR_MESSAGES[errorCode] || 'Sign-in failed. Please try again or contact support@barpel.ai.')
        : null;
    const { lockedOut, timerLabel, recordFailure, reset } = useAuthRateLimit('login');

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(normalizeAuthError(error));
                recordFailure();
                setLoading(false);
                return;
            }

            reset();
            // Fire-and-forget: start waking up the backend during page navigation
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
            if (backendUrl) fetch(`${backendUrl}/health`, { cache: 'no-store' }).catch(() => {});
            window.location.href = '/dashboard';
        } catch (err) {
            setError("An unexpected error occurred");
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
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
        } catch (err: any) {
            setError(normalizeAuthError(err));
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#E8F5F2] via-white to-[#F3F4F6] flex flex-col items-center justify-center px-4 py-12">
            {/* Top Navigation */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4">
                <Link
                    href="https://barpelai.odia.dev"
                    className="flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#37A195] transition-colors"
                >
                    <span>←</span>
                    <span>Back to barpel.ai</span>
                </Link>
            </div>

            <FadeIn>
                {/* Logo and Tagline */}
                <div className="mb-12 text-center max-w-md mx-auto">
                    <Logo
                        width={80}
                        height={80}
                        showText={false}
                        variant="dark"
                        className="justify-center mx-auto mb-4"
                    />
                    <h2 className="text-2xl font-bold text-[#102A33] mb-2">Barpel AI</h2>
                    <p className="text-[#6B7280] text-sm">The AI receptionist for modern businesses</p>
                </div>

                {/* Main Card */}
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-[#102A33] tracking-tight">
                            Welcome back
                        </h1>
                        <p className="text-[#6B7280] mt-2">
                            Sign in to continue to your dashboard
                        </p>
                    </div>

                    {/* Google Sign In */}
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 gap-3 text-[#102A33] border-2 border-[#E5E7EB] rounded-lg bg-white shadow-sm hover:shadow-md hover:bg-gray-50 hover:scale-[1.02] active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#37A195]/30 focus:ring-offset-2 transition-all duration-200"
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin text-[#6B7280]" />
                        ) : (
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                        )}
                        Continue with Google
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#E5E7EB]" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-[#6B7280]">OR</span>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSignIn} className="space-y-5">
                        {queryError && !error && (
                            <div role="status" aria-live="polite" className="bg-amber-900/20 border border-amber-500/30 text-amber-600 px-4 py-3 rounded-lg text-sm">
                                <p>{queryError}</p>
                                {errorCode === 'no_org' && (
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            await supabase.auth.signOut();
                                            window.location.href = '/sign-up';
                                        }}
                                        className="underline font-medium hover:text-amber-700 transition-colors mt-2 block"
                                    >
                                        Sign out and start over →
                                    </button>
                                )}
                            </div>
                        )}
                        {error && (
                            <div role="alert" aria-live="assertive" className="bg-red-900/20 border border-red-500/30 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-[#102A33]">
                                Email address
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                className="border border-[#E5E7EB] rounded-lg focus:border-[#37A195] focus:ring-[#37A195]/10"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-medium text-[#102A33]">
                                    Password
                                </label>
                                <Link href="/forgot-password" className="text-sm font-medium text-[#37A195] hover:text-[#2F8E88]">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                        </div>

                        {lockedOut && (
                            <p className="text-sm text-center text-[#6B7280]" role="status" aria-live="polite">
                                Too many attempts. Retry in {timerLabel}, or{' '}
                                <a
                                    href="mailto:support@barpel.ai"
                                    className="font-medium text-[#37A195] underline hover:no-underline"
                                >
                                    contact support
                                </a>
                                .
                            </p>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold bg-[#37A195] text-white rounded-lg shadow-lg shadow-[#37A195]/25 hover:shadow-xl hover:shadow-[#37A195]/35 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#37A195]/50 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
                            disabled={loading || lockedOut}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing In...
                                </>
                            ) : lockedOut ? (
                                "Try again later"
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-[#6B7280]">
                        Don&apos;t have an account?{" "}
                        <Link href="/sign-up" className="font-medium text-[#37A195] hover:text-[#2F8E88]">
                            Sign Up
                        </Link>
                    </p>
                </div>

                {/* Stats Pills (optional social proof) */}
                <div className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto text-center">
                    <div className="text-xs">
                        <p className="text-lg font-bold text-[#37A195]">10K+</p>
                        <p className="text-[#6B7280] text-xs">Calls Handled</p>
                    </div>
                    <div className="text-xs">
                        <p className="text-lg font-bold text-[#37A195]">&lt;2s</p>
                        <p className="text-[#6B7280] text-xs">Response Time</p>
                    </div>
                    <div className="text-xs">
                        <p className="text-lg font-bold text-[#37A195]">98.7%</p>
                        <p className="text-[#6B7280] text-xs">Pickup Rate</p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link
                        href="https://barpelai.odia.dev"
                        className="text-sm text-[#6B7280] hover:text-[#102A33] transition-colors"
                    >
                        Back to Home Page
                    </Link>
                </div>
            </FadeIn>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#E8F5F2] via-white to-[#F3F4F6]">
                <div className="w-8 h-8 border-4 border-[#E5E7EB] border-t-[#37A195] rounded-full animate-spin" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
