# Barpel AI Deployment Guide (2026-03-08)

**Status:** ✅ Ready for Production Deployment
**GitHub:** Code pushed to `main` branch
**Commit:** `0f1c1d6` - Phase 4 MVP features

---

## 📋 Deployment Checklist

### Phase 1: GitHub Push ✅ COMPLETE
- [x] Code committed with Phase 4 features
- [x] Pushed to `https://github.com/Odiabackend099/Barpel-AI.git`
- [x] Branch: `main`
- [x] Commit: `0f1c1d6`

### Phase 2: Backend Deployment (Render) ⏳ NEXT
- [ ] Deploy `backend/` to Render
- [ ] Set environment variables in Render dashboard
- [ ] Verify health check endpoint (`/health`)
- [ ] Test API endpoints

### Phase 3: Frontend Deployment (Vercel) ⏳ NEXT
- [ ] Deploy main app to Vercel
- [ ] Deploy marketing site (`frontend/website/`) to Vercel
- [ ] Set environment variables in Vercel
- [ ] Verify production URLs

---

## 🚀 BACKEND DEPLOYMENT (Render)

### Prerequisites
- Render.com account
- GitHub connected to Render
- Environment variables ready

### Step 1: Create Render Service

**Option A: Using Render Dashboard (Manual)**
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repository: `Barpel-AI`
4. Select branch: `main`
5. Configure build:
   - **Name:** `barpel-backend`
   - **Environment:** `Node`
   - **Build command:** `cd backend && npm install && npm run build`
   - **Start command:** `cd backend && npm run start`
   - **Instance Type:** Standard (or higher for production)
6. Click "Create Web Service"

**Option B: Using Render CLI**
```bash
render deploy --environment production
```

### Step 2: Set Environment Variables

In Render Dashboard → `barpel-backend` → Settings → Environment:

```
# Supabase
SUPABASE_URL=https://wifcmvgwzicgyrvaoiwi.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[your-key]

# Vapi
VAPI_PRIVATE_KEY=[your-key]
VAPI_PUBLIC_KEY=[your-key]

# Twilio (if needed)
TWILIO_MASTER_ACCOUNT_SID=[your-sid]
TWILIO_MASTER_AUTH_TOKEN=[your-token]

# Redis
REDIS_URL=[your-redis-url]

# Stripe
STRIPE_SECRET_KEY=[your-key]
STRIPE_PUBLISHABLE_KEY=[your-key]

# Google
GOOGLE_CLIENT_ID=[your-id]
GOOGLE_CLIENT_SECRET=[your-secret]

# Email
RESEND_API_KEY=[your-key]

# API
PORT=8001
NODE_ENV=production
LOG_LEVEL=info
```

### Step 3: Verify Deployment

```bash
# Get backend URL from Render dashboard
BACKEND_URL=https://barpel-backend.onrender.com

# Test health endpoint
curl -s $BACKEND_URL/health | jq .

# Expected response:
# {
#   "status": "ok",
#   "services": {
#     "database": true,
#     "supabase": true,
#     "backgroundJobs": true
#   }
# }
```

### Step 4: Monitor Logs

In Render Dashboard → `barpel-backend` → Logs (watch real-time deployment)

---

## 🌐 FRONTEND DEPLOYMENT (Vercel)

### Using Vercel CLI (Automated)

**Step 1: Get Vercel Token**
```bash
cat ~/.vercel/auth.json | jq -r '.token'
# Output: Your Vercel token
```

**Step 2: Deploy Main App**
```bash
export VERCEL_TOKEN=$(cat ~/.vercel/auth.json | jq -r '.token')
cd /Users/mac/Desktop/Barpel
vercel deploy --prod --token=$VERCEL_TOKEN
```

**Expected output:**
```
Vercel CLI 49.1.2
Deploying barpel-dashboard
Uploading [===================] (4.2MB)
Production: https://barpel-dashboard.vercel.app
Building...
✓ Compiled successfully
✓ Generated 69 static pages
Production: https://barpel-dashboard.vercel.app [55s]
```

**Step 3: Deploy Marketing Site (Optional)**
```bash
cd /Users/mac/Desktop/Barpel/frontend/website
vercel deploy --prod --token=$VERCEL_TOKEN
```

**Step 4: Set Environment Variables in Vercel**

In Vercel Dashboard → Project Settings → Environment Variables:

```
# Frontend Environment Variables
NEXT_PUBLIC_BACKEND_URL=https://barpel-backend.onrender.com
NEXT_PUBLIC_APP_URL=https://barpel-dashboard.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://wifcmvgwzicgyrvaoiwi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-key]

# Stripe (public)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[your-key]

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=[your-id]

# Analytics
NEXT_PUBLIC_GA_ID=[your-ga-id]
```

### Step 5: Verify Deployment

```bash
# Test main app
curl -s https://barpel-dashboard.vercel.app | head -20

# Test marketing site
curl -s https://barpel-marketing.vercel.app | head -20

# Test API endpoint
curl -s https://barpel-dashboard.vercel.app/api/health
```

---

## 📊 Post-Deployment Verification

### Health Checks
```bash
# Backend health
curl -s https://barpel-backend.onrender.com/health | jq .

# Frontend health
curl -s https://barpel-dashboard.vercel.app/ | grep -c "Barpel"

# API endpoint
curl -s https://barpel-dashboard.vercel.app/api/agents | jq '.length'
```

### Test Critical Flows
- [ ] User signup (Google OAuth)
- [ ] Agent creation
- [ ] Voice testing
- [ ] Appointment booking
- [ ] Calendar integration
- [ ] Wallet top-up (Stripe)

### Monitor Logs
- **Backend:** `https://dashboard.render.com/` → Logs
- **Frontend:** `https://vercel.com/dashboard` → Deployments → Logs

---

## 🔄 Deployment Commands Reference

### Quick Deploy (All Services)
```bash
# 1. Push to GitHub
git add .
git commit -m "feat: update"
git push origin main

# 2. Deploy Backend (Render)
# → Automatic via GitHub integration

# 3. Deploy Frontend (Vercel)
export VERCEL_TOKEN=$(cat ~/.vercel/auth.json | jq -r '.token')
vercel deploy --prod --token=$VERCEL_TOKEN
```

### Rollback (if needed)

**Render Rollback:**
1. Go to Render Dashboard
2. Click "Deployments"
3. Select previous deployment
4. Click "Redeploy"

**Vercel Rollback:**
```bash
vercel rollback --token=$VERCEL_TOKEN
```

---

## 🆘 Troubleshooting

### Backend Issues
- **Connection failed:** Check Supabase URL and credentials
- **Build failed:** Check `backend/` npm scripts in package.json
- **Health check fails:** Check database connectivity in Render logs

### Frontend Issues
- **Build failed:** Run `npm run build` locally to debug
- **API calls fail:** Verify `NEXT_PUBLIC_BACKEND_URL` in Vercel env vars
- **Auth fails:** Check Supabase credentials and Google OAuth settings

---

## 📈 Performance Monitoring

### Vercel Analytics
- https://vercel.com/dashboard/barpel-dashboard/analytics

### Render Metrics
- https://dashboard.render.com/services/barpel-backend/metrics

### Sentry Error Tracking
- https://sentry.io (if configured)

---

## 🎯 Deployment Complete When:

✅ Backend responds on `https://barpel-backend.onrender.com/health`
✅ Frontend loads on `https://barpel-dashboard.vercel.app`
✅ API calls work (frontend → backend)
✅ Database connected (Supabase)
✅ Auth working (Google OAuth)
✅ All critical flows tested

---

**Status:** Ready for deployment
**Last Updated:** 2026-03-08
**Next:** Deploy backend and frontend
