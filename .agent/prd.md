# Barpel AI – Product Requirements Document (PRD)

**Version:** 2026.03.01
**Last Updated:** 2026-03-01 UTC
**Status:** ✅ DEMO READY - Complete Reskin from Voxanne AI to Barpel AI
**Project Foundation:** Reskin of enterprise voice receptionist platform for Nigerian SMEs/Small Businesses (2026-02-27 → 2026-03-01)
**Verification Status:** ✅ FULL STACK OPERATIONAL - Frontend (Next.js on port 3000) + Backend (Express on port 6001) + Supabase (wifcmvgwzicgyrvaoiwi) + Dim & Brandy branding + 5-step onboarding wizard (business verticals)

---

## CRITICAL ARCHITECTURE RULES (TIER 1: Non-Negotiable Truths)

These rules NEVER change and are enforced by the database and RLS policies:

1. **Backend is Sole Vapi Provider**
   - ONE Vapi API key in backend `.env`
   - ALL organizations share single Vapi credential (NO per-org Vapi credentials)
   - Tools registered globally, linked to each org's assistants
   - Reference: SSOT.md Section 2.1

2. **Multi-Tenant Isolation via org_id**
   - JWT `app_metadata.org_id` = single source of truth for org
   - Every query filters by `org_id` FIRST
   - RLS policies enforce at database level (CHECK org_id = auth.uid()... via jwt_extract_org_id)
   - Reference: SSOT.md Section 2.2

3. **Wallet Balance Must Be Enforced**
   - Check balance BEFORE deducting
   - Deduct ATOMICALLY (use RPC with row locks, never separate SELECT + UPDATE)
   - Negative balances trigger kill switch (automatic call termination)
   - Reference: SSOT.md Section 5 + Real-Time Prepaid Billing Engine (Section 2.5 below)

4. **Multi-Number Support: 1 Inbound + 1 Outbound per Org** ✅ NEW (2026-02-24)
   - `org_credentials` constraint: `UNIQUE(org_id, provider, type)` — not `UNIQUE(org_id, provider)`
   - Each direction (inbound/outbound) stored separately with independent `vapi_phone_id`
   - RPC parameter: `p_routing_direction` (not `p_type`) determines column for insertion
   - Service ALWAYS writes org_credentials (no skip logic for 2nd number)
   - Reference: SSOT.md Section 9 + PRD_UPDATE_2026_02_24.md

---

## How to Use This Document

**If you're fixing a bug:** Read Section 1 (Critical Rules) + relevant section in Section 2
**If you're adding a feature:** Read Section 2 (how the system works) + check SSOT.md for database details
**If you're deploying:** Read Section 3 (Operations) + Section 7 (Runbooks)
**If you're debugging:** Read the Release History appendix (what changed when)

---

## Section 2: System Capabilities

### Core Features

1. **Managed Telephony — 1 Inbound + 1 Outbound per Organization** ✅ (Just Fixed)
   - Purchase Twilio subaccount numbers via dashboard
   - Store in `org_credentials` AND `managed_phone_numbers` (dual-write required)
   - `org_credentials` is SSOT for credential discovery in dropdowns
   - Each direction (inbound/outbound) stored as separate row with `type` column
   - Inbound → receives calls via phone_number_mapping
   - Outbound → agent uses vapi_phone_id for caller ID on outbound calls
   - Cannot exceed 1 active number per direction per org (DB unique index enforces)
   - Reference: SSOT.md Section 9 (Managed Phone Numbers — Lifecycle & Dual-Write)

2. **Real-Time Prepaid Billing Engine** — Phase 1-3 Deployed & Verified
   - Atomic asset billing (RPC with FOR UPDATE locks, prevents TOCTOU)
   - Credit reservation during calls (5-min default hold, auto-release when call ends)
   - Kill switch: auto-terminate calls when balance ≤ 0 (checked every 60s)
   - Fixed rate: 56 pence/min GBP
   - Reference: SSOT.md Section 5 + Section 2.5 (below) for business impact

3. **Dashboard & Analytics** — Golden Record SSOT
   - All call data (cost, appointment linkage, tools used, ended reason) in `calls` table
   - Sentiment analysis, lead scoring, pipeline value tracking
   - Multi-tenant isolation (every query filters org_id via JWT)
   - Reference: SSOT.md Section 7 (Dashboard & Call Analytics) for schema details

4. **Webhook Architecture** — Single Production Endpoint
   - `/api/vapi/webhook` (vapi-webhook.ts) = production endpoint
   - `/api/webhooks/vapi` (webhooks.ts) = unused legacy (do not modify)
   - Retries via BullMQ queue, idempotency via processed_webhook_events table
   - Reference: SSOT.md Section 11 (Webhook Architecture) for full details

5. **Security & Compliance** — RLS Enforced on All Tables
   - JWT `org_id` extraction from `app_metadata`
   - RLS policies on 20+ tables
   - Error sanitization: 132+ info disclosure fixes applied
   - Reference: SSOT.md Section 2 (Authentication & Multi-Tenancy) for detailed policies

### Technical Reference

**All technical details (schema, RPCs, webhooks) are in SSOT.md. Don't duplicate here:**
| Topic | Location |
|-------|----------|
| Database schema | SSOT.md Section 3-6 (tables, columns, constraints, indexes) |
| RPC functions | SSOT.md Section 8 (function signatures, error handling) |
| Multi-number architecture | SSOT.md Section 9 + PRD_UPDATE_2026_02_24.md Section 1-4 |
| Webhook delivery | SSOT.md Section 11 (delivery log, retry logic, idempotency) |
| Critical invariants | SSOT.md Section 13 (rules that must never break) |
| Phone number handling | SSOT.md Section 9 + Invariant 9 (dual-write, deletion cleanup) |
| Compliance logging | SSOT.md Section 12 (audit logs, retention, HIPAA compliance) |

---

## 2. Product Overview
| Area | Description |
|------|-------------|
| Target user | Nigerian SMEs & small businesses (auto dealers, real estate, legal, salon/spa, retail, medical clinics) needing an AI assistant to qualify leads, book appointments, and route calls |
| Core value prop | End-to-end automation from inbound call → appointment → billing, with auditable Golden Record data. Local numbers, intelligent lead routing, 24/7 availability. |
| Deployment | Frontend (Next.js on port 3000) + Backend (Node/Express on port 6001) + Supabase (Postgres + Auth, project: wifcmvgwzicgyrvaoiwi) + Stripe + Twilio + Vapi |
| Pricing model | Pay-as-you-go wallet model (TBD for Barpel business model — inherited from Voxanne architecture). Calls billed at fixed rate per minute (inherited infrastructure). |

### Deployment Configuration (2026-03-01 - DEMO READY)

**Frontend (Local Dev):**
- Development URL: `http://localhost:3000`
- Framework: Next.js 14 (App Router)
- Vercel deployment: TBD (post-demo, will be `https://barpel.ai`)

**Backend (Local Dev):**
- Development URL: `http://localhost:6001`
- Framework: Express.js on Node.js
- Render deployment: TBD (post-demo, will be `https://barpel.onrender.com`)

**Database:**
- Supabase Project ID: `wifcmvgwzicgyrvaoiwi`
- Connection: SUPABASE_URL = `https://wifcmvgwzicgyrvaoiwi.supabase.co`
- Auth: Service role key for backend, anon key for frontend

**Stripe Webhook Configuration (TBD for Production):**
- Will be: `https://barpel.onrender.com/api/webhooks/stripe`
- Events listened: `checkout.session.completed`, `payment_intent.succeeded`, `customer.created`
- Secret storage: Backend environment variable `STRIPE_WEBHOOK_SECRET`

**Environment Variables (Current - Local Dev):**
- See `/Users/mac/Desktop/Barpel/.env.local` (frontend)
- See `/Users/mac/Desktop/Barpel/backend/.env` (backend)
- **Note:** Credentials are Barpel-specific (Vapi key, Supabase project, Twilio account, Stripe test keys)

---

## 2.5 Real-Time Prepaid Billing Engine ✅ COMPLETE (2026-02-16)

**Summary:** 3-phase atomic billing system deployed to production. Zero revenue leaks. Fixed rate: 56 pence/min GBP.

1. **Phase 1 - Atomic Asset Billing:** RPC with FOR UPDATE locks prevents double-spending on phone provisioning
2. **Phase 2 - Credit Reservation:** 5-minute holds during calls, auto-release at call end
3. **Phase 3 - Kill Switch:** Real-time balance check every 60s, auto-terminate calls when balance ≤ 0

**Status:** ✅ All phases deployed, 100% test coverage, schema fixed (2026-02-16), rate aligned (56p/min)

**Technical Details:** See SSOT.md Sections 5-6 (database tables) + Section 8 (RPC functions)

---

## 3. Core Capabilities

1. **AI Voice Agent** – Handles inbound/outbound calls via Vapi, executes tools (availability checks, booking, KB queries, transfer, end call).
2. **Golden Record SSOT** – Unified `calls` + `appointments` schema with cost, appointment linkage, tools used, and end reasons for analytics.
3. **Real-Time Prepaid Billing Engine** – Atomic 3-phase system with zero revenue leaks:
   - **Phase 1:** Atomic asset billing (prevents TOCTOU race conditions)
   - **Phase 2:** Credit reservation (5-min holds during calls)
   - **Phase 3:** Kill switch (auto-terminate when balance ≤ 0)
   - **See Section 2.5 below for full details**
4. **Wallet Billing** – Stripe Checkout top-ups (£25 minimum), auto-recharge, credit ledger, webhook verification, and fixed-rate per-minute deductions (56 pence/min GBP).
5. **Managed Telephony** – Purchase Twilio subaccount numbers (1 inbound + 1 outbound per org), surface in Agent Config, support manual AI Forwarding.
6. **Dashboards & Leads** – Production dashboards for call stats (Total Calls, Appointments, Average Sentiment, Avg Duration), call log filters (status, date range, search with clear), call detail modal (cost, appointment ID, tools used), activity click-through to call detail, appointment-to-call linkage, lead enrichment, conversion tracking, and Geo/SEO telemetry.
7. **Pre-Sales Lead Intake Form** – Public intake form at `/start` (unauthenticated, marketing-facing) for prospects who have not yet signed up. Collects company info, greeting script, voice preference, and optional pricing PDF. Auto-sends confirmation email to user and support notification to support@voxanne.ai. Stores submissions in `onboarding_submissions` table. ⚠️ **This is NOT the New User Onboarding Wizard** — it is a lead-capture form for pre-signup prospects only.
8. **New User Onboarding Wizard** – 5-step conversion wizard at `/dashboard/onboarding` for newly registered authenticated users. Flow: (0) Clinic Name → (1) Specialty → (2) Stripe payment → (3) Celebration + phone number auto-provisioned → (4) Aha Moment (test call CTA). Zustand store persisted to `sessionStorage` for Stripe redirect resilience. Dashboard home page auto-redirects users with `onboarding_completed_at = NULL`. Cart abandonment emails (3-step: 1hr soft nudge / 24hr pain reminder / 48hr £10 credit). Funnel telemetry via `onboarding_events` table. ⚠️ **This is NOT the pre-sales form at `/start`** — it is the post-signup conversion flow for authenticated users.
9. **Verified Caller ID** – Outbound caller ID verification via Twilio validation API. Pre-checks existing verifications to prevent errors, displays validation codes in UI, supports delete/unverify workflow. Works in both managed and BYOC telephony modes with automatic credential resolution.
10. **Security & Compliance** – JWT middleware using `jwt-decode`, Supabase RLS on all tenant tables, hardened functions (`search_path` pinned to `public`), HIPAA-ready infrastructure.
11. **Error Sanitization & Observability** – All API errors sanitized to prevent information disclosure (database schema, validation rules, implementation details). Centralized error utility (`error-sanitizer.ts`) ensures user-friendly messages while full technical details logged to Sentry for debugging. 132+ error exposures fixed (2026-02-22). Production deployment verified with zero technical leakage.

---

## 4. System Architecture Summary
```
Caller → Twilio/Vapi → Vapi webhook → backend/src/routes/vapi-webhook.ts
    ↳ Calls table (Golden Record columns)
    ↳ Appointments table + bidirectional linkage
    ↳ Supabase views feed dashboard routes

Stripe Checkout (wallet top-up) → Stripe webhooks → BullMQ queue → wallet service
    ↳ credit_wallets + credit_transactions ledger
    ↳ webhook verification API ensures wallet credited

Managed number provisioning → Twilio subaccounts → Vapi import → org_credentials + managed_phone_numbers
```
Supporting services: wallet auto-recharge processor, webhook verification API, analytics/Geo instrumentation, AI Forwarding GSM code generator.

---

## 5. Recent Releases & Verification

**Latest (2026-02-25):** New User Onboarding Wizard deployed. 5-step post-signup flow with cart abandonment emails and funnel analytics.

**See APPENDIX: Release History** for all releases, deployment timelines, and verification details.

---

## 6. Functional Requirements

**Note:** Technical details (schema, RPCs, webhooks) are in SSOT.md. This section covers business-level requirements.
### 6.1 AI Call Handling
- Voice agent must execute tools in order: `checkAvailability` → `bookClinicAppointment` → `transferCall`/`endCall`.  
- `queryKnowledgeBase` is mandatory for answering content questions (no hallucinated answers).  
- Every call writes a Golden Record row with cost, tool names, and appointment linkage within 1 second of webhook receipt.

### 6.2 Golden Record Analytics
- Calls table stores `cost_cents`, `appointment_id`, `tools_used[]`, `ended_reason`.
- Appointments table stores `call_id`, `vapi_call_id`.
- Dashboard APIs surface these fields for frontend usage (cost, appointment ID, tools used, sentiment scores).
- Multi-tenant isolation enforced via JWT org_id on all endpoints.

### 6.3 Telephony & AI Forwarding
- Managed number provisioning purchases via Twilio subaccounts and **must import into Vapi using subaccount credentials**.
- **Multi-number support:** Organizations can hold 1 inbound number + 1 outbound number (managed independently with separate `type` column in `org_credentials`)
- All managed numbers stored in `managed_phone_numbers` with `routing_direction` (inbound/outbound), and credential SSOT tracked in `org_credentials` with `type` column
- Agent Config dropdown shows managed numbers with badges per direction
- Database constraint `UNIQUE(org_id, provider, type)` prevents duplicate numbers in same direction
- Inbound numbers receive calls via `phone_number_mapping` table
- Outbound numbers linked to agents' `vapi_phone_number_id` for caller ID on outbound calls
- AI Forwarding wizard generates GSM codes for supported carriers and verifies Twilio caller ID ownership before enabling
- **Reference:** SSOT.md Section 9 (Managed Phone Numbers) + PRD_UPDATE_2026_02_24.md (detailed multi-number architecture)

### 6.5 Pre-Sales Lead Intake Form (Marketing — `/start`)

Form for unauthenticated prospects. Stores to `onboarding_submissions` table (distinct from `onboarding_events` for the wizard).

- Form page at `src/app/start/page.tsx` accepts company name, email, phone (E.164), greeting script, voice preference, optional pricing PDF.
- Form submission validates required fields and submits FormData (multipart) to `POST /api/onboarding-intake`.
- Backend route `backend/src/routes/onboarding-intake.ts` stores submission to `onboarding_submissions` table with full details, UTM attribution, and timestamps.
- Auto-sends confirmation email to user's email address (via Resend) and support notification to support@barpel.ai.
- Testing endpoints at `/api/email-testing/*` enable programmatic email verification without manual inbox checks.
- Submissions logged with structured context for debugging and audit trail.

### 6.6 Security & Monitoring

**Authentication & Multi-Tenancy:**
- JWT org_id extraction from `app_metadata` (no fallback allowed)
- Supabase RLS enforced on all tenant tables (wallets, calls, appointments, onboarding data)
- SECURITY DEFINER functions pin `search_path = public`
- Credentials encrypted (AES-256-GCM) via IntegrationDecryptor

**Error Sanitization (132+ exposures fixed 2026-02-22):**
- All API errors return user-friendly messages (no database schema, validation rules, or implementation details exposed)
- Full technical context logged to Sentry with org_id + request_id for debugging
- Use `backend/src/utils/error-sanitizer.ts` for consistent error handling across routes

**Webhook Health Monitoring:**
- `/api/webhook-verification/health` reports processed webhook counts and wallet credit reconciliation
- Stripe events (`charge.succeeded`) logged with org context

**Verified Caller ID (Outbound):**
- Organizations must verify phone numbers before use as outbound caller ID
- Supports both managed (subaccount) and BYOC (org credentials) modes
- Pre-check via Twilio API prevents duplicate verification requests
- Database: `verified_caller_ids` table with org_id, phone_number, status, verified_at
- **Critical Invariant:** Pre-check Twilio's `outgoingCallerIds.list()` BEFORE initiating verification — if already verified, auto-mark in database

### 6.7 New User Onboarding Wizard (Post-Signup — `/dashboard/onboarding`)

5-step authenticated wizard at `/dashboard/onboarding`. Stores telemetry to `onboarding_events` table (distinct from pre-sales form).

**Overview:** Framer Motion `AnimatePresence` overlay. Zustand store persisted to `sessionStorage` (survives Stripe redirect). Dim & Brandy (dark) theme.

**Steps:**
| Step | Component | Key Action |
|------|-----------|------------|
| 0 | `StepWelcome` | Business name input (e.g., "Ace Auto Dealers") → stored as `clinic_name` on `organizations` (DB field name unchanged for backward compatibility) |
| 1 | `StepSpecialty` | 6-card business vertical picker: Auto Dealer, Real Estate, Legal, Salon/Spa, Medical Clinic, Retail → auto-advances after 400ms → `specialty` on `organizations` |
| 2 | `StepPaywall` | Value props + area code input + "Get My AI Number" → Stripe Checkout via `/api/billing/wallet/topup` with `return_url=/dashboard/onboarding` |
| 3 | `StepCelebration` | Detects `?topup=success` on return → confetti (Brandy palette: #8D4A43, #B26A62, #1C1C1E) + auto-provisions phone number via `POST /api/onboarding/provision-number` |
| 4 | `StepAhaMoment` | Shows provisioned number in large mono text → "Call this number" CTA → on completion: `POST /api/onboarding/complete`, redirect to `/dashboard` |

**API Endpoints (all require `requireAuth`):**
- `POST /api/onboarding/event` — Fire-and-forget telemetry (always returns 200, never blocks user)
- `GET /api/onboarding/status` — Returns `{ needs_onboarding: boolean, completed_at: string|null }`
- `POST /api/onboarding/complete` — Sets `onboarding_completed_at = NOW()`, writes `clinic_name` + `specialty` to org
- `POST /api/onboarding/provision-number` — Atomically deducts £10 from wallet, provisions Twilio inbound number, refunds on failure

**New-User Detection:**
- Dashboard home page (`src/app/dashboard/page.tsx`) SWR-fetches `/api/onboarding/status`
- If `needs_onboarding = true`, `router.push('/dashboard/onboarding')` (only fires on `/dashboard`, not deep links)
- After wizard completes, `/dashboard` visit no longer redirects

**Cart Abandonment (automated job, every 15 minutes):**
- Detects orgs with `payment_viewed` event but no `payment_success` event, and `onboarding_completed_at IS NULL`
- Email 1 (≥1hr): Soft nudge — "Your AI receptionist is almost ready"
- Email 2 (≥24hr): Pain reminder — "How many calls did you miss today?"
- Email 3 (≥48hr): Objection killer — £10 credit applied + email notification
- **Idempotency:** `recordEmailSent` runs BEFORE `addCredits` — UNIQUE constraint on `(org_id, sequence_number)` in `abandonment_emails` table prevents double-credit on retry
- File: `backend/src/jobs/onboarding-abandonment.ts`

**Telemetry (6 event types):**
All events fire-and-forget to `POST /api/onboarding/event`. Never block wizard progression.
`started` → `clinic_named` → `specialty_chosen` → `payment_viewed` → `payment_success` → `test_call_completed`

**Design Constraints:**
- No semantic colors in wizard UI (no green/red/yellow) — monochromatic blue palette only
- Confetti uses only: #1D4ED8, #3B82F6, #BFDBFE, #FFFFFF (brand-safe)
- All currency in GBP pence (£10 credit = 1000 pence)
- `sessionStorage` (not `localStorage`) — clears when tab closes

**Critical Invariants:**
1. `onboarding_completed_at` on `organizations` is the single gate — only set by `POST /api/onboarding/complete` or the "Skip for now" flow
2. `abandonment_emails.UNIQUE(org_id, sequence_number)` prevents duplicate emails and double credit — never remove this constraint
3. The Stripe return URL must decode `?topup=success` and advance to step 3 — ensure `billing-api.ts` allows `/dashboard/onboarding` as a valid `return_url`
4. `provision-number` must refund with `addCredits` on Twilio failure — wallet must never be left debited after a failed provisioning

---

## 7. Test Accounts & Environment
| Purpose | Email / Credential | Notes |
|---------|-------------------|-------|
| Demo org | Create via signup at `/sign-up` | Full flow: signup → onboarding wizard → dashboard |
| Frontend URL | `http://localhost:3000` | Signup at `/sign-up`, login at `/login`, dashboard at `/dashboard`, wizard at `/dashboard/onboarding` |
| Backend URL | `http://localhost:6001` | APIs secured via JWT middleware, health endpoint at `/health` |
| Supabase Project | `wifcmvgwzicgyrvaoiwi` | Barpel-specific project with 79 migrations |
| Stripe keys | `pk_test_...`, `sk_test_...` (see `backend/.env`) | Test mode for development, never commit secrets |
| Vapi Credentials | Service role key in `backend/.env` | Single shared Vapi credential per Barpel account |

---

## 9. Backlog / Next Steps (Barpel AI)

**Completed (Reskin Phase - 2026-02-27 to 2026-03-01):**
1. ✅ **COMPLETE** (2026-03-01) – Barpel AI Reskin: Full branding overhaul from Voxanne to Barpel
   - Frontend: Dim & Brandy color scheme, logo asset, business-focused onboarding wizard
   - Backend: Port 6001, Barpel credentials, business vertical SSOT
   - Database: Supabase project wifcmvgwzicgyrvaoiwi, 79 migrations, onboarding_completed_at column
   - Git: Fresh repo, 1 clean commit, zero Voxanne references
   - Demo Status: ✅ READY — both servers running, full demo flow tested

**Upcoming (Post-Demo, Investor Phase):**
1. **Decide on Barpel Pricing Model** – Inherited Voxanne wallet/prepaid system (56p/min GBP). Customize for Nigerian SMEs (NG₦ rates, local pricing bands, startup credits).
2. **Production Deployment** – Deploy to Vercel (frontend: `barpel.ai`) and Render (backend: `barpel.onrender.com`). Update DNS, SSL, CDN configuration.
3. **Local Payment Gateway Integration** – Stripe test mode → production. Consider Flutterwave or PayStack for Nigerian NG₦ payment acceptance.
4. **SMS/USSD Support** – Extend Twilio integration for SMS notifications and USSD callback feature (common in Nigeria).
5. **Localization** – i18n for Yoruba/Hausa/Igbo. Local number prefixes (+234). Timezone handling (WAT).
6. **Marketing & Sales Funnel** – Drive signups via `/start` → pre-sales form. Email nurture sequence via Resend. Analytics on conversion funnel.
7. **Call Analytics Dashboard** – Build sentiment analysis, lead scoring, and ROI tracking for SME use cases.
8. **Mobile Optimization** – Responsive design for mobile-first users (iOS Safari, Chrome Android).
9. **API Documentation** – REST API docs for integration partners (CRM, accounting software).
10. **Security & Compliance** – Data residency (server location), GDPR + Nigeria's NDPR compliance, audit logging.

---

## 8. Quick Reference: Where to Find Information

**This PRD covers:**
- ✅ Critical Rules: Non-negotiable business & security truths
- ✅ Core Capabilities: Current system features and recent releases
- ✅ Test accounts and verification checklists

**For Technical Details (database, RPCs, webhooks), refer to SSOT.md:**
- Database schema, columns, constraints, indexes
- RPC function signatures, error handling, transaction logic
- Webhook delivery patterns, retry logic, idempotency
- Multi-tenant RLS policy implementation
- Phone number architecture (dual-write, deletion cleanup)
- Critical invariants that must never break

**Quick Links:**
| Document | Purpose |
|----------|---------|
| **SSOT.md** | Technical authority for database, RPCs, webhooks, compliance |
| **PRD_UPDATE_2026_02_24.md** | Detailed explanation of Bug 3 fix (multi-number support) |
| **PRD_CURRENT_STATE_2026_02_24.md** | High-level guide to PRD structure and tier system |
| **This PRD (.agent/prd.md)** | Business capabilities, releases, operational procedures |

**For New Developers (Ramp-Up Guide):**
1. Read Critical Rules above (understand immutable rules, 5 mins)
2. Read SSOT.md Sections 1-2 (auth & multi-tenancy, 15 mins)
3. Read Core Capabilities above (system overview, 10 mins)
4. Read SSOT.md Section 9 (managed phone numbers, 20 mins)
5. Read relevant sections of SSOT.md for your task
6. Reference this PRD for business context

**For Contributors (Before Modifying Code):**
- Always reference SSOT.md Section 13 (Critical Invariants) first
- Check if your change affects: org_id filtering, multi-tenant isolation, wallet enforcement, phone number handling
- When modifying managed_phone_numbers or org_credentials, ensure dual-write/dual-delete
- When adding endpoints, apply error sanitization pattern (use `error-sanitizer.ts`)
- When touching RPC functions, verify transaction semantics with "All-or-nothing" constraint

---

## APPENDIX: Release History

### 2026-03-01: Barpel AI Reskin ✅ COMPLETE
- **Scope:** Complete branding overhaul from Voxanne AI to Barpel AI (February 27 → March 1, 2026)
- **Frontend:** Dim & Brandy dark theme, new logo (navy-to-teal B-mark), business onboarding wizard (Auto Dealer → Real Estate → Legal → Salon/Spa → Medical → Retail)
- **Backend:** Port changed 3001 → 6001, Barpel-specific credentials (Vapi, Supabase wifcmvgwzicgyrvaoiwi, Stripe test), CORS updated
- **Database:** 79 migrations copied, onboarding_completed_at column added, clinic_name/specialty fields (business-focused terminology)
- **Branding:** 100% coverage — zero Voxanne references, all UI text updated to SME/business focus, color palette (Brandy #8D4A43, Dim #1C1C1E)
- **Git:** Fresh repository at `/Users/mac/Desktop/Barpel/`, clean history, separate from Voxanne source
- **Status:** ✅ DEMO READY — Full stack running, signup → wizard → dashboard flow verified
- **Verification:** Senior engineer review (8 critical issues identified & resolved), brand QA grep (zero Voxanne text), server health checks ✓

### 2026-02-25: New User Onboarding Wizard (Voxanne) ✅ DEPLOYED
- 5-step conversion wizard for newly registered users at `/dashboard/onboarding`
- Flow: Clinic Name → Specialty → Stripe Payment → Celebration + Auto-Provision → Aha Moment
- Cart abandonment: 3-email sequence (1hr/24hr/48hr) with £10 credit on email 3
- Funnel telemetry: 6 event types in `onboarding_events` table
- Migration: `20260225_onboarding_wizard.sql` (2 new tables + 3 org columns)
- **Note:** Reused as-is for Barpel wizard (clinic_name field kept for DB compatibility; frontend terminology changed to business_name)

### 2026-02-24: Multi-Number Support Bug Fix (Voxanne) ✅ FIXED
- Outbound number provisioning: Fixed RPC parameter mismatch and constraint
- Changed UNIQUE constraint from `(org_id, provider)` → `(org_id, provider, type)`
- Verified: +16812711486 purchased and stored correctly

### 2026-02-14: Real-Time Prepaid Billing Engine (Voxanne) ✅ DEPLOYED
- Phase 1 (Atomic Asset Billing): TOCTOU prevention via FOR UPDATE locks
- Phase 2 (Credit Reservation): 5-minute holds with auto-release
- Phase 3 (Kill Switch): Real-time balance monitoring every 60 seconds
- **Inherited by Barpel:** All 3 phases operational, will be adapted for Nigerian pricing post-demo

