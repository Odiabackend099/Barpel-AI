---
name: barpel-design-system
description: Implement Barpel AI's professional teal-and-white design system across sign-up, login, onboarding, and dashboard pages. Enforces the approved brand palette from the website, prevents Voxanne cloning, and ensures visual consistency. Use when redesigning auth pages, onboarding flows, dashboard layouts, or working with dashboard sidebars.
---

# Barpel Design System

## Overview

Barpel AI uses a **professional, light-mode design system** based on teal (#37A195) and deep slate (#102A33) colors on white backgrounds. This is fundamentally different from the dark Voxanne theme currently in the codebase.

**Key Principle:** All user-facing pages (signup, login, onboarding, dashboard) must match the **professional branding of the live Barpel website**. The design should be clean, modern, and definitively NOT a clone of Voxanne.

---

## Approved Color Palette

These exact hex codes are the ONLY approved colors for Barpel AI. Source: extracted from live website screenshots and official logo assets.

| Color Name | Hex | Role | Example Usage |
|------------|-----|------|----------------|
| **Primary Teal** | `#37A195` | Main brand color, primary buttons, highlights, active states | CTA buttons, link text, active nav items, icons |
| **Deep Slate** | `#102A33` | Headings, navigation text, dark accents | Page titles, section headers, nav text, logo text |
| **Dark Teal** | `#244B52` | Gradient endpoints, sidebar dark areas | Banner gradients, secondary dark backgrounds |
| **Secondary Teal** | `#285861` | Secondary buttons on darker backgrounds | Buttons on gradient backgrounds, secondary CTAs |
| **Muted Gray** | `#6B7280` | Body text, subtitles, helper text | Paragraph text, labels, descriptions, footer text |
| **Pure White** | `#FFFFFF` | Page/card backgrounds, contrast | Main backgrounds, cards, input fields, text fields |
| **Light Gray** | `#F3F4F6` | Subtle backgrounds, disabled states | Hover states, disabled inputs, subtle sections |
| **Border Gray** | `#E5E7EB` | Dividers, borders, subtle separation | Border lines, subtle dividers, form separators |

---

## Logo Usage Rules

Barpel logo assets are located in: `.agent/Barpel Branding/logo_package/`

| File | Dimensions | Use Case | Background |
|------|-----------|----------|------------|
| `logo_dark.png` | 280×333 | Light backgrounds, auth pages | White / light gray backgrounds |
| `logo_white.png` | 280×333 | Dark backgrounds, banners | Teal / dark slate backgrounds |
| `logo-128.png` | 128×128 | Web standard size | Light backgrounds |
| `logo-256.png` | 256×256 | Retina displays | Light backgrounds |
| `logo_square_dark.png` | 333×333 | Social media profiles | Light backgrounds |
| `logo_square_white.png` | 333×333 | Dark social profiles | Dark backgrounds |
| `favicon.ico` | Multi-res | Browser tab icon | - |
| `favicon-32.png` | 32×32 | Modern browsers | - |
| `apple-touch-icon.png` | 180×180 | iOS home screen | - |

**Current Problem:** The old `barpel-logo.jpeg` (not from the professional package) is still being used. Copy the proper logo files from `.agent/Barpel Branding/logo_package/` to `public/images/logos/` during implementation.

---

## Page-by-Page Implementation Guide

### Sign-Up Page (`src/app/(auth)/sign-up/page.tsx`)

**Layout:** Two-column (desktop), single-column (mobile)

**Left Column (Form Area):**
```
├─ Background: bg-white
├─ Logo: logo_dark.png (128px, top-left)
├─ Heading: "Create your account" (text-[#102A33] text-3xl font-bold)
├─ Subheading: "Join thousands of businesses..." (text-[#6B7280])
├─ Google OAuth Button (outline style, teal border, white background)
├─ Divider: "Or continue with email" (text-[#6B7280], hr border-[#E5E7EB])
├─ Email Input
├─ Name Input
├─ Password Input (with strength meter)
├─ Terms Checkbox
├─ CTA Button: "Create Account" (bg-[#37A195], text-white, full-width)
└─ "Already have an account? Sign in" link (text-[#37A195] hover:underline)
```

**Right Column (Social Proof - Desktop Only):**
```
├─ Background: gradient from-[#244B52] to-[#37A195]
├─ Dot pattern overlay (subtle radial-gradient)
├─ Centered content:
│  ├─ Testimonial quote: "Never miss another customer call..."
│  ├─ Attribution: "— Jane Smith, Salon Owner"
│  └─ Integration logos: (Vapi, Twilio, Google Calendar)
└─ logo_white.png (optional, bottom-right)
```

**Color Classes:**
- Form card: `bg-white shadow-md rounded-xl`
- Buttons: Primary `bg-[#37A195] text-white hover:bg-[#2F8E88]` | Outline `border border-[#37A195] text-[#37A195]`
- Links: `text-[#37A195] hover:underline`
- Inputs: `border border-[#E5E7EB] bg-white focus:border-[#37A195] focus:ring-[#37A195]/10`
- Errors: `text-red-500 border-red-300` (standard red, not teal)

---

### Login Page (`src/app/login/page.tsx`)

**Identical layout to sign-up, with these differences:**

**Left Column:**
```
├─ Heading: "Welcome Back"
├─ Subheading: "Your AI receptionist awaits"
├─ Email Input (focused first, before password)
├─ Password Input
├─ "Forgot password?" link (text-[#37A195])
├─ CTA: "Sign In" button (bg-[#37A195])
├─ OR divider
├─ Google OAuth Button
└─ "Don't have an account? Create one" link (text-[#37A195])
```

**Right Column:**
```
├─ Same gradient as sign-up: from-[#244B52] to-[#37A195]
├─ Quote: "Your business never stops. Neither does Barpel AI."
└─ Integration logos (same: Vapi, Twilio, Google Calendar)
```

**Key difference from sign-up:** Google OAuth button appears BELOW form, not above (reverse order).

---

### Onboarding Intake Form (`src/app/start/page.tsx`)

**Current Problem:** This page uses random Tailwind colors (`bg-slate-50`, `file:bg-blue-50`) that are inconsistent with the rest of the app.

**New Implementation:**
```
├─ Background: bg-white (not slate-50)
├─ Header: Logo (logo_dark.png) + "Get Started with Barpel AI"
├─ Main card: bg-white shadow-md rounded-xl p-8 max-w-2xl
├─ Form fields:
│  ├─ Company Name (text input)
│  ├─ Website URL (text input)
│  ├─ Email (text input)
│  ├─ Phone (tel input)
│  ├─ Greeting Script (textarea)
│  ├─ Voice Preference (select dropdown)
│  └─ PDF Upload (file input with teal styling, see below)
├─ CTA Button: "Get Started" (bg-[#37A195], text-white, full-width)
└─ Footer: "Questions? Email support@barpel.ai" (text-[#6B7280])
```

**File Input Styling (fix from current blue):**
```css
/* OLD (WRONG) - Remove these: */
file:bg-blue-50 file:text-blue-700 file:border-blue-200

/* NEW (CORRECT) - Use these: */
file:bg-[#37A195]/10 file:text-[#37A195] file:border-[#37A195]/30
```

**Input styling:**
- Border: `border border-[#E5E7EB]`
- Focus: `focus:border-[#37A195] focus:ring-[#37A195]/10`
- Label: `text-[#102A33] font-medium`
- Helper text: `text-[#6B7280] text-sm`
- Error: `border-red-300 text-red-600`

---

### Post-Signup Onboarding Wizard (`src/components/onboarding/Step*.tsx`)

**Container:**
```
├─ Background: bg-white or bg-gray-50
├─ Card: bg-white shadow-md rounded-lg p-8
├─ Heading: text-[#102A33] text-2xl font-bold
├─ Subheading: text-[#6B7280]
└─ Step indicator (1 of 5): text-[#37A195] font-semibold
```

#### Step 1: Welcome (StepWelcome.tsx)

**Current style uses `surgical-600` brandy - replace with teal:**

**Before (WRONG):**
```
bg-surgical-50 border-surgical-200 text-surgical-600
```

**After (CORRECT):**
```
bg-[#37A195]/10 border-[#37A195]/30 text-[#37A195]
```

**Component layout:**
```
├─ Icon box: bg-[#37A195]/10 border border-[#37A195]/30 rounded-lg
│  └─ Icon (Building2): text-[#37A195] text-3xl
├─ Input field: "Business Name" (text-[#102A33] placeholder-[#6B7280])
└─ CTA: "Continue" (bg-[#37A195] text-white)
```

#### Step 2: Specialty (StepSpecialty.tsx)

**Industry selector cards:**
```
├─ Each card:
│  ├─ Border: border-[#E5E7EB]
│  ├─ Hover: hover:border-[#37A195] hover:bg-[#37A195]/5
│  ├─ Active: border-[#37A195] bg-[#37A195]/10 text-[#37A195]
│  ├─ Icon: text-[#37A195] (when active)
│  └─ Text: text-[#102A33] (heading) / text-[#6B7280] (description)
└─ CTA: "Continue" (bg-[#37A195])
```

**Remove healthcare focus** (this is multi-industry now): Keep generic business types like:
- Auto Dealer, Real Estate, Legal, Salon/Spa, Medical, Retail, Other

#### Step 3+: Continuation Steps

**Apply same pattern:**
- Active state: `border-[#37A195] bg-[#37A195]/5 text-[#37A195]`
- CTA buttons: `bg-[#37A195] text-white hover:bg-[#2F8E88]`
- Icons: `text-[#37A195]`
- Text: Deep slate headings, muted gray body text

---

### Dashboard Layout (`src/app/dashboard/layout.tsx`)

**Overall structure:**
```
├─ Background: bg-gray-50 (not dark bg-clinical-bg)
├─ Sidebar: bg-white fixed-left
├─ Main content: flex-1 bg-gray-50
└─ All cards: bg-white
```

---

### Dashboard Sidebar (`src/components/dashboard/LeftSidebar.tsx`)

**Container:**
```
├─ Background: bg-white (not frosted glass with opacity)
├─ Border: border-r border-[#E5E7EB]
├─ Shadow: shadow-sm (subtle, not large)
└─ Width: w-72 (fixed, or flexible based on design)
```

**Logo section:**
```
├─ Logo: logo_dark.png (32×32)
├─ Text: "Barpel AI" (text-[#102A33] font-semibold)
└─ Spacing: gap-2 flex items-center
```

**Navigation items:**

**Inactive state:**
```
├─ Text: text-[#6B7280]
├─ Hover: text-[#102A33] bg-gray-50
├─ Icon: text-[#6B7280]
└─ No border, no background color
```

**Active state:**
```
├─ Text: text-[#37A195] font-semibold
├─ Background: bg-[#37A195]/10
├─ Border-left: border-l-4 border-[#37A195]
├─ Icon: text-[#37A195]
└─ Rounded on right (visual enhancement)
```

**Section headers (OPERATIONS, VOICE AGENT, etc.):**
```
├─ Text: text-[#102A33] font-bold uppercase text-xs
├─ Tracking: tracking-wider
├─ Margin-top: mt-6 mb-3
└─ Color: NOT muted gray, use deep slate for readability
```

**User card (bottom):**
```
├─ Background: bg-gray-50
├─ Border: border border-[#E5E7EB] rounded-lg
├─ Avatar: circular, teal accent ring (ring ring-[#37A195]/20)
├─ Name: text-[#102A33]
├─ Email: text-[#6B7280] text-sm
└─ Menu button: text-[#6B7280] hover:text-[#102A33]
```

**Removed elements:**
- No "Hybrid Telephony" or "AI Forwarding" entry (feature not ready)
- No colored gradient background (just white)
- No frosted glass effect (`backdrop-blur`)

---

### Dashboard Cards & Components

**Standard card pattern:**
```
bg-white
border border-[#E5E7EB]
rounded-lg
shadow-sm
p-6
```

**Headers (in cards):**
```
text-[#102A33] font-bold text-lg
```

**Subtext:**
```
text-[#6B7280] text-sm
```

**Buttons:**

**Primary CTA:**
```
bg-[#37A195] text-white
hover:bg-[#2F8E88] active:bg-[#267F78]
rounded-lg px-4 py-2
transition-colors
```

**Secondary:**
```
border border-[#37A195] text-[#37A195] bg-white
hover:bg-[#37A195]/5 active:bg-[#37A195]/10
```

**Tertiary (text button):**
```
text-[#37A195] hover:underline
```

**Disabled:**
```
bg-gray-100 text-gray-400 cursor-not-allowed
```

---

## Tailwind Config Updates Needed

Add these tokens to `tailwind.config.ts`:

```javascript
// In colors object:
'barpel-teal': '#37A195',
'barpel-teal-dark': '#2F8E88',
'barpel-teal-darker': '#267F78',
'barpel-teal-light': '#E8F5F2',
'barpel-slate': '#102A33',
'barpel-slate-light': '#2D3748',
'barpel-gray': '#6B7280',
'barpel-border': '#E5E7EB',

// Override existing tokens if needed:
// 'primary': '#37A195', (if using theme.extend.backgroundColor)
```

**Then in components, use:**
```
bg-barpel-teal  // instead of bg-surgical-600
text-barpel-slate  // instead of text-obsidian
border-barpel-border  // instead of border-clinical-border
```

---

## What NOT To Do (Anti-Patterns)

### ❌ Never:
- Use dark backgrounds like `bg-clinical-bg` (`#1C1C1E`) for auth/onboarding
- Use the brandy/maroon `surgical-600` (`#8D4A43`) as primary color
- Use Voxanne blue tokens: `surgical-blue`, `clinical-blue`, `sky-mist`
- Clone Voxanne layout structure (2-column auth with left form + right quote)
- Copy Voxanne component patterns without redesigning for Barpel
- Use the old `barpel-logo.jpeg` instead of professional logo assets
- Keep inconsistent light/dark themes (auth page light, dashboard dark, onboarding blue)
- Use file inputs with blue styling (`file:bg-blue-50 file:text-blue-700`)
- Add `backdrop-blur` effects or frosted glass (not Barpel's style)
- Use more than 3 shades of teal in a single component (stick to #37A195 primary)

### ✅ Instead:
- Use white/light backgrounds consistently
- Use teal (#37A195) for all primary actions and highlights
- Use deep slate (#102A33) for all text headings
- Use muted gray (#6B7280) for body text and subtitles
- Use professional logo files from `.agent/Barpel Branding/logo_package/`
- Maintain consistent light theme across auth, onboarding, and dashboard
- Style file inputs with teal accents
- Keep interfaces clean and minimal (no shadow/blur effects)
- Ensure visual hierarchy: slate headings → gray text → teal actions

---

## Implementation Checklist

When implementing any page listed above, verify:

- [ ] Logo changed from `barpel-logo.jpeg` to `logo_dark.png` (light backgrounds) or `logo_white.png` (dark backgrounds)
- [ ] All backgrounds are white/light gray (not dark charcoal)
- [ ] Primary color is teal `#37A195` (not brandy `#8D4A43`)
- [ ] All headings use deep slate `#102A33` (not `text-obsidian`)
- [ ] All body text uses muted gray `#6B7280` (not inherited gray)
- [ ] CTA buttons are teal with white text, never brandy
- [ ] Active nav states use teal highlight + border (not brandy gradient)
- [ ] File inputs styled with teal (not blue)
- [ ] No `surgical-*` tokens used (those are brandy)
- [ ] No `clinical-*` tokens used (those are dark backgrounds)
- [ ] Sidebar is white, not frosted glass
- [ ] Form inputs have teal focus rings (not red, not brandy)
- [ ] Dividers and borders use light gray `#E5E7EB`
- [ ] Testimonials and quotes use proper contrast on gradient backgrounds
- [ ] Mobile layout is responsive and maintains color consistency

---

## Examples

### Good: Login Button Component
```jsx
// ✅ CORRECT
<button className="bg-barpel-teal text-white hover:bg-barpel-teal-dark rounded-lg px-4 py-2 font-semibold">
  Sign In
</button>
```

### Bad: Using Old Colors
```jsx
// ❌ WRONG
<button className="bg-surgical-600 text-white hover:bg-surgical-700">  {/* brandy */}
  Sign In
</button>
```

### Good: Form Input
```jsx
// ✅ CORRECT
<input
  className="border border-barpel-border focus:border-barpel-teal focus:ring-barpel-teal/10"
  placeholder="your@email.com"
/>
```

### Good: Active Navigation Item
```jsx
// ✅ CORRECT
<li className="border-l-4 border-barpel-teal bg-barpel-teal/10 text-barpel-teal px-4 py-2">
  Dashboard
</li>
```

### Bad: Old Active State
```jsx
// ❌ WRONG
<li className="border-l-4 border-surgical-600 bg-surgical-600/10 text-surgical-600">  {/* brandy */}
  Dashboard
</li>
```

---

## Reference Files

**Logo assets:** `.agent/Barpel Branding/logo_package/`
**Color specifications:** User-provided website screenshots + this skill
**Current pages to redesign:**
- `src/app/(auth)/sign-up/page.tsx`
- `src/app/login/page.tsx`
- `src/app/start/page.tsx`
- `src/components/onboarding/Step*.tsx`
- `src/app/dashboard/layout.tsx`
- `src/components/dashboard/LeftSidebar.tsx`

**Current tailwind config:** `tailwind.config.ts` (update with new tokens)

---

## Testing Your Implementation

After completing a page redesign:

1. **Visual Check:** Does it match the Barpel website colors (teal + white, not dark + brandy)?
2. **Logo Check:** Is `logo_dark.png` or `logo_white.png` used (not old `barpel-logo.jpeg`)?
3. **Color Audit:** Inspect element → are hex codes in the approved palette?
4. **Consistency:** Do all pages (auth, onboarding, dashboard) use the same teal/slate/gray palette?
5. **Anti-Clone Test:** Could this page be mistaken for Voxanne? (It shouldn't be)
6. **Mobile View:** Does the design work on mobile with proper spacing and color contrast?

---

## Quick Reference: Color Palette as CSS Variables

```css
/* In globals.css or theme file: */
:root {
  --barpel-teal: #37A195;
  --barpel-teal-dark: #2F8E88;
  --barpel-slate: #102A33;
  --barpel-gray: #6B7280;
  --barpel-border: #E5E7EB;
  --barpel-white: #FFFFFF;
  --barpel-light-gray: #F3F4F6;
}

/* Usage in CSS: */
.button-primary {
  background-color: var(--barpel-teal);
  color: var(--barpel-white);
}

.heading {
  color: var(--barpel-slate);
}

.body-text {
  color: var(--barpel-gray);
}
```

---

**Remember:** Barpel is NOT Voxanne. The design should be clean, professional, light, and distinctly different from the dark medical/clinical theme that came before.
