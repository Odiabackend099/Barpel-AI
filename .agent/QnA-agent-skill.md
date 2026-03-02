# QnA Agent Skill — Endpoint Testing Methodology

**Purpose:** Standard, repeatable methodology for testing any Barpel AI backend endpoint using real user credentials. This is the canonical debugging and verification approach for the platform.

**When to use:** Any time you need to verify that an endpoint works correctly, debug a failing API call, confirm a database migration landed, or reproduce a bug reported by a user.

---

## Core Principle

> **Always test with a real JWT from real credentials, against the real backend. Never mock. Never guess.**

Testing with real credentials catches the actual bugs — wrong column names, missing DB columns, wallet balance issues, permission failures. Mocks hide these failures.

---

## Step 1 — Get a Fresh JWT

### Method A: Exchange email/password for JWT (preferred)

**Credentials:**
- Email: `cto@barpel.ai`
- Password: `Eguale@2021?`
- Supabase URL: `https://wifcmvgwzicgyrvaoiwi.supabase.co`
- Supabase Anon Key: found in `.env.local` (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)

```bash
# Get the anon key first
ANON_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY /Users/mac/Desktop/Barpel/.env.local | cut -d= -f2)

# Sign in to get JWT
curl -s -X POST \
  "https://wifcmvgwzicgyrvaoiwi.supabase.co/auth/v1/token?grant_type=password" \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -d '{"email":"cto@barpel.ai","password":"Eguale@2021?"}' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('access_token','ERROR: ' + str(d)))"
```

**Expected output:** A long JWT string starting with `eyJ...`

**Save it:**
```bash
JWT="eyJ..."   # paste the token here
ORG_ID="17a9dc94-3ed0-448b-bd44-f527eadb5317"   # CTO org
```

### Method B: Python (use when curl pipelines are unreliable)

```python
#!/usr/bin/env python3
import urllib.request, json

SUPABASE_URL = "https://wifcmvgwzicgyrvaoiwi.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  # from .env.local

payload = json.dumps({"email": "cto@barpel.ai", "password": "Eguale@2021?"}).encode()
req = urllib.request.Request(
    f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
    data=payload,
    headers={"Content-Type": "application/json", "apikey": ANON_KEY}
)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read())

JWT = data["access_token"]
print("JWT:", JWT[:40] + "...")
print("org_id:", data["user"]["app_metadata"].get("org_id"))
```

---

## Step 2 — Get CSRF Token (required for all mutating endpoints)

The backend uses stateless HMAC-SHA256 CSRF protection. Every `POST`, `PUT`, `PATCH`, `DELETE` request needs a CSRF token in the `X-CSRF-Token` header.

```bash
# Fetch a fresh CSRF token
# Response field is "csrfToken" (primary) — falls back to "token"
CSRF=$(curl -s "http://localhost:8001/api/csrf-token" \
  -H "Authorization: Bearer $JWT" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('csrfToken') or d.get('token'))")

echo "CSRF: $CSRF"
```

> **Note:** CSRF tokens expire after 1 hour. If you get a 403 "CSRF token invalid", just fetch a new one.

---

## Step 3 — Test an Endpoint

### GET endpoint (no CSRF needed)
```bash
curl -s "http://localhost:8001/api/billing/wallet" \
  -H "Authorization: Bearer $JWT" \
  | python3 -m json.tool
```

### POST endpoint (CSRF required)
```bash
curl -s -X POST "http://localhost:8001/api/founder-console/agent/web-test" \
  -H "Authorization: Bearer $JWT" \
  -H "X-CSRF-Token: $CSRF" \
  -H "Content-Type: application/json" \
  -d '{"agentId": "YOUR_AGENT_ID"}' \
  | python3 -m json.tool
```

### Full Python approach (recommended for complex multi-step tests)

```python
#!/usr/bin/env python3
"""
Template: Multi-step endpoint test with auth + CSRF
"""
import urllib.request, json, sys

BACKEND = "http://localhost:8001"
JWT = "eyJ..."  # from Step 1

def req(method, path, body=None, csrf=None):
    headers = {"Authorization": f"Bearer {JWT}", "Content-Type": "application/json"}
    if csrf:
        headers["X-CSRF-Token"] = csrf
    data = json.dumps(body).encode() if body else None
    r = urllib.request.Request(f"{BACKEND}{path}", data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())

# Step 1: Get CSRF token
# NOTE: response field is "csrfToken" (NOT "token" — check both for safety)
status, csrf_resp = req("GET", "/api/csrf-token")
assert status == 200, f"CSRF fetch failed: {status}"
CSRF = csrf_resp.get("csrfToken") or csrf_resp.get("token")
print(f"✅ CSRF: {CSRF[:20]}...")

# Step 2: Check wallet balance
status, wallet = req("GET", "/api/billing/wallet")
print(f"✅ Wallet: {wallet.get('balance_pence')}p ({wallet.get('balance_display')})")

# Step 3: Test your endpoint
status, result = req("POST", "/api/your-endpoint", body={"key": "value"}, csrf=CSRF)
print(f"Status: {status}")
print(json.dumps(result, indent=2))
```

---

## Step 4 — Backend Startup (when testing locally)

The backend must be running at `localhost:8001` before testing.

```bash
# Start backend with full absolute paths (required — shell env may not have node in PATH)
nohup /usr/local/opt/node@20/bin/node \
  /Users/mac/Desktop/Barpel/backend/node_modules/.bin/tsx \
  /Users/mac/Desktop/Barpel/backend/src/server.ts \
  > /tmp/bk.log 2>&1 &

# Wait 3s, check it's up
sleep 3
curl -s http://localhost:8001/health | python3 -m json.tool

# Tail logs for debugging
tail -f /tmp/bk.log
```

> **Why full paths?** Claude Code's shell doesn't inherit the user's PATH. `/usr/local/opt/node@20/bin/node` is the exact path on this Mac.

To kill a running backend:
```bash
lsof -ti:8001 | xargs kill -9
```

---

## Step 5 — Stripe CLI (wallet top-up testing)

```bash
# In backend/ directory — listen for webhooks and forward to local backend
cd /Users/mac/Desktop/Barpel/backend
npm run stripe:listen
# This prints: "Your webhook signing secret is whsec_xxxx..."
```

**CRITICAL:** The Stripe CLI generates a new signing secret each session. Update `backend/.env`:
```
STRIPE_WEBHOOK_SECRET=whsec_xxxx   # from CLI output
```
Then restart the backend.

Trigger a test top-up:
```bash
stripe trigger checkout.session.completed \
  --override checkout_session:metadata.type=wallet_topup \
  --override "checkout_session:metadata.org_id=17a9dc94-3ed0-448b-bd44-f527eadb5317" \
  --override checkout_session:metadata.amount_pence=2000
```

Verify balance:
```bash
curl -s "http://localhost:8001/api/billing/wallet" \
  -H "Authorization: Bearer $JWT" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('Balance:', d.get('balance_pence'), 'pence')"
```

---

## Confirmed API Field Names (source of truth)

These were verified by running `/tmp/full_test_v3.py` against the live backend (2026-03-02):

| Endpoint | Field | Correct Name | Notes |
|----------|-------|-------------|-------|
| `GET /api/csrf-token` | CSRF value | `csrfToken` (or `token` fallback) | Use `d.get("csrfToken") or d.get("token")` |
| `GET /api/founder-console/agent/config?role=inbound` | Response wrapper | `agents` array, each with `role` field | Response: `{"success":true,"agents":[...],"vapiConfigured":bool}` |
| `GET /api/founder-console/agent/config?role=inbound` | Vapi assistant ID | `vapiAssistantId` (camelCase) | NOT `vapi_assistant_id` |
| `GET /api/founder-console/agent/config?role=inbound` | Agent DB ID | `id` | Plain UUID string |
| `GET /api/knowledge-base` | List wrapper | `items` | Response: `{"items":[...]}` — NOT `data` or `articles` |
| `POST /api/knowledge-base` | ID in response | `id` or `item.id` | Response: `{"item":{...},"id":"..."}` |
| `POST /api/founder-console/agent/web-test` | Call ID | `vapiCallId` | toolIds are NOT in HTTP response — embedded in Vapi inline assistant |
| `POST /api/founder-console/agent/web-test` | WebSocket URL | `bridgeWebsocketUrl` | `ws://localhost:8001/api/web-voice/{uuid}` |

---

## Common Error Patterns & Fixes

| Error | Root Cause | Fix |
|-------|-----------|-----|
| `401 Unauthorized` | JWT expired or not passed | Re-run Step 1, check `Authorization: Bearer $JWT` header |
| `403 CSRF token invalid` | CSRF expired (1hr TTL) or missing header | Re-run Step 2, add `X-CSRF-Token: $CSRF` |
| `402 Insufficient balance` | Org wallet is empty | Top up via Stripe CLI (Step 5) |
| `500 column "active" does not exist` | Query uses `active` but DB column is `is_active` | Fix SELECT query to use `is_active` |
| `500 ReferenceError: agents is not defined` | Old array variable reference after `.maybeSingle()` change | Fix: remove array indexing, use direct object result |
| `400 model.provider must be one of...` | Vapi PATCH sent `{ model: { toolIds } }` without provider/model | Pre-fetch assistant, merge `provider`+`model` into PATCH |
| Backend not responding | Wrong node path or port conflict | Use full absolute paths for tsx, check `lsof -ti:8001` |
| Stripe webhook 400 "Invalid signature" | STRIPE_WEBHOOK_SECRET doesn't match CLI session secret | Update `backend/.env`, restart backend |
| `KB upload 500 "Failed to create knowledge base document"` | `knowledge_base` table missing columns (`filename`, `category`, `active`, `version`, `metadata`) | Apply ALTER TABLE migration via Supabase Management API |
| `KB upload 500 "Failed to record change history"` | `knowledge_base_changelog` table: `changed_by` is UUID FK but code sends text; missing columns | Drop FK, change `changed_by` to TEXT, add `version_from/to`, `change_type`, `change_summary`, `previous_content`, `new_content` |
| `GET /api/knowledge-base` returns `0 articles` | Test checking `d.get("data")` but response uses `d.get("items")` | Use `d.get("items") or []` |
| `GET /api/managed-telephony/available-numbers` returns 424 | `TWILIO_MASTER_ACCOUNT_SID`/`TWILIO_MASTER_AUTH_TOKEN` expired/invalid | Update credentials in `backend/.env` from https://console.twilio.com/ |
| Time awareness webhook returns 500 | `generateEmbedding()` in `Promise.all` throws on OpenAI 429, crashes whole handler | Change `Promise.all` to `Promise.allSettled`; build `timeBlock` before embedding check; return `{context: timeBlock}` on embedding failure |
| `KB retrieval found=True` but `ctx` empty | OpenAI quota exceeded — embeddings not generated, so no chunks to retrieve | Top up OpenAI at https://platform.openai.com/settings/billing; time context still returns correctly |

---

## Supabase Management API (for schema changes)

When you need to add columns to fix missing column errors:

```bash
PAT="sbp_62c06aa0b851e28dd60ce34170bca62982e26562"
PROJECT_REF="wifcmvgwzicgyrvaoiwi"

# Run SQL migration
curl -s -X POST \
  "https://api.supabase.com/v1/projects/$PROJECT_REF/database/query" \
  -H "Authorization: Bearer $PAT" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "ALTER TABLE call_tracking ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES agents(id) ON DELETE SET NULL;"
  }' | python3 -m json.tool
```

---

## Production Testing (vs local)

Replace `http://localhost:8001` with `https://barpel-ai.onrender.com` for production tests.

```bash
BACKEND="https://barpel-ai.onrender.com"
# All other steps are identical — same JWT, same CSRF flow, same endpoint paths
```

---

## Key Constants

| Item | Value |
|------|-------|
| Test org | `cto@barpel.ai` / `Eguale@2021?` |
| Test org_id | `17a9dc94-3ed0-448b-bd44-f527eadb5317` |
| Inbound agent ID | `65a23950-...` (query via `GET /api/founder-console/agent/config?role=inbound`) |
| Vapi assistant ID | `089282e4-4ea...` (field: `vapiAssistantId` in agent config response) |
| Supabase URL | `https://wifcmvgwzicgyrvaoiwi.supabase.co` |
| Supabase PAT | `sbp_62c06aa0b851e28dd60ce34170bca62982e26562` |
| Backend local | `http://localhost:8001` |
| Backend prod | `https://barpel-ai.onrender.com` |
| Node binary | `/usr/local/opt/node@20/bin/node` |
| tsx binary | `/Users/mac/Desktop/Barpel/backend/node_modules/.bin/tsx` |
| Backend log | `/tmp/bk.log` |

---

## Verified Platform State (2026-03-02)

Run `/tmp/full_test_v3.py` to reproduce. **Final result: 13/14 passed, 0 failed, 1 warning.**

| Check | Status | Notes |
|-------|--------|-------|
| JWT auth | ✅ | org_id in app_metadata |
| CSRF token | ✅ | field: `csrfToken` |
| Wallet balance | ✅ | 2000p (£20.00) |
| KB upload | ✅ | DB schema migration applied |
| KB list | ✅ | response key: `items` |
| KB retrieval (Vapi tool) | ✅ | time context returns; chunks empty (OpenAI quota) |
| Agent config | ✅ | 9 tools bound; field: `vapiAssistantId` |
| Telephony status | ✅ | mode=byoc |
| Phone status | ✅ | 0 numbers (no provisioned numbers yet) |
| GB number search | ⚠️ | 424 — Twilio master creds expired (env issue, not code) |
| Web-test | ✅ | HTTP 200, vapiCallId returned |
| bridgeWebsocketUrl | ✅ | WebSocket URL present |
| Time awareness | ✅ | Returns "Today is Monday, 2 March 2026" correctly |
| 9 tools bound | ✅ | toolCount=9 confirmed in backend log |

**Open environment issues (not code bugs):**
1. `TWILIO_MASTER_ACCOUNT_SID` + `TWILIO_MASTER_AUTH_TOKEN` in `backend/.env` are expired → get fresh from https://console.twilio.com/
2. OpenAI quota exceeded → top up at https://platform.openai.com/settings/billing (affects KB embeddings only — KB upload/retrieval structure still works)
