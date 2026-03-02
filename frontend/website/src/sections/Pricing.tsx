import { Check, ArrowRight } from 'lucide-react';
import { ctaLinks } from '@/lib/brand.config';

const plans = [
  {
    name: 'Starter',
    price: '₦25,000',
    period: '/mo',
    description: 'For solo entrepreneurs.',
    features: ['200 Minutes/mo', '1 AI Number', 'Basic Call Forwarding', 'Email Support'],
    cta: 'Start Trial',
    href: ctaLinks.signUpStarter,
    highlighted: false,
  },
  {
    name: 'Business',
    price: '₦60,000',
    period: '/mo',
    description: 'For growing SMEs.',
    features: [
      '1,000 Minutes/mo',
      'CRM Integration',
      'Appointment Booking',
      'Call Transcripts',
      'Priority Support',
    ],
    cta: 'Start Free Trial',
    href: ctaLinks.signUpBusiness,
    highlighted: true,
    badge: 'BEST VALUE',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For high volume needs.',
    features: ['Unlimited Minutes', 'Custom Voice Clone', 'API Access', 'Dedicated Account Manager'],
    cta: 'Contact Sales',
    href: '/contact',
    highlighted: false,
    isInternal: true,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-barpel-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-barpel-text mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-barpel-text-secondary text-lg max-w-2xl mx-auto">
            No hidden fees. Start free, scale as you grow.
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
                <div className="flex items-baseline gap-1">
                  <span className={`font-display font-bold text-4xl ${plan.highlighted ? 'text-white' : 'text-barpel-text'}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-sm ${plan.highlighted ? 'text-white/60' : 'text-barpel-text-secondary'}`}>
                      {plan.period}
                    </span>
                  )}
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
              {plan.isInternal ? (
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
              ) : (
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
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
