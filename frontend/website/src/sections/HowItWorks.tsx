import { Smartphone, Phone, MessageCircle } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      icon: Smartphone,
      title: 'Create Your Account',
      description: "Sign up free, configure your AI agent's voice, greeting, and behavior in 10 minutes.",
    },
    {
      number: '2',
      icon: Phone,
      title: 'Get Your AI Phone Number',
      description: 'Receive a dedicated business number powered by Twilio and Vapi infrastructure.',
    },
    {
      number: '3',
      icon: MessageCircle,
      title: 'AI Handles Your Calls',
      description: 'Every call answered, appointments booked, leads qualified, and messages sent automatically.',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#102A33] mb-4">
            Up and Running in 3 Steps
          </h2>
          <p className="text-lg text-[#6B7280]">
            Average setup time: under 30 minutes
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative">
                {/* Number Badge */}
                <div className="absolute -top-4 left-0 w-10 h-10 rounded-full bg-[#37A195] text-white flex items-center justify-center font-bold text-lg">
                  {step.number}
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl p-8 pt-12 h-full border border-[#E5E7EB] hover:shadow-lg transition-shadow">
                  <div className="mb-4 inline-block p-3 bg-[#E8F5F2] rounded-lg">
                    <Icon className="w-6 h-6 text-[#37A195]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#102A33] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-[#6B7280]">
                    {step.description}
                  </p>
                </div>

                {/* Arrow (hide on last) */}
                {step.number !== '3' && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <div className="text-3xl text-[#E5E7EB]">→</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom stat */}
        <div className="bg-gradient-to-r from-[#E8F5F2] to-[#F3F4F6] rounded-2xl p-8 text-center">
          <p className="text-[#6B7280] text-sm mb-2">Average time from signup to first call answered</p>
          <p className="text-4xl font-bold text-[#37A195]">30 minutes</p>
        </div>
      </div>
    </section>
  );
}
