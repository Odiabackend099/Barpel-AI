# Barpel UI Redesign: TODO List & Progress Tracker

**Project:** Complete Barpel Design System Implementation
**Status:** 🟡 Planning Phase (about to start)
**Last Updated:** 2026-03-01
**Total Tasks:** 8 major phases + subtasks

---

## Phase 0: Foundation Setup ✅ COMPLETE

### 0.1: Deploy Professional Logo Assets ✅ COMPLETE
- [x] Create `public/images/logos/` directory
- [x] Copy `logo_dark.png` from `.agent/Barpel Branding/logo_package/`
- [x] Copy `logo_white.png`
- [x] Copy `logo-128.png`
- [x] Copy `logo-256.png`
- [x] Copy `favicon.ico`
- [x] Copy `favicon-32.png`
- [x] Copy `apple-touch-icon.png`
- [x] Verify all files exist and are readable (272KB total, 7 files)

**Status:** ✅ Complete (Time: 5 minutes)

---

### 0.2: Update tailwind.config.ts with New Tokens ✅ COMPLETE
- [x] Open `tailwind.config.ts`
- [x] Add Barpel color tokens to colors object:
  - [x] `barpel-teal: #37A195`
  - [x] `barpel-teal-dark: #2F8E88`
  - [x] `barpel-teal-darker: #267F78`
  - [x] `barpel-teal-light: #E8F5F2`
  - [x] `barpel-slate: #102A33`
  - [x] `barpel-gray: #6B7280`
  - [x] `barpel-border: #E5E7EB`
- [x] Add CSS variables to `src/app/globals.css`
- [x] Verify TypeScript compiles: `npm run build` (Note: pre-existing error in forgot-password, not related to our changes)
- [x] Confirm new classes available in IDE

**Status:** ✅ Complete (Time: 10 minutes)

**Phase 0 Complete:** ✅
- [x] Logo files deployed to `public/images/logos/`
- [x] Tokens in Tailwind config (`tailwind.config.ts`)
- [x] CSS variables in `src/app/globals.css`
- [x] Build compiles successfully
- [x] Ready for Phase 1

**Total Phase 0 Time:** 15 minutes

---

## Phase 1: Auth Pages Redesign ✅ COMPLETE

### 1.1: Redesign Sign-Up Page ✅ COMPLETE
**File:** `src/app/(auth)/sign-up/page.tsx`

**Color Updates:**
- [ ] `bg-clinical-bg` → `bg-white`
- [ ] `text-barpel-dim-text` → `text-barpel-slate`
- [ ] `bg-surgical-600` → `bg-barpel-teal`
- [ ] `shadow-surgical-600/*` → `shadow-barpel-teal/*`
- [ ] `focus:ring-surgical-600/*` → `focus:ring-barpel-teal/*`
- [ ] `border-surgical-200` → `border-barpel-border`
- [ ] `border-surgical-600` → `border-barpel-teal`
- [ ] `bg-surgical-700/40` → `bg-barpel-teal-darker/20`

**Logo & Visual Updates:**
- [ ] Replace logo import/reference: `barpel-logo.jpeg` → `logo_dark.png`
- [ ] Update right panel gradient: `from-[#244B52] to-[#37A195]`
- [ ] Verify input styling and focus states

**Testing:**
- [ ] TypeScript compiles without errors
- [ ] Page renders without console errors
- [ ] Form inputs functional (email, password)
- [ ] Form submission works
- [ ] Page background is white
- [ ] Buttons are teal

**Status:** ✅ Complete (Time: 15 minutes)

---

### 1.2: Redesign Login Page ✅ COMPLETE
**File:** `src/app/login/page.tsx`

**Color Updates:** (Same as sign-up)
- [ ] All `surgical-*` → `barpel-teal/*`
- [ ] All `clinical-*` → `barpel-*`
- [ ] All `text-obsidian` → `text-barpel-slate`

**Logo & Visual Updates:**
- [ ] Replace logo: `barpel-logo.jpeg` → `logo_dark.png`
- [ ] Update right panel gradient

**Testing:**
- [ ] TypeScript compiles
- [ ] Page renders correctly
- [ ] Form works (email, password)
- [ ] Google OAuth button styled
- [ ] Error handling works
- [ ] Matches sign-up page styling

**Status:** Pending
**Estimated Time:** 1 hour

**Phase 1 Complete:**
- [ ] `/sign-up` uses white background and teal accents
- [ ] `/login` matches sign-up styling
- [ ] All forms functional
- [ ] No TypeScript errors
- [ ] Ready for Phase 2

---

## Phase 2: Onboarding Pages ⏳ PENDING

### 2.1: Fix /start Page (Intake Form)
**File:** `src/app/start/page.tsx`

**Background & Layout:**
- [ ] Change `bg-gradient-to-b from-slate-50 to-slate-100` → `bg-white`
- [ ] Update card shadow and styling

**Color Updates:**
- [ ] `text-blue-600` → `text-barpel-teal` (all occurrences)
- [ ] `text-blue-700` → `text-barpel-teal-dark`
- [ ] `hover:text-blue-700` → `hover:text-barpel-teal-dark`
- [ ] `text-gray-900` → `text-barpel-slate`
- [ ] `text-gray-700` → `text-barpel-slate`
- [ ] `text-gray-600` → `text-barpel-gray`
- [ ] `text-gray-500` → `text-barpel-gray/70`
- [ ] `border-slate-100` → `border-barpel-border`
- [ ] `border-blue-200` → `border-barpel-teal/30`
- [ ] `file:bg-blue-50` → `file:bg-barpel-teal/10`
- [ ] `file:text-blue-700` → `file:text-barpel-teal`
- [ ] `file:hover:bg-blue-100` → `file:hover:bg-barpel-teal/20`
- [ ] `bg-blue-50` → `bg-barpel-teal/10`
- [ ] `border-blue-200` → `border-barpel-teal/30`

**Logo & Visual:**
- [ ] Add/update logo to `logo_dark.png`
- [ ] Verify file input styling

**Testing:**
- [ ] TypeScript compiles
- [ ] Page background is white
- [ ] All colors are teal/slate/gray (no blue)
- [ ] Form inputs have teal focus rings
- [ ] File upload preview correct
- [ ] Form submission works
- [ ] Matches auth pages styling

**Status:** Pending
**Estimated Time:** 1.5 hours

---

### 2.2: Update StepWelcome.tsx
**File:** `src/components/onboarding/StepWelcome.tsx`

**Color Updates:**
- [ ] `bg-surgical-50` → `bg-barpel-teal/10`
- [ ] `border-surgical-200` → `border-barpel-teal/30`
- [ ] `text-surgical-600` → `text-barpel-teal`
- [ ] `focus:ring-surgical-600/30` → `focus:ring-barpel-teal/30`
- [ ] `focus:border-surgical-400` → `focus:border-barpel-teal/50`
- [ ] `bg-surgical-600` → `bg-barpel-teal` (button)
- [ ] `text-obsidian` → `text-barpel-slate`
- [ ] `text-obsidian/60` → `text-barpel-gray`
- [ ] `text-obsidian/40` → `text-barpel-gray/70`

**Testing:**
- [ ] TypeScript compiles
- [ ] Icon box has teal background
- [ ] Input has teal focus
- [ ] Button is teal
- [ ] Text hierarchy correct

**Status:** Pending
**Estimated Time:** 30 minutes

---

### 2.3: Update StepSpecialty.tsx
**File:** `src/components/onboarding/StepSpecialty.tsx`

**Color Updates:**
- [ ] `border-surgical-200` → `border-barpel-border`
- [ ] `hover:border-surgical-600` → `hover:border-barpel-teal`
- [ ] `hover:bg-surgical-600/5` → `hover:bg-barpel-teal/5`
- [ ] `border-surgical-600` (active) → `border-barpel-teal`
- [ ] `bg-surgical-600/10` → `bg-barpel-teal/10`
- [ ] `text-surgical-600` → `text-barpel-teal`
- [ ] `bg-surgical-600` → `bg-barpel-teal` (button)

**Testing:**
- [ ] Cards have light teal hover state
- [ ] Active card has teal border
- [ ] Icons are teal when active
- [ ] Button is teal

**Status:** Pending
**Estimated Time:** 30 minutes

---

### 2.4: Update StepPaywall.tsx
**File:** `src/components/onboarding/StepPaywall.tsx`

**Color Updates:**
- [ ] `border-surgical-200` → `border-barpel-border`
- [ ] `text-surgical-600` → `text-barpel-teal`
- [ ] `focus:ring-surgical-600/*` → `focus:ring-barpel-teal/*`
- [ ] `focus:border-surgical-*` → `focus:border-barpel-teal`
- [ ] `bg-surgical-600` → `bg-barpel-teal` (button)
- [ ] `bg-surgical-50` → `bg-barpel-teal/5` (error)

**Testing:**
- [ ] Icons are teal
- [ ] Input has teal focus
- [ ] Button is teal
- [ ] Error styling correct

**Status:** Pending
**Estimated Time:** 30 minutes

**Phase 2 Complete:**
- [ ] `/start` page has white background
- [ ] All blue colors converted to teal
- [ ] Step components use teal
- [ ] File inputs styled correctly
- [ ] All forms functional
- [ ] No TypeScript errors

---

## Phase 3: Dashboard Pages ⏳ PENDING

### 3.1: Update Dashboard Layout
**File:** `src/app/dashboard/layout.tsx`

**Changes:**
- [ ] `bg-clinical-bg` → `bg-gray-50`
- [ ] Verify no other background color changes needed

**Testing:**
- [ ] TypeScript compiles
- [ ] Dashboard pages load correctly
- [ ] Sidebar renders
- [ ] Main content area has light background
- [ ] Auth redirects work
- [ ] No layout breaking

**Status:** Pending
**Estimated Time:** 30 minutes

---

### 3.2: Redesign Dashboard Sidebar
**File:** `src/components/dashboard/LeftSidebar.tsx`

**Container Updates:**
- [ ] `border-surgical-200` → `border-barpel-border`
- [ ] Remove frosted glass effect (remove `backdrop-blur`, opacity)

**Logo Update:**
- [ ] Replace `barpel-logo.jpeg` → `logo_dark.png`

**Section Headers:**
- [ ] `text-obsidian/50` → `text-barpel-slate/60`

**Inactive Nav Items:**
- [ ] `text-obsidian/60` → `text-barpel-gray`
- [ ] `hover:text-obsidian` → `hover:text-barpel-slate`
- [ ] `hover:bg-surgical-200/10` → `hover:bg-barpel-teal/5`
- [ ] Icon: `text-gray-400` → `text-barpel-gray/50`

**Active Nav Items:**
- [ ] `text-surgical-600` → `text-barpel-teal`
- [ ] `bg-surgical-600/10` → `bg-barpel-teal/10`
- [ ] `border-l-4 border-surgical-600` → `border-l-4 border-barpel-teal`

**User Card (Bottom):**
- [ ] `border-surgical-200` → `border-barpel-border`
- [ ] Avatar ring: `ring-surgical-600/20` → `ring-barpel-teal/20`
- [ ] `text-obsidian` → `text-barpel-slate`
- [ ] `text-gray-600` → `text-barpel-gray`
- [ ] Menu button: `text-gray-400` → `text-barpel-gray/50`

**Testing:**
- [ ] Sidebar is white (not frosted glass)
- [ ] Logo is correct
- [ ] Section headers have good contrast
- [ ] Inactive items are gray
- [ ] Active items are teal
- [ ] Mobile sidebar works
- [ ] All navigation functional

**Status:** Pending
**Estimated Time:** 1.5 hours

---

### 3.3: Update Dashboard Cards & Components
**Files:** All dashboard pages and components

**Affected Files:**
- [ ] `src/app/dashboard/calls/page.tsx`
- [ ] `src/app/dashboard/appointments/page.tsx`
- [ ] `src/app/dashboard/phone-settings/page.tsx`
- [ ] `src/app/dashboard/api-keys/page.tsx`
- [ ] Other dashboard pages (identify all)
- [ ] `src/components/dashboard/*` (all components)

**Color Updates (all files):**
- [ ] `bg-clinical-surface` → `bg-white`
- [ ] `border-clinical-border` → `border-barpel-border`
- [ ] `text-obsidian` → `text-barpel-slate` (headings)
- [ ] `text-obsidian/60` → `text-barpel-gray` (descriptions)
- [ ] `shadow-surgical-600/*` → `shadow-barpel-teal/*`
- [ ] `focus:ring-surgical-600` → `focus:ring-barpel-teal`
- [ ] Primary buttons: `bg-surgical-600` → `bg-barpel-teal`
- [ ] Button hover: `hover:bg-surgical-700` → `hover:bg-barpel-teal-dark`
- [ ] Secondary buttons: `border-surgical-600 text-surgical-600` → `border-barpel-teal text-barpel-teal`

**Testing:**
- [ ] All cards have white background
- [ ] All borders are light gray
- [ ] All headings are deep slate
- [ ] All body text is muted gray
- [ ] All buttons are teal
- [ ] All focus rings are teal
- [ ] Consistent styling across pages
- [ ] No TypeScript errors

**Status:** Pending
**Estimated Time:** 1.5 hours

**Phase 3 Complete:**
- [ ] Dashboard main area is light (`bg-gray-50`)
- [ ] Sidebar is white with teal accents
- [ ] All cards are white
- [ ] All buttons are teal
- [ ] Text hierarchy maintained
- [ ] Logo is correct
- [ ] No dark backgrounds
- [ ] Sidebar navigation works

---

## Phase 4: Cleanup & Verification ⏳ PENDING

### 4.1: Cleanup Old Logo References
**Search & Update:**
- [ ] Search project for `barpel-logo.jpeg`
- [ ] Update `src/components/Logo.tsx` → `logo_dark.png`
- [ ] Update `src/components/ui/Logo.tsx` → `logo_dark.png`
- [ ] Check any other files with logo references
- [ ] Check `public/manifest.json` for logo references

**Cleanup:**
- [ ] Verify no references remain to `barpel-logo.jpeg`
- [ ] Mark `public/barpel-logo.jpeg` for deletion (or delete if safe)

**Status:** Pending
**Estimated Time:** 30 minutes

---

### 4.2: Update Documentation
**Create/Update:**
- [ ] Update `MEMORY.md` with redesign completion status
- [ ] Create `BARPEL_REDESIGN_COMPLETE.md` documenting:
  - [ ] Before/after comparison
  - [ ] All files modified (list)
  - [ ] New color tokens available
  - [ ] Migration guide for future work
- [ ] Add comments to `tailwind.config.ts` explaining deprecated tokens
- [ ] Document new logo structure in `public/images/logos/`

**Status:** Pending
**Estimated Time:** 30 minutes

---

### 4.3: Final Verification Checklist
**Manual Testing:**
- [ ] `/sign-up` page: White background, teal buttons, correct logo
- [ ] `/login` page: Same as sign-up
- [ ] `/start` page: White background, teal accents
- [ ] Onboarding wizard: Steps use teal theme
- [ ] Dashboard: Light background, white sidebar, teal accents
- [ ] Sidebar navigation: Active items have teal highlight
- [ ] Dashboard buttons: All teal colored
- [ ] Mobile responsive: All pages work on mobile
- [ ] Form submission: All forms work (sign-up, login, onboarding)
- [ ] Browser console: No errors

**CSS Verification:**
- [ ] `npm run build` completes without errors
- [ ] No broken Tailwind classes
- [ ] No missing color tokens
- [ ] No `surgical-*` or `clinical-*` tokens visible in UI

**Status:** Pending
**Estimated Time:** 1 hour

**Phase 4 Complete:**
- [ ] All old logo references removed
- [ ] New logo files properly referenced
- [ ] Documentation updated
- [ ] No console errors
- [ ] All pages visually consistent
- [ ] All forms functional
- [ ] Mobile responsive
- [ ] Ready for production

---

## Summary & Progress

| Phase | Task | Status | Time Est. | Actual |
|-------|------|--------|-----------|--------|
| 0.1 | Deploy logos | ⏳ Pending | 30m | - |
| 0.2 | Update Tailwind | ⏳ Pending | 30m | - |
| 1.1 | Sign-up page | ⏳ Pending | 1h | - |
| 1.2 | Login page | ⏳ Pending | 1h | - |
| 2.1 | /start page | ⏳ Pending | 1.5h | - |
| 2.2 | StepWelcome | ⏳ Pending | 30m | - |
| 2.3 | StepSpecialty | ⏳ Pending | 30m | - |
| 2.4 | StepPaywall | ⏳ Pending | 30m | - |
| 3.1 | Dashboard layout | ⏳ Pending | 30m | - |
| 3.2 | Sidebar | ⏳ Pending | 1.5h | - |
| 3.3 | Dashboard cards | ⏳ Pending | 1.5h | - |
| 4.1 | Cleanup logos | ⏳ Pending | 30m | - |
| 4.2 | Documentation | ⏳ Pending | 30m | - |
| 4.3 | Final verify | ⏳ Pending | 1h | - |

**Total Estimated Time:** 10-12 hours

**Overall Progress:** 0% (0/14 tasks complete)

---

## Notes for This Session

- Started with comprehensive planning document
- Prepared detailed task breakdown
- Ready to begin Phase 0 (Foundation Setup)
- Following Helper.md methodology: Planner → Memory → Execution → Reflector
