import { Lock, Zap, Shield, CheckCircle } from 'lucide-react';

const trustItems = [
  {
    icon: Lock,
    title: 'Data Encryption',
    description: 'End-to-end encryption for all calls and data at rest using AES-256.',
  },
  {
    icon: Zap,
    title: '99.9% Uptime SLA',
    description: 'Built on Vapi and Twilio infrastructure with 99.9% guaranteed uptime.',
  },
  {
    icon: Shield,
    title: 'GDPR Compliant',
    description: 'Full GDPR compliance including data deletion, export, and privacy controls.',
  },
  {
    icon: CheckCircle,
    title: 'SOC 2 Ready',
    description: 'Enterprise-grade security and compliance certifications.',
  },
];

// Real partner logos stored in /public/logos/
const partners = [
  {
    name: 'Twilio',
    logo: '/logos/twilio.svg',
    width: 36,
    height: 36,
  },
  {
    name: 'Vapi',
    logo: '/logos/vapi.svg',
    width: 64,
    height: 28,
  },
  {
    name: 'Google Calendar',
    logo: '/logos/google-calendar.svg',
    width: 32,
    height: 32,
  },
  {
    name: 'Stripe',
    logo: '/logos/stripe.svg',
    width: 48,
    height: 20,
  },
  {
    name: 'Groq',
    logo: '/logos/groq.svg',
    width: 64,
    height: 28,
  },
];

export default function SecurityTrust() {
  return (
    <section id="security-section" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#102A33] mb-4">
            Enterprise Security You Can Trust
          </h2>
          <p className="text-lg text-[#6B7280]">
            Built on proven, certified infrastructure
          </p>
        </div>

        {/* Trust Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-gradient-to-br from-[#E8F5F2] to-white rounded-2xl p-8 border border-[#37A195]/20"
              >
                <div className="w-12 h-12 rounded-lg bg-[#37A195] flex items-center justify-center mb-4 text-white">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#102A33] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[#6B7280]">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Partners — infinite scroll marquee, right to left, pauses on hover */}
        <div className="border-t border-b border-[#E5E7EB] py-10 mb-16">
          <p className="text-center text-[#6B7280] text-xs font-semibold uppercase tracking-widest mb-8">
            Powered by enterprise infrastructure
          </p>
          {/*
            Marquee technique:
            - Render the partners list twice in a single flex row (width = 2× content).
            - Animate translateX from 0 → -50%, which moves exactly one full copy off-screen.
            - The second copy fills in seamlessly, creating an infinite loop.
            - `overflow-hidden` on the outer div clips the content outside the viewport.
            - `hover:[animation-play-state:paused]` is the accessibility standard for auto-scrolling content.
          */}
          <div className="overflow-hidden" aria-label="Partner logos">
            <div
              className="flex items-center animate-marquee hover:[animation-play-state:paused]"
              style={{ width: 'max-content' }}
            >
              {/* Render partners twice for seamless loop */}
              {[...partners, ...partners].map((partner, i) => (
                <div
                  key={`${partner.name}-${i}`}
                  className="flex flex-col items-center gap-2 group cursor-default mx-10 sm:mx-16"
                  title={partner.name}
                >
                  <div
                    className="grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 ease-in-out flex items-center justify-center"
                    style={{ width: partner.width, height: partner.height }}
                  >
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      width={partner.width}
                      height={partner.height}
                      loading="lazy"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[11px] text-[#9CA3AF] font-medium group-hover:text-[#6B7280] transition-colors whitespace-nowrap">
                    {partner.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-4xl font-bold text-[#37A195] mb-1">10K+</p>
            <p className="text-[#6B7280]">Calls Handled</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-[#37A195] mb-1">99.9%</p>
            <p className="text-[#6B7280]">Uptime</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-[#37A195] mb-1">&lt;2s</p>
            <p className="text-[#6B7280]">Response Time</p>
          </div>
        </div>
      </div>
    </section>
  );
}
