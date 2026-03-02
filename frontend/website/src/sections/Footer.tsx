import { Link } from 'react-router-dom';
import { brand, ctaLinks } from '@/lib/brand.config';

const footerLinks = {
  Product: [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Security', href: '/security' },
    { label: 'Demo', href: '/demo' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy', href: '/legal/privacy' },
    { label: 'Terms', href: '/legal/terms' },
    { label: 'Cookies', href: '/legal/cookies' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-barpel-navy text-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/logo_white.png" alt={brand.name} className="h-8 w-auto" />
              <span className="font-display font-bold text-white">{brand.name}</span>
            </Link>
            <p className="text-sm leading-relaxed">{brand.description}</p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold text-sm mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm hover:text-barpel-teal transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">
            © {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
          <a
            href={ctaLinks.signUp}
            className="px-4 py-2 rounded-pill bg-barpel-teal text-white text-sm font-medium hover:bg-barpel-teal-dark transition-colors"
          >
            Start Free Trial
          </a>
        </div>
      </div>
    </footer>
  );
}
