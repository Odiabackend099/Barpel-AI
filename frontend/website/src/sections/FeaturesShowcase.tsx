import {
  Phone,
  Calendar,
  Zap,
  FileText,
  Mic,
  ArrowLeftRight,
  BarChart3,
  Globe,
} from 'lucide-react';

export default function FeaturesShowcase() {
  const features = [
    {
      icon: Phone,
      title: '24/7 Call Handling',
      description: 'Never miss a call. AI receptionist answers every incoming call around the clock.',
    },
    {
      icon: Calendar,
      title: 'Smart Appointment Booking',
      description: 'Automatically schedules appointments by checking your calendar and sending confirmations.',
    },
    {
      icon: Zap,
      title: 'Lead Qualification',
      description: 'Qualify leads instantly and route important calls to the right team member.',
    },
    {
      icon: FileText,
      title: 'Call Transcripts',
      description: 'Get detailed transcripts and summaries of every call for reference and compliance.',
    },
    {
      icon: Mic,
      title: 'Custom Voice',
      description: 'Choose from multiple AI voices or create a custom branded voice for your business.',
    },
    {
      icon: ArrowLeftRight,
      title: 'CRM Integration',
      description: 'Seamlessly sync with your existing tools like HubSpot, Salesforce, and more.',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track call metrics, success rates, and performance insights in real-time.',
    },
    {
      icon: Globe,
      title: 'Multi-Language Support',
      description: 'Coming soon: Support for 50+ languages to reach global customers.',
    },
  ];

  return (
    <section id="features" className="py-24 bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#102A33] mb-4">
            Everything Your Receptionist Can Do
          </h2>
          <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
            Barpel AI is packed with powerful features to automate your customer service
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isComingSoon = feature.title === 'Multi-Language Support';

            return (
              <div
                key={feature.title}
                className="relative bg-white rounded-2xl p-6 border border-[#E5E7EB] hover:shadow-lg transition-shadow"
              >
                {isComingSoon && (
                  <div className="absolute -top-3 -right-3">
                    <span className="bg-[#FEE3B1] text-[#92400E] text-xs font-bold px-3 py-1 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                )}

                <div className="w-12 h-12 rounded-lg bg-[#E8F5F2] flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[#37A195]" />
                </div>

                <h3 className="text-lg font-bold text-[#102A33] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#6B7280]">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
