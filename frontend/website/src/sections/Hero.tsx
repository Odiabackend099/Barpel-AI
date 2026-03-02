import { ArrowRight, Play } from 'lucide-react';
import { ctaLinks } from '@/lib/brand.config';

export default function Hero() {
  const scrollToDemo = () => {
    document.getElementById('audio-demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-barpel-navy via-[#1a3a45] to-barpel-navy overflow-hidden pt-16">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-barpel-teal/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-barpel-teal/5 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
        <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
          Barpel AI books appointments, answers questions, and follows up with leads —
          automatically. Never miss a call again.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={ctaLinks.signUp}
            className="group px-6 py-3.5 rounded-pill bg-barpel-teal text-white font-medium text-sm flex items-center gap-2 hover:bg-barpel-teal-dark hover:shadow-glow-teal transition-all duration-300"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <button
            onClick={scrollToDemo}
            className="px-6 py-3.5 rounded-pill bg-white/10 text-white font-medium text-sm border border-white/20 flex items-center gap-2 hover:bg-white/20 transition-all duration-300"
          >
            <Play className="w-4 h-4" />
            Hear Demo
          </button>
        </div>

        {/* Social proof */}
        <p className="mt-8 text-white/40 text-sm">
          Trusted by 500+ businesses across Nigeria
        </p>
      </div>
    </section>
  );
}
