import { Lock, Zap, Shield, CheckCircle } from 'lucide-react';

export default function SecurityTrust() {
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

  const partners = [
    { name: 'Twilio', logo: '📞' },
    { name: 'Vapi', logo: '🎙️' },
    { name: 'Google Calendar', logo: '📅' },
    { name: 'Stripe', logo: '💳' },
    { name: 'Groq', logo: '🧠' },
  ];

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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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

        {/* Partners */}
        <div className="bg-[#F9FAFB] rounded-2xl p-8 mb-12">
          <p className="text-center text-[#6B7280] text-sm font-medium mb-6">
            Trusted by enterprise partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="flex items-center gap-2 text-[#102A33] font-semibold"
              >
                <span className="text-2xl">{partner.logo}</span>
                <span className="text-sm">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-[#37A195] mb-1">10K+</p>
            <p className="text-[#6B7280]">Calls Handled</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#37A195] mb-1">99.9%</p>
            <p className="text-[#6B7280]">Uptime</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#37A195] mb-1">&lt;2s</p>
            <p className="text-[#6B7280]">Response Time</p>
          </div>
        </div>
      </div>
    </section>
  );
}
