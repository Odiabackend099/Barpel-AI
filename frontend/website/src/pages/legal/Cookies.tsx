import Navigation from '@/sections/Navigation';
import Footer from '@/sections/Footer';

export default function Cookies() {
  return (
    <>
      <Navigation />
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-[#102A33] mb-2">Cookie Policy</h1>
          <p className="text-sm text-[#6B7280] mb-10">Last updated: March 2026</p>

          <div className="space-y-8 text-[#6B7280]">

            <div>
              <h2 className="text-2xl font-bold text-[#102A33] mb-4">What Are Cookies?</h2>
              <p>
                Cookies are small text files stored on your device when you visit a website. They
                help websites remember your preferences, keep you signed in, and understand how
                pages are used. We use cookies to make Barpel AI work correctly and to improve
                your experience.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#102A33] mb-4">Cookies We Use</h2>

              <div className="space-y-6">

                <div className="border border-[#E5E7EB] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-[#102A33]">Essential Cookies</h3>
                    <span className="text-xs px-2 py-1 bg-[#E8F5F2] text-[#37A195] rounded-full font-medium">Always Active</span>
                  </div>
                  <p className="text-sm mb-3">
                    These cookies are required for the website and application to function. Without
                    them, you cannot sign in, stay logged in, or use the dashboard. We cannot
                    disable these cookies.
                  </p>
                  <ul className="text-sm space-y-2">
                    <li><strong className="text-[#102A33]">sb-auth-token</strong> — Keeps you signed into the Barpel AI dashboard (Supabase Auth)</li>
                    <li><strong className="text-[#102A33]">sb-refresh-token</strong> — Refreshes your session automatically so you stay logged in</li>
                    <li><strong className="text-[#102A33]">__stripe_mid</strong> — Stripe fraud prevention (required for payment processing)</li>
                  </ul>
                </div>

                <div className="border border-[#E5E7EB] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-[#102A33]">Analytics Cookies</h3>
                    <span className="text-xs px-2 py-1 bg-[#F9FAFB] text-[#6B7280] rounded-full font-medium">Optional</span>
                  </div>
                  <p className="text-sm mb-3">
                    We may use privacy-respecting analytics to understand how visitors use the
                    marketing website (which pages are popular, where users come from). We do not
                    use advertising trackers or sell your data.
                  </p>
                  <p className="text-sm">
                    We do not use Google Analytics, Facebook Pixel, or any third-party advertising
                    cookies. If we add analytics in future, we will update this policy and request
                    consent where required.
                  </p>
                </div>

                <div className="border border-[#E5E7EB] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-[#102A33]">Strictly Necessary Third-Party Cookies</h3>
                    <span className="text-xs px-2 py-1 bg-[#E8F5F2] text-[#37A195] rounded-full font-medium">Required for Features</span>
                  </div>
                  <p className="text-sm mb-3">
                    Some features rely on trusted third-party services that may set their own
                    cookies:
                  </p>
                  <ul className="text-sm space-y-2">
                    <li><strong className="text-[#102A33]">Stripe</strong> — Payment processing cookies for secure checkout. See <a href="https://stripe.com/cookie-settings" className="text-[#37A195] hover:underline" target="_blank" rel="noopener noreferrer">Stripe Cookie Policy</a>.</li>
                  </ul>
                </div>

              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#102A33] mb-4">How to Control Cookies</h2>
              <p className="mb-4">
                You can control cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>View and delete existing cookies</li>
                <li>Block third-party cookies</li>
                <li>Block all cookies (note: this will prevent you from signing in)</li>
                <li>Receive a notification when a cookie is set</li>
              </ul>
              <p className="mb-3">Browser guides:</p>
              <ul className="space-y-1 text-sm">
                <li><a href="https://support.google.com/chrome/answer/95647" className="text-[#37A195] hover:underline" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
                <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" className="text-[#37A195] hover:underline" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
                <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" className="text-[#37A195] hover:underline" target="_blank" rel="noopener noreferrer">Apple Safari</a></li>
                <li><a href="https://support.microsoft.com/en-us/windows/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d" className="text-[#37A195] hover:underline" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#102A33] mb-4">Changes to This Policy</h2>
              <p>
                We may update this Cookie Policy as our use of cookies changes. We will update the
                &quot;Last updated&quot; date at the top of this page. We encourage you to review this policy
                periodically.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#102A33] mb-4">Contact</h2>
              <p>
                Questions about cookies? Contact us at{' '}
                <a href="mailto:privacy@barpel.ai" className="text-[#37A195] hover:underline">
                  privacy@barpel.ai
                </a>
                .
              </p>
            </div>

          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
