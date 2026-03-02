import { Check, ArrowRight } from 'lucide-react';
import { ctaLinks } from '@/lib/brand.config';

// Actual rates from backend/src/config/index.ts
// RATE_PER_MINUTE_USD_CENTS = 70  →  $0.70/min
// WALLET_MIN_TOPUP_USD_CENTS = 2500   →  $25 minimum top-up
// Bundle $99 at $0.70/min = ~141 min raw, +10% bonus = ~155 min

const plans = [
  {
    name: 'Pay-As-You-Go',
    priceLabel: 'Free to start',
    priceNote: '$0.70 per minute',
    description: 'No upfront cost. Top up anytime and only pay for the calls your AI handles.',
    features: [
      'No monthly commitment',
      '$0.70 per minute of AI call time',
      'Minimum top-up of $25',
      'Credits never expire',
      'All core features included',
      'Email support',
    ],
    cta: 'Get Started Free',
    href: ctaLinks.signUp,
    highlighted: false,
    badge: null,
  },
  {
    name: 'Growth Bundle',
    priceLabel: '$99',
    priceNote: '~155 minutes included',
    description: 'Buy a bundle and get more minutes at a better per-minute rate.',
    features: [
      '~155 minutes of AI call time',
      '+10% bonus vs pay-as-you-go',
      'Credits never expire',
      'All core features included',
      'Priority support',
    ],
    cta: 'Get Started Free',
    href: ctaLinks.signUp,
    highlighted: true,
    badge: 'BEST VALUE',
  },
  {
    name: 'Enterprise',
    priceLabel: 'Custom',
    priceNote: 'Volume pricing available',
    description: 'High-volume businesses with dedicated support and custom SLA.',
    features: [
      'Custom call volume pricing',
      'Dedicated account manager',
      'Custom SLA & uptime guarantee',
      'Advanced integrations & API access',
      'Onboarding & training included',
    ],
    cta: 'Talk to Sales',
    href: '/contact',
    highlighted: false,
    badge: null,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-bold text-3xl sm:text-4xl text-[#102A33] mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-[#6B7280] text-lg max-w-2xl mx-auto">
            Start free with pay-as-you-go, or buy a bundle for better rates. No subscriptions. Credits never expire.
          </p>
          <p className="text-[#6B7280] text-sm mt-4">
            All amounts in USD · Secure Stripe checkout · Cancel anytime
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 transition-all duration-300 ${
                plan.highlighted
                  ? 'bg-[#102A33] text-white shadow-2xl scale-105'
                  : 'bg-white text-[#102A33] shadow-md hover:shadow-xl'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-[#37A195] text-white text-xs font-bold tracking-wider">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`font-bold text-xl mb-1 ${plan.highlighted ? 'text-white' : 'text-[#102A33]'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.highlighted ? 'text-white/60' : 'text-[#6B7280]'}`}>
                  {plan.description}
                </p>
                <div className="mb-1">
                  <span className={`font-bold text-4xl ${plan.highlighted ? 'text-white' : 'text-[#102A33]'}`}>
                    {plan.priceLabel}
                  </span>
                </div>
                <div className={`text-sm ${plan.highlighted ? 'text-white/70' : 'text-[#6B7280]'}`}>
                  {plan.priceNote}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 flex-shrink-0 text-[#37A195]" />
                    <span className={plan.highlighted ? 'text-white/80' : 'text-[#102A33]'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href={plan.href}
                className={`group w-full py-3 rounded-full font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                  plan.highlighted
                    ? 'bg-[#37A195] text-white hover:bg-[#2F8E88]'
                    : 'bg-[#37A195]/10 text-[#37A195] hover:bg-[#37A195] hover:text-white border border-[#37A195]/30'
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
