import { useEffect, useState } from 'react';
import {
  ArrowRight, Play, PhoneCall, CheckCircle2,
  Phone, PhoneOff, PhoneMissed, DollarSign,
  MessageSquare, CalendarCheck, Bot,
} from 'lucide-react';
import { ctaLinks } from '@/lib/brand.config';

// Mini partner logos for the hero trust strip
const trustLogos = [
  { name: 'Twilio', logo: '/logos/twilio.svg', w: 22, h: 22 },
  { name: 'Stripe', logo: '/logos/stripe.svg', w: 36, h: 15 },
  { name: 'Vapi', logo: '/logos/vapi.svg', w: 42, h: 18 },
  { name: 'Google Calendar', logo: '/logos/google-calendar.svg', w: 22, h: 22 },
];

/**
 * PHASE WORKFLOW — loops every ~14 seconds
 *   0  RINGING    — Incoming call notification, ring animation
 *   1  ANSWERING  — Barpel AI auto-answers, greeting message
 *   2  BOOKING    — 3-turn conversation: caller asks, AI offers slots, caller picks
 *   3  CONFIRMED  — Appointment locked, SMS sent, calendar entry
 *   4  OUTCOME    — Call summary: duration, revenue secured, zero missed calls
 */
type Phase = 0 | 1 | 2 | 3 | 4;

const PHASE_DURATIONS: Record<Phase, number> = {
  0: 3000,  // RINGING
  1: 2500,  // ANSWERING
  2: 3500,  // BOOKING
  3: 2500,  // CONFIRMED
  4: 2000,  // OUTCOME (brief — then loops back)
};

const TRANSITION_MS = 350; // ms for fade-out before phase swap

// ─── Phase 0: RINGING ───────────────────────────────────────────────────────
function PhaseRinging() {
  return (
    <div className="flex flex-col items-center justify-center py-6 gap-5">
      {/* Pulsing ring rings around the phone icon */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-20 h-20 rounded-full bg-barpel-teal/10 animate-ping" />
        <div className="absolute w-14 h-14 rounded-full bg-barpel-teal/15 animate-ping" style={{ animationDelay: '0.3s' }} />
        <div className="w-14 h-14 rounded-full bg-barpel-teal/20 border border-barpel-teal/50 flex items-center justify-center z-10">
          <Phone className="w-6 h-6 text-barpel-teal" />
        </div>
      </div>

      {/* Caller info */}
      <div className="text-center">
        <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Incoming Call</p>
        <p className="text-white text-base font-semibold">John Adeyemi</p>
        <p className="text-white/40 text-xs">+234 802 456 7890</p>
      </div>

      {/* Auto-answer label */}
      <p className="text-barpel-teal text-xs font-medium animate-pulse">
        Barpel AI answering automatically...
      </p>

      {/* Accept / Decline buttons (decorative) */}
      <div className="flex gap-8">
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-11 h-11 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <PhoneOff className="w-4 h-4 text-red-400" />
          </div>
          <span className="text-white/30 text-[10px]">Decline</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-11 h-11 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center ring-2 ring-emerald-500/30">
            <Phone className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-emerald-400/70 text-[10px]">Auto</span>
        </div>
      </div>
    </div>
  );
}

// ─── Phase 1: ANSWERING ──────────────────────────────────────────────────────
function PhaseAnswering() {
  return (
    <div className="px-5 py-5 space-y-4">
      {/* Call connected bar */}
      <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-medium">Call connected</span>
        </div>
        <span className="text-white/30 text-xs font-mono">0:03</span>
      </div>

      {/* AI greeting */}
      <div className="flex justify-start">
        <div className="max-w-[88%] bg-barpel-teal/25 border border-barpel-teal/30 rounded-2xl rounded-tl-sm px-4 py-3">
          <p className="text-white text-xs font-semibold mb-0.5 text-barpel-teal">Barpel AI</p>
          <p className="text-white/90 text-sm leading-snug">
            Hi! Thank you for calling Glow Beauty Studio. How can I help you today?
          </p>
        </div>
      </div>

      {/* Typing indicator */}
      <div className="flex justify-end">
        <div className="bg-white/8 border border-white/10 rounded-2xl rounded-tr-sm px-4 py-3">
          <div className="flex gap-1 items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Phase 2: BOOKING ────────────────────────────────────────────────────────
function PhaseBooking() {
  return (
    <div className="px-5 py-4 space-y-3">
      {/* Caller message */}
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-white/10 rounded-2xl rounded-tr-sm px-4 py-2.5">
          <p className="text-white/80 text-sm leading-snug">
            I&apos;d like to book a haircut for Saturday morning
          </p>
        </div>
      </div>

      {/* AI response with slots */}
      <div className="flex justify-start">
        <div className="max-w-[88%] bg-barpel-teal/25 border border-barpel-teal/30 rounded-2xl rounded-tl-sm px-4 py-2.5">
          <p className="text-white text-sm leading-snug">
            Perfect! I have <span className="text-barpel-teal font-semibold">9:00 AM</span> and <span className="text-barpel-teal font-semibold">11:00 AM</span> available on Saturday. Which works for you?
          </p>
        </div>
      </div>

      {/* Caller picks */}
      <div className="flex justify-end">
        <div className="max-w-[60%] bg-white/10 rounded-2xl rounded-tr-sm px-4 py-2.5">
          <p className="text-white/80 text-sm leading-snug">9am please</p>
        </div>
      </div>

      {/* AI confirms + processes */}
      <div className="flex justify-start">
        <div className="max-w-[88%] bg-barpel-teal/25 border border-barpel-teal/30 rounded-2xl rounded-tl-sm px-4 py-2.5">
          <p className="text-white text-sm leading-snug">
            Great choice! Booking that now...
          </p>
          <div className="mt-1.5 flex gap-1 items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-barpel-teal animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-barpel-teal animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-barpel-teal animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Phase 3: CONFIRMED ──────────────────────────────────────────────────────
function PhaseConfirmed() {
  return (
    <div className="px-5 py-5 space-y-3">
      {/* Big confirmation card */}
      <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4">
        <div className="flex items-center gap-2.5 mb-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-emerald-400 text-sm font-bold">Appointment Booked!</p>
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-white/40">Client</span>
            <span className="text-white/80 font-medium">John Adeyemi</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Service</span>
            <span className="text-white/80 font-medium">Haircut</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Date &amp; Time</span>
            <span className="text-white/80 font-medium">Sat · 9:00 AM</span>
          </div>
        </div>
      </div>

      {/* SMS + Calendar confirmations */}
      <div className="flex gap-2">
        <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-white/40 flex-shrink-0" />
          <div>
            <p className="text-white/60 text-[10px] font-medium">SMS sent</p>
            <p className="text-white/30 text-[9px]">Confirmation delivered</p>
          </div>
        </div>
        <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-white/40 flex-shrink-0" />
          <div>
            <p className="text-white/60 text-[10px] font-medium">Calendar</p>
            <p className="text-white/30 text-[9px]">Event added</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Phase 4: OUTCOME ────────────────────────────────────────────────────────
function PhaseOutcome() {
  return (
    <div className="px-5 py-5 space-y-3">
      {/* Call ended header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PhoneMissed className="w-4 h-4 text-white/30" />
          <span className="text-white/40 text-xs">Call ended · 0:52</span>
        </div>
        <span className="text-[10px] text-white/20 font-medium uppercase tracking-wide">Summary</span>
      </div>

      {/* Revenue highlight */}
      <div className="bg-barpel-teal/15 border border-barpel-teal/30 rounded-xl px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-barpel-teal/20 flex items-center justify-center flex-shrink-0">
          <DollarSign className="w-5 h-5 text-barpel-teal" />
        </div>
        <div>
          <p className="text-barpel-teal text-base font-bold">$85 secured</p>
          <p className="text-white/40 text-xs">Revenue from this call</p>
        </div>
      </div>

      {/* 3 outcome metrics */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white/5 rounded-xl py-2.5">
          <p className="text-white text-sm font-bold">0:52</p>
          <p className="text-white/30 text-[9px] mt-0.5">Duration</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl py-2.5">
          <p className="text-emerald-400 text-sm font-bold">✓ Booked</p>
          <p className="text-white/30 text-[9px] mt-0.5">Outcome</p>
        </div>
        <div className="bg-white/5 rounded-xl py-2.5">
          <p className="text-white text-sm font-bold">0</p>
          <p className="text-white/30 text-[9px] mt-0.5">Missed</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5">
        <Bot className="w-3 h-3 text-white/20" />
        <p className="text-white/25 text-[10px]">Handled entirely by Barpel AI</p>
      </div>
    </div>
  );
}

// Module-level constant — no need to recreate on every PhoneShell render
const PHASE_LABELS: Record<Phase, string> = {
  0: 'Ringing',
  1: 'AI Answering',
  2: 'Booking',
  3: 'Confirmed',
  4: 'Summary',
};

// ─── Phone Shell ─────────────────────────────────────────────────────────────
function PhoneShell({ phase, visible }: { phase: Phase; visible: boolean }) {

  return (
    <div className="relative w-72 lg:w-80 rounded-[2.5rem] bg-[#0d2530] border border-white/10 shadow-2xl overflow-hidden animate-float">
      {/* Notch */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-24 h-1.5 rounded-full bg-white/10" />
      </div>

      {/* Phone header — always visible */}
      <div className="px-5 py-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-barpel-teal/20 border border-barpel-teal/40 flex items-center justify-center">
              <PhoneCall className="w-3.5 h-3.5 text-barpel-teal" />
            </div>
            <div>
              <p className="text-white text-xs font-semibold leading-none">Barpel AI</p>
              <p className="text-white/30 text-[10px] mt-0.5">Glow Beauty Studio</p>
            </div>
          </div>
          {/* Phase indicator badge */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-barpel-teal/15 border border-barpel-teal/30">
            <span className="w-1.5 h-1.5 rounded-full bg-barpel-teal animate-pulse-soft" />
            <span className="text-barpel-teal text-[10px] font-medium">{PHASE_LABELS[phase]}</span>
          </div>
        </div>
      </div>

      {/* Phase content — fades between phases */}
      <div
        className="transition-opacity duration-300 ease-in-out min-h-[200px]"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {phase === 0 && <PhaseRinging />}
        {phase === 1 && <PhaseAnswering />}
        {phase === 2 && <PhaseBooking />}
        {phase === 3 && <PhaseConfirmed />}
        {phase === 4 && <PhaseOutcome />}
      </div>

      {/* Waveform + timer — visible during active call phases (1-3) */}
      {(phase === 1 || phase === 2 || phase === 3) && (
        <div className="px-5 pb-4 pt-1 flex items-center justify-center gap-2" aria-hidden="true">
          <div className="flex items-end gap-0.5">
            {[2, 4, 3, 5, 2, 4, 3, 2, 4, 3, 5, 3].map((h, i) => (
              <div
                key={i}
                className="w-0.5 rounded-full bg-barpel-teal/60 animate-waveform"
                style={{ height: `${h * 3}px`, animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <span className="text-white/30 text-xs font-mono ml-1">
            {phase === 1 ? '0:05' : phase === 2 ? '0:28' : '0:47'}
          </span>
        </div>
      )}

      {/* Bottom home bar */}
      <div className="flex justify-center pb-3">
        <div className="w-20 h-1 rounded-full bg-white/10" />
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
export default function Hero() {
  const [phase, setPhase] = useState<Phase>(0);
  const [visible, setVisible] = useState(true);

  // Advance phase: fade out → swap content → fade in
  useEffect(() => {
    let swapTimer: ReturnType<typeof setTimeout>;

    const advanceTimer = setTimeout(() => {
      setVisible(false);
      swapTimer = setTimeout(() => {
        setPhase((prev) => ((prev + 1) % 5) as Phase);
        setVisible(true);
      }, TRANSITION_MS);
    }, PHASE_DURATIONS[phase]);

    return () => {
      clearTimeout(advanceTimer);
      clearTimeout(swapTimer);
    };
  }, [phase]);

  const scrollToDemo = () => {
    document.getElementById('audio-demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-barpel-navy via-[#1a3a45] to-barpel-navy overflow-hidden pt-16">
      {/* Background glow blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-barpel-teal/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/6 w-64 h-64 bg-barpel-teal/5 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left column: copy + CTAs ── */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-barpel-teal/20 border border-barpel-teal/30 mb-6">
              <span className="w-2 h-2 rounded-full bg-barpel-teal animate-pulse-soft" />
              <span className="text-barpel-teal text-xs font-medium tracking-wide uppercase">
                AI-Powered Voice Automation
              </span>
            </div>

            {/* Heading */}
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-6">
              Your Business Deserves a{' '}
              <span className="text-barpel-teal">24/7 AI Receptionist</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg text-white/70 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              Barpel AI books appointments, answers questions, and follows up with leads —
              automatically. Never miss a call again.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
              <a
                href={ctaLinks.signUp}
                className="group px-6 py-3.5 rounded-pill bg-barpel-teal text-white font-medium text-sm flex items-center gap-2 hover:bg-barpel-teal-dark hover:shadow-glow-teal transition-all duration-300"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <button
                type="button"
                onClick={scrollToDemo}
                className="px-6 py-3.5 rounded-pill bg-white/10 text-white font-medium text-sm border border-white/20 flex items-center gap-2 hover:bg-white/20 transition-all duration-300"
              >
                <Play className="w-4 h-4" />
                Hear Demo
              </button>
            </div>

            {/* Trust strip: partner logos (inverted white on dark hero) */}
            <div className="flex flex-col items-center lg:items-start gap-3">
              <span className="text-white/30 text-xs font-medium uppercase tracking-widest">Powered by</span>
              <div className="flex items-center gap-5">
                {trustLogos.map((logo) => (
                  <div
                    key={logo.name}
                    title={logo.name}
                    className="opacity-40 hover:opacity-70 transition-opacity duration-200 flex items-center justify-center"
                    style={{ width: logo.w, height: logo.h }}
                  >
                    <img
                      src={logo.logo}
                      alt={logo.name}
                      width={logo.w}
                      height={logo.h}
                      className="w-full h-full object-contain brightness-0 invert"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right column: animated phone workflow ── */}
          <div className="relative flex items-center justify-center lg:justify-end" aria-hidden="true">
            {/* Outer glow */}
            <div className="absolute w-80 h-80 lg:w-96 lg:h-96 rounded-full bg-barpel-teal/10 blur-2xl pointer-events-none" />
            <PhoneShell phase={phase} visible={visible} />
          </div>

        </div>
      </div>
    </section>
  );
}
