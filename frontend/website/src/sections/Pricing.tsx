import { Check, ArrowRight } from 'lucide-react';
import { ctaLinks } from '@/lib/brand.config';

// Pricing configuration - easy to update
const RATE_PER_MINUTE = '$0.14'; // Per minute rate for display
const RATE_NUMERIC = 0.14; // Numeric value

const plans = [
  {
    name: 'Starter Pack',
    price: '$25',
    minutes: '~180 minutes',
    description: 'Perfect for small businesses starting out.',
    features: ['~180 minutes of AI calls', 'Pay-as-you-go pricing', 'Credits never expire', 'Email support'],
    cta: 'Get Started Free',
    href: ctaLinks.signUp,
    highlighted: false,
  },
  {
    name: 'Growth Pack',
    price: '$50',
    minutes: '~400 minutes (+ 11% bonus)',
    description: 'For growing teams handling more calls.',
    features: ['~400 minutes of AI calls', '11% bonus credits', 'Pay-as-you-go pricing', 'Priority support'],
    cta: 'Get Started Free',
    href: ctaLinks.signUp,
    highlighted: true,
    badge: 'BEST VALUE',
  },
  {
    name: 'Scale Pack',
    price: '$100',
    minutes: '~900 minutes (+ 25% bonus)',
    description: 'For high-volume businesses.',
    features: ['~900 minutes of AI calls', '25% bonus credits', 'Pay-as-you-go pricing', 'Dedicated support'],
    cta: 'Get Started Free',
    href: ctaLinks.signUp,
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-barpel-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-barpel-text mb-4">
            Simple Pay-As-You-Go Pricing
          </h2>
          <p className="text-barpel-text-secondary text-lg max-w-2xl mx-auto">
            Buy credits, use them, top up anytime. No monthly commitments. Credits never expire.
          </p>
          <p className="text-barpel-text text-sm mt-4">
            All amounts in USD · Cancel anytime · Secure Stripe checkout
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 transition-all duration-300 ${
                plan.highlighted
                  ? 'bg-barpel-navy text-white shadow-card-elevated scale-105'
                  : 'bg-white text-barpel-text shadow-card hover:shadow-card-elevated'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-pill bg-barpel-teal text-white text-xs font-bold tracking-wider">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`font-display font-bold text-xl mb-1 ${plan.highlighted ? 'text-white' : 'text-barpel-text'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.highlighted ? 'text-white/60' : 'text-barpel-text-secondary'}`}>
                  {plan.description}
                </p>
                <div className="mb-2">
                  <span className={`font-display font-bold text-4xl ${plan.highlighted ? 'text-white' : 'text-barpel-text'}`}>
                    {plan.price}
                  </span>
                </div>
                <div className={`text-sm ${plan.highlighted ? 'text-white/70' : 'text-barpel-text-secondary'}`}>
                  {plan.minutes}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check className={`w-4 h-4 flex-shrink-0 ${plan.highlighted ? 'text-barpel-teal' : 'text-barpel-teal'}`} />
                    <span className={plan.highlighted ? 'text-white/80' : 'text-barpel-text'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href={plan.href}
                className={`group w-full py-3 rounded-pill font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                  plan.highlighted
                    ? 'bg-barpel-teal text-white hover:bg-barpel-teal-dark'
                    : 'bg-barpel-teal/10 text-barpel-teal hover:bg-barpel-teal hover:text-white border border-barpel-teal/30'
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
