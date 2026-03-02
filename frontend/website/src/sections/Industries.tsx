export default function Industries() {
  const industries = [
    {
      emoji: '🏥',
      name: 'Healthcare & Medical',
      useCase: 'Appointment scheduling and patient intake',
    },
    {
      emoji: '💇',
      name: 'Beauty & Salons',
      useCase: 'Booking and cancellation management',
    },
    {
      emoji: '🍽️',
      name: 'Restaurants & Hospitality',
      useCase: 'Reservation management and inquiries',
    },
    {
      emoji: '⚖️',
      name: 'Professional Services',
      useCase: 'Consultation booking and client intake',
    },
    {
      emoji: '🏠',
      name: 'Real Estate',
      useCase: 'Property inquiry and viewing scheduling',
    },
    {
      emoji: '🛍️',
      name: 'Retail & eCommerce',
      useCase: 'Customer support and order tracking',
    },
  ];

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
          {industries.map((industry) => (
            <div
              key={industry.name}
              className="bg-white rounded-2xl p-8 border border-[#E5E7EB] hover:shadow-lg hover:border-[#37A195] transition-all"
            >
              <div className="text-4xl mb-4">{industry.emoji}</div>
              <h3 className="text-lg font-bold text-[#102A33] mb-2">
                {industry.name}
              </h3>
              <p className="text-sm text-[#6B7280]">
                {industry.useCase}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
