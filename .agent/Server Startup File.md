# Server Startup File

**Purpose**: Reference guide for AI to automatically start all Barpel AI servers (frontend, backend)

**Location**: `/Users/mac/Desktop/Barpel/.agent/Server Startup File.md`

**Version**: 4.0 (Barpel AI — March 1, 2026)
**Last Updated**: 2026-03-01 UTC
**Status**: ✅ All servers verified and working

---

## 🔧 Current Barpel AI Setup (March 1, 2026)

### ✅ Correct Paths & Credentials
- **Project Root**: `/Users/mac/Desktop/Barpel/`
- **Frontend**: `/Users/mac/Desktop/Barpel/` (Next.js 14)
- **Backend**: `/Users/mac/Desktop/Barpel/backend/` (Express.js)
- **Supabase**: Project `wifcmvgwzicgyrvaoiwi` (Barpel-specific)
- **Status**: Demo ready, all servers tested ✅

### ✅ Frontend Port Configuration
- **Current**: Port **3000** (macOS X11 compatibility — standard Next.js dev port)
- **Previous attempts**: Port 6000 (X11 reserved) → 5000 (in use) → 3000 (successful) ✅
- **Status**: Frontend running and rendering correctly ✅

---

## 🎯 BARPEL AI STANDARD PORTS (FINAL - DO NOT CHANGE)

These ports are the permanent standard for Barpel AI development:

| Service | Port | URL | Status |
|---------|------|-----|--------|
| **Frontend** | **8000** | http://localhost:8000 | ✅ Ready to start |
| **Backend** | **8001** | http://localhost:8001 | ✅ Ready to start |
| **ngrok Dashboard** | **8040** | http://localhost:8040 | Ready for production tunneling |

---

## ⚡ QUICK START (Execute These Steps in Order)

### Step 1: Kill Old Processes (If Any Running)
```bash
pkill -9 -f "next dev" 2>/dev/null || true
pkill -9 -f "npm run dev" 2>/dev/null || true
sleep 2
echo "✓ Old processes terminated"
```

### Step 2: Start Backend Server (Port 8001) — Barpel AI
```bash
cd /Users/mac/Desktop/Barpel/backend
PORT=8001 npm run dev > /tmp/backend.log 2>&1 &
sleep 10
echo "✓ Backend starting on port 8001..."
```

### Step 3: Start Frontend Server (Port 8000) — Barpel AI
```bash
cd /Users/mac/Desktop/Barpel
PORT=8000 npm run dev > /tmp/frontend.log 2>&1 &
sleep 15
echo "✓ Frontend running on port 8000"
```

### Step 4: Verify All Services Running
```bash
echo "=== BARPEL AI SERVER STATUS ==="
echo -n "Frontend (8000): "
lsof -i :8000 2>/dev/null | grep -q LISTEN && echo "✅ RUNNING" || echo "❌ STOPPED"
echo -n "Backend (8001):  "
lsof -i :8001 2>/dev/null | grep -q LISTEN && echo "✅ RUNNING" || echo "❌ STOPPED"
echo ""
echo "=== ACCESS POINTS ==="
echo "Frontend:   http://localhost:8000"
echo "Backend:    http://localhost:8001"
echo "Backend Health: http://localhost:8001/health"
```

---

## 📋 DETAILED STARTUP SEQUENCE (Barpel AI)

### Prerequisites Verification

Before starting, verify you have:

```bash
# Check Node.js
node --version

# Check npm
npm --version

# Verify Barpel project directory
ls -la /Users/mac/Desktop/Barpel

# Verify backend .env exists
ls -la /Users/mac/Desktop/Barpel/backend/.env

# Verify frontend .env.local exists
ls -la /Users/mac/Desktop/Barpel/.env.local
```

### Step 1: Terminate Old Processes

```bash
# Kill any existing servers
pkill -9 -f "next dev" 2>/dev/null || echo "No Next.js running"
pkill -9 -f "npm run dev" 2>/dev/null || echo "No npm dev running"

# Wait for cleanup
sleep 2

# Verify all killed
echo "Checking for remaining processes..."
lsof -i :8000 2>/dev/null | grep LISTEN && echo "WARNING: Port 8000 still in use" || echo "✓ Port 8000 clear"
lsof -i :8001 2>/dev/null | grep LISTEN && echo "WARNING: Port 8001 still in use" || echo "✓ Port 8001 clear"
```

### Step 2: Start Backend Server (Barpel AI)

```bash
# Navigate to backend directory
cd /Users/mac/Desktop/Barpel/backend

# Start backend on port 8001
PORT=8001 npm run dev > /tmp/backend.log 2>&1 &

# Get the process ID
BACKEND_PID=$!
echo "Backend process started with PID: $BACKEND_PID"

# Wait for startup
sleep 10

# Check if it started successfully
if lsof -i :8001 2>/dev/null | grep -q LISTEN; then
  echo "✅ Backend successfully started on port 8001"
  curl -s http://localhost:8001/health | jq . 2>/dev/null && echo "Health check passed" || true
else
  echo "❌ Backend failed to start. Check logs:"
  tail -20 /tmp/backend.log
fi
```

### Step 3: Start Frontend Server (Barpel AI)

```bash
# Navigate to frontend directory
cd /Users/mac/Desktop/Barpel

# Start frontend on port 8000
PORT=8000 npm run dev > /tmp/frontend.log 2>&1 &

# Get the process ID
FRONTEND_PID=$!
echo "Frontend process started with PID: $FRONTEND_PID"

# Wait for startup
sleep 15

# Check if it started successfully
if lsof -i :8000 2>/dev/null | grep -q LISTEN; then
  echo "✅ Frontend successfully started on port 8000"
  tail -5 /tmp/frontend.log | grep -E "Ready|listening" || echo "(Next.js starting...)"
else
  echo "❌ Frontend failed to start. Check logs:"
  tail -20 /tmp/frontend.log
fi
```

### Step 4: Verify All Systems

```bash
echo ""
echo "=========================================="
echo "   BARPEL AI SERVER STATUS"
echo "=========================================="
echo ""

# Check Frontend
echo -n "Frontend (port 8000): "
if lsof -i :8000 2>/dev/null | grep -q LISTEN; then
  echo "✅ RUNNING"
  echo "   URL: http://localhost:8000"
else
  echo "❌ STOPPED"
fi

# Check Backend
echo -n "Backend (port 8001):  "
if lsof -i :8001 2>/dev/null | grep -q LISTEN; then
  echo "✅ RUNNING"
  echo "   URL: http://localhost:8001"
  echo "   Health: http://localhost:8001/health"
else
  echo "❌ STOPPED"
fi

echo ""
echo "=========================================="
echo ""
```

---

## 🌐 ACCESS POINTS (After All Services Start)

### Local Development URLs (Barpel AI)
```
Frontend:           http://localhost:8000
Backend API:        http://localhost:8001
Backend Health:     http://localhost:8001/health
```

### Demo Flow
```
Signup:             http://localhost:8000/sign-up
Login:              http://localhost:8000/login
Dashboard:          http://localhost:8000/dashboard
Onboarding Wizard:  http://localhost:8000/dashboard/onboarding
```

### Environment Variables in Use
```
# Frontend (.env.local)
NEXT_PUBLIC_APP_URL=http://localhost:8000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8001
NEXT_PUBLIC_SUPABASE_URL=https://wifcmvgwzicgyrvaoiwi.supabase.co

# Backend (backend/.env)
PORT=8001
FRONTEND_URL=http://localhost:8000
COMPANY_NAME=Barpel AI
CLINIC_NAME=Barpel
```

---

## 📊 REQUIRED ENVIRONMENT VARIABLES (Barpel AI)

### Frontend (.env.local) — ✅ Already Configured
```bash
NEXT_PUBLIC_SUPABASE_URL="https://wifcmvgwzicgyrvaoiwi.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
NEXT_PUBLIC_BACKEND_URL="http://localhost:8001"
NEXT_PUBLIC_APP_URL="http://localhost:8000"
NEXT_PUBLIC_AGENT_NAME="Barpel"
NEXT_PUBLIC_VAPI_PUBLIC_KEY="904d9ddd-c633-4fb7-8514-6890134a62e8"
```

### Backend (backend/.env) — Must Have (Barpel AI)
```bash
# Critical for BARPEL AI — Supabase
PORT=8001
NODE_ENV=development
SUPABASE_URL=https://wifcmvgwzicgyrvaoiwi.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Barpel AI Branding
COMPANY_NAME=Barpel AI
CLINIC_NAME=Barpel
FRONTEND_URL=http://localhost:8000

# Vapi (Voice Agent)
VAPI_PRIVATE_KEY=623b9f25-cda2-4de0-8e6e-5291eac94e32

# Encryption & Security
ENCRYPTION_KEY=bbaf521ae57542c3d879a7ec3d45d6c7b58358e617754974c2c928094c12886b

# Twilio (for managed telephony)
TWILIO_MASTER_ACCOUNT_SID=ACe1819d2d7d8d511f740a5212db9f343d
TWILIO_MASTER_AUTH_TOKEN=20461f775fc71ae9c51c0bb7709b9a1a

# Stripe (test mode)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Other services (Resend, Google, OpenAI, etc.)
RESEND_API_KEY=...
GROQ_API_KEY=...
```

### Verify Backend Config
```bash
# Check critical variables exist
cd /Users/mac/Desktop/Barpel/backend
grep -E "^(SUPABASE_URL|VAPI_PRIVATE_KEY|ENCRYPTION_KEY|PORT|COMPANY_NAME)" .env

# Should output:
# SUPABASE_URL=https://wifcmvgwzicgyrvaoiwi.supabase.co
# VAPI_PRIVATE_KEY=623b9f25-cda2-4de0-8e6e-5291eac94e32
# ENCRYPTION_KEY=bbaf521...
# PORT=6001
# COMPANY_NAME=Barpel AI
```

---

## 🛑 TROUBLESHOOTING (Barpel AI)

### Port Already In Use

**If you see: "Address already in use" or "Port 8000/8001 already in use"**

```bash
# Find and kill process using the port
# For port 8000 (Frontend):
lsof -i :8000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# For port 8001 (Backend):
lsof -i :8001 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Then restart the servers
```

### Backend Won't Start

**Check for missing environment variables:**
```bash
cd /Users/mac/Desktop/Barpel/backend
npm run dev 2>&1 | head -30
```

**If missing vars, verify backend/.env has:**
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- VAPI_PRIVATE_KEY
- ENCRYPTION_KEY
- PORT=6001
- COMPANY_NAME=Barpel AI

**Verify directory exists:**
```bash
ls -la /Users/mac/Desktop/Barpel/backend
```

### Frontend Blank Screen or Won't Load

**Check logs for errors:**
```bash
tail -50 /tmp/frontend.log | grep -i "error"
```

**Verify Next.js is running:**
```bash
lsof -i :3000
```

**Check that .env.local exists:**
```bash
cat /Users/mac/Desktop/Barpel/.env.local
```

### Backend Health Check Fails

**Test the health endpoint:**
```bash
curl -s http://localhost:8001/health | jq .
```

**If it fails, check backend logs:**
```bash
tail -50 /tmp/backend.log
```

---

## 📋 LOG FILES

Monitor these log files to debug issues:

```bash
# Frontend logs
tail -50 /tmp/frontend.log

# Backend logs
tail -50 /tmp/backend.log

# ngrok logs
tail -50 /tmp/ngrok.log
```

---

## ✅ SUCCESS CHECKLIST

After startup, verify:

- [ ] Frontend running on port 5001
  - [ ] `lsof -i :5001` shows Node.js process
  - [ ] http://localhost:5001 displays BARPEL homepage
  - [ ] No React errors in browser console

- [ ] Backend running on port 6001
  - [ ] `lsof -i :6001` shows Node.js process
  - [ ] `curl http://localhost:6001/api/vapi/webhook/health` returns JSON

- [ ] ngrok running on port 4040
  - [ ] `lsof -i :4040` shows ngrok process
  - [ ] `curl http://localhost:4040/api/tunnels` returns JSON with public_url
  - [ ] Public webhook URL accessible from internet

---

## 🔄 COMMON WORKFLOWS (Barpel AI)

### Quick Restart Both Services
```bash
pkill -9 -f "next dev" && pkill -9 -f "npm run dev" && sleep 2 && \
cd /Users/mac/Desktop/Barpel/backend && \
PORT=8001 npm run dev > /tmp/backend.log 2>&1 & sleep 10 && \
cd /Users/mac/Desktop/Barpel && \
PORT=8000 npm run dev > /tmp/frontend.log 2>&1 & sleep 15 && \
echo "✅ Both servers restarting..."
```

### Just Restart Frontend
```bash
pkill -9 -f "next dev"
sleep 2
cd /Users/mac/Desktop/Barpel
PORT=8000 npm run dev > /tmp/frontend.log 2>&1 &
sleep 15
tail -5 /tmp/frontend.log
echo "✅ Frontend restarted on port 8000"
```

### Just Restart Backend
```bash
pkill -9 -f "npm run dev"
sleep 2
cd /Users/mac/Desktop/Barpel/backend
PORT=8001 npm run dev > /tmp/backend.log 2>&1 &
sleep 10
tail -5 /tmp/backend.log
echo "✅ Backend restarted on port 8001"
```

### Check if Services Still Running
```bash
echo "Frontend (8000): $(lsof -i :8000 2>/dev/null | grep -q LISTEN && echo '✅ RUNNING' || echo '❌ STOPPED')"
echo "Backend (8001):  $(lsof -i :8001 2>/dev/null | grep -q LISTEN && echo '✅ RUNNING' || echo '❌ STOPPED')"
```

---

## 🎯 FOR AI ASSISTANTS (Barpel AI)

**When user asks to "start servers":**

1. Execute Step 1: Kill old processes
2. Execute Step 2: Start backend (Port 8001)
3. Execute Step 3: Start frontend (Port 8000)
4. Execute Step 4: Verify all services
5. Report the access points to user:
   - Frontend: http://localhost:8000
   - Backend: http://localhost:8001
   - Health: http://localhost:8001/health

**When user asks to "check servers" or "status":**

1. Run the "Check if Services Still Running" command above
2. Check logs if any are down
3. Report status and access points to user

**When user asks to "stop servers":**

```bash
pkill -9 -f "next dev"
pkill -9 -f "npm run dev"
echo "✓ All servers stopped"
```

**When user asks to "test demo flow":**

1. Ensure both servers are running
2. Open http://localhost:8000/sign-up
3. Create test account (business name, business vertical)
4. Complete onboarding wizard
5. Verify dashboard renders
6. Check that backend health endpoint works
7. Report results to user

---

## 📞 WHEN TO RESTART

Restart servers when:
- User explicitly asks to start/restart servers
- User makes code changes and wants to test them
- User wants to test webhook changes
- After updating environment variables
- After updating backend configuration

---

## 🔐 SECURITY NOTES (Barpel AI)

- ✅ All credentials in `.env` and `.env.local` files (never hardcoded in scripts)
- ✅ Service role key: Kept in backend/.env only (never exposed to frontend)
- ✅ Frontend anon key: In .env.local (limited access via RLS)
- ✅ Vapi private key: In backend/.env only
- ✅ Stripe keys: Test mode in development
- ✅ Never commit `.env` or `.env.local` to git
- ✅ All API keys stored in environment variables

---

## 📈 CURRENT SYSTEM STATUS (Barpel AI)

**As of March 1, 2026 UTC:**

| Component | Status | Port | URL | Notes |
|-----------|--------|------|-----|-------|
| Frontend | ✅ Ready | 8000 | http://localhost:8000 | Next.js 14 dev server |
| Backend | ✅ Ready | 8001 | http://localhost:8001 | Express.js server |
| Database | ✅ Connected | N/A | `wifcmvgwzicgyrvaoiwi.supabase.co` | Barpel project |

**Project Status:**
- ✅ Barpel AI Reskin: COMPLETE (2026-03-01)
- ✅ Frontend: Dim & Brandy theme, business onboarding wizard
- ✅ Backend: Barpel credentials, port 6001
- ✅ Database: 79 migrations deployed
- ✅ Demo Ready: Signup → Wizard → Dashboard flow tested

**Directory Structure:**
```
/Users/mac/Desktop/Barpel/
├── .env.local (frontend credentials)
├── backend/
│   ├── .env (backend credentials)
│   └── src/
├── src/ (frontend code)
└── .agent/ (documentation)
```

**Recent Fixes & Port Changes:**
- ✅ Frontend port: 6000 → 5000 → 3000 → 8000 (X11 conflict resolved, now using custom port)
- ✅ Backend port: 6001 → 8001 (standardized to 8000-8001 range)
- ✅ Framer-motion: v12 → v11 (React 18 compatibility)
- ✅ All branding: Zero Voxanne references
- ✅ Database: onboarding_completed_at column added

---

**This file is the single source of truth for Barpel AI server startup.**
**Location:** `/Users/mac/Desktop/Barpel/.agent/Server Startup File.md`
**Follow this exactly when starting services.**
**Do not deviate from these port numbers.**

**Version**: 4.0 | **BARPEL AI** | **March 1, 2026**
