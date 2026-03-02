import { Lock, Shield, FileCheck, Server } from 'lucide-react';
import Navigation from '@/sections/Navigation';
import Footer from '@/sections/Footer';

const securityCards = [
  {
    icon: Lock,
    title: 'Data Encryption',
    desc: 'All data is encrypted at rest using AES-256 and in transit using TLS 1.3. Your call recordings, transcripts, and customer data are never stored in plaintext.',
  },
  {
    icon: Server,
    title: '99.9% Uptime SLA',
    desc: 'Built on Twilio and Vapi infrastructure — both SOC 2 Type II certified. We maintain a 99.9% uptime service level agreement across all calling services.',
  },
  {
    icon: FileCheck,
    title: 'GDPR & NDPR Compliance',
    desc: 'We are fully compliant with GDPR (EU) and NDPR (Nigeria). Users can request data access, deletion, or portability at any time via privacy@barpel.ai.',
  },
  {
    icon: Shield,
    title: 'Row-Level Security',
    desc: 'Every organisation\'s data is completely isolated. Multi-tenant architecture with strict row-level security policies ensures no data leakage between customers.',
  },
];

export default function Security() {
  return (
    <>
      <Navigation />
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-[#102A33] mb-4">Security &amp; Compliance</h1>
          <p className="text-xl text-[#37A195] font-semibold mb-8">
            Enterprise-grade security, built in from day one.
          </p>

          <p className="text-lg text-[#6B7280] mb-12">
            Your customers trust you with sensitive information. We take that responsibility
            seriously. Barpel AI is built on a security-first architecture designed to protect
            your data and your customers.
          </p>

          {/* Security cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {securityCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="border border-[#E5E7EB] rounded-xl p-6">
                  <div className="inline-block p-3 bg-[#E8F5F2] rounded-lg mb-4">
                    <Icon className="w-6 h-6 text-[#37A195]" />
                  </div>
                  <h3 className="font-bold text-[#102A33] mb-2">{card.title}</h3>
                  <p className="text-[#6B7280] text-sm">{card.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Infrastructure */}
          <h2 className="text-2xl font-bold text-[#102A33] mb-4">Our Infrastructure Partners</h2>
          <p className="text-[#6B7280] mb-6">
            We deliberately choose vendors who meet the highest security standards so you benefit
            from their compliance certifications without additional cost.
          </p>
          <ul className="space-y-3 mb-12">
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-[#37A195] flex-shrink-0" />
              <span className="text-[#6B7280]"><strong className="text-[#102A33]">Twilio</strong> — SOC 2 Type II, ISO 27001, HIPAA-eligible telephony infrastructure</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-[#37A195] flex-shrink-0" />
              <span className="text-[#6B7280]"><strong className="text-[#102A33]">Vapi</strong> — Secure voice AI infrastructure, enterprise-grade API</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-[#37A195] flex-shrink-0" />
              <span className="text-[#6B7280]"><strong className="text-[#102A33]">Supabase</strong> — SOC 2 Type II certified database with row-level security</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-[#37A195] flex-shrink-0" />
              <span className="text-[#6B7280]"><strong className="text-[#102A33]">Stripe</strong> — PCI-DSS Level 1 certified payment processing</span>
            </li>
          </ul>

          {/* Data practices */}
          <h2 className="text-2xl font-bold text-[#102A33] mb-4">Data Practices</h2>
          <ul className="space-y-3 list-disc list-inside text-[#6B7280] mb-12">
            <li>Call transcripts retained for 30 days by default (configurable)</li>
            <li>No call recordings stored without explicit consent</li>
            <li>Personal data deleted within 30 days of account closure</li>
            <li>All API keys and credentials encrypted at the application layer</li>
            <li>Regular security audits and penetration testing</li>
          </ul>

          {/* Contact */}
          <div className="bg-[#E8F5F2] rounded-2xl p-8">
            <h2 className="text-xl font-bold text-[#102A33] mb-2">Security Contact</h2>
            <p className="text-[#6B7280]">
              Found a vulnerability or have a security question? Contact our security team directly at{' '}
              <a href="mailto:security@barpel.ai" className="text-[#37A195] hover:underline font-medium">
                security@barpel.ai
              </a>
              . We respond to all security disclosures within 24 hours.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
