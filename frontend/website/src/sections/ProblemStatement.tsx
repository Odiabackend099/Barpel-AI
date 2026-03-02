import { Phone, Clock, TrendingDown } from 'lucide-react';

export default function ProblemStatement() {
  const problems = [
    {
      icon: Phone,
      title: 'Missed Calls = Lost Revenue',
      description: 'When your phone rings and no one answers, that customer calls a competitor instead.',
    },
    {
      icon: Clock,
      title: 'Expensive Receptionists',
      description: 'Hiring a receptionist costs £25k+/year and only works during business hours.',
    },
    {
      icon: TrendingDown,
      description: 'No-shows and missed appointments drain your revenue every single week.',
      title: 'No-Shows & Cancellations',
    },
  ];

  return (
    <section id="problem" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Stat Block */}
          <div>
            <div className="bg-[#E8F5F2] rounded-2xl p-12 text-center">
              <p className="text-5xl sm:text-6xl font-bold text-[#37A195] mb-4">78%</p>
              <p className="text-xl text-[#102A33] font-semibold mb-2">of missed calls</p>
              <p className="text-[#6B7280]">result in lost business opportunities</p>
            </div>
          </div>

          {/* Right: Pain Points */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#102A33] mb-6">
              The Problem Most Businesses Face
            </h2>
            <p className="text-[#6B7280] text-lg mb-8">
              Your business loses revenue every day because of missed calls and manual booking processes.
            </p>

            <div className="space-y-6">
              {problems.map((problem) => {
                const Icon = problem.icon;
                return (
                  <div key={problem.title} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[#E8F5F2]">
                        <Icon className="h-6 w-6 text-[#37A195]" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#102A33]">{problem.title}</h3>
                      <p className="text-[#6B7280] mt-1">{problem.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
