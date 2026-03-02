import { Check } from 'lucide-react';

export default function Solution() {
  const comparisons = [
    {
      problem: 'Missed calls go unanswered',
      solution: 'Every call answered 24/7/365',
    },
    {
      problem: 'Manual appointment booking',
      solution: 'Automatic calendar sync & scheduling',
    },
    {
      problem: 'Business hours only',
      solution: 'AI receptionist works round the clock',
    },
    {
      problem: 'Expensive staff costs',
      solution: 'Fraction of the cost of a real receptionist',
    },
  ];

  return (
    <section id="solution" className="py-24 bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#102A33] mb-4">
            Meet Your AI Receptionist
          </h2>
          <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
            Barpel AI answers every call, books appointments, and qualifies leads automatically. No hiring needed.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Without Barpel */}
          <div className="bg-white rounded-2xl p-8 border border-red-200 bg-red-50/30">
            <h3 className="text-xl font-bold text-[#102A33] mb-6">Without Barpel</h3>
            <div className="space-y-4">
              {comparisons.map((item) => (
                <div key={item.problem} className="flex gap-3">
                  <div className="text-red-500 flex-shrink-0 mt-1">✕</div>
                  <p className="text-[#6B7280]">{item.problem}</p>
                </div>
              ))}
            </div>
          </div>

          {/* With Barpel */}
          <div className="bg-white rounded-2xl p-8 border border-[#37A195] bg-[#E8F5F2]/30">
            <h3 className="text-xl font-bold text-[#102A33] mb-6">With Barpel</h3>
            <div className="space-y-4">
              {comparisons.map((item) => (
                <div key={item.solution} className="flex gap-3">
                  <Check className="w-6 h-6 text-[#37A195] flex-shrink-0" />
                  <p className="text-[#6B7280]">{item.solution}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#37A195] text-white rounded-lg font-semibold hover:bg-[#2F8E88] transition-colors"
          >
            See How It Works
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
