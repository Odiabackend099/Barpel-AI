import Navigation from '@/sections/Navigation';
import Footer from '@/sections/Footer';

export default function About() {
  return (
    <>
      <Navigation />
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-[#102A33] mb-8">About Barpel AI</h1>

          <div className="prose prose-lg text-[#6B7280] space-y-6">
            <p className="text-xl text-[#37A195] font-semibold">
              Making enterprise-grade AI receptionists accessible to every business.
            </p>

            <h2 className="text-2xl font-bold text-[#102A33]">Our Story</h2>
            <p>
              Barpel AI was founded to solve a problem affecting millions of businesses worldwide: missed calls and unmanned phones. We discovered that SMEs and healthcare practices lose billions annually due to missed calls, while being unable to afford dedicated receptionists.
            </p>
            <p>
              By combining the latest AI technology with proven telephony infrastructure, we created a solution that works 24/7, costs a fraction of human staff, and actually improves customer experience.
            </p>

            <h2 className="text-2xl font-bold text-[#102A33]">Our Mission</h2>
            <p>
              To empower every business with intelligent, reliable call handling that feels human, works tirelessly, and costs less than hiring one person.
            </p>

            <h2 className="text-2xl font-bold text-[#102A33]">Our Values</h2>
            <ul className="space-y-3 list-disc list-inside">
              <li><strong>Reliability:</strong> Every call matters. We operate 99.9% uptime.</li>
              <li><strong>Accessibility:</strong> Powerful AI shouldn't require technical expertise.</li>
              <li><strong>Innovation:</strong> We continuously improve through customer feedback.</li>
              <li><strong>Privacy-First:</strong> Your data is encrypted and protected.</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#102A33]">By The Numbers</h2>
            <div className="grid md:grid-cols-3 gap-6 my-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#37A195]">10K+</p>
                <p className="text-[#6B7280]">Calls Handled</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#37A195]">99.9%</p>
                <p className="text-[#6B7280]">Uptime</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#37A195]">&lt;2s</p>
                <p className="text-[#6B7280]">Response Time</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
