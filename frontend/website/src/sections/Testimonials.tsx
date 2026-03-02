import { Star } from 'lucide-react';

interface Testimonial {
  quote: string;
  name: string;
  title: string;
  business: string;
  industry: string;
  initials: string;
  avatarColor: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "Barpel AI paid for itself in the first week. We stopped missing calls after hours and our bookings went up 40%. Best thing we've done for the clinic.",
    name: 'Dr. Emeka Obi',
    title: 'Medical Director',
    business: 'Lagos Medical Centre',
    industry: 'Healthcare',
    initials: 'EO',
    avatarColor: '#37A195',
  },
  {
    quote:
      "I was sceptical but it genuinely sounds like a real receptionist. Clients book appointments without realising it's an AI. Complete game-changer for my salon.",
    name: 'Chisom Adeyemi',
    title: 'Owner',
    business: 'Glow Beauty Studio',
    industry: 'Beauty & Salons',
    initials: 'CA',
    avatarColor: '#5B9FA3',
  },
  {
    quote:
      "We get a lot of enquiries about properties. Barpel qualifies every lead and only sends me the serious buyers. It saves me 3 hours a day, easily.",
    name: 'Tunde Bakare',
    title: 'Principal Agent',
    business: 'Lagos Prime Realty',
    industry: 'Real Estate',
    initials: 'TB',
    avatarColor: '#2F8E88',
  },
];

function StarRating() {
  return (
    <div className="flex gap-0.5 mb-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-[#37A195] text-[#37A195]" />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#102A33] mb-4">
            Businesses That Never Miss a Call
          </h2>
          <p className="text-lg text-[#6B7280]">
            Real results from Nigerian business owners using Barpel AI every day
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-white rounded-2xl p-8 border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <StarRating />

              {/* Quote — curly quotes for typographic quality */}
              <blockquote className="text-[#374151] text-base leading-relaxed flex-1 mb-8">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: testimonial.avatarColor }}
                >
                  {testimonial.initials}
                </div>
                <div>
                  <p className="font-semibold text-[#102A33] text-sm leading-tight">{testimonial.name}</p>
                  <p className="text-[#6B7280] text-xs mt-0.5">{testimonial.title} · {testimonial.business}</p>
                </div>
                {/* Industry tag */}
                <div className="ml-auto">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-[#37A195] bg-[#E8F5F2] px-2 py-1 rounded-full whitespace-nowrap">
                    {testimonial.industry}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
