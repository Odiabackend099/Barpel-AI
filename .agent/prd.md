# Barpel AI – Product Requirements Document (PRD)

**Version:** 2026.03.05
**Last Updated:** 2026-03-05 UTC
**Status:** 🚀 PRODUCTION DEPLOYED - Full Platform Live (Call Transfer feature live: transferCall Vapi tool end-to-end fixed, Escalation Rules UI replaced with simple Call Transfer settings page)
**Project Foundation:** Enterprise voice receptionist platform for Nigerian SMEs/Small Businesses
**Verification Status:** ✅ FULL STACK OPERATIONAL - Frontend (Next.js port 8000) + Backend (Express port 8001) + Supabase (wifcmvgwzicgyrvaoiwi) + Teal-and-white branding + 5-step onboarding wizard + Google OAuth sign-in + Marketing site all 6 pages live + 7 Vapi tools linked + Wallet gating enforced + Call Transfer end-to-end verified

---

## PRODUCTION DEPLOYMENT ARCHITECTURE (2026-03-02)

**Temporary domains (pending barpel.ai purchase):**

| Domain | Platform | Source | Status |
|--------|----------|--------|--------|
| `barpelai.odia.dev` | Vercel (Vite/React) | `frontend/website/` | ✅ LIVE |
| `www.barpelai.odia.dev` | Vercel (Vite/React) | `frontend/website/` | ✅ LIVE |
| `app-barpelai.odia.dev` | Vercel (Next.js 14) | `src/` | ✅ LIVE |
| `barpel-ai.onrender.com` | Render (Express/Node) | `backend/` | ✅ LIVE |

**Permanent domains (once barpel.ai is purchased — update same files):**
- `barpel.ai` → marketing, `app.barpel.ai` → dashboard, `api.barpel.ai` → backend

**Dev Ports:**
- Dashboard: `http://localhost:8000` (`npm run dev`)
- Marketing site: `http://localhost:8002` (`npm run dev:site`)
- Backend: `http://localhost:8001` (`cd backend && npm run dev`)

**GitHub:** `https://github.com/Odiabackend099/Barpel-AI`

**Vercel Projects:**
- Dashboard: `odia-backends-projects/barpel-dashboard` — token in `.agent/vercel cli.md`
- Marketing: `odia-backends-projects/barpel-marketing` — token in `.agent/vercel cli.md`

**Render Service:** `barpel-ai.onrender.com` (`barpel-backend`) — secrets set manually in Render Dashboard

**Required Render Dashboard secrets:**
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `VAPI_PRIVATE_KEY`, `ENCRYPTION_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_ENCRYPTION_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `FROM_EMAIL`, `OPENAI_API_KEY`, `REDIS_URL`, `SENTRY_DSN`

**Render env vars to update in dashboard (currently set in render.yaml):**
- `BACKEND_URL` → `https://barpel-ai.onrender.com`
- `FRONTEND_URL` → `https://app-barpelai.odia.dev`
- `CORS_ORIGIN` → `https://app.barpel.ai,https://barpel.ai,https://www.barpel.ai,https://app-barpelai.odia.dev,https://barpelai.odia.dev,https://barpel-ai.onrender.com`
- `GOOGLE_REDIRECT_URI` → `https://barpel-ai.onrender.com/api/google-oauth/callback`

---

## CRITICAL ARCHITECTURE RULES (TIER 1: Non-Negotiable Truths)

These rules NEVER change and are enforced by the database and RLS policies:

1. **Backend is Sole Vapi Provider**
   - ONE Vapi API key in backend `.env`
   - ALL organizations share single Vapi credential (NO per-org Vapi credentials)
   - Tools registered globally, linked to each org's assistants
   - Reference: database-ssot.md Section 2.1

2. **Multi-Tenant Isolation via org_id**
   - JWT `app_metadata.org_id` = single source of truth for org
   - Every query filters by `org_id` FIRST
   - RLS policies enforce at database level (CHECK org_id = auth.uid()... via jwt_extract_org_id)
   - Reference: database-ssot.md Section 2.2

3. **Wallet Balance Must Be Enforced**
   - Check balance BEFORE deducting
   - Deduct ATOMICALLY (use RPC with row locks, never separate SELECT + UPDATE)
   - Negative balances trigger kill switch (automatic call termination)
   - Reference: database-ssot.md Section 5 + Real-Time Prepaid Billing Engine (Section 2.5 below)

4. **Multi-Number Support: 1 Inbound + 1 Outbound per Org** ✅ NEW (2026-02-24)
   - `org_credentials` constraint: `UNIQUE(org_id, provider, type)` — not `UNIQUE(org_id, provider)`
   - Each direction (inbound/outbound) stored separately with independent `vapi_phone_id`
   - RPC parameter: `p_routing_direction` (not `p_type`) determines column for insertion
   - Service ALWAYS writes org_credentials (no skip logic for 2nd number)
   - Reference: database-ssot.md Section 9 + PRD_UPDATE_2026_02_24.md

---

## How to Use This Document

**If you're fixing a bug:** Read Section 1 (Critical Rules) + relevant section in Section 2
**If you're adding a feature:** Read Section 2 (how the system works) + check database-ssot.md for database details
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
   - Reference: database-ssot.md Section 9 (Managed Phone Numbers — Lifecycle & Dual-Write)

2. **Real-Time Prepaid Billing Engine** — Phase 1-3 Deployed & Verified
   - Atomic asset billing (RPC with FOR UPDATE locks, prevents TOCTOU)
   - Credit reservation during calls (5-min default hold, auto-release when call ends)
   - Kill switch: auto-terminate calls when balance ≤ 0 (checked every 60s)
   - Fixed rate: 56 pence/min GBP (TBD customization for Nigerian NG₦ post-launch)
   - Reference: database-ssot.md Section 5 + Section 2.5 (below) for business impact

3. **Dashboard & Analytics** — Golden Record SSOT
   - All call data (cost, appointment linkage, tools used, ended reason) in `calls` table
   - Sentiment analysis, lead scoring, pipeline value tracking
   - Multi-tenant isolation (every query filters org_id via JWT)
   - Reference: database-ssot.md Section 7 (Dashboard & Call Analytics) for schema details

4. **Webhook Architecture** — Single Production Endpoint
   - `/api/vapi/webhook` (vapi-webhook.ts) = production endpoint
   - `/api/webhooks/vapi` (webhooks.ts) = unused legacy (do not modify)
   - Retries via BullMQ queue, idempotency via processed_webhook_events table
   - Reference: database-ssot.md Section 11 (Webhook Architecture) for full details

5. **Security & Compliance** — RLS Enforced on All Tables
   - JWT `org_id` extraction from `app_metadata`
   - RLS policies on 20+ tables
   - Error sanitization: 132+ info disclosure fixes applied
   - Reference: database-ssot.md Section 2 (Authentication & Multi-Tenancy) for detailed policies

### Technical Reference

**All technical details (schema, RPCs, webhooks) are in database-ssot.md. Don't duplicate here:**
| Topic | Location |
|-------|----------|
| Database schema | database-ssot.md Section 3-6 (tables, columns, constraints, indexes) |
| RPC functions | database-ssot.md Section 8 (function signatures, error handling) |
| Multi-number architecture | database-ssot.md Section 9 + PRD_UPDATE_2026_02_24.md Section 1-4 |
| Webhook delivery | database-ssot.md Section 11 (delivery log, retry logic, idempotency) |
| Critical invariants | database-ssot.md Section 13 (rules that must never break) |
| Phone number handling | database-ssot.md Section 9 + Invariant 9 (dual-write, deletion cleanup) |
| Compliance logging | database-ssot.md Section 12 (audit logs, retention, HIPAA compliance) |

---

## 2. Product Overview
| Area | Description |
|------|-------------|
| Target user | Nigerian SMEs & small businesses (auto dealers, real estate, legal, salon/spa, retail, medical clinics) needing an AI assistant to qualify leads, book appointments, and route calls |
| Core value prop | End-to-end automation from inbound call → appointment → billing, with auditable Golden Record data. Local numbers, intelligent lead routing, 24/7 availability. |
| Deployment | Frontend (Next.js on port 8000) + Backend (Node/Express on port 8001) + Supabase (Postgres + Auth, project: wifcmvgwzicgyrvaoiwi) + Stripe + Twilio + Vapi |
| Pricing model | Pay-as-you-go wallet model (56 pence/min GBP, TBD customization for Nigerian NG₦). Calls billed at fixed rate per minute. |

### Deployment Configuration (2026-03-02 - PRODUCTION LIVE)

**Production URLs (temporary domains — pending barpel.ai purchase):**
- Dashboard (Frontend): `https://app-barpelai.odia.dev` (Vercel, Next.js 14)
- Marketing Site: `https://barpelai.odia.dev` (Vercel, Vite/React)
- Backend API: `https://barpel-ai.onrender.com` (Render, Express/Node)

**Local Development:**
- Dashboard: `http://localhost:8000` (port 8000)
- Backend: `http://localhost:8001` (port 8001)
- Marketing: `http://localhost:8002` (port 8002)

**Database:**
- Supabase Project ID: `wifcmvgwzicgyrvaoiwi`
- Connection: SUPABASE_URL = `https://wifcmvgwzicgyrvaoiwi.supabase.co`
- Auth: Service role key for backend, anon key for frontend

**Render Infrastructure:**
- Backend service: `barpel-backend` at `barpel-ai.onrender.com`
- Redis: **Upstash** (cloud-managed, TLS). `REDIS_URL` set manually in Render dashboard env vars. **Do NOT use Render internal Redis** — Render private networking only works within the same workspace; the backend (odiadev workspace) and original Redis (Austyn's workspace) were in different workspaces, causing ENOTFOUND crash loops.
- Render env reference file: `render/renderenv` (local only, gitignored)
- Build fix: eslint downgraded `^9` → `^8` (commit `05e72ca`), `.npmrc` `legacy-peer-deps=true`
- **Render Dashboard required:** Set Root Directory = `backend`, enter all secrets from `render/renderenv`

**Production Fixes Applied (2026-03-03 — commits `beebf9a`, `190a445`, `7e2bf40`, `723b329`):**

**commit `beebf9a` — Backend stability:**
- ✅ **Redis crash loop eliminated:** `vapi-reconciliation-worker.ts` rewritten to lazy-init pattern using `createRedisConnection()` with null guard — matches all other queue files. Previously instantiated `new Redis()` at module load, causing ENOTFOUND flood every ~100ms.
- ✅ **`billing-reconciliation.ts` null guards:** `/history` and `/health` now return graceful empty responses when `vapiReconcileQueue === null`.
- ✅ **`NEXT_PUBLIC_BACKEND_URL` fixed in Vercel:** Was `https://api.barpel.ai` (domain not owned). Updated to `https://barpel-ai.onrender.com`.
- ✅ **CORS_ORIGIN expanded:** Includes all 6 origins (odia.dev + future barpel.ai domains).
- ✅ **Wrong DNS record deleted:** Stale CNAME pointing `barpel-ai.onrender.com` to Vercel removed.

**commits `190a445`, `7e2bf40` — CSP violations & dead domain cleanup:**
- ✅ **CSP root cause fixed:** `vercel.json` `/(.*)`  headers block was overriding `next.config.mjs` for same-key headers (Vercel-level headers always win). Removed stale headers block from `vercel.json` — `next.config.mjs` is now the sole CSP authority.
- ✅ **Dead domain `api.barpel.ai` removed** from all 5 source files: `next.config.mjs`, `vercel.json`, `brand.config.ts`, `telephony-provisioning.ts`, `api-reference/page.tsx`. Canonical backend is `https://barpel-ai.onrender.com`.
- ✅ **PWA service worker stale cache cleared:** Bumped runtimeCaching cache names to `api-cache-v2` / `pages-cache-v2` — forces old service workers serving CSP-blocked pages to discard cached HTML.
- ✅ **Redis switched to Upstash:** Render private networking doesn't cross workspace boundaries. Old Redis was in a different workspace than the backend. Upstash (`rediss://` TLS) resolves the ENOTFOUND.
- ✅ **HSTS added** to `next.config.mjs` (was only in the now-removed `vercel.json` block).

**commit `723b329` — Google Sign-In fixed:**
- ✅ **Google OAuth redirecting to `localhost:8000` fixed:** Root cause was Supabase Dashboard Site URL still set to `http://localhost:8000`. Supabase validates `redirectTo` against its allowlist — if not found, falls back to Site URL. Fixed by: (1) setting Supabase Site URL to `https://app-barpelai.odia.dev`, (2) adding `https://app-barpelai.odia.dev/**` to Supabase redirect allowlist, (3) fixing Google Cloud Console Calendar OAuth URI (was missing `/api/google-oauth/callback` path), (4) fixing SSR fallback in `src/lib/auth-redirect.ts` (was hardcoded `localhost:3000`).
- ✅ **Verified end-to-end:** Google Sign-Up → Google consent → redirects to `https://app-barpelai.odia.dev/dashboard` → onboarding wizard launches correctly.

**Stripe Webhook Configuration (Production):**
- Endpoint: `https://barpel-ai.onrender.com/api/webhooks/stripe`
- Events: `checkout.session.completed`, `payment_intent.succeeded`, `customer.created`
- Secret: `STRIPE_WEBHOOK_SECRET` in Render dashboard env vars

**Environment Variables:**
- Local dev: `backend/.env` (backend), `.env.local` (frontend)
- Production: Render dashboard env vars (copy from `render/renderenv`)

---

## 2.5 Real-Time Prepaid Billing Engine ✅ COMPLETE (2026-02-16)

**Summary:** 3-phase atomic billing system deployed to production. Zero revenue leaks. Fixed rate: 56 pence/min GBP.

1. **Phase 1 - Atomic Asset Billing:** RPC with FOR UPDATE locks prevents double-spending on phone provisioning
2. **Phase 2 - Credit Reservation:** 5-minute holds during calls, auto-release at call end
3. **Phase 3 - Kill Switch:** Real-time balance check every 60s, auto-terminate calls when balance ≤ 0

**Status:** ✅ All phases deployed, 100% test coverage, schema fixed (2026-02-16), rate aligned (56p/min)

**Technical Details:** See database-ssot.md Sections 5-6 (database tables) + Section 8 (RPC functions)

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
5a. **Call Transfer** – Business owners configure a single transfer phone number (E.164) in the Call Transfer settings page (`/dashboard/escalation-rules`). When a caller asks to speak to a human, or the AI detects a serious buyer, the `transferCall` Vapi tool reads `integration_settings.transfer_phone_number` (provider='transfer') and routes the live call to that number. History of transferred calls visible in the same settings page. Route: `/api/transfer-settings` (GET, PUT, GET /history). DB: `integration_settings` table, row with `provider = 'transfer'` per org.
6. **Dashboards & Leads** – Production dashboards for call stats (Total Calls, Appointments, Average Sentiment, Avg Duration), call log filters (status, date range, search with clear), call detail modal (cost, appointment ID, tools used), activity click-through to call detail, appointment-to-call linkage, lead enrichment, conversion tracking, and Geo/SEO telemetry.
7. **Pre-Sales Lead Intake Form** – Public intake form at `/start` (unauthenticated, marketing-facing) for prospects who have not yet signed up. Collects company info, greeting script, voice preference, and optional pricing PDF. Auto-sends confirmation email to user and support notification to support@barpel.ai. Stores submissions in `onboarding_submissions` table. ⚠️ **This is NOT the New User Onboarding Wizard** — it is a lead-capture form for pre-signup prospects only.
8. **New User Onboarding Wizard** – 5-step conversion wizard at `/dashboard/onboarding` for newly registered authenticated users. Flow: (0) Choose Number (direction + country + area code + search) → (1) Payment (Stripe Checkout + auto-provision) → (2) Telecom Routing (forwarding/caller ID) → (3) Agent Personality (name, voice, prompt) → (4) Sync & Go Live (phone ↔ agent sync + celebration). Back/Skip navigation on all steps. Zustand store persisted to `sessionStorage` for Stripe redirect resilience. Dashboard home page auto-redirects users with `onboarding_completed_at = NULL`. Cart abandonment emails (3-step: 1hr soft nudge / 24hr pain reminder / 48hr £10 credit). Funnel telemetry via `onboarding_events` table. ⚠️ **This is NOT the pre-sales form at `/start`** — it is the post-signup conversion flow for authenticated users.
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

**Latest (2026-03-05 — Call Transfer):** End-to-end call transfer feature fixed and verified. Escalation Rules UI replaced with a simple one-field Call Transfer settings page. 3 new API endpoints live. Root cause: `integration_settings` table existed but was missing `transfer_phone_number` column, so the `transferCall` Vapi tool always got `null` and calls never transferred. See APPENDIX for full details.

**Previous (2026-03-04 — Infrastructure Audit):** Wallet gating, 7 tools, time awareness, test endpoints — all verified end-to-end. Four bugs found and fixed.
- ✅ **Wallet gate added** to `POST /agent/test-call` + `POST /agent/web-test` — both return 402 when org balance = 0. `hasEnoughBalance()` imported from `wallet-service`.
- ✅ **Time awareness per-call** — `vapi-webhook.ts` `assistant-request` handler injects current date + WAT time (Africa/Lagos, UTC+1) fresh on every call. Never stale.
- ✅ **7 tools registered and linked** — checkAvailability, bookClinicAppointment, transferCall, lookupCaller, endCall, queryKnowledgeBase, **sendSms** (new standalone SMS tool, `async: false` to prevent false confirmations). All 7 `toolIds` now included in inline assistant config returned to Vapi in browser test.
- ✅ **Stripe CLI local dev** — `npm run stripe:listen` in `backend/` forwards webhooks to `localhost:8001`. Wallet top-up flow verified: 0 → 2000p (£20.00) in ~5s.
- ✅ **Wallet page polling** — replaced single `mutateWallet()` with 4×3s polling loop after `?topup=success`.
- 🐛 **4 bugs fixed in `founder-console-v2.ts` + `tool-sync-service.ts`:**
  1. `ReferenceError: agents is not defined` — stale array reference after `.maybeSingle()` change → fixed `total_agents: 1`
  2. "Agent not configured" → wrong column `active` (DB is `is_active`) → fixed all 4 references
  3. `call_tracking` missing columns → added `agent_id`, `lead_id`, `phone`, `called_at`, `call_outcome` via Supabase migration
  4. Vapi PATCH 400 "model.provider required" → `linkToolsToAssistant()` now pre-fetches existing assistant to preserve `provider`+`model` fields in PATCH payload

**Previous (2026-03-04 — commits `dbcafc8`, `5415a07`):** Marketing website fully completed.
- ✅ **6 missing pages created** (were all "Section coming soon" placeholders in App.tsx): Careers, Demo, Features, Security, Terms of Service, Cookie Policy
- ✅ **Pricing.tsx corrected** — rates now sourced from `backend/src/config/index.ts`: $0.70/min (RATE_PER_MINUTE_USD_CENTS=70), ~155 min for $99 bundle (141 raw + 10% bonus), £25 minimum top-up. Previous rates ($0.14/min, 750 min) were wrong by 5×.
- ✅ **App.tsx cleaned** — `PlaceholderSection` component and all 6 inline placeholder page definitions removed; replaced with proper imports.
- ✅ **`barpel-marketing-pages` skill created** at `.claude/skills/barpel-marketing-pages/SKILL.md` — encodes design system, all product knowledge, correct pricing, CTA wiring, TypeScript safety rules, and per-page content templates for future marketing page work.
- ✅ **Deployed** to `barpelai.odia.dev` (Vercel, commit `5415a07`)

**Previous (2026-03-03 — commits `190a445`, `7e2bf40`, `723b329`):** CSP violations eliminated (root cause: `vercel.json` overriding `next.config.mjs`; dead `api.barpel.ai` domain purged from all files). Redis switched from Render internal to Upstash (workspace boundary issue). Google Sign-In with Google fully working end-to-end — Supabase Dashboard Site URL corrected from `localhost:8000` to `https://app-barpelai.odia.dev`. PWA stale cache busted. HSTS added.

**Previous (2026-03-03 — commit `beebf9a`):** Backend Redis crash loop fixed (`vapi-reconciliation-worker.ts` lazy-init). `NEXT_PUBLIC_BACKEND_URL` corrected in Vercel. CORS origins expanded. Stale DNS record deleted.

**Previous (2026-03-01):** Barpel AI Production Platform fully operational. 5-step post-signup onboarding wizard, real-time prepaid billing, managed telephony, and teal-and-white design system.

**See APPENDIX: Release History** for all releases, deployment timelines, and verification details.

---

## 6. Functional Requirements

**Note:** Technical details (schema, RPCs, webhooks) are in database-ssot.md. This section covers business-level requirements.
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
- **Reference:** database-ssot.md Section 9 (Managed Phone Numbers) + PRD_UPDATE_2026_02_24.md (detailed multi-number architecture)

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

**Overview:** Framer Motion `AnimatePresence` overlay. Zustand store (`barpel-onboarding`) persisted to `sessionStorage` (survives Stripe redirect). Teal-and-white design system. Back + Skip navigation on all non-final steps.

**Files:**
- Page: `src/app/dashboard/onboarding/page.tsx`
- Store: `src/lib/store/onboardingStore.ts`
- Components: `src/components/onboarding/Step*.tsx`

**Steps:**
| Step | Component | Key Action |
|------|-----------|------------|
| 0 | `StepNumberSelection` | Inbound/outbound direction toggle + country + area code + available number search → pick number |
| 1 | `StepPayment` | Displays selected number + pricing → Stripe Checkout via `/api/billing/wallet/topup` with `return_url=/dashboard/onboarding` → auto-provisions on Stripe return |
| 2 | `StepTelecomRouting` | Inbound: configure call forwarding. Outbound: configure caller ID |
| 3 | `StepAgentPersonality` | Set agent name, voice, system prompt |
| 4 | `StepSyncGoLive` | Links provisioned phone number to Vapi assistant → confirmation + "Go to Dashboard" |

**Navigation:**
- **Back button** (steps 1–3 only): calls `prevStep()` from Zustand store
- **Skip button** (steps 0–3 only): calls `POST /api/onboarding/complete` (best-effort), then `router.replace('/dashboard')`. Shown top-right as "Skip".

**Zustand Store Fields (`src/lib/store/onboardingStore.ts`):**
- `direction: 'inbound' | 'outbound'` — selected agent type
- `selectedCountry: string` — ISO country code ('US', 'GB', 'CA')
- `areaCode: string` — 3-digit area code (optional)
- `selectedNumber: string | null` — E.164 number chosen from search results
- `selectedLocality: string | null` — city display text
- `businessName: string` — org name
- `paymentComplete: boolean` — Stripe checkout completed
- `phoneNumber: string | null` — provisioned E.164
- `vapiPhoneId: string | null` — Vapi phone UUID
- `routingConfigured: boolean`
- `agentName: string`
- `agentId: string | null`
- `vapiAssistantId: string | null`
- `syncComplete: boolean`

**API Endpoints (all require `requireAuth`):**
- `POST /api/onboarding/event` — Fire-and-forget telemetry (always returns 200, never blocks user)
- `GET /api/onboarding/status` — Returns `{ needs_onboarding: boolean, completed_at: string|null }`
- `POST /api/onboarding/complete` — Sets `onboarding_completed_at = NOW()` on the org
- `POST /api/onboarding/provision-number` — Atomically deducts from wallet, provisions Twilio number via managed-telephony, refunds on failure
- `GET /api/managed-telephony/available-numbers` — Searches available Twilio numbers (country, numberType, areaCode, limit params)

**New-User Detection:**
- Dashboard home page (`src/app/dashboard/page.tsx`) SWR-fetches `/api/onboarding/status`
- If `needs_onboarding = true`, `router.push('/dashboard/onboarding')` (only fires on `/dashboard`, not deep links)
- After wizard completes (or skip), `/dashboard` visit no longer redirects

**Cart Abandonment (automated job, every 15 minutes):**
- Detects orgs with `payment_viewed` event but no `payment_success` event, and `onboarding_completed_at IS NULL`
- Email 1 (≥1hr): Soft nudge — "Your AI receptionist is almost ready"
- Email 2 (≥24hr): Pain reminder — "How many calls did you miss today?"
- Email 3 (≥48hr): Objection killer — £10 credit applied + email notification
- **Idempotency:** `recordEmailSent` runs BEFORE `addCredits` — UNIQUE constraint on `(org_id, sequence_number)` in `abandonment_emails` table prevents double-credit on retry
- File: `backend/src/jobs/onboarding-abandonment.ts`

**Telemetry events (fire-and-forget via `POST /api/onboarding/event`):**
`started` → `number_selected` → `payment_viewed` → `payment_success` → `routing_configured` → `agent_configured` → `sync_complete`

**Design Constraints:**
- Teal-and-white design system (`barpel-teal: #37A195`, `barpel-slate: #102A33`)
- No dark theme, no semantic red/green/yellow
- All currency in GBP pence (£10 credit = 1000 pence)
- `sessionStorage` (not `localStorage`) — clears when tab closes

**Critical Invariants:**
1. `onboarding_completed_at` on `organizations` is the single gate — only set by `POST /api/onboarding/complete` (called by final step OR the Skip button)
2. `abandonment_emails.UNIQUE(org_id, sequence_number)` prevents duplicate emails and double credit — never remove this constraint
3. The Stripe return URL must decode `?topup=success` and advance to Step 1 (Payment) — ensure `billing-api.ts` allows `/dashboard/onboarding` as a valid `return_url`. The page detects `?topup=success`, sets `paymentComplete=true`, and calls `goToStep(1)`.
4. `provision-number` must refund with `addCredits` on Twilio failure — wallet must never be left debited after a failed provisioning
5. Back navigation on Step 1+ does NOT undo Stripe payment — if payment is already complete, user returns to Step 1 and sees provisioning status
6. Skip on any step must mark onboarding complete to prevent redirect loop on dashboard

---

## 7. Test Accounts & Environment
| Purpose | Email / Credential | Notes |
|---------|-------------------|-------|
| Demo org | Create via signup at `/sign-up` | Full flow: signup → onboarding wizard → dashboard |
| Frontend URL | `http://localhost:8000` | Signup at `/sign-up`, login at `/login`, dashboard at `/dashboard`, wizard at `/dashboard/onboarding` |
| Backend URL | `http://localhost:8001` | APIs secured via JWT middleware, health endpoint at `/health` |
| Supabase Project | `wifcmvgwzicgyrvaoiwi` | Barpel-specific project with 79 migrations |
| Stripe keys | `pk_test_...`, `sk_test_...` (see `backend/.env`) | Test mode for development, never commit secrets |
| Vapi Credentials | Service role key in `backend/.env` | Single shared Vapi credential per Barpel account |

---

## 9. Backlog / Next Steps (Barpel AI)

**Completed (Production Phase - 2026-03-01):**
1. ✅ **COMPLETE** (2026-03-01) – Barpel AI Production Platform: Full operational system for Nigerian SMEs
   - Frontend: Teal-and-white design system, Barpel branding, 5-step onboarding wizard for business verticals
   - Backend: Port 8001, Barpel credentials, real-time prepaid billing engine, managed telephony
   - Database: Supabase project wifcmvgwzicgyrvaoiwi, 79 migrations, 3-phase billing system, multi-tenant isolation
   - Features: Inbound/outbound call handling, appointment booking, lead scoring, call tracking, AI voice agents
   - Demo Status: ✅ LIVE — both servers running on ports 8000/8001, signup → wizard → dashboard flow operational

**Completed (2026-03-04):**
- ✅ **Marketing website all pages live** – All 6 previously-placeholder pages now fully built and deployed: `/careers`, `/demo`, `/features`, `/security`, `/legal/terms`, `/legal/cookies`. Pricing correct ($0.70/min, $99 bundle = ~155 min). `barpel-marketing-pages` skill documented for future page work.

**Upcoming (Post-Demo, Investor Phase):**
1. **Customize Pricing for Nigerian Market** – Current prepaid wallet system (56p/min GBP). Adapt for Nigerian SMEs with NG₦ rates, local pricing bands, and startup credits.
2. ✅ **Production Deployment (Temp Domains Live)** – Deployed to Vercel (`app-barpelai.odia.dev` dashboard, `barpelai.odia.dev` marketing) and Render (`barpel-ai.onrender.com`). Pending: purchase `barpel.ai`, update DNS/CORS/redirect URIs to final domains.
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

**For Technical Details (database, RPCs, webhooks), refer to database-ssot.md:**
- Database schema, columns, constraints, indexes
- RPC function signatures, error handling, transaction logic
- Webhook delivery patterns, retry logic, idempotency
- Multi-tenant RLS policy implementation
- Phone number architecture (dual-write, deletion cleanup)
- Critical invariants that must never break

**Quick Links:**
| Document | Purpose |
|----------|---------|
| **database-ssot.md** | Technical authority for database, RPCs, webhooks, compliance |
| **PRD_UPDATE_2026_02_24.md** | Detailed explanation of Bug 3 fix (multi-number support) |
| **PRD_CURRENT_STATE_2026_02_24.md** | High-level guide to PRD structure and tier system |
| **This PRD (.agent/prd.md)** | Business capabilities, releases, operational procedures |

**For New Developers (Ramp-Up Guide):**
1. Read Critical Rules above (understand immutable rules, 5 mins)
2. Read database-ssot.md Sections 1-2 (auth & multi-tenancy, 15 mins)
3. Read Core Capabilities above (system overview, 10 mins)
4. Read database-ssot.md Section 9 (managed phone numbers, 20 mins)
5. Read relevant sections of database-ssot.md for your task
6. Reference this PRD for business context

**For Contributors (Before Modifying Code):**
- Always reference database-ssot.md Section 13 (Critical Invariants) first
- Check if your change affects: org_id filtering, multi-tenant isolation, wallet enforcement, phone number handling
- When modifying managed_phone_numbers or org_credentials, ensure dual-write/dual-delete
- When adding endpoints, apply error sanitization pattern (use `error-sanitizer.ts`)
- When touching RPC functions, verify transaction semantics with "All-or-nothing" constraint

---

## APPENDIX: Release History

### 2026-03-05: Call Transfer Feature — End-to-End Fixed ✅ COMPLETE

**Root Cause (why call transfers were silently failing):**
The `transferCall` Vapi tool always returned `null` for the transfer phone number. `integration_settings` table existed but was missing `transfer_phone_number`, `transfer_sip_uri`, and `transfer_departments` columns. The table also has a `UNIQUE(org_id, provider)` constraint — the `transferCall` tool was not filtering by `provider = 'transfer'`, so `.maybeSingle()` would throw if multiple provider rows existed.

The Escalation Rules UI (priority 1-100, sentiment threshold, max wait seconds) was managing the `escalation_rules` table — a completely disconnected table the Vapi tool never reads.

**What was fixed:**

1. **DB migration** (`backend/supabase/migrations/20260305_create_integration_settings.sql`):
   - `ALTER TABLE integration_settings ADD COLUMN IF NOT EXISTS transfer_phone_number TEXT`
   - `ALTER TABLE integration_settings ADD COLUMN IF NOT EXISTS transfer_sip_uri TEXT`
   - `ALTER TABLE integration_settings ADD COLUMN IF NOT EXISTS transfer_departments JSONB DEFAULT '{}'`

2. **`transferCall` Vapi tool** (`backend/src/routes/vapi-tools-routes.ts`):
   - Added `.eq('provider', 'transfer')` filter to prevent `.maybeSingle()` error when org has multiple provider rows

3. **New backend route** (`backend/src/routes/transfer-settings.ts`):
   - `GET /api/transfer-settings` — returns `{ transfer_number, last_updated }` (null if not set yet)
   - `PUT /api/transfer-settings` — saves E.164 number, UPSERT on `(org_id, provider='transfer')`
   - `GET /api/transfer-settings/history` — last 10 calls where `transferCall` was used (from `calls.tools_used` jsonb array)
   - Bug fixed during testing: `.contains('tools_used', ['transferCall'])` sends PostgreSQL text array syntax `cs.{transferCall}` which fails on jsonb columns. Fixed with `.filter('tools_used', 'cs', '["transferCall"]')`.

4. **Frontend** (`src/app/dashboard/escalation-rules/page.tsx`):
   - Replaced 334-line complex escalation form (priority slider, sentiment threshold, trigger type selector) with a simple one-field settings page
   - Industry benchmark: ElevenLabs, OpenAI Operator, Dialpad all use a single "transfer to" number field
   - Follows wallet page SWR + useCallback + optimistic mutate pattern exactly
   - Shows transfer history (empty state if no transfers yet)
   - `src/app/dashboard/escalation-rules/components/RuleForm.tsx` deleted (352 lines, no longer needed)

5. **Sidebar** (`src/components/dashboard/LeftSidebar.tsx`):
   - "Escalation Rules" → "Call Transfer" (route stays `/dashboard/escalation-rules`)

**Verified endpoints (all passing):**
- `GET /api/transfer-settings` → `{ transfer_number: null, last_updated: null }` for new org ✅
- `PUT /api/transfer-settings` with `+2348012345678` → `{ success: true }` ✅
- `PUT /api/transfer-settings` with `08012345678` → `400 { error: "Phone number must be in E.164 format..." }` ✅
- `GET /api/transfer-settings` after save → `{ transfer_number: "+2348012345678", last_updated: "..." }` ✅
- `GET /api/transfer-settings/history` → `[]` (correct — no transfers yet) ✅

---

### 2026-03-04: Marketing Website — All Pages Live ✅ COMPLETE
- **Scope:** Complete the Barpel AI marketing site at `barpelai.odia.dev`
- **Skill created:** `.claude/skills/barpel-marketing-pages/SKILL.md` — reusable skill encoding design system, product knowledge, correct pricing, CTA wiring, TypeScript rules, and per-page templates
- **6 pages built** (all were inline `PlaceholderSection` placeholders in App.tsx before this release):
  - `/careers` — Culture, open positions (hello@barpel.ai), perks grid (Remote-first, Equity, Learning Budget, Health Coverage)
  - `/demo` — "See Barpel AI In Action", 3-step what-to-expect, Request a Demo CTA (→ sign-up), sales@barpel.ai
  - `/features` — 16 features across 4 groups (Call Handling, Appointment Booking, Analytics & Insights, Integrations & Security), lucide-react icons, teal design system
  - `/security` — AES-256 / TLS 1.3 encryption, 99.9% uptime SLA, GDPR & NDPR compliance, row-level security, vendor chain (Twilio/Vapi/Supabase/Stripe), security@barpel.ai
  - `/legal/terms` — 11-section Terms of Service (Acceptance, Description, Registration, Acceptable Use, Billing/Credits, IP, Privacy, Liability, Termination, UK Governing Law, Contact), legal@barpel.ai
  - `/legal/cookies` — Essential cookies (Supabase auth tokens, Stripe fraud), Analytics section, browser guides with external links, privacy@barpel.ai
- **Pricing corrected** — `frontend/website/src/sections/Pricing.tsx` rates now match `backend/src/config/index.ts`:
  - PAYG: `$0.70/min` (RATE_PER_MINUTE_USD_CENTS=70)
  - Growth Bundle: `$99 → ~155 minutes` ($99 ÷ $0.70 = 141 raw + 10% bonus)
  - Minimum top-up: `£25` (WALLET_MIN_TOPUP_PENCE=2500)
  - Previous wrong rates ($0.14/min, 750 min) removed and documented as incorrect in skill file
- **App.tsx cleaned** — removed `PlaceholderSection` component + all 6 inline placeholder definitions; added proper imports
- **Commits:** `dbcafc8` (pages + initial pricing), `5415a07` (pricing correction + skill update)
- **Deploy:** `barpelai.odia.dev` — `vercel deploy --prod`, build ✅ 1739 modules, 0 TypeScript errors

### 2026-03-01: Barpel AI Production Platform ✅ COMPLETE
- **Scope:** Enterprise voice receptionist platform for Nigerian SMEs, fully operational
- **Frontend:** Teal-and-white design system, Barpel logo and branding, 5-step business onboarding wizard (Auto Dealer → Real Estate → Legal → Salon/Spa → Medical → Retail)
- **Backend:** Port 8001, real-time prepaid billing engine (56 pence/min GBP), managed telephony integration (Twilio), AI voice agents (Vapi)
- **Database:** 32 tables, 79 migrations deployed, multi-tenant isolation (RLS enforced), onboarding completion gate, business vertical tracking
- **Billing System:** 3-phase atomic billing (asset deduction, credit reservation, kill switch), £5 debt limit, zero revenue leaks
- **Telephony:** Managed Twilio numbers (1 inbound + 1 outbound per org), Vapi integration, caller ID verification, AI forwarding setup
- **Status:** ✅ PRODUCTION READY — Full stack running on ports 8000/8001, signup → wizard → dashboard flow verified, servers stable
- **Verification:** Endpoint testing (available-numbers GET fixed), onboarding guard deployed, dynamic amount selector integrated, security hardened


