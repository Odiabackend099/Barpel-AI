import Navigation from '@/sections/Navigation';
import Footer from '@/sections/Footer';

export default function Terms() {
  return (
    <>
      <Navigation />
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-[#102A33] mb-2">Terms of Service</h1>
          <p className="text-sm text-[#6B7280] mb-10">Last updated: March 2026</p>

          <div className="space-y-8 text-[#6B7280]">

            <div>
              <h2 className="text-2xl font-bold text-[#102A33] mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Barpel AI (the &quot;Service&quot;), you agree to be bound by these Terms of
                Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not access or use the
                Service. These Terms apply to all users, including businesses and individuals who
                register for an account.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#102A33] mb-4">2. Description of Service</h2>
              <p>
                Barpel AI provides an AI-powered voice receptionist platform that handles inbound and
                outbound telephone calls on behalf of businesses. The Service includes call answering,
                appointment booking, lead qualification, call transcription, and related analytics
                features.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#102A33] mb-4">3. Account Registration</h2>
              <p className="mb-3">
                You must create an account to use the Service. You are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Providing accurate and complete registration information</li>
                <li>Maintaining the security of your account credentials</li>
                <li>All activity that occurs under your account</li>
                <li>Notifying us immediately of any unauthorised access</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#102A33] mb-4">4. Acceptable Use</h2>
              <p className="mb-3">You agree not to use the Service to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Violate any applicable law or regulation</li>
                <li>Conduct spam, phishing, or fraudulent calling campaigns</li>
                <li>Record calls without proper consent where legally required</li>
                <li>Harass, threaten, or deceive call recipients</li>
                <li>Resell or sublicense the Service without written permission</li>
                <li>Attempt to reverse-engineer or circumvent the platform</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#102A33] mb-4">5. Billing and Credits</h2>
              <p className="mb-3">
                The Service operates on a pay-as-you-go credit model. Credits are deducted based on
                the duration of AI-handled calls.
              </p>
              <ul className="list-disc list-inside space-y-2 mb-3">
                <li>Credits are purchased in advance and deducted as the Service is used</li>
                <li>Credits do not expire</li>
                <li>Used credits are non-refundable</li>
                <li>Unused credits may be refunded within 14 days of purchase, minus any usage</li>
                <li>Prices are displayed in USD and may change with 30 days notice</li>
              </ul>
              <p>
                Bundle purchases are one-time payments. There are no recurring subscriptions unless
                you explicitly enrol in an auto top-up plan.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#102A33] mb-4">6. Intellectual Property</h2>
              <p>
                Barpel AI and its licensors own all right, title, and interest in the Service,
                including all software, content, branding, and documentation. You retain ownership
                of your data (call recordings, transcripts, customer contacts) and grant us a
                limited licence to process it solely to provide the Service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#102A33] mb-4">7. Privacy and Data</h2>
              <p>
                Your use of the Service is also governed by our{' '}
                <a href="/legal/privacy" className="text-[#37A195] hover:underline">
                  Privacy Policy
                </a>
                , which is incorporated into these Terms by reference.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#102A33] mb-4">8. Limitation of Liability</h2>
              <p className="mb-3">
                To the maximum extent permitted by law, Barpel AI shall not be liable for:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Indirect, incidental, or consequential damages</li>
                <li>Loss of revenue, profits, or business opportunities</li>
                <li>Damage caused by third-party telephony or AI providers</li>
                <li>Service interruptions outside our reasonable control</li>
              </ul>
              <p className="mt-3">
                Our total liability to you for any claim shall not exceed the amount you paid for the
                Service in the 3 months preceding the claim.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#102A33] mb-4">9. Termination</h2>
              <p>
                You may close your account at any time. We may suspend or terminate your account for
                violation of these Terms, with or without notice. Upon termination, your data will be
                deleted within 30 days in accordance with our Privacy Policy.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#102A33] mb-4">10. Governing Law</h2>
              <p>
                These Terms are governed by the laws of England and Wales. Any disputes shall be
                resolved in the courts of England and Wales, unless you are a consumer in another
                jurisdiction entitled to the protection of local law.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#102A33] mb-4">11. Contact</h2>
              <p>
                Questions about these Terms? Contact us at{' '}
                <a href="mailto:legal@barpel.ai" className="text-[#37A195] hover:underline">
                  legal@barpel.ai
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
