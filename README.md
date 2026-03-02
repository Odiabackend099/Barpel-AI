# Barpel AI — AI Voice Automation Platform

> Give your business a 24/7 AI receptionist that books appointments, answers questions, and follows up with leads — automatically.

---

## Architecture

```
Barpel/
├── .agent/               ← AI developer brain (read this first)
│   ├── prd.md            ← Product requirements document
│   ├── database-ssot.md  ← Database schema & API reference
│   ├── NEXT_AI_DEVELOPER_PROMPT.md ← Onboarding prompt for AI devs
│   ├── Barpel Branding/  ← Logo package (24 assets)
│   └── workflows/        ← Testing & deployment workflows
├── src/                  ← Next.js dashboard app → app.barpel.ai
├── backend/              ← Node.js/Express API → api.barpel.ai
├── frontend/
│   └── website/          ← React/Vite marketing site → barpel.ai
├── supabase/             ← Supabase config & edge functions
├── migrations/           ← Database migration SQL files
└── scripts/              ← Utility scripts
```

### Deployment Targets

| Service | URL | Source |
|---------|-----|--------|
| Marketing website | `barpel.ai` | `frontend/website/` |
| Dashboard app | `app.barpel.ai` | `src/` (Next.js root) |
| API server | `api.barpel.ai` | `backend/` |

---

## Quick Start

### Prerequisites
- Node.js 20+
- npm or bun
- Supabase account
- Vapi account

### 1. Clone & install

```bash
git clone https://github.com/your-org/barpel.git
cd barpel
npm install          # installs dashboard app deps
cd backend && npm install && cd ..
cd frontend/website && npm install && cd ../..
```

### 2. Environment setup

```bash
cp .env.example .env.local
# Fill in your Supabase, Vapi, Twilio, and Stripe keys
```

```bash
cd frontend/website
cp .env.local.example .env.local
# Set VITE_APP_URL=http://localhost:3000 for local dev
```

### 3. Run locally

```bash
# Terminal 1 — Dashboard app (Next.js)
npm run dev                    # → http://localhost:3000

# Terminal 2 — API server
cd backend && npm run dev      # → http://localhost:4000

# Terminal 3 — Marketing website (Vite)
cd frontend/website && npm run dev  # → http://localhost:5173
```

---

## .agent/ — AI Developer Context

The `.agent/` folder is the brain of this project. Any AI developer (Claude, Cursor, Copilot) should **read these files first** before making changes:

| File | Purpose |
|------|---------|
| `prd.md` | Full product requirements and feature specs |
| `database-ssot.md` | Database schema, tables, RLS policies |
| `NEXT_AI_DEVELOPER_PROMPT.md` | Context prompt for AI developers |
| `ARCHITECTURE_DECISIONS.md` | Why things are built the way they are |
| `skill.md` | Core engineering principles and patterns |
| `workflows/` | Testing, deployment, and debugging workflows |

---

## Design System

**Canonical brand colors** are defined in `src/lib/brand-colors.ts`:

| Token | Value | Usage |
|-------|-------|-------|
| `barpelTeal` | `#37A195` | Primary CTA, active states |
| `barpelTealDark` | `#2F8E88` | Hover states |
| `deepSlate` | `#102A33` | Headings, primary text |
| `mutedGray` | `#6B7280` | Body text, subtitles |
| `borderGray` | `#E5E7EB` | Borders, dividers |

Both `tailwind.config.ts` (dashboard) and `frontend/website/tailwind.config.js` mirror these values.

---

## White-Label Customization

To deploy this platform for a new client/niche:

1. **Update brand identity** in `src/lib/brand.config.ts` and `frontend/website/src/lib/brand.config.ts`
2. **Replace logo assets** in `public/` and `frontend/website/public/` using the `.agent/Barpel Branding/logo_package/` as your template
3. **Update colors** in `tailwind.config.ts` and `frontend/website/tailwind.config.js`
4. **Set environment variables** in `.env.local` with new domain, Supabase project, and API keys
5. **Update `.agent/prd.md`** with the new niche's use case and requirements
6. Run `npm run build` in both `src/` and `frontend/website/` to verify clean build

---

## Key Invariants

**Never break these — they protect the outbound calling pipeline:**

- `backend/src/routes/agent-sync.ts` — always writes `vapi_phone_number_id`
- `backend/src/routes/contacts.ts` — uses `.maybeSingle()` not `.single()` on agent queries
- `backend/src/services/vapi-client.ts` — always calls `assertOutboundCallReady()` before dialing

See `.agent/CONFIGURATION_CRITICAL_INVARIANTS.md` for full details.

---

## Running Tests

```bash
# Unit tests (backend)
cd backend && npm run test:unit

# E2E tests (dashboard)
npx playwright test

# Marketing site lint
cd frontend/website && npm run lint
```

---

## Deployment

- **Dashboard + Marketing:** Vercel (auto-deploys from `main` branch)
- **API:** Render (see `render.yaml`)
- **Database:** Supabase (managed)

See `.agent/DEPLOYMENT_CHECKLIST.md` for full production deployment guide.
