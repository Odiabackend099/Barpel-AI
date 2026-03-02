import { Phone, MessageCircle } from 'lucide-react';
import { ctaLinks } from '@/lib/brand.config';

export default function AudioDemo() {
  const callTranscript = [
    {
      speaker: 'Caller',
      message: "Hi, I'd like to book an appointment for next Tuesday...",
      side: 'left',
    },
    {
      speaker: 'AI Receptionist',
      message: 'Of course! I have availability at 10am, 2pm, or 4pm on Tuesday. Which works best for you?',
      side: 'right',
    },
    {
      speaker: 'Caller',
      message: '2pm works great!',
      side: 'left',
    },
    {
      speaker: 'AI Receptionist',
      message: "Perfect! I've booked you for Tuesday at 2pm. You'll receive a confirmation SMS shortly.",
      side: 'right',
    },
  ];

  return (
    <section id="audio-demo" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#102A33] mb-4">
            Hear It In Action
          </h2>
          <p className="text-lg text-[#6B7280]">
            See how Barpel AI handles a real booking call in seconds
          </p>
        </div>

        {/* Call Demo UI */}
        <div className="bg-gradient-to-br from-[#102A33] to-[#244B52] rounded-3xl p-8 shadow-2xl mb-12">
          {/* Phone Header */}
          <div className="bg-[#102A33] rounded-t-2xl p-4 mb-4">
            <div className="flex items-center justify-between text-white mb-4">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#37A195]" />
                <span className="font-semibold">Incoming Call</span>
              </div>
              <span className="text-sm text-white/60">02:34</span>
            </div>
          </div>

          {/* Transcript */}
          <div className="space-y-4 mb-8 max-h-96 overflow-y-auto">
            {callTranscript.map((item, idx) => (
              <div
                key={idx}
                className={`flex ${item.side === 'left' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-lg text-sm ${
                    item.side === 'left'
                      ? 'bg-white/10 text-white rounded-bl-none'
                      : 'bg-[#37A195] text-white rounded-br-none'
                  }`}
                >
                  <p className="font-semibold text-xs opacity-70 mb-1">{item.speaker}</p>
                  <p>{item.message}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Status */}
          <div className="bg-[#37A195]/20 border border-[#37A195] rounded-lg p-4 text-center text-white">
            <p className="flex items-center justify-center gap-2 text-sm">
              <MessageCircle className="w-4 h-4" />
              Appointment booked automatically
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href={ctaLinks.signUp}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#37A195] text-white rounded-lg font-semibold hover:bg-[#2F8E88] transition-colors shadow-lg"
          >
            Try It With Your Business
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
