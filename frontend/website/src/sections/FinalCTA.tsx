import { ArrowRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ctaLinks } from '@/lib/brand.config';

export default function FinalCTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-barpel-navy via-[#1a3a45] to-barpel-navy relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-barpel-teal/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
          Ready to Never Miss a Call Again?
        </h2>
        <p className="text-white/60 text-lg mb-10">
          Join 500+ businesses using Barpel AI to automate their front desk.
          Start your free trial today — no credit card required.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={ctaLinks.signUp}
            className="group px-6 py-3.5 rounded-pill bg-white text-barpel-navy font-medium text-sm flex items-center gap-2 hover:bg-barpel-teal hover:text-white transition-all duration-300 shadow-lg"
          >
            Get Started Now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <Link
            to="/demo"
            className="px-6 py-3.5 rounded-pill bg-barpel-navy/30 text-white font-medium text-sm flex items-center gap-2 hover:bg-barpel-navy/50 transition-colors backdrop-blur-sm border border-white/10"
          >
            <Calendar className="w-4 h-4" />
            Schedule Demo
          </Link>
        </div>
      </div>
    </section>
  );
}
