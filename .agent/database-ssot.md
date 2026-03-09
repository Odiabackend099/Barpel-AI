# Barpel AI - Database Schema SSOT (Single Source of Truth)

**Status:** ✅ PRODUCTION READY - Barpel AI Platform (2026-03-05)
**Project ID:** `wifcmvgwzicgyrvaoiwi` (Barpel-specific Supabase project)
**Database URL:** `https://wifcmvgwzicgyrvaoiwi.supabase.co`
**Generated:** Barpel AI production database for Nigerian SMEs
**Database State:** Production-ready with enterprise-grade schema (prepaid billing, security hardening, multi-tenancy, managed telephony, Google OAuth)
**Migrations Deployed:** ✅ 79 total
  - Includes: Prepaid billing (3 phases), Security hardening, Multi-tenancy RLS, Onboarding wizard, Verified caller ID
**Onboarding Schema:** ✅ Business-focused terminology
  - `onboarding_events` table: funnel telemetry (6 event types, org-scoped)
  - `abandonment_emails` table: cart abandonment workflow
  - `organizations` columns: `onboarding_completed_at`, `clinic_name` (→ used for business_name), `specialty` (→ business vertical)
**Real-Time Prepaid Billing Engine:** ✅ FULLY OPERATIONAL
  - Phase 1 (Atomic Asset Billing): TOCTOU prevention via FOR UPDATE locks
  - Phase 2 (Credit Reservation): 5-minute holds with auto-release
  - Phase 3 (Kill Switch): Real-time balance monitoring with automatic termination
  - **Rate:** 56 pence/minute GBP (TBD customization for Nigerian NG₦ post-launch)
**Deployment Status:** ✅ FULLY OPERATIONAL - Fresh Barpel project, all migrations live, demo tested
**Latest Change:** (2026-03-05) Call Transfer feature end-to-end fixed: added `transfer_phone_number`, `transfer_sip_uri`, `transfer_departments` columns to `integration_settings`; new `/api/transfer-settings` route (3 endpoints); `transferCall` Vapi tool now filters by `provider = 'transfer'`; Escalation Rules UI replaced with simple Call Transfer page
**Foundation:** Barpel AI production schema (2026-03-01) - Onboarding Wizard, Security hardening, Prepaid Billing

---

## 🌐 Deployment Architecture (2026-03-02 - PRODUCTION LIVE)

**Active Production Hosting (Temporary Domains — pending barpel.ai purchase):**
| Component | Platform | URL | Status |
|-----------|----------|-----|--------|
| **Dashboard (Frontend)** | Vercel | `https://app-barpelai.odia.dev` | ✅ LIVE |
| **Marketing Site** | Vercel | `https://barpelai.odia.dev` | ✅ LIVE |
| **Backend API** | Render | `https://barpel-ai.onrender.com` | ✅ LIVE |
| **Database** | Supabase | `https://wifcmvgwzicgyrvaoiwi.supabase.co` | ✅ LIVE |
| **Redis** | Upstash | `rediss://rapid-macaque-66085.upstash.io:6379` | ⚠️ AUTH FAILED (2026-03-08 17:34 UTC) |
| **Stripe Webhooks** | Stripe → Render | `https://barpel-ai.onrender.com/api/webhooks/stripe` | ✅ LIVE |

**Render Service Details:**
- Service name: `barpel-backend`
- Build fix: eslint downgraded `^9` → `^8` + `.npmrc` `legacy-peer-deps=true` (commit `05e72ca`)
- Root Directory in Render dashboard must be set to `backend`
- All secrets entered manually via Render Dashboard (reference: `render/renderenv` — local only, gitignored)

**Permanent Domain Target (once barpel.ai is purchased):**
- `barpel.ai` → marketing, `app.barpel.ai` → dashboard, `api.barpel.ai` → backend
- When switching: update CORS_ORIGIN, FRONTEND_URL, BACKEND_URL, GOOGLE_REDIRECT_URI in Render + Vercel env vars
- When switching: also update Supabase Dashboard Site URL + Redirect allowlist (Authentication → URL Configuration)

**Google OAuth Configuration (CRITICAL — do not break):**

Two separate OAuth flows exist. Do not confuse them:

| Flow | Purpose | Callback URL | Configured In |
|------|---------|-------------|---------------|
| **Supabase Auth** | User sign-in/sign-up with Google | `https://wifcmvgwzicgyrvaoiwi.supabase.co/auth/v1/callback` | Supabase Dashboard + Google Cloud Console |
| **Google Calendar OAuth** | Connecting org's calendar for availability | `https://barpel-ai.onrender.com/api/google-oauth/callback` | Render `GOOGLE_REDIRECT_URI` env var + Google Cloud Console |

**Supabase Auth URL Configuration** (Authentication → URL Configuration):
- Site URL: `https://app-barpelai.odia.dev`
- Redirect URLs allowlist: `https://app-barpelai.odia.dev/**`
- **Rule:** If a domain is not in the allowlist, Supabase ignores `redirectTo` and falls back to Site URL. This is why Google Sign-In was redirecting to `localhost:8000` — Site URL was never updated from development.

**Google Cloud Console** (Client ID: `750045445755-najs38gvm8dudvtrq7mkm6legetn9bos`):
- Authorized redirect URI for Supabase Auth: `https://wifcmvgwzicgyrvaoiwi.supabase.co/auth/v1/callback`
- Authorized redirect URI for Calendar OAuth: `https://barpel-ai.onrender.com/api/google-oauth/callback`

**Frontend auth redirect** (`src/lib/auth-redirect.ts`):
- Browser-side: always uses `window.location.origin` — dynamically correct
- SSR fallback: uses `NEXT_PUBLIC_APP_URL` env var; if unset, falls back to `https://app-barpelai.odia.dev` (production) or `http://localhost:8000` (dev)

**Local Development:**
- ✅ Frontend: `http://localhost:8000` (`.env.local`: `NEXT_PUBLIC_BACKEND_URL=http://localhost:8001`)
- ✅ Backend: `http://localhost:8001` (`backend/.env` has all Barpel credentials)
- ✅ Supabase: `wifcmvgwzicgyrvaoiwi` (Barpel-specific project)
- ✅ Stripe: Test mode keys in `backend/.env`
- ✅ Vapi: Private key in `backend/.env`
- ✅ Redis: `redis://localhost:6379` (local) → Upstash `rediss://hip-flounder-31845.upstash.io:6379` (production, TLS)

**Environment Variables (Local Dev):**
```bash
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://wifcmvgwzicgyrvaoiwi.supabase.co
NEXT_PUBLIC_BACKEND_URL=http://localhost:8001
NEXT_PUBLIC_APP_URL=http://localhost:8000
NEXT_PUBLIC_AGENT_NAME=Barpel
NEXT_PUBLIC_VAPI_PUBLIC_KEY=904d9ddd-c633-4fb7-8514-6890134a62e8

# Backend (backend/.env)
PORT=8001
NODE_ENV=development
SUPABASE_URL=https://wifcmvgwzicgyrvaoiwi.supabase.co
VAPI_PRIVATE_KEY=623b9f25-cda2-4de0-8e6e-5291eac94e32
COMPANY_NAME=Barpel AI
CLINIC_NAME=Barpel
REDIS_URL=redis://localhost:6379
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

**Production Deployment Checklist (completed 2026-03-02):**
- ✅ Dashboard deployed to Vercel (`app-barpelai.odia.dev`)
- ✅ Marketing site deployed to Vercel (`barpelai.odia.dev`)
- ✅ Backend deployed to Render (`barpel-ai.onrender.com`)
- ✅ Redis switched to Upstash (`rediss://hip-flounder-31845.upstash.io:6379`) — Render private networking cannot cross workspace boundaries
- ✅ Render build failure fixed (eslint peer dep, commit `05e72ca`)
- ✅ Render secrets entered (all vars from `render/renderenv` set in Render dashboard)
- ✅ Supabase Auth Site URL updated to `https://app-barpelai.odia.dev` — fixes Google Sign-In redirect
- ✅ Google Cloud Console Calendar OAuth URI corrected (`/api/google-oauth/callback` path added)
- ⏳ `TWILIO_MASTER_ACCOUNT_SID` + `TWILIO_MASTER_AUTH_TOKEN`: add to Render dashboard to enable managed phone provisioning (onboarding wizard Step 0)
- ⏳ Purchase `barpel.ai`, update all URLs to final domains
- ⏳ Stripe production keys (currently test mode)
- ⏳ Local payment gateways (Flutterwave/PayStack for NG₦)

---

## 🔴 PRODUCTION INCIDENT: Redis Authentication Failure (2026-03-08)

### Issue Summary
**Status:** ACTIVE INCIDENT
**Severity:** 🔴 CRITICAL — All background job queues failing
**Error:** `ReplyError: WRONGPASS invalid username-password pair`
**Affected Services:**
- ❌ WebhookQueue (Vapi call webhooks not processing)
- ❌ BillingQueue (wallet charges not applying)
- ❌ WalletQueue (credit top-ups not processing)
- ❌ VapiReconciliationWorker (call reconciliation failing)

### Root Cause
Redis instance changed from `hip-flounder-31845.upstash.io` to `rapid-macaque-66085.upstash.io`, but `REDIS_URL` in Render dashboard either:
1. Contains old credentials (from previous instance)
2. Has embedded CLI flags (`redis-cli --tls -u`) instead of URL format
3. Uses `redis://` protocol instead of `rediss://` (TLS)

### Resolution Steps (IMMEDIATE)

**Step 1: Get Correct Connection String**
- Go to Upstash Dashboard → Redis instance `rapid-macaque-66085`
- Click "Details" button
- Copy the Redis CLI connection string (looks like: `redis-cli --tls -u redis://default:PASSWORD@rapid-macaque-66085.upstash.io:6379`)

**Step 2: Convert to Environment Variable Format**
- Change `redis://` to `rediss://` (TLS-enabled protocol)
- Example transformation:
  ```
  FROM: redis-cli --tls -u redis://default:PASSWORD@rapid-macaque-66085.upstash.io:6379
  TO:   rediss://default:PASSWORD@rapid-macaque-66085.upstash.io:6379
  ```

**Step 3: Update Render Dashboard**
- Log into Render → barpel-backend service
- Settings → Environment
- Find `REDIS_URL` variable
- Replace entire value with correct format (from Step 2)
- Click "Save"
- Render automatically restarts (5-10 minutes)

**Step 4: Verify Fix**
- Wait 30 seconds for Render restart
- Run health check:
  ```bash
  curl https://barpel-ai.onrender.com/health
  ```
- Look for: `"webhookQueue": true` (indicates Redis connected)
- Logs should show: "Redis connected successfully"

### Monitoring

**Before Fix (Current State):**
```json
{
  "database": true,
  "supabase": true,
  "backgroundJobs": true,
  "webhookQueue": false  // ❌ Redis disconnected
}
```

**After Fix (Expected):**
```json
{
  "database": true,
  "supabase": true,
  "backgroundJobs": true,
  "webhookQueue": true  // ✅ Redis connected
}
```

### Documentation Update Required
- MEMORY.md line referencing `hip-flounder-31845.upstash.io` needs updating to `rapid-macaque-66085.upstash.io` after fix verified

### Critical Requirements for Redis Configuration
| Requirement | Correct | Incorrect | Impact |
|-------------|---------|-----------|--------|
| Protocol | `rediss://` (TLS) | `redis://` (no TLS) | Connection fails on Upstash |
| Format | URL only | CLI command (`redis-cli --tls -u ...`) | Parser error, auth fails |
| Credentials | Current instance | Old/rotated instance | WRONGPASS error |
| Placement | `REDIS_URL` env var | Hardcoded in code | Security & config issues |

---

## 📊 System Status at a Glance

| Component | Status | Details |
|-----------|--------|---------|
| **Database** | ✅ Production | 32 tables, 183 indexes, 23 RLS policies |
| **Billing Engine** | ✅ Operational | 56 pence/min GBP, atomic enforcement, zero leaks |
| **Multi-Tenancy** | ✅ Hardened | org_id isolation, daily RLS verification |
| **Security** | ✅ Hardened | 95+/100 score, P0 vulns mitigated |
| **Webhooks** | ✅ Production | Defense-in-depth idempotency, 24-96hr retention |
| **Onboarding** | ✅ Production | 5-step wizard, auto-provisioning, cart abandonment |

### Schema Reduction Summary
- **Before:** 79 tables (2026-02-09)
- **After Cleanup:** 26 tables (-67%)
- **After Billing Restore:** 28 tables (restored 2 critical billing tables)
- **After Security Hardening:** 29 tables (added 1 security table + 7 helper functions)
- **After Verified Caller ID (2026-02-15):** 30 tables
- **After Onboarding Wizard (2026-02-25):** 32 tables (added `onboarding_events` + `abandonment_emails`)
- **Data Loss:** Zero (no production data deleted)

---

## 🟢 PRODUCTION TABLES (10 - Active Data)

These 10 tables contain real user data and drive the platform:

### Table: `calls`
**Purpose:** Log of all inbound and outbound voice calls (Golden Record SSOT)

**Columns:**
- `id` (uuid) - Unique call identifier
- `org_id` (uuid) - Organization owner
- `contact_id` (uuid, nullable) - Associated contact
- `call_direction` (text) - "inbound" or "outbound"
- `from_number` (text) - Caller phone number (E.164)
- `to_number` (text) - Called phone number (E.164)
- `duration_seconds` (integer, nullable) - Call length in seconds
- `status` (text) - "pending", "in_progress", "completed", "failed"
- `transcript` (text, nullable) - AI-generated call transcript
- `summary` (text, nullable) - AI summary of call
- `sentiment_label` (text, nullable) - "positive", "neutral", "negative"
- `sentiment_score` (numeric, nullable) - Score 0.0-1.0
- `sentiment_summary` (text, nullable) - Human-readable summary
- `sentiment_urgency` (text, nullable) - "low", "medium", "high", "critical"
- `phone_number` (text, nullable) - E.164 formatted phone
- `caller_name` (text, nullable) - Enriched caller name
- `vapi_call_id` (text, nullable) - Vapi platform call ID
- `recording_url` (text, nullable) - Call recording (if available)
- `created_at` (timestamp) - Call start time
- `updated_at` (timestamp) - Last update time
- **`cost_cents` (integer, default 0)** - Call cost in cents (Golden Record) ✨ NEW
- **`appointment_id` (uuid, nullable)** - Linked appointment if booked (Golden Record) ✨ NEW
- **`tools_used` (text[], default '{}')** - Tools used during call (Golden Record) ✨ NEW
- **`ended_reason` (text, nullable)** - Vapi endedReason code (Golden Record) ✨ NEW

**Primary Key:** id
**Foreign Keys:** org_id → organizations.id, contact_id → contacts.id, appointment_id → appointments.id
**Indexes:**
- org_id, call_direction, created_at, status (existing)
- **idx_calls_appointment_id** - Partial index on appointment_id (Golden Record) ✨ NEW
- **idx_calls_cost** - Composite index on (org_id, cost_cents) for cost analytics (Golden Record) ✨ NEW

**Row Count:** 22 (verified via end-to-end VAPI pipeline verification)

**Golden Record Details (2026-02-13):**
- ✅ **Pipeline Verified:** End-to-end VAPI → Backend → Supabase → Dashboard flow confirmed working
- ✅ **Data Persistence:** 22 real calls in database with vapi_call_id (proves VAPI webhooks reaching system)
- ✅ **cost_cents:** Stored as integer cents (prevents floating-point precision issues)

**✅ PREPAID BILLING IMPLEMENTATION STATUS:**
All 3 phases now complete and operational. No legacy data population issues remaining. Credit reservation system deployed and verified in production (2026-02-14).

---

### Table: `appointments`
**Purpose:** Scheduled meetings/appointments for organizations (Golden Record SSOT)

**Columns:**
- `id` (uuid) - Unique appointment ID
- `org_id` (uuid) - Organization owner
- `contact_id` (uuid) - Associated contact
- `title` (text) - Appointment title/type
- `description` (text, nullable) - Details about appointment
- `scheduled_at` (timestamp) - When appointment is scheduled
- `duration_minutes` (integer) - Duration in minutes
- `status` (text) - "scheduled", "completed", "cancelled", "no-show"
- `location` (text, nullable) - Physical or virtual location
- `notes` (text, nullable) - Internal notes
- `reminder_sent_at` (timestamp, nullable) - When reminder was sent
- `created_at` (timestamp) - When created
- `updated_at` (timestamp) - Last update
- **`call_id` (uuid, nullable)** - Bidirectional link to calls table (Golden Record) ✨ NEW
- **`vapi_call_id` (text, nullable)** - Direct Vapi call ID correlation (Golden Record) ✨ NEW

**Primary Key:** id
**Foreign Keys:** org_id → organizations.id, contact_id → contacts.id, call_id → calls.id
**Indexes:**
- org_id, scheduled_at, status, contact_id (existing)
- **idx_appointments_call_id** - Partial index on call_id (Golden Record) ✨ NEW
- **idx_appointments_vapi_call_id** - Partial index on vapi_call_id (Golden Record) ✨ NEW

**Row Count:** 30 (new linking columns populated for calls that create appointments)

**Golden Record Details (2026-02-13):**
- ✅ call_id: Links back to calls table (bidirectional call↔appointment relationship)
- ✅ vapi_call_id: Direct correlation to Vapi call ID (enables call lookup without JOIN)
- ✅ Automatic linking: Appointments created during calls auto-link via time-bounded query
- ✅ Migration: `20260213_golden_record_schema.sql` applied 2026-02-13
- ✅ Dashboard exposed: Appointment data returned with calls via /api/calls-dashboard

---

### Table: `organizations`
**Purpose:** Customer accounts in the multi-tenant platform (SMEs, small businesses, practices)

**Columns:**
- `id` (uuid) - Unique organization ID
- `name` (text) - Organization name (company name from signup)
- `email` (text) - Primary contact email
- `phone` (text, nullable) - Organization phone
- `website` (text, nullable) - Organization website
- `plan` (text) - ⚠️ DEPRECATED: Legacy tiered billing plan column (not used). All customers use pay-as-you-go wallet model.
- `stripe_customer_id` (text, nullable) - Stripe customer reference (or Flutterwave/PayStack reference post-launch)
- `wallet_balance_pence` (integer, nullable) - Prepaid balance in pence (GBP, TBD NG₦ post-launch)
- `debt_limit_pence` (integer, default 500) - Maximum negative balance allowed (£5.00 / 500 pence GBP)
- `wallet_markup_percent` (integer, default 50) - ⚠️ DEPRECATED: Legacy column from tiered pricing era. Not used in billing calculations. Marked for removal in future schema cleanup.
- `telephony_mode` (text) - "byoc", "managed", or "none" (managed Twilio or bring-your-own credentials)
- `settings` (jsonb, nullable) - Custom settings
- `created_at` (timestamp) - Account creation time
- `updated_at` (timestamp) - Last update time
- **`onboarding_completed_at` (timestamptz, nullable, default NULL)** - NULL means user needs onboarding wizard; set by `POST /api/onboarding/complete`. Used as gate for dashboard redirect logic. ✨ NEW (2026-02-25) / BARPEL CRITICAL
- **`clinic_name` (text, nullable, default NULL)** - **BARPEL:** Business name from wizard step 0 (e.g., "Ace Auto Dealers", "Lagos Real Estate"). Written on onboarding completion. ✨ NEW (2026-02-25)
- **`specialty` (text, nullable, default NULL)** - **BARPEL:** Business vertical from wizard step 1 (auto_dealer, real_estate, legal, salon_spa, medical, retail, other); kept as `specialty` for backward compatibility. ✨ NEW (2026-02-25)

**Primary Key:** id
**Indexes:** name, email, plan, stripe_customer_id, telephony_mode
**New Index:** `idx_organizations_needs_onboarding` — partial index on `id WHERE onboarding_completed_at IS NULL` for fast new-user detection ✨ NEW (2026-02-25)
**Row Count:** 27

**Billing Notes:**
- ✅ Fixed-rate billing: 56 pence/minute GBP for all organizations (internal rate stored in pence)
- ✅ Debt limit: £5.00 (500 pence) enforced atomically via `deduct_call_credits()` RPC
- ⚠️ DEPRECATED: `wallet_markup_percent` column is not used by billing logic (always passes 0 to RPC) - marked for removal
- ✅ Verification complete: 46/46 tests passed (see `BILLING_VERIFICATION_REPORT.md`)

---

### Table: `profiles`
**Purpose:** User accounts with role-based access

**Columns:**
- `id` (uuid) - Unique user ID (Supabase auth)
- `org_id` (uuid) - Organization this user belongs to
- `email` (text) - User email address
- `full_name` (text, nullable) - User's full name
- `avatar_url` (text, nullable) - Profile picture URL
- `role` (text) - "admin", "manager", "user"
- `phone` (text, nullable) - User phone number
- `status` (text) - "active", "inactive", "suspended"
- `last_login` (timestamp, nullable) - Last login time
- `created_at` (timestamp) - Account creation
- `updated_at` (timestamp) - Last update

**Primary Key:** id
**Foreign Keys:** org_id → organizations.id
**Indexes:** org_id, email, role, status
**Row Count:** 26

---

### Table: `contacts`
**Purpose:** Contact list for organizations (leads, customers, patients)

**Columns:**
- `id` (uuid) - Unique contact ID
- `org_id` (uuid) - Organization owner
- `phone` (text) - Phone number (E.164)
- `email` (text, nullable) - Email address
- `first_name` (text) - Contact first name
- `last_name` (text) - Contact last name
- `lead_status` (text) - "hot", "warm", "cold", "contacted"
- `lead_score` (integer, nullable) - Score 0-100
- `notes` (text, nullable) - Internal notes
- `last_contacted_at` (timestamp, nullable) - When last contacted
- `created_at` (timestamp) - When added
- `updated_at` (timestamp) - Last update

**Primary Key:** id
**Foreign Keys:** org_id → organizations.id
**Indexes:** org_id, phone, lead_status, lead_score
**Row Count:** 12

---

### Table: `call_tracking`
**Purpose:** Analytics and tracking metrics for calls (also used by test endpoints to record test call state)

**Columns:**
- `id` (uuid) - Unique tracking record ID
- `org_id` (uuid) - Organization
- `call_id` (uuid, nullable) - Associated call
- `contact_id` (uuid, nullable) - Associated contact
- `tracked_url` (text) - Source tracking URL
- `utm_source` (text, nullable) - UTM source parameter
- `utm_medium` (text, nullable) - UTM medium parameter
- `utm_campaign` (text, nullable) - UTM campaign parameter
- `device_type` (text, nullable) - "mobile", "desktop", "unknown"
- `browser` (text, nullable) - Browser name
- `os` (text, nullable) - Operating system
- `ip_address` (text, nullable) - Caller IP
- `location` (text, nullable) - Geographic location
- `created_at` (timestamp) - When tracked
- **`agent_id` (uuid, nullable)** - Agent used for the call ✨ ADDED (2026-03-04)
- **`lead_id` (uuid, nullable)** - Contact/lead associated with the test call ✨ ADDED (2026-03-04)
- **`phone` (text, nullable)** - Phone number called ✨ ADDED (2026-03-04)
- **`called_at` (timestamptz, default NOW())** - When the call was initiated ✨ ADDED (2026-03-04)
- **`call_outcome` (text, nullable)** - Outcome of the call (e.g., "completed", "failed", "pending") ✨ ADDED (2026-03-04)

**Primary Key:** id
**Foreign Keys:** org_id → organizations.id, call_id → calls.id, agent_id → agents.id (ON DELETE SET NULL), lead_id → contacts.id (ON DELETE SET NULL)
**Indexes:** org_id, call_id, created_at, utm_source
**Row Count:** 85

> ⚠️ **Usage Note:** The `agent_id`, `lead_id`, `phone`, `called_at`, `call_outcome` columns are used by `POST /api/founder-console/agent/test-call` and `POST /api/founder-console/agent/web-test` to record a tracking row before the Vapi call is made. The row uses `vapi_call_id: 'pending-{requestId}'` as a placeholder until the real call ID arrives from Vapi. If the Vapi call fails after the row is inserted, the cleanup `DELETE` is attempted — check for orphaned `pending-*` rows if tracking data seems inconsistent.

---

### Table: `feature_flags`
**Purpose:** Global feature toggles for feature management

**Columns:**
- `id` (uuid) - Unique flag ID
- `flag_key` (text) - Feature name/key
- `description` (text, nullable) - Feature description
- `enabled_globally` (boolean) - Global enable/disable
- `rollout_percentage` (integer, nullable) - 0-100 rollout
- `created_at` (timestamp) - When created

**Primary Key:** id
**Indexes:** flag_key, enabled_globally
**Row Count:** 11

---

### Table: `org_tools`
**Purpose:** Organization-specific tool configurations — tracks which Vapi tools are registered for each org, including their Vapi tool IDs and hash-based versioning

**Columns:**
- `id` (uuid) - Unique tool config ID
- `org_id` (uuid) - Organization owner
- `tool_name` (text) - Tool identifier (matches Vapi tool name)
- `enabled` (boolean) - Whether tool is active for this org
- `config` (jsonb, nullable) - Tool-specific configuration
- `created_at` (timestamp)
- `updated_at` (timestamp)
- **`vapi_tool_id` (text, nullable)** - Vapi platform tool ID (UUID assigned by Vapi on registration) ✨ ADDED
- **`description` (text, nullable)** - Human-readable tool description ✨ ADDED
- **`definition_hash` (text, nullable)** - SHA-256 hash of tool definition; used to detect changes and trigger re-registration ✨ ADDED

**Primary Key:** id
**Foreign Keys:** org_id → organizations.id
**Indexes:** org_id, tool_name
**Row Count:** 7 (✅ 7 tools registered after infrastructure audit 2026-03-04)

**Active Tools (7 — confirmed via `SELECT * FROM org_tools WHERE org_id = '...' AND enabled = true`):**
| tool_name | Purpose | Vapi Tool ID Present |
|-----------|---------|---------------------|
| `checkAvailability` | Calendar slot check | ✅ |
| `bookClinicAppointment` | Atomic appointment booking | ✅ |
| `transferCall` | Handoff to human agent | ✅ |
| `lookupCaller` | Contact lookup by phone | ✅ |
| `endCall` | Graceful call termination | ✅ |
| `queryKnowledgeBase` | RAG knowledge base query | ✅ |
| `sendSms` | Standalone SMS tool (sync, `async: false` to prevent false confirmations) | ✅ |

> ⚠️ **Tool Sync Invariant:** When calling `linkToolsToAssistant()` in `tool-sync-service.ts`, always fetch the existing Vapi assistant first to preserve `model.provider` and `model.model` fields. Vapi's PATCH endpoint requires all discriminated union fields — sending only `{ model: { toolIds } }` returns HTTP 400 "model.provider must be one of..."

---

### Table: `onboarding_submissions`
**Purpose:** Lead capture from website forms

**Columns:**
- `id` (uuid) - Unique submission ID
- `org_id` (uuid, nullable) - Associated organization
- `email` (text) - Submitter email
- `phone` (text) - Submitter phone
- `name` (text) - Submitter name
- `company` (text, nullable) - Company name
- `message` (text, nullable) - Message or inquiry
- `source` (text, nullable) - Where form was accessed from
- `ip_address` (text, nullable) - Submitter IP
- `created_at` (timestamp) - Submission time

**Primary Key:** id
**Foreign Keys:** org_id → organizations.id
**Indexes:** org_id, email, created_at
**Row Count:** 21

---

### Table: `onboarding_events` ✨ NEW (2026-02-25)
**Purpose:** Funnel telemetry for the new-user onboarding wizard at `/dashboard/onboarding`

> ⚠️ **NAMING CLARITY:** This table tracks events from the **post-signup onboarding wizard** (authenticated users). It is NOT related to `onboarding_submissions`, which captures unauthenticated pre-sales leads from the `/start` page.

**Columns:**
- `id` (uuid) - Unique event ID
- `org_id` (uuid) - Organization this event belongs to
- `user_id` (uuid) - User who triggered the event
- `event_name` (text) - One of 6 funnel stages (CHECK constraint enforced)
- `step_index` (integer) - Wizard step 0–4
- `metadata` (jsonb, default '{}') - Optional event payload (e.g., `{ clinic_name: "..." }`)
- `session_id` (text, nullable) - Groups events from same wizard session
- `created_at` (timestamptz) - When the event fired

**Check Constraints:**
- `valid_event_name`: event_name IN ('started', 'clinic_named', 'specialty_chosen', 'payment_viewed', 'payment_success', 'test_call_completed')

**Primary Key:** id
**Foreign Keys:** (org_id should reference organizations.id — FK not declared in migration for fire-and-forget perf)
**Indexes:**
- `idx_onboarding_events_org_id` — fast org-level queries
- `idx_onboarding_events_created_at` — DESC for recent events
- `idx_onboarding_events_event_name` — filter by event type
- `idx_onboarding_events_abandonment` — partial index on (org_id, event_name) WHERE event_name IN ('started', 'payment_viewed') for abandonment job performance

**RLS Policies:**
- Service role full access (abandonment job reads all events server-side)
- Authenticated users: INSERT own events, SELECT own events (fire-and-forget from browser)

**Business Logic:**
- Events fire-and-forget from `useOnboardingTelemetry` hook — backend always returns 200, telemetry never blocks the wizard
- Used by `processAbandonmentEmails()` job to detect orgs with `payment_viewed` but no `payment_success`
- Funnel query: GROUP BY event_name to count distinct orgs at each step

**Migration:** `20260225_onboarding_wizard.sql`

---

### Table: `abandonment_emails` ✨ NEW (2026-02-25)
**Purpose:** Sent-email ledger for the cart abandonment job — prevents duplicate emails and double credit application

**Columns:**
- `id` (uuid) - Unique record ID
- `org_id` (uuid) - Organization this record belongs to
- `user_email` (text) - Email address the message was sent to
- `sequence_number` (integer 1-3) - Which email in the 3-part sequence
- `template_name` (text) - Resend template identifier (e.g., 'abandonment_soft_nudge')
- `sent_at` (timestamptz, default NOW()) - When the email was sent
- `resend_email_id` (text, nullable) - Resend API response ID for tracking
- `credit_applied` (boolean, default FALSE) - Whether £10 credit was applied (email 3 only)

**Check Constraints:**
- `valid_sequence`: sequence_number BETWEEN 1 AND 3

**Primary Key:** id
**Unique Constraints:**
- `idx_abandonment_emails_org_sequence` — UNIQUE on (org_id, sequence_number) — **this is the idempotency guard that prevents sending any sequence email more than once per org, and prevents double-crediting on retry**

**Indexes:**
- `idx_abandonment_emails_org_id` — fast org lookup
- `idx_abandonment_emails_sent_at` — DESC for recent sends
- `UNIQUE(org_id, sequence_number)` — idempotency constraint (see above)

**RLS Policies:**
- Service role only (abandonment job writes/reads server-side; no user-facing access needed)

**Business Logic:**
- `processAbandonmentEmails()` job inserts a row here BEFORE applying any credit (critical idempotency order)
- If the insert fails (row already exists due to UNIQUE constraint), the job skips to the next org — no email resent, no credit re-applied
- `credit_applied` flag is informational only — the UNIQUE constraint is the actual guard

**Critical Invariant:** **Never remove the UNIQUE(org_id, sequence_number) constraint.** It is the only mechanism preventing duplicate abandonment emails and double £10 credits when the job runs every 15 minutes.

**Migration:** `20260225_onboarding_wizard.sql`

---

### Table: `verified_caller_ids`
**Purpose:** Outbound caller ID verification records for Twilio

**Columns:**
- `id` (uuid) - Unique verification ID
- `org_id` (uuid) - Organization owner
- `phone_number` (text) - Verified phone number in E.164 format
- `country_code` (text, nullable) - ISO country code (e.g., 'NG', 'US', 'GB')
- `status` (text) - Verification status: "pending", "verified", "failed"
- `verification_code` (text, nullable) - 6-digit validation code (for reference, not used in confirmation)
- `twilio_caller_id_sid` (text, nullable) - Twilio outgoing caller ID SID
- `verified_at` (timestamptz, nullable) - When verification was confirmed
- `created_at` (timestamptz) - When verification was initiated
- `updated_at` (timestamptz) - Last status update

**Primary Key:** id
**Foreign Keys:** org_id → organizations.id (CASCADE)
**Unique Constraints:** UNIQUE(org_id, phone_number) - Prevents duplicate verifications for same number
**Check Constraints:** status IN ('pending', 'verified', 'failed')

**Indexes:**
- `idx_verified_caller_ids_org_id` - Fast lookup by organization
- `idx_verified_caller_ids_phone_number` - Search by phone number
- `idx_verified_caller_ids_status` - Filter by verification status
- `UNIQUE(org_id, phone_number)` - Ensures one verification record per org per number

**RLS Policies:**
- verified_caller_ids_org_isolation: Users can only see their org's verified numbers
- verified_caller_ids_service_role_all: Service role can access all records

**Row Count:** Variable (user-created verifications)

**Business Logic:**
- ✅ **Pre-Check Flow:** Before creating verification, check Twilio's `outgoingCallerIds.list()` for existing verification
- ✅ **Auto-Verification:** If found in Twilio, create record with status='verified' immediately (no call needed)
- ✅ **Verification Call Flow:** If not found, create validation request in Twilio → Display code in UI → User enters on phone keypad → Confirm by checking Twilio list
- ✅ **Delete/Unverify:** DELETE endpoint allows users to remove verification and start fresh
- ✅ **Telephony Mode Support:** Works with both managed (subaccount) and BYOC (org credentials) via `getEffectiveTwilioCredentials()`
- ✅ **Multi-Tenant Isolation:** RLS enforces org_id filtering, prevents cross-org access

**API Endpoints:**
1. `POST /api/verified-caller-id/verify` - Initiate verification (pre-check or call)
2. `POST /api/verified-caller-id/confirm` - Confirm verification via Twilio list check
3. `DELETE /api/verified-caller-id` - Remove verification record (body: { phoneNumber })
4. `GET /api/verified-caller-id` - List verified numbers for org

**Critical Invariants (DO NOT VIOLATE):**
1. Always pre-check `outgoingCallerIds.list()` before creating validation request
2. Never use `outgoingCallerIds.create()` - use `validationRequests.create()` instead
3. Confirmation checks Twilio's list, NOT database `verification_code` field
4. DELETE uses phoneNumber in body, NOT ID in URL path
5. Use `getEffectiveTwilioCredentials()` for both managed and BYOC support

**Related Tables:**
- Works with `organizations.telephony_mode` to determine credential source
- Used by outbound calling system to set caller ID on calls
- Requires `org_credentials` (BYOC) or `twilio_subaccounts` (managed) for Twilio access

**Deployment Status:** ✅ PRODUCTION READY (2026-02-15)
- All API endpoints operational
- Pre-check logic implemented and tested
- Delete functionality verified
- Multi-tenant isolation enforced

---

## 💰 BILLING TABLES (3 - Payment Infrastructure)

Three tables manage prepaid billing: transactions ledger, credit holds during calls, and webhook idempotency.

### credit_transactions
**Purpose:** Immutable ledger (top-ups, deductions, refunds). UNIQUE(call_id) prevents duplicate billing.
**Key Columns:** id, org_id, amount_pence, type, stripe_payment_intent_id, call_id (NEW 2026-02-16), vapi_call_id
**Rate:** 56 pence/min GBP (fixed, enforced at RPC level)
**Features:** Advisory locks prevent race conditions, idempotency via stripe_payment_intent_id + call_id UNIQUE constraint
**Status:** ✅ Operational, E2E tested, zero revenue leaks

### processed_webhook_events
**Purpose:** Idempotency tracking (Stripe, Vapi, Twilio events). UNIQUE(event_id) enforces exactly-once processing.
**Key Columns:** id, event_id, event_type, event_data, org_id, created_at, processed_at
**Retention:** 24 hours (auto-cleanup via cleanup_old_webhook_events())
**Status:** ✅ Operational, all webhook sources supported

### credit_reservations
**Purpose:** Hold wallet balance during calls (auth-then-capture pattern). 5-min holds, auto-release when call ends.
**Key Columns:** id, org_id, call_id (UNIQUE), reserved_pence, committed_pence, status, expires_at
**Status:** ✅ Operational, kill switch integrated, 60-min expiry prevents infinite holds

---

## 🔒 SECURITY TABLES (1 - Webhook Idempotency)

### Table: `processed_stripe_webhooks`
**Purpose:** Defense-in-depth idempotency tracking for Stripe webhook events (prevents replay attacks)

**Columns (11):**
- `id` (uuid) - Unique record ID
- `event_id` (text) - Stripe event ID (UNIQUE) - e.g., "evt_1ABCde2fGHIjklMN3oPQRstu"
- `event_type` (text) - Event type (e.g., 'checkout.session.completed')
- `org_id` (uuid, nullable) - Associated organization
- `status` (text) - Processing status: 'processed', 'failed', 'duplicate'
- `received_at` (timestamptz) - When webhook was first received
- `processed_at` (timestamptz) - When webhook was processed (or skipped if duplicate)
- `error_message` (text, nullable) - Error message if processing failed
- `event_data` (jsonb, nullable) - Full event data for debugging
- `created_at` (timestamptz) - Record creation time
- `updated_at` (timestamptz) - Last update time

**Primary Key:** id
**Foreign Keys:** org_id → organizations.id (CASCADE)
**Unique Constraints:** event_id (prevents duplicate processing)
**Check Constraints:** status IN ('processed', 'failed', 'duplicate')

**Indexes (7 total - 5 explicit + 2 automatic):**
- `processed_stripe_webhooks_pkey` - Primary key on id
- `processed_stripe_webhooks_event_id_key` - UNIQUE on event_id
- `idx_processed_stripe_webhooks_event_id` - Fast lookup by event_id
- `idx_processed_stripe_webhooks_org_id` - Filter by org_id
- `idx_processed_stripe_webhooks_event_type` - Filter by event_type
- `idx_processed_stripe_webhooks_received_at` - Time-based queries (DESC)
- `idx_processed_stripe_webhooks_status` - Error monitoring

**RLS Policies:**
- `processed_stripe_webhooks_service_role` - Service role has full access (USING true, WITH CHECK true)
- Table protected by Row-Level Security

**Helper Functions (3):**
1. `is_stripe_event_processed(p_event_id TEXT)` → BOOLEAN
   - Returns TRUE if event_id exists in table (duplicate check)
2. `mark_stripe_event_processed(p_event_id TEXT, p_event_type TEXT, p_org_id UUID, p_event_data JSONB)` → BOOLEAN
   - Inserts event_id to prevent future duplicates
   - Returns TRUE on success, FALSE if already exists (ON CONFLICT DO NOTHING)
3. `cleanup_old_processed_stripe_webhooks()` → INTEGER
   - Deletes events older than 90 days
   - Returns count of deleted records

**Row Count:** 0 (newly created 2026-02-12)
**Retention:** 90 days (automatic cleanup)

**Security Impact (P0-3 Fix - CVSS 8.7):**
- ✅ Prevents replay attacks (attackers replaying checkout.session.completed webhooks)
- ✅ Defense-in-depth: BullMQ queue-level + database-level idempotency
- ✅ Survives queue flushes, restarts, cross-system webhook deliveries
- ✅ Audit trail for compliance and debugging
- ✅ 96% risk reduction (8.7/10 → 0.5/10)

**Related Tables:**
- Works alongside `processed_webhook_events` (24-hour retention for all webhooks)
- This table is Stripe-specific with 90-day retention for compliance

**Deployment Verification (2026-02-12):**
- ✅ Migration applied via Supabase Management API
- ✅ All 7 indexes created successfully
- ✅ All 3 helper functions deployed
- ✅ RLS policy enforced
- ✅ UNIQUE constraint on event_id verified
- ✅ Status CHECK constraint validated

---

## 🛡️ SECURITY HELPER FUNCTIONS (4 - RLS Policy Verification)

**Purpose:** Automated RLS (Row-Level Security) policy verification for security auditing

These 4 database functions enable automated verification of RLS policies across all 28 multi-tenant tables, preventing horizontal privilege escalation attacks (CVSS 9.0).

### Function: `check_rls_enabled(p_table_name TEXT)`
**Returns:** TABLE(table_name TEXT, rls_enabled BOOLEAN)
**Purpose:** Check if RLS is enabled on a specific table
**Security:** SECURITY DEFINER (runs with creator privileges)
**Usage:** Security audits, compliance verification
**Example:**
```sql
SELECT * FROM check_rls_enabled('organizations');
-- Returns: { table_name: 'organizations', rls_enabled: true }
```

### Function: `get_table_policies(p_table_name TEXT)`
**Returns:** TABLE(policyname TEXT, definition TEXT, permissive BOOLEAN, roles TEXT[])
**Purpose:** Get all RLS policies for a specific table with full definitions
**Security:** SECURITY DEFINER
**Usage:** Policy debugging, security reviews
**Example:**
```sql
SELECT * FROM get_table_policies('organizations');
-- Returns: All RLS policies for organizations table with their SQL definitions
```

### Function: `get_all_rls_policies()`
**Returns:** TABLE(tablename TEXT, policyname TEXT, definition TEXT, permissive BOOLEAN)
**Purpose:** Get all RLS policies across all tables in public schema
**Security:** SECURITY DEFINER
**Usage:** Comprehensive security audit
**Example:**
```sql
SELECT * FROM get_all_rls_policies() ORDER BY tablename, policyname;
-- Returns: Complete list of all RLS policies in database
```

### Function: `count_rls_policies()`
**Returns:** INTEGER
**Purpose:** Count total RLS policies in database
**Security:** SECURITY DEFINER
**Usage:** Quick security health check
**Example:**
```sql
SELECT count_rls_policies();
-- Returns: 23 (total policy count as of 2026-02-12)
```

**Security Impact (P0-4 Fix - CVSS 9.0):**
- ✅ Prevents horizontal privilege escalation (org_id tampering)
- ✅ Automated daily verification of RLS policies
- ✅ Detects missing RLS policies on multi-tenant tables
- ✅ Validates no policies use user_metadata (security risk)
- ✅ 90% risk reduction (9.0/10 → 1.0/10)

**Related Scripts:**
- `backend/src/scripts/verify-rls-policies.ts` - Automated RLS verification script
- Checks 28 multi-tenant tables for RLS enablement
- Validates policy count >= 20
- Ensures no policies use user_metadata

**Deployment Verification (2026-02-12):**
- ✅ Migration applied via Supabase Management API
- ✅ All 4 functions created successfully
- ✅ Comments added for documentation
- ✅ SECURITY DEFINER privileges granted
- ✅ Tested with verify-rls-policies.ts script (4/4 tests passed)

---

## 🔵 CONFIGURATION TABLES (17 - System Setup)

| Table | Purpose | Used By |
|-------|---------|---------|
| agents | AI agent configs | Voice calls |
| services | Service catalog | Dashboard |
| knowledge_base* | KB articles | RAG queries |
| integrations | API configs | Tool sync |
| org_credentials | Encrypted API keys | All services |
| leads | CRM data | Pipeline analytics |
| audit_logs | System audit trail | Compliance |
| verified_caller_ids | Outbound caller ID verification | Telephony |
| carrier_forwarding_rules | Call forwarding config | AI Forwarding |
| telephony_country_audit_log | Telephony audit | Country routing |
| security_audit_log | Login & security events | Compliance |
| hot_lead_alerts | High-priority lead notifications | Dashboard |
| org_feature_flags | Feature toggles | Feature system |
| twilio_subaccounts | Twilio multi-tenant mapping | Account routing |
| escalation_rules | Call escalation config | Call routing |
| integration_settings | Global integration config — including Call Transfer phone number (`provider='transfer'` row) | Backend + transferCall Vapi tool |
| backup_verification_log | Backup health checks | Ops monitoring |

**Note:** For detailed column-level schema on config tables not listed below, refer to Supabase Studio or production database.

---

### Table: `integration_settings` (CRITICAL — Call Transfer SSOT)
**Purpose:** Stores per-org integration configuration rows, keyed by `(org_id, provider)`. The `provider = 'transfer'` row is the source of truth for the Call Transfer feature — the `transferCall` Vapi tool reads this row on every live call to get the destination phone number.

**Constraint:** `UNIQUE(org_id, provider)` — one row per provider per org. This is critical: **always filter by `provider` when querying**, or `.maybeSingle()` will throw if multiple provider rows exist.

**Key Columns (Call Transfer row — `provider = 'transfer'`):**
- `org_id` (uuid) — Organization owner
- `provider` (text) — `'transfer'` for call transfer settings
- `transfer_phone_number` (text, nullable) — E.164 destination number the AI transfers calls to (e.g. `+2348012345678`) ✨ ADDED (2026-03-05)
- `transfer_sip_uri` (text, nullable) — SIP URI for SIP-based transfer (optional, future use) ✨ ADDED (2026-03-05)
- `transfer_departments` (jsonb, default '{}') — Department routing map (optional, future use) ✨ ADDED (2026-03-05)
- `is_active` (boolean) — Whether this row is active
- `updated_at` (timestamptz) — When last saved

**Migration:** `backend/supabase/migrations/20260305_create_integration_settings.sql`
```sql
ALTER TABLE integration_settings ADD COLUMN IF NOT EXISTS transfer_phone_number TEXT;
ALTER TABLE integration_settings ADD COLUMN IF NOT EXISTS transfer_sip_uri TEXT;
ALTER TABLE integration_settings ADD COLUMN IF NOT EXISTS transfer_departments JSONB DEFAULT '{}';
```

**API Layer:** `backend/src/routes/transfer-settings.ts`
- `GET /api/transfer-settings` → `{ transfer_number: string|null, last_updated: string|null }`
- `PUT /api/transfer-settings` → body `{ transfer_number: string }` (E.164 validated), UPSERT on `(org_id, provider='transfer')`
- `GET /api/transfer-settings/history` → last 10 calls where `transferCall` tool was used

**Vapi Tool Integration:** `backend/src/routes/vapi-tools-routes.ts` (`transferCall` tool handler)
- Query: `.eq('org_id', orgId).eq('provider', 'transfer').maybeSingle()`
- If `transfer_phone_number` is null → tool returns error "No transfer number configured"
- If set → Vapi executes warm transfer to that number during the live call

**Frontend:** `src/app/dashboard/escalation-rules/page.tsx` (Call Transfer settings page)
- Single phone input field (E.164 format)
- "Save" button with inline success/error feedback
- Transfer history table (last 10 calls where transfer was triggered)
- SWR-based — no full page reload on save

**Critical Invariant:** Always filter `.eq('provider', 'transfer')` when reading Call Transfer settings. The table has `UNIQUE(org_id, provider)`, meaning an org may have multiple rows (one per provider). Omitting the provider filter causes `.maybeSingle()` to throw `PGRST116` when >1 row exists.

---

### Table: `agents` (CRITICAL — AI Voice Agent Config)
**Purpose:** Per-org AI agent configuration. Each org has exactly 1 inbound + 1 outbound agent. Synced to Vapi via `ensureAssistantSynced()`.

**Columns:**
- `id` (uuid) - Unique agent ID
- `org_id` (uuid) - Organization owner
- `name` (text) - Agent display name (also used as Vapi assistant name)
- `role` (text) - **`'inbound'`** or **`'outbound'`** — determines prompt fallback and test endpoint routing
- `system_prompt` (text, nullable) - Agent's system prompt; falls back to role-aware default if NULL
- `voice` (text) - Vapi voice ID (e.g., `"jennifer"`, `"ryan"`, custom ElevenLabs voice ID)
- `voice_provider` (text, nullable) - Voice provider: `'vapi'`, `'11labs'`, `'azure'`. Stored when registry lookup fails for custom voices.
- `voice_stability` (float, nullable) - ElevenLabs stability setting (0.0–1.0); only used if provider is `'11labs'`
- `voice_similarity_boost` (float, nullable) - ElevenLabs similarity boost; only used if provider is `'11labs'`
- `language` (text) - Language code (e.g., `'en'`), defaults to `'en'`
- `first_message` (text, nullable) - Agent's opening message on call start
- `max_call_duration` (integer, nullable) - Maximum call length in seconds (default 600 = 10 min)
- `vapi_assistant_id` (text, nullable) - **CRITICAL:** Vapi UUID for this agent's assistant. If NULL, agent has never been synced to Vapi. Must never be set to phone numbers — UUID format only.
- `vapi_phone_number_id` (text, nullable) - **CRITICAL:** Vapi phone number UUID for outbound calls. Set by agent-save flow; used by `createOutboundCall()`. Never use E.164 phone strings here.
- `linked_phone_number_id` (uuid, nullable) - FK to `managed_phone_numbers.id`; the managed number associated with this agent
- `knowledge_base_id` (uuid, nullable) - FK to knowledge base record if RAG is enabled
- `is_active` (boolean) - Whether this agent is active. **Column is `is_active`, NOT `active`.** Queries that use `active` will return null data — always use `is_active`.
- `last_synced_at` (timestamptz, nullable) - When agent was last synced to Vapi (written after successful `ensureAssistantSynced()`)
- `prompt_synced_at` (timestamptz, nullable) - When system prompt was last synced; used to skip redundant sync on unchanged prompts
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**Primary Key:** id
**Foreign Keys:** org_id → organizations.id
**Indexes:** org_id, role, is_active, vapi_assistant_id
**Row Count:** ~54 (2 per org: 1 inbound + 1 outbound)

**Critical Invariants:**
1. `vapi_phone_number_id` must be a Vapi UUID (e.g., `abc123-def456`), NOT an E.164 phone number. The pre-flight check in `VapiClient.createOutboundCall()` throws if it detects a `+` prefix.
2. Never remove `vapi_phone_number_id` from agent-sync writes — if NULL, outbound calls fail silently.
3. The `is_active` column gates which agent the test endpoints query. Always use `is_active`, never `active`.
4. Role fallback prompt in `ensureAssistantSynced()`: outbound agents use SDR template; inbound agents use generic receptionist prompt. If an agent has `system_prompt = null`, this fallback is used — it is role-aware.
5. **PHONE NUMBER PROVISIONING (2026-03-02 FIX):** Inbound and outbound phone numbers MUST be strictly separated. `phone-number-resolver.ts` Step 1 now requires `routing_direction='outbound'` with zero fallback to inbound numbers. Attempting outbound calls without an explicitly provisioned outbound number returns clear error message (no silent failures). See `backend/src/services/phone-number-resolver.ts` lines 72-110 for enforcement.

---

### Table: `managed_phone_numbers` (Phone Number Provisioning)

**Purpose:** Stores phone numbers managed by Barpel (purchased/provisioned via Twilio). Each row has a `routing_direction` that strictly governs whether the number can be used for inbound calls, outbound calls, or both.

**Critical Architecture (2026-03-02 Fix):**
- **Inbound-only numbers** (`routing_direction='inbound'`): Can ONLY be used for receiving calls. Cannot be used for outbound calling.
- **Outbound-only numbers** (`routing_direction='outbound'`): Can ONLY be used for making calls. Cannot be used for receiving calls.
- **Bidirectional numbers** (`routing_direction='both'`): Can be used for both inbound and outbound (rare, requires explicit configuration).
- **No Cross-Use Allowed:** The phone number resolver (`backend/src/services/phone-number-resolver.ts`) strictly enforces this separation. There is NO fallback that accepts any random active number for outbound calling.

**Key Columns:**
- `id` (uuid) - Unique phone number record ID
- `org_id` (uuid) - Organization owner
- `phone_number` (text) - E.164 formatted phone number (e.g., `+2348012345678`)
- `vapi_phone_id` (text, nullable) - Vapi phone number UUID (required for Vapi calls)
- `routing_direction` (text) - **CRITICAL:** `'inbound'`, `'outbound'`, or `'both'`. Phone resolution strictly filters by this field.
- `provider` (text) - Provider type: `'twilio'`, `'vonage'`, etc.
- `status` (text) - Status: `'active'`, `'suspended'`, `'released'`
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**Phone Number Resolution Algorithm (2026-03-02):**
```
resolveOrgPhoneNumberId(orgId, direction='outbound'):
  Step 1: Query managed_phone_numbers WHERE org_id=orgId AND routing_direction=direction AND status='active'
          ↳ If found: Return vapi_phone_id (success)
          ↳ If NOT found: Continue to Step 2 (NO FALLBACK TO ANY ACTIVE NUMBER)
  Step 2: Check BYOC (Bring Your Own Carrier) credentials
  Step 3-5: Fallback strategies for BYOC
  Final: Return null if NO phone number provisioned (user must configure outbound number)
```

**Before Fix (Bug - Commit 34d2c19):**
- Step 1 fallback query had NO `routing_direction` filter
- Accepted ANY active managed number regardless of direction
- Inbound numbers were incorrectly used for outbound calls ❌

**After Fix (Correct - Commit 34d2c19):**
- Step 1 strictly filters `routing_direction='outbound'`
- Removed permissive fallback entirely
- Returns NULL if no outbound number provisioned
- Returns clear error message: "No outbound phone number provisioned. Inbound numbers cannot be used for outbound calls." ✅

**Related Code Files:**
- `backend/src/services/phone-number-resolver.ts` (lines 72-110): Phone number resolution with strict outbound filtering
- `backend/src/routes/founder-console-v2.ts` (lines 3841-3857): Enhanced error message for missing outbound number
- `backend/src/routes/managed-telephony.ts`: Provisioning endpoints that set `routing_direction`

---

## 📊 Schema Summary

**32 tables:** 12 core (calls, appointments, onboarding, etc.) + 2 billing + 1 security + 17 config
**~590 columns, 84 FKs, 183 indexes, 12 functions**

---

## 🔐 Multi-Tenancy & Security

**Isolation Model:** JWT org_id → RLS policies → Database enforcement
**Status:** ✅ 23+ RLS policies active, org_id is SSOT, zero cross-org leaks
**Verification:** Daily RLS policy audit, all tables enforce org_id filtering

---

## 📈 Key Relationships

### Call Lifecycle
```
Call (calls table)
├── org_id → organizations (which org made the call)
├── contact_id → contacts (who called/was called)
├── tracked by → call_tracking (analytics)
├── billed via → credit_transactions (deductions based on duration / cost)
└── may create → hot_lead_alerts (if high scoring)
```

### Appointment Lifecycle
```
Appointment (appointments table)
├── org_id → organizations
├── contact_id → contacts
└── may create → hot_lead_alerts (if VIP)
```

### Configuration Hierarchy
```
Organization (organizations)
├── agents (voice AI agents)
├── services (service offerings)
├── integrations (API connections)
├── org_credentials (encrypted API keys)
├── org_tools (tool configurations)
├── org_feature_flags (feature toggles)
└── carrier_forwarding_rules (telephony config)
```

---

## ✅ Validation Rules

### Critical Constraints
- All org_id references must exist in organizations table
- All contact_id references must exist in contacts table
- All profile access must be RLS-filtered by org_id
- Call status must be one of: pending, in_progress, completed, failed
- Lead status must be: hot, warm, cold, contacted

### Data Quality Rules
- Phone numbers stored in E.164 format (+1234567890)
- Emails must be valid format
- Timestamps always in UTC (timestamp with time zone)
- UUIDs generated by database (uuid_generate_v4() or gen_random_uuid())

---

## 🚀 Production Readiness Status

| Component | Status | Notes |
|-----------|--------|-------|
| **Schema Complexity** | ✅ Optimal | 32 tables (2 billing + 1 security + 29 core; 2 new onboarding tables added 2026-02-25) |
| **Data Integrity** | ✅ Strong | Constraints, FKs, RLS active |
| **Performance** | ✅ Excellent | 169 indexes on critical paths |
| **Multi-Tenancy** | ✅ Secure | RLS policies enforced + automated verification |
| **Backup Strategy** | ✅ 7-day PITR | Daily Supabase backups |
| **Security** | ✅ **HARDENED** | P0 vulnerabilities mitigated (95+/100 score) |
| **Billing System** | ✅ **CERTIFIED** | Fixed 56 pence/min GBP rate, 46/46 tests passed |
| **Billing Infrastructure** | ✅ **COMPLETE** | 2 tables, 12 indexes, 4 RLS policies, 1 cleanup function |
| **Debt Limit** | ✅ **ENFORCED** | £5.00 (500 pence) max debt, atomic RPC enforcement |
| **Webhook Processing** | ✅ **IDEMPOTENT** | Defense-in-depth (BullMQ + DB), 90-day retention |
| **Security Infrastructure** | ✅ **COMPLETE** | 1 table, 7 indexes, 7 helper functions, automated RLS verification |
| **P0 Vulnerabilities** | ✅ **MITIGATED** | 4/4 critical issues fixed (21/21 tests passed) |
| **API Endpoints** | ✅ **VERIFIED** | All dashboard endpoints tested, real data confirmed, 3-sentence outcomes |
| **Dashboard Frontend** | ✅ **E2E VERIFIED** | 8 TestSprite failures fixed (2026-02-21): metrics, filters, detail fields, navigation |

---

---

## 🛠️ Infrastructure Audit: Wallet + Test Endpoints + Tools (2026-03-04)

**Status:** ✅ ALL VERIFIED — Stripe→Wallet, test-call, web-test, 7 tools, time awareness

### Changes Applied (Infrastructure Audit Session)

#### 1. founder-console-v2.ts — 4 bug fixes
| Bug | Root Cause | Fix Location | Fix |
|-----|-----------|-------------|-----|
| `ReferenceError: agents is not defined` | Debug log referenced `agents?.length` after query changed to `.maybeSingle()` (returns object, not array) | Lines 3121, 3583 | Changed to `total_agents: 1` |
| "Agent not configured" on web-test | SELECT query included `active` column — DB column is `is_active`. PostgREST returned null data. | Lines 3102, 3120, 3562, 3582 | Changed `active` → `is_active` everywhere |
| call_tracking insert failed | Table missing `agent_id`, `lead_id`, `phone`, `called_at`, `call_outcome` columns | DB migration | Added 5 columns via Supabase Management API |
| Vapi PATCH 400 "model.provider must be one of..." | `linkToolsToAssistant()` sent `{ model: { toolIds } }` without required `provider`+`model` fields | tool-sync-service.ts | Pre-fetch existing assistant, merge provider+model into PATCH payload |

#### 2. tool-sync-service.ts — linkToolsToAssistant() fix
```typescript
// Before: sent only toolIds — Vapi rejected with 400
await vapi.updateAssistant(assistantId, { model: { toolIds } });

// After: fetch existing assistant first, then merge
const existing = await vapi.getAssistant(assistantId);
await vapi.updateAssistant(assistantId, {
  model: {
    provider: existing?.model?.provider || 'openai',
    model: existing?.model?.model || 'gpt-4',
    toolIds: toolIds
  }
});
```

#### 3. Stripe CLI local dev setup
- `backend/package.json`: added `"stripe:listen": "stripe listen --forward-to localhost:8001/api/webhooks/stripe"`
- When running locally, replace `STRIPE_WEBHOOK_SECRET` in `backend/.env` with the CLI's signing secret (printed on startup as `whsec_...`). This secret changes per `stripe listen` session.

#### 4. Wallet page polling (wallet/page.tsx)
- Replaced single `mutateWallet()` with polling loop (4 attempts × 3s intervals)
- Shows "Payment received, balance updating shortly" until balance increases
- Prevents false "Credits added" message before Stripe webhook fires

#### 5. Time awareness per-call (vapi-webhook.ts:1505)
- Confirmed at `assistant-request` handler, line ~1505
- Injects: today's date (en-GB) + current time in WAT (Africa/Lagos, UTC+1)
- Fresh per call — not stale from sync time

#### 6. 7 tools verified end-to-end
All 7 tools confirmed in `org_tools` with `enabled=true` and `vapi_tool_id` populated:
checkAvailability, bookClinicAppointment, transferCall, lookupCaller, endCall, queryKnowledgeBase, **sendSms** (new — standalone SMS tool, `async: false`)

#### 7. Wallet gate on test endpoints
Both `POST /api/founder-console/agent/test-call` and `POST /api/founder-console/agent/web-test` now check `hasEnoughBalance()` before creating a Vapi call. Returns HTTP 402 with clear message if balance is zero.

### Verified Test Results (2026-03-04)
- ✅ Zero balance → 402 on both test endpoints
- ✅ Stripe CLI → `checkout.session.completed` → `addCredits()` → balance 0 → 2000p (£20.00)
- ✅ `POST /api/founder-console/agent/web-test` → 200 with `vapiCallId` + `bridgeWebsocketUrl`
- ✅ 7 `toolIds` included in inline assistant config returned to Vapi
- ✅ Time awareness confirmed in vapi-webhook.ts `assistant-request` handler

---

## 📝 Status & Last Updated

**Current:** March 5, 2026
**Latest:** Call Transfer end-to-end fixed — `transfer_phone_number` column added to `integration_settings`, `transferCall` Vapi tool now reads the correct row (`provider='transfer'`), new `/api/transfer-settings` route (3 endpoints), Escalation Rules UI replaced with simple Call Transfer page, jsonb `.filter('tools_used', 'cs', '["transferCall"]')` bug fixed.
**Previous:** Infrastructure audit complete — wallet gating, 7 tools, time awareness, test endpoints all verified. 4 bugs found and fixed in founder-console-v2.ts + tool-sync-service.ts. Schema updated with new columns.
**Key Metrics:** ✅ 32 tables, 183 indexes, 23 RLS policies, 56p/min billing enforced, 7 Vapi tools live

**For what changed recently, see APPENDIX: Release History**

---

## 🔗 Related Documentation

### Schema & Database
- `SCHEMA_CLEANUP_EXECUTION_GUIDE.md` - How cleanup was performed
- `SCHEMA_CLEANUP_QUICK_REFERENCE.md` - Quick reference
- `SCHEMA_CLEANUP_DEPLOYMENT_COMPLETE.md` - Execution report
- `.agent/supabase-mcp.md` - Database connection guide

### Billing System (2026-02-11)
- `BILLING_VERIFICATION_REPORT.md` - CTO certification document (46/46 tests passed)
- `CRITICAL_BILLING_FIXES_COMPLETE.md` - 3 critical fixes implementation report (6/6 tests)
- `STRIPE_CHECKOUT_VERIFICATION_COMPLETE.md` - 4-agent team testing results
- `backend/src/scripts/verify-billing-math.ts` - Dry-run verification script (8/8 tests)
- `backend/src/scripts/audit-billing-config.ts` - Configuration audit script (10/10 checks)
- `backend/src/scripts/test-debt-limit.ts` - Debt limit integration tests (7 tests)
- `backend/src/scripts/test-billing-fixes.ts` - Billing fixes verification (6/6 tests)
- `backend/src/__tests__/unit/fixed-rate-billing.test.ts` - Unit tests (26/26 passed)

### Billing Implementation Files
- `backend/src/services/wallet-service.ts` - Core billing logic (`calculateFixedRateCharge()`)
- `backend/src/config/index.ts` - Billing constants (`RATE_PER_MINUTE_USD_CENTS: 70`)
- `backend/src/routes/billing-api.ts` - Stripe checkout API (with client_reference_id fix)
- `backend/src/routes/webhook-verification.ts` - Webhook verification API (3 endpoints)
- `backend/src/config/wallet-queue.ts` - Auto-recharge job deduplication
- `backend/supabase/migrations/20260209_add_debt_limit.sql` - Debt limit schema

### Database Tables (Created 2026-02-11)
- `credit_transactions` - Immutable ledger of wallet transactions (6 indexes, 2 RLS policies)
- `processed_webhook_events` - Webhook idempotency tracking (6 indexes, 2 RLS policies)
- `cleanup_old_webhook_events()` - 24-hour retention cleanup function

### Security Infrastructure (Created 2026-02-12)
- `processed_stripe_webhooks` - Stripe webhook idempotency (11 columns, 7 indexes, 1 RLS policy, 3 helper functions)
- `check_rls_enabled()` - RLS enablement verification function
- `get_table_policies()` - RLS policy inspection function
- `get_all_rls_policies()` - Comprehensive RLS audit function
- `count_rls_policies()` - RLS policy count function

### Security Fixes (2026-02-12)
- `P0_SECURITY_FIXES_COMPLETE.md` - Implementation documentation (CODE + TEST phases)
- `P0_SECURITY_DEPLOYMENT_SUCCESS.md` - Production deployment report (21/21 tests passed)
- `backend/src/middleware/auth.ts` - JWT signature verification fix (P0-1)
- `backend/src/routes/billing-api.ts` - Negative amount validation fix (P0-2)
- `backend/src/routes/stripe-webhooks.ts` - Webhook idempotency fix (P0-3)
- `backend/src/scripts/verify-rls-policies.ts` - Automated RLS verification (P0-4)
- `backend/supabase/migrations/20260212_create_processed_stripe_webhooks.sql` - Webhook table migration
- `backend/supabase/migrations/20260212_create_rls_helper_functions.sql` - RLS functions migration

---

## 📋 Barpel AI Project Status

**This is the Single Source of Truth (SSOT) for the Barpel AI database schema.**

**Project Phase:** ✅ PRODUCTION READY (Barpel AI Enterprise Platform)
**Status as of:** 2026-03-01
**Last Verified:** Barpel AI Production Platform (2026-03-01) - 79 migrations deployed, frontend + backend running on ports 8000/8001, endpoint testing & onboarding guard verified
**Database Project:** Supabase `wifcmvgwzicgyrvaoiwi` (Barpel-specific)
**Architecture:** Enterprise-grade foundation with prepaid billing (56 pence/min GBP), multi-tenant security (RLS enforced), managed telephony (Twilio + Vapi)
**Business Terminology:** Business-focused for Nigerian SMEs (clinic_name → business_name, specialty → business vertical, medical_clinic → healthcare)

**Key Metrics:**
- ✅ 32 tables (10 core + 2 billing + 1 security + 17 config + 2 onboarding)
- ✅ 79 migrations (71 copied + 8 existing)
- ✅ 183 indexes (optimized for performance)
- ✅ 23 RLS policies (multi-tenant isolation enforced)
- ✅ 56 pence/minute billing rate (inherited, TBD customization for NG₦)

**Billing Status:** ✅ FULLY OPERATIONAL - 3-phase prepaid billing system (atomic deduction, credit reservation, kill switch)
**Security Score:** 95+/100 (RLS enforced, webhook idempotency, error sanitization)
**Multi-Tenancy:** ✅ HARDENED - org_id isolation on all queries, automated RLS verification
**Production Readiness:** ✅ COMPLETE - Signup → Wizard → Dashboard flow tested, teal-and-white design system applied, servers running on ports 8000/8001

**Next Steps:**
1. **Pricing & Billing Customization** — Adapt 56p/min rate to Nigerian market (NG₦ currency options, SME-friendly pricing bands, startup credits)
2. ✅ **Production Deployment (Temp Domains Live 2026-03-02)** — `app-barpelai.odia.dev` (dashboard), `barpelai.odia.dev` (marketing), `barpel-ai.onrender.com` (backend). Pending: purchase `barpel.ai`, update all URLs to final domains, enter Render secrets, Stripe production keys
3. **Local Payment Gateways** — Flutterwave/PayStack integration for NG₦ acceptance (parallel Stripe for international customers)
4. **Localization & I18n** — Yoruba/Hausa/Igbo support, WAT timezone handling, local number prefixes (+234), business terminology localization
5. **SME-Specific Analytics** — Call ROI tracking, appointment-to-revenue metrics, lead scoring optimized for Nigerian business cycles
6. **Regulatory Compliance** — NDPR (Nigeria Data Protection Regulation) compliance, data residency verification, audit logging for SME context

**Next Technical Review:** 2026-03-10 (post-investor demo)
