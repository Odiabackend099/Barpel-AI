/**
 * Barpel AI Brand Configuration
 *
 * Single source of truth for all brand-specific values in the marketing website.
 * When white-labeling for a new client, update this file + swap logo assets in /public/.
 *
 * Dashboard app URL is driven by the VITE_APP_URL environment variable:
 *   - Development: .env.local → http://localhost:3000
 *   - Production:  .env.production → https://app.barpel.ai
 */

export const brand = {
  // Identity
  name: 'Barpel AI',
  shortName: 'Barpel',
  tagline: 'AI-powered voice automation for your business',
  description:
    'Barpel AI gives your business a 24/7 AI voice agent that books appointments, answers questions, and follows up with leads automatically.',

  // URLs
  appUrl: import.meta.env.VITE_APP_URL ?? 'https://app.barpel.ai',
  domain: 'barpel.ai',
  supportEmail: 'support@barpel.ai',

  // Social
  twitter: 'https://twitter.com/barpelai',
  linkedin: 'https://linkedin.com/company/barpel-ai',
  facebook: 'https://facebook.com/barpelai',
} as const;

/**
 * CTA link helpers — ensures all buttons point to the correct app URL.
 * Authenticated users are handled server-side by the Next.js app:
 * if session exists → redirect('/dashboard')
 */
export const ctaLinks = {
  signUp: `${brand.appUrl}/sign-up`,
  signUpStarter: `${brand.appUrl}/sign-up?plan=starter`,
  signUpBusiness: `${brand.appUrl}/sign-up?plan=business`,
  signUpEnterprise: `${brand.appUrl}/sign-up?plan=enterprise`,
  login: `${brand.appUrl}/login`,
  dashboard: `${brand.appUrl}/dashboard`,
} as const;
