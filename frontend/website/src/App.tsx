import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from '@/sections/Navigation';
import Hero from '@/sections/Hero';
import Pricing from '@/sections/Pricing';
import FinalCTA from '@/sections/FinalCTA';
import Footer from '@/sections/Footer';

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
const About = () => <><Navigation /><PlaceholderSection id="about" label="About Barpel AI" /><Footer /></>;
const Careers = () => <><Navigation /><PlaceholderSection id="careers" label="Careers" /><Footer /></>;
const Contact = () => <><Navigation /><PlaceholderSection id="contact" label="Contact Us" /><Footer /></>;
const Demo = () => <><Navigation /><PlaceholderSection id="demo" label="Book a Demo" /><Footer /></>;
const Features = () => <><Navigation /><PlaceholderSection id="features" label="All Features" /><Footer /></>;
const Security = () => <><Navigation /><PlaceholderSection id="security" label="Security & Compliance" /><Footer /></>;
const PrivacyPolicy = () => <><Navigation /><PlaceholderSection id="privacy" label="Privacy Policy" /><Footer /></>;
const TermsOfService = () => <><Navigation /><PlaceholderSection id="terms" label="Terms of Service" /><Footer /></>;
const CookiePolicy = () => <><Navigation /><PlaceholderSection id="cookies" label="Cookie Policy" /><Footer /></>;

// Landing page
function LandingPage() {
  return (
    <>
      <Navigation />
      <Hero />
      <PlaceholderSection id="problem" label="Problem Statement" />
      <PlaceholderSection id="solution" label="Our Solution" />
      <PlaceholderSection id="audio-demo" label="Audio Demo" />
      <PlaceholderSection id="how-it-works" label="How It Works" />
      <PlaceholderSection id="industries" label="Industries We Serve" />
      <PlaceholderSection id="features" label="Features Showcase" />
      <PlaceholderSection id="security-section" label="Security & Trust" />
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
    </BrowserRouter>
  );
}
