import { Smartphone, Phone, MessageCircle, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Step {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

// Module-level constant — no need to recreate on every render
const steps: Step[] = [
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

export default function HowItWorks() {
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

        {/* Step cards with visible connector line on desktop */}
        <div className="relative grid md:grid-cols-3 gap-8 mb-12">

          {/* Connecting line — sits behind the cards on desktop */}
          <div
            className="hidden md:block absolute top-8 left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] h-px bg-[#37A195]/30"
            aria-hidden="true"
          />

          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;
            return (
              <div key={step.number} className="relative flex flex-col">
                {/* Step header: number badge + connector chevron */}
                <div className="flex items-center gap-3 mb-5">
                  {/* Number badge with teal ring */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#37A195] text-white flex items-center justify-center font-bold text-base z-10 relative shadow-md">
                      {step.number}
                    </div>
                    {/* Faint outer ring */}
                    <div className="absolute inset-0 rounded-full bg-[#37A195]/20 scale-[1.5]" />
                  </div>

                  {/* Chevron connector — shows between steps, hidden on last */}
                  {!isLast && (
                    <div className="flex-1 flex justify-end md:hidden" aria-hidden="true">
                      <ChevronRight className="w-5 h-5 text-[#37A195]/40" />
                    </div>
                  )}
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl p-7 flex-1 border border-[#E5E7EB] hover:border-[#37A195]/40 hover:shadow-lg transition-all duration-300 group">
                  <div className="mb-4 inline-block p-3 bg-[#E8F5F2] rounded-xl group-hover:bg-[#37A195] transition-colors duration-300">
                    <Icon className="w-6 h-6 text-[#37A195] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-bold text-[#102A33] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[#6B7280] text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
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
