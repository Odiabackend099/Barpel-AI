import { Stethoscope, Scissors, UtensilsCrossed, Briefcase, Building2, ShoppingBag } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Industry {
  icon: LucideIcon;
  name: string;
  useCase: string;
}

const industries: Industry[] = [
  {
    icon: Stethoscope,
    name: 'Healthcare & Medical',
    useCase: 'Appointment scheduling and patient intake',
  },
  {
    icon: Scissors,
    name: 'Beauty & Salons',
    useCase: 'Booking and cancellation management',
  },
  {
    icon: UtensilsCrossed,
    name: 'Restaurants & Hospitality',
    useCase: 'Reservation management and inquiries',
  },
  {
    icon: Briefcase,
    name: 'Professional Services',
    useCase: 'Consultation booking and client intake',
  },
  {
    icon: Building2,
    name: 'Real Estate',
    useCase: 'Property inquiry and viewing scheduling',
  },
  {
    icon: ShoppingBag,
    name: 'Retail & eCommerce',
    useCase: 'Customer support and order tracking',
  },
];

export default function Industries() {
  return (
    <section id="industries" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#102A33] mb-4">
            Built for Every Business That Answers Phones
          </h2>
          <p className="text-lg text-[#6B7280]">
            Works for any industry with customer calls
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {industries.map((industry) => {
            const Icon = industry.icon;
            return (
              <div
                key={industry.name}
                className="group bg-white rounded-2xl p-8 border border-[#E5E7EB] hover:border-[#37A195] hover:shadow-lg transition-all duration-300 cursor-default"
              >
                {/* Icon container — teal bg at rest, solid teal on hover */}
                <div className="w-14 h-14 rounded-xl bg-[#E8F5F2] group-hover:bg-[#37A195] flex items-center justify-center mb-5 transition-colors duration-300">
                  <Icon className="w-7 h-7 text-[#37A195] group-hover:text-white transition-colors duration-300" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#102A33] mb-1.5">
                    {industry.name}
                  </h3>
                  <p className="text-sm text-[#6B7280]">
                    {industry.useCase}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
