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
import Careers from '@/pages/Careers';
import Demo from '@/pages/Demo';
import Features from '@/pages/Features';
import Security from '@/pages/Security';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import Terms from '@/pages/legal/Terms';
import Cookies from '@/pages/legal/Cookies';

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
        <Route path="/legal/terms" element={<Terms />} />
        <Route path="/legal/cookies" element={<Cookies />} />
      </Routes>
      <ChatWidget />
    </BrowserRouter>
  );
}
