/**
 * Barpel AI Brand Configuration — Dashboard App
 *
 * Single source of truth for brand-specific values.
 * When white-labeling for a new client:
 *   1. Update this file (name, tagline, domain, supportEmail)
 *   2. Swap logo assets in /public/ using .agent/Barpel Branding/logo_package/ as template
 *   3. Update tailwind.config.ts barpel-teal if rebranding colors
 *   4. Update .env.local with new Supabase project and API keys
 */

export const brand = {
  // Identity
  name: 'Barpel AI',
  shortName: 'Barpel',
  tagline: 'AI-powered voice automation for your business',
  description:
    'Barpel AI gives your business a 24/7 AI voice agent that books appointments, answers questions, and follows up with leads automatically.',

  // URLs
  domain: 'barpel.ai',
  marketingUrl: process.env.NEXT_PUBLIC_MARKETING_URL ?? 'https://barpel.ai',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.barpel.ai',
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'https://barpel-ai.onrender.com',
  supportEmail: 'support@barpel.ai',

  // Social
  twitter: 'https://twitter.com/barpelai',
  linkedin: 'https://linkedin.com/company/barpel-ai',
} as const;
