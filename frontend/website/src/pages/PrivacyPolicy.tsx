import Navigation from '@/sections/Navigation';
import Footer from '@/sections/Footer';

export default function PrivacyPolicy() {
  return (
    <>
      <Navigation />
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-[#102A33] mb-2">Privacy Policy</h1>
          <p className="text-[#6B7280] mb-8">Last updated: March 2026</p>

          <div className="prose prose-lg text-[#6B7280] space-y-6 max-w-none">
            <h2 className="text-2xl font-bold text-[#102A33]">Introduction</h2>
            <p>
              Barpel AI Ltd ("Company", "we", "us", "our") operates the Barpel AI service. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service, and the choices you have associated with that data.
            </p>

            <h2 className="text-2xl font-bold text-[#102A33]">Information We Collect</h2>
            <p><strong>Account Information:</strong> Name, email address, company name, phone number</p>
            <p><strong>Call Data:</strong> Call recordings, transcripts, caller information, appointment details</p>
            <p><strong>Usage Data:</strong> How you interact with our service, IP address, browser type</p>

            <h2 className="text-2xl font-bold text-[#102A33]">How We Use Your Data</h2>
            <ul className="space-y-2">
              <li>Provide and improve our AI receptionist service</li>
              <li>Send you service-related announcements</li>
              <li>Process billing and payment information</li>
              <li>Comply with legal obligations</li>
              <li>Protect against fraud and abuse</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#102A33]">Data Protection</h2>
            <p>
              We implement AES-256 encryption at rest and TLS encryption in transit. Your data is stored on secure, access-controlled servers. We do not sell your data to third parties.
            </p>

            <h2 className="text-2xl font-bold text-[#102A33]">Your Rights (GDPR/NDPR)</h2>
            <ul className="space-y-2">
              <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Deletion:</strong> Request we delete your data</li>
              <li><strong>Right to Portability:</strong> Request your data in a portable format</li>
              <li><strong>Right to Opt-Out:</strong> Unsubscribe from marketing emails</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#102A33]">Retention Policy</h2>
            <p>
              We retain call records for 30 days. Account data is retained while your account is active. You can request deletion at any time.
            </p>

            <h2 className="text-2xl font-bold text-[#102A33]">Contact Us</h2>
            <p>
              For privacy concerns, contact us at: <a href="mailto:privacy@barpel.ai" className="text-[#37A195] font-semibold">privacy@barpel.ai</a>
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
