import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from '@/sections/Navigation';
import Hero from '@/sections/Hero';
import ProblemStatement from '@/sections/ProblemStatement';
import Solution from '@/sections/Solution';
import AudioDemo from '@/sections/AudioDemo';
import HowItWorks from '@/sections/HowItWorks';
import Industries from '@/sections/Industries';
import FeaturesShowcase from '@/sections/FeaturesShowcase';
import SecurityTrust from '@/sections/SecurityTrust';
import Pricing from '@/sections/Pricing';
import FinalCTA from '@/sections/FinalCTA';
import Footer from '@/sections/Footer';
import ChatWidget from '@/components/ChatWidget';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import PrivacyPolicy from '@/pages/PrivacyPolicy';

// Placeholder sections (to be built out)
const PlaceholderSection = ({ id, label }: { id: string; label: string }) => (
  <section id={id} className="py-24 bg-white flex items-center justify-center">
    <div className="text-center">
      <p className="text-barpel-text-secondary font-medium">{label}</p>
      <p className="text-sm text-barpel-border mt-1">Section coming soon</p>
    </div>
  </section>
);

// Pages
const Careers = () => <><Navigation /><PlaceholderSection id="careers" label="Careers" /><Footer /></>;
const Demo = () => <><Navigation /><PlaceholderSection id="demo" label="Book a Demo" /><Footer /></>;
const Features = () => <><Navigation /><PlaceholderSection id="features" label="All Features" /><Footer /></>;
const Security = () => <><Navigation /><PlaceholderSection id="security" label="Security & Compliance" /><Footer /></>;
const TermsOfService = () => <><Navigation /><PlaceholderSection id="terms" label="Terms of Service" /><Footer /></>;
const CookiePolicy = () => <><Navigation /><PlaceholderSection id="cookies" label="Cookie Policy" /><Footer /></>;

// Landing page
function LandingPage() {
  return (
    <>
      <Navigation />
      <Hero />
      <ProblemStatement />
      <Solution />
      <AudioDemo />
      <HowItWorks />
      <Industries />
      <FeaturesShowcase />
      <SecurityTrust />
      <Pricing />
      <FinalCTA />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/features" element={<Features />} />
        <Route path="/security" element={<Security />} />
        <Route path="/legal/privacy" element={<PrivacyPolicy />} />
        <Route path="/legal/terms" element={<TermsOfService />} />
        <Route path="/legal/cookies" element={<CookiePolicy />} />
      </Routes>
      <ChatWidget />
    </BrowserRouter>
  );
}
