import Navigation from '@/sections/Navigation';
import Footer from '@/sections/Footer';
import { ctaLinks } from '@/lib/brand.config';

const steps = [
  {
    step: '01',
    title: '30-Minute Live Session',
    desc: 'A real, interactive walkthrough of the Barpel AI platform — not a slide deck.',
  },
  {
    step: '02',
    title: 'Your Industry, Your Use Case',
    desc: 'We tailor the demo to how your business works — healthcare, salons, restaurants, and more.',
  },
  {
    step: '03',
    title: 'Q&A Included',
    desc: 'Ask anything — pricing, integrations, setup time, technical requirements. No gatekeeping.',
  },
];

export default function Demo() {
  return (
    <>
      <Navigation />
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-[#102A33] mb-4">See Barpel AI In Action</h1>
          <p className="text-xl text-[#37A195] font-semibold mb-8">
            Watch a live demo tailored to your business. No commitment required.
          </p>

          <p className="text-lg text-[#6B7280] mb-12">
            The best way to understand what Barpel AI can do for your business is to see it handle
            a real call. Our team will walk you through the platform live, show you how calls are
            handled in your industry, and answer every question you have.
          </p>

          {/* What to expect */}
          <h2 className="text-2xl font-bold text-[#102A33] mb-6">What to Expect</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {steps.map((item) => (
              <div key={item.step} className="bg-[#F9FAFB] rounded-xl p-6 border border-[#E5E7EB]">
                <span className="text-[#37A195] font-bold text-sm">{item.step}</span>
                <h3 className="font-bold text-[#102A33] mt-1 mb-2">{item.title}</h3>
                <p className="text-[#6B7280] text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA box */}
          <div className="bg-[#E8F5F2] rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-[#102A33] mb-3">Ready to See It Live?</h2>
            <p className="text-[#6B7280] mb-6 max-w-lg mx-auto">
              Sign up for free and our team will reach out to schedule your personalised demo
              within one business day.
            </p>
            <a
              href={ctaLinks.signUp}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#37A195] text-white rounded-lg font-semibold hover:bg-[#2F8E88] transition-colors shadow-lg"
            >
              Request a Demo
              <span>→</span>
            </a>
            <p className="text-sm text-[#6B7280] mt-6">
              Prefer email? Reach us at{' '}
              <a href="mailto:sales@barpel.ai" className="text-[#37A195] hover:underline font-medium">
                sales@barpel.ai
              </a>
              {' '}— we respond within 1 business day.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
