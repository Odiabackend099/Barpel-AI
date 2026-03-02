---
name: barpel-marketing-pages
description: Create, update, or fix pages and sections for the Barpel AI marketing website at frontend/website/src/. Use when building new pages (Careers, Demo, Features, Security, legal pages), updating pricing tiers, adding landing page sections, or fixing placeholder "coming soon" pages. Enforces teal-and-white design system, correct CTA wiring, and TypeScript safety.
---

# Barpel AI Marketing Pages

This skill builds and maintains pages for the Barpel AI marketing website (`frontend/website/`).

---

## Quick Start

Every standalone page follows this exact pattern:

```tsx
import Navigation from '@/sections/Navigation';
import Footer from '@/sections/Footer';

export default function PageName() {
  return (
    <>
      <Navigation />
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* content */}
        </div>
      </section>
      <Footer />
    </>
  );
}
```

After creating a page file, add it to `frontend/website/src/App.tsx`:
1. Import: `import PageName from '@/pages/PageName';`
2. Route: `<Route path="/page-name" element={<PageName />} />`

---

## Design System

### Colors (always use raw hex — NOT barpel-* class tokens in pages)

```
Primary Teal:      #37A195   — buttons, icons, accent headings, highlights
Deep Slate:        #102A33   — h1, h2, h3, all main headings
Muted Gray:        #6B7280   — body text, descriptions, meta text
Light Teal BG:     #E8F5F2   — card backgrounds, info boxes
Light Gray BG:     #F9FAFB   — alternating section backgrounds
Borders:           #E5E7EB   — card borders, dividers
White:             #FFFFFF   — primary page background
```

### Typography

```
Headings:    font-bold, sizes: text-4xl (h1) / text-2xl (h2) / text-xl (h3)
Body:        text-base or text-lg for intro paragraphs
Meta/label:  text-sm
```

### Spacing & Layout

```
Section padding:   py-24 (main), py-16 (subsections)
Content max-width: max-w-4xl (detail pages), max-w-7xl (grid/wide pages)
Container:         mx-auto px-4 sm:px-6 lg:px-8
Grid:              grid md:grid-cols-3 gap-6 or gap-8
Card:              rounded-2xl p-6 or p-8, border border-[#E5E7EB]
```

### CTA Buttons

Always import from brand config — never hardcode URLs:
```tsx
import { ctaLinks } from '@/lib/brand.config';

// Primary CTA (teal)
<a href={ctaLinks.signUp} className="inline-flex items-center gap-2 px-8 py-4 bg-[#37A195] text-white rounded-lg font-semibold hover:bg-[#2F8E88] transition-colors">
  Get Started Free
</a>

// Secondary CTA (outline)
<a href={ctaLinks.signUp} className="inline-flex items-center gap-2 px-8 py-4 border-2 border-[#37A195] text-[#37A195] rounded-lg font-semibold hover:bg-[#37A195] hover:text-white transition-colors">
  Learn More
</a>

// Text link
<a href="/contact" className="text-[#37A195] hover:underline font-medium">
  Talk to Sales →
</a>
```

---

## Product Knowledge

### What Barpel AI Is
An AI-powered receptionist platform that handles phone calls 24/7 for businesses. Powered by Vapi (voice), Twilio (telephony), and Groq AI (intelligence).

### Pricing (current — from backend/src/config/index.ts)
- **Pay-As-You-Go**: Free to start, **$0.70/min** (RATE_PER_MINUTE_USD_CENTS=70), minimum top-up £25
- **Growth Bundle**: $99 one-time, **~155 minutes** included ($99 / $0.70 = 141 min raw + 10% bonus), better rate than PAYG
- **Enterprise**: Custom pricing, contact sales
- Internal rate: **56 pence/min GBP** (USD_TO_GBP_RATE=0.79 × $0.70 = £0.553 ≈ 56p)
- DO NOT use $0.14/min — that is incorrect

### Key Features
- 24/7 call answering
- Smart appointment booking (Google Calendar sync)
- Lead qualification and scoring
- Call transcripts and summaries
- Custom voice and greeting
- CRM integration
- Analytics dashboard
- Multi-language support (coming soon)

### Target Industries
Healthcare, Beauty & Salons, Restaurants, Professional Services, Real Estate, Retail

### Integrations
Google Calendar, Stripe, Twilio, Vapi, Groq, CRM systems

### Contact Emails
- General: hello@barpel.ai
- Sales: sales@barpel.ai
- Support: support@barpel.ai
- Security: security@barpel.ai
- Privacy: privacy@barpel.ai

### URLs (from brand.config.ts)
```tsx
import { brand, ctaLinks } from '@/lib/brand.config';
// brand.appUrl → https://app-barpelai.odia.dev (or VITE_APP_URL env)
// ctaLinks.signUp → appUrl + /sign-up
// ctaLinks.login → appUrl + /login
```

---

## Page Templates

### Careers Page

```tsx
import Navigation from '@/sections/Navigation';
import Footer from '@/sections/Footer';

const perks = [
  { title: 'Remote-First', desc: 'Work from anywhere, anytime.' },
  { title: 'Equity', desc: 'Own a piece of what you build.' },
  { title: 'Learning Budget', desc: '£1,000/year for courses, books, conferences.' },
  { title: 'Health Coverage', desc: 'Private health insurance for you and family.' },
];

export default function Careers() {
  return (
    <>
      <Navigation />
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-[#102A33] mb-4">Join Barpel AI</h1>
          <p className="text-xl text-[#37A195] font-semibold mb-8">
            Help us make AI receptionists accessible to every business.
          </p>
          <p className="text-lg text-[#6B7280] mb-12">
            We are a small, remote-first team building the future of business communication.
            If you are passionate about AI, love talking to customers, and want equity
            in something real — we want to hear from you.
          </p>

          <h2 className="text-2xl font-bold text-[#102A33] mb-6">Open Positions</h2>
          <div className="bg-[#F9FAFB] rounded-2xl p-8 mb-12 border border-[#E5E7EB]">
            <p className="text-[#6B7280]">
              We are growing fast and always looking for talented people.
              No specific roles open right now, but we review every application.
            </p>
            <p className="mt-3 text-[#6B7280]">
              Send your CV and a short note to{' '}
              <a href="mailto:hello@barpel.ai" className="text-[#37A195] hover:underline font-medium">
                hello@barpel.ai
              </a>
            </p>
          </div>

          <h2 className="text-2xl font-bold text-[#102A33] mb-6">Why Barpel AI</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {perks.map((perk) => (
              <div key={perk.title} className="bg-[#E8F5F2] rounded-xl p-6">
                <h3 className="font-bold text-[#102A33] mb-2">{perk.title}</h3>
                <p className="text-[#6B7280] text-sm">{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
```

### Demo Page

```tsx
import Navigation from '@/sections/Navigation';
import Footer from '@/sections/Footer';
import { ctaLinks } from '@/lib/brand.config';

export default function Demo() {
  return (
    <>
      <Navigation />
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-[#102A33] mb-4">See Barpel AI In Action</h1>
          <p className="text-xl text-[#37A195] font-semibold mb-8">
            Watch a live demo tailored to your industry. No commitment.
          </p>

          {/* What to expect */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { step: '01', title: '30-Minute Session', desc: 'Live walkthrough of the full platform with real calls.' },
              { step: '02', title: 'Your Industry Focus', desc: 'We demo use cases specific to your business type.' },
              { step: '03', title: 'Q&A Included', desc: 'Ask anything — pricing, integrations, setup timeline.' },
            ].map((item) => (
              <div key={item.step} className="bg-[#F9FAFB] rounded-xl p-6 border border-[#E5E7EB]">
                <span className="text-[#37A195] font-bold text-sm">{item.step}</span>
                <h3 className="font-bold text-[#102A33] mt-1 mb-2">{item.title}</h3>
                <p className="text-[#6B7280] text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-[#E8F5F2] rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-[#102A33] mb-3">Ready to See It Live?</h2>
            <p className="text-[#6B7280] mb-6">
              Sign up and our team will reach out to schedule your personalised demo within one business day.
            </p>
            <a
              href={ctaLinks.signUp}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#37A195] text-white rounded-lg font-semibold hover:bg-[#2F8E88] transition-colors"
            >
              Request a Demo
              <span>→</span>
            </a>
            <p className="text-sm text-[#6B7280] mt-4">
              Or email us directly at{' '}
              <a href="mailto:sales@barpel.ai" className="text-[#37A195] hover:underline">
                sales@barpel.ai
              </a>
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
```

### Features Page

Organize into 4 groups: Call Handling, Booking, Analytics, Integrations. Each feature card:
```tsx
<div className="border border-[#E5E7EB] rounded-xl p-6">
  <div className="inline-block p-3 bg-[#E8F5F2] rounded-lg mb-4">
    <Icon className="w-6 h-6 text-[#37A195]" />
  </div>
  <h3 className="font-bold text-[#102A33] mb-2">Feature Name</h3>
  <p className="text-[#6B7280] text-sm">2-3 line description.</p>
</div>
```

### Security Page

Structure:
1. Hero heading + intro
2. 4 security cards (Encryption, Uptime SLA, GDPR, Vendor SOC 2)
3. Contact section with security@barpel.ai

### Legal Pages (Terms + Cookies)

Always include:
- `<p className="text-sm text-[#6B7280] mb-8">Last updated: March 2026</p>` after h1
- Sections as `<h2 className="text-2xl font-bold text-[#102A33] mt-10 mb-4">`
- Body as `<p className="text-[#6B7280] mb-4">`
- Contact email as `<a href="mailto:legal@barpel.ai" className="text-[#37A195] hover:underline">`

---

## TypeScript Safety Rules

1. **No unused variables** — TypeScript strict mode fails the Vercel build on `TS6133`
2. **No apostrophes in single-quoted strings** — use double quotes: `"agent's voice"` not `'agent's voice'`
3. **No `<` in JSX text** — use `&lt;` HTML entity
4. **No `>` in JSX text** — use `&gt;` HTML entity
5. **Always type icon props** — `const Icon = step.icon; <Icon className="..." />`

---

## After Creating Pages: Update App.tsx

1. Remove the inline placeholder definition (e.g. `const Features = () => ...`)
2. Remove from `PlaceholderSection` usage if applicable
3. Add import at top: `import Features from '@/pages/Features';`
4. Route already exists — no change needed

---

## Verification Checklist

- [ ] `cd frontend/website && npm run build` passes with 0 errors
- [ ] Each new page route shows real content in browser (not "Section coming soon")
- [ ] Pricing section shows correct 3-tier structure
- [ ] All CTAs link to `ctaLinks.signUp` or `/contact` (not hardcoded URLs)
- [ ] No `barpel-navy`, `barpel-teal-dark`, or other undefined Tailwind tokens used in page files
- [ ] `git add -A && git commit && git push` succeeds
- [ ] `vercel deploy --prod --token=<TOKEN>` from `frontend/website/` succeeds
