import Navigation from '@/sections/Navigation';
import Footer from '@/sections/Footer';

const perks = [
  { title: 'Remote-First', desc: 'Work from anywhere in the world, on your own schedule.' },
  { title: 'Equity', desc: 'Own a meaningful piece of what you help build.' },
  { title: 'Learning Budget', desc: '$1,000/year for courses, books, and conferences.' },
  { title: 'Health Coverage', desc: 'Private health insurance for you and your family.' },
];

export default function Careers() {
  return (
    <>
      <Navigation />
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-[#102A33] mb-4">Join Barpel AI</h1>
          <p className="text-xl text-[#37A195] font-semibold mb-8">
            Help us make enterprise-grade AI receptionists accessible to every business.
          </p>

          <div className="prose prose-lg text-[#6B7280] space-y-6">
            <p>
              We are a small, ambitious team building the future of business communication. Our AI
              handles phone calls so business owners can focus on what they do best. If you are
              passionate about AI, love solving real problems for real customers, and want equity in
              something meaningful — we want to hear from you.
            </p>

            <h2 className="text-2xl font-bold text-[#102A33]">Open Positions</h2>
            <div className="bg-[#F9FAFB] rounded-2xl p-8 border border-[#E5E7EB]">
              <p className="text-[#6B7280]">
                We are growing fast and always on the lookout for exceptional people. We do not
                always have specific roles open, but we review every CV we receive.
              </p>
              <p className="mt-4 text-[#6B7280]">
                Send your CV and a short note about what you would bring to the team to{' '}
                <a
                  href="mailto:hello@barpel.ai"
                  className="text-[#37A195] hover:underline font-medium"
                >
                  hello@barpel.ai
                </a>
              </p>
              <p className="mt-4 text-sm text-[#6B7280]">
                We typically respond within 3 business days. Remote applicants welcome worldwide.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-[#102A33]">Why Barpel AI</h2>
            <p>
              We are not just building software — we are solving a real problem that affects millions
              of businesses every day. Missed calls mean missed revenue. Our AI makes sure that never
              happens again.
            </p>

            <div className="grid md:grid-cols-2 gap-6 my-8">
              {perks.map((perk) => (
                <div key={perk.title} className="bg-[#E8F5F2] rounded-xl p-6">
                  <h3 className="font-bold text-[#102A33] mb-2">{perk.title}</h3>
                  <p className="text-[#6B7280] text-sm">{perk.desc}</p>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-bold text-[#102A33]">Our Values</h2>
            <ul className="space-y-3 list-disc list-inside">
              <li><strong>Ownership:</strong> Everyone acts like a founder — no blame, only solutions.</li>
              <li><strong>Customer Obsession:</strong> Every feature decision starts with the customer.</li>
              <li><strong>Move Fast:</strong> Ship, learn, iterate. We prefer done over perfect.</li>
              <li><strong>Radical Transparency:</strong> We share context openly across the team.</li>
            </ul>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
