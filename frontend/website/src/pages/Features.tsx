import { Phone, Calendar, BarChart2, Zap, MessageSquare, Settings, Globe, Shield } from 'lucide-react';
import Navigation from '@/sections/Navigation';
import Footer from '@/sections/Footer';
import { ctaLinks } from '@/lib/brand.config';

const featureGroups = [
  {
    title: 'Call Handling',
    features: [
      {
        icon: Phone,
        name: '24/7 Call Answering',
        desc: 'Every call answered instantly, day or night, weekends and holidays. Your AI receptionist never sleeps, never takes a break, and never misses a call.',
      },
      {
        icon: MessageSquare,
        name: 'Natural Conversations',
        desc: 'Powered by advanced AI, your receptionist understands context, handles follow-up questions, and speaks naturally — callers often cannot tell the difference.',
      },
      {
        icon: Settings,
        name: 'Custom Voice & Greeting',
        desc: 'Choose your AI voice, set your greeting script, and define how the agent handles different call types — all from your dashboard in minutes.',
      },
      {
        icon: Globe,
        name: 'Multi-Language Support',
        desc: 'Serve callers in their preferred language. Barpel AI can handle conversations in multiple languages automatically. (Coming soon)',
      },
    ],
  },
  {
    title: 'Appointment Booking',
    features: [
      {
        icon: Calendar,
        name: 'Google Calendar Sync',
        desc: 'Connect your Google Calendar and let your AI book, reschedule, and cancel appointments in real time — no double bookings, no gaps.',
      },
      {
        icon: MessageSquare,
        name: 'SMS Confirmations',
        desc: 'Automatic confirmation and reminder texts sent to callers after booking. Reduce no-shows by up to 80% with automated reminders.',
      },
      {
        icon: Zap,
        name: 'Instant Availability Check',
        desc: 'The AI checks your live calendar availability mid-call and offers the next available slots — no hold music, no callback needed.',
      },
      {
        icon: Phone,
        name: 'Outbound Reminder Calls',
        desc: 'Optionally have your AI call customers the day before their appointment to confirm — fully automated, no staff required.',
      },
    ],
  },
  {
    title: 'Analytics & Insights',
    features: [
      {
        icon: BarChart2,
        name: 'Call Transcripts',
        desc: 'Every call is automatically transcribed and stored. Search, review, and replay any conversation from your dashboard.',
      },
      {
        icon: BarChart2,
        name: 'Lead Scoring',
        desc: 'Barpel AI scores each caller as hot, warm, or cold based on intent signals — so your team knows who to follow up with first.',
      },
      {
        icon: Zap,
        name: 'Sentiment Analysis',
        desc: 'Understand how callers feel about your business. Automatic sentiment scoring surfaces issues before they become complaints.',
      },
      {
        icon: BarChart2,
        name: 'Analytics Dashboard',
        desc: 'Track call volume, booking rates, peak hours, and revenue pipeline — all in one clean dashboard updated in real time.',
      },
    ],
  },
  {
    title: 'Integrations & Security',
    features: [
      {
        icon: Zap,
        name: 'CRM Integration',
        desc: 'Contacts, notes, and call outcomes sync automatically to your CRM. No manual data entry, no lost leads.',
      },
      {
        icon: Settings,
        name: 'Knowledge Base Upload',
        desc: 'Upload PDFs, FAQs, or service menus and your AI will answer caller questions accurately based on your own documents.',
      },
      {
        icon: Shield,
        name: 'Enterprise Security',
        desc: 'AES-256 encryption at rest, TLS 1.3 in transit, GDPR-compliant data handling, and 99.9% uptime SLA.',
      },
      {
        icon: Globe,
        name: 'REST API Access',
        desc: 'Build custom integrations with our REST API. Webhooks, call events, and booking data available for enterprise customers.',
      },
    ],
  },
];

export default function Features() {
  return (
    <>
      <Navigation />
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-[#102A33] mb-4">All Features</h1>
            <p className="text-xl text-[#37A195] font-semibold mb-4">
              Everything your AI receptionist can do — out of the box.
            </p>
            <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
              From answering calls to booking appointments to qualifying leads, Barpel AI handles
              the full receptionist workflow automatically.
            </p>
          </div>

          <div className="space-y-16">
            {featureGroups.map((group) => (
              <div key={group.title}>
                <h2 className="text-2xl font-bold text-[#102A33] mb-8 pb-3 border-b border-[#E5E7EB]">
                  {group.title}
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {group.features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <div key={feature.name} className="border border-[#E5E7EB] rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="inline-block p-3 bg-[#E8F5F2] rounded-lg mb-4">
                          <Icon className="w-6 h-6 text-[#37A195]" />
                        </div>
                        <h3 className="font-bold text-[#102A33] mb-2">{feature.name}</h3>
                        <p className="text-[#6B7280] text-sm">{feature.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-20 text-center bg-[#E8F5F2] rounded-2xl p-10">
            <h2 className="text-2xl font-bold text-[#102A33] mb-3">Ready to Put It to Work?</h2>
            <p className="text-[#6B7280] mb-6">Set up takes under 30 minutes. Start free, no credit card required.</p>
            <a
              href={ctaLinks.signUp}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#37A195] text-white rounded-lg font-semibold hover:bg-[#2F8E88] transition-colors shadow-lg"
            >
              Start Free Trial
              <span>→</span>
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
