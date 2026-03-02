import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { ctaLinks, brand } from '@/lib/brand.config';

const navLinks = [
  { label: 'Features', href: '/features' },
  { label: 'How it Works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Security', href: '/security' },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navClass = isScrolled || !isHome
    ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-barpel-border'
    : 'bg-transparent';

  const textClass = isScrolled || !isHome ? 'text-barpel-text' : 'text-white';
  const logoTextClass = isScrolled || !isHome ? 'text-barpel-navy' : 'text-white';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
              <img src="/logo_master_transparent.png" alt={brand.name}
                className="object-contain w-full h-full" />
            </div>
            <span className={`font-display font-bold text-lg ${logoTextClass}`}>
              {brand.name}
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-barpel-teal ${textClass}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={ctaLinks.login}
              className={`text-sm font-medium transition-colors hover:text-barpel-teal ${textClass}`}
            >
              Log In
            </a>
            <a
              href={ctaLinks.signUp}
              className="px-4 py-2 rounded-pill bg-barpel-teal text-white text-sm font-medium hover:bg-barpel-teal-dark transition-colors shadow-sm hover:shadow-glow-teal"
            >
              Get Started
            </a>
          </div>

          {/* Mobile menu toggle */}
          <button
            className={`md:hidden p-2 ${textClass}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-barpel-border px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="block text-sm font-medium text-barpel-text hover:text-barpel-teal py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-barpel-border flex flex-col gap-3">
            <a
              href={ctaLinks.login}
              className="text-sm font-medium text-barpel-text hover:text-barpel-teal py-2"
            >
              Log In
            </a>
            <a
              href={ctaLinks.signUp}
              className="px-4 py-2.5 rounded-pill bg-barpel-teal text-white text-sm font-medium text-center hover:bg-barpel-teal-dark transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
