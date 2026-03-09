# Redis Authentication Failure - Diagnostic & Fix Guide

**Date:** 2026-03-08 17:34:17 UTC
**Severity:** 🔴 CRITICAL
**Status:** Active Incident
**ETA to Fix:** 5 minutes (once manual env var updated)

---

## Executive Summary

All background job queues are failing due to Redis authentication error. The root cause is a misconfigured `REDIS_URL` environment variable in the Render dashboard.

**Impact:**
- ❌ Webhooks from Vapi not being processed (call logs disappearing)
- ❌ Wallet charges not being deducted
- ❌ Billing records not being created
- ❌ Appointment confirmations not sending
- ✅ Database: Still working
- ✅ Frontend: Still working
- ✅ API: Still responding (but async jobs broken)

---

## Diagnosis

### Error Signature
```
ReplyError: WRONGPASS invalid username-password pair
at parseError (/redis-parser/lib/parser.js:179:12)
command: { name: 'auth', args: [ 'default', '...' ] }
```

### What This Means
Redis is rejecting the authentication attempt. The connection is successful (TLS handshake works), but the username/password provided in the connection URL doesn't match the Redis server's credentials.

### Root Cause Analysis

**Evidence from Logs:**
1. **Connection attempt:** Successfully connects to `rapid-macaque-66085.upstash.io:6379`
2. **Auth attempt:** Sends `AUTH default [PASSWORD]`
3. **Rejection:** Server responds `WRONGPASS invalid username-password pair`

**Hypothesis 1: Wrong Credentials (70% probability)**
- Redis instance was rotated or replaced
- Old instance: `hip-flounder-31845.upstash.io` (documented in code)
- New instance: `rapid-macaque-66085.upstash.io` (in logs)
- Old credentials don't work with new instance
- **Fix:** Update to new instance's credentials

**Hypothesis 2: Malformed URL (25% probability)**
- `REDIS_URL` contains embedded CLI flags
- **Wrong:** `redis-cli --tls -u redis://default:PASSWORD@host:6379`
- **Right:** `rediss://default:PASSWORD@host:6379`
- Parser gets confused, sends wrong AUTH command
- **Fix:** Remove CLI flags, use URL-only format

**Hypothesis 3: Protocol Mismatch (5% probability)**
- Using `redis://` instead of `rediss://` (TLS)
- Upstash requires TLS for security
- **Fix:** Change `redis://` to `rediss://`

---

## Step-by-Step Fix

### Step 1: Get Current Redis Credentials

**Via Upstash Dashboard (Recommended):**
1. Go to https://console.upstash.com
2. Select the Redis instance `rapid-macaque-66085`
3. Click "Details" button in top right
4. Scroll down to find **"Redis CLI"** section
5. Copy the entire connection string (looks like):
   ```
   redis-cli --tls -u redis://default:PASSWORD@rapid-macaque-66085.upstash.io:6379
   ```

**Alternative: Extract from logs**
If Upstash is unavailable, use the redis-cli command the user provided:
```
redis-cli --tls -u redis://default:gQAAAAAAAQIlAAIncDFmY2IzMWNhMDk1ZWQ0ZWQ5YjExNTU2Y2YxYWZiNzUyNHAxNjYwODU@rapid-macaque-66085.upstash.io:6379
```

### Step 2: Convert to Environment Variable Format

Take the CLI string and extract the URL part:

**Before (CLI format):**
```
redis-cli --tls -u redis://default:gQAAAAAAAQIlAAIncDFmY2IzMWNhMDk1ZWQ0ZWQ5YjExNTU2Y2YxYWZiNzUyNHAxNjYwODU@rapid-macaque-66085.upstash.io:6379
```

**After (env var format):**
```
rediss://default:gQAAAAAAAQIlAAIncDFmY2IzMWNhMDk1ZWQ0ZWQ5YjExNTU2Y2YxYWZiNzUyNHAxNjYwODU@rapid-macaque-66085.upstash.io:6379
```

**Key changes:**
- Remove: `redis-cli --tls -u ` prefix
- Replace: `redis://` → `rediss://` (enables TLS)
- Keep: Everything after protocol (`default:PASSWORD@host:6379`)

### Step 3: Update Render Dashboard

1. **Log into Render:** https://dashboard.render.com
2. **Select service:** `barpel-backend` (or your backend service name)
3. **Navigate:** Settings → Environment
4. **Find:** `REDIS_URL` variable (scroll down if needed)
5. **Update:**
   - Select the value field
   - Clear all current content (Ctrl+A, Delete)
   - Paste the corrected URL from Step 2
   - Example:
     ```
     rediss://default:gQAAAAAAAQIlAAIncDFmY2IzMWNhMDk1ZWQ0ZWQ5YjExNTU2Y2YxYWZiNzUyNHAxNjYwODU@rapid-macaque-66085.upstash.io:6379
     ```
6. **Save:** Click "Update" or "Save" button (bottom right)
7. **Wait:** Render automatically restarts (visible as "Deploying..." status)

### Step 4: Verify the Fix

**Wait 30-60 seconds for Render restart, then:**

**Option A: Check Health Endpoint (Immediate)**
```bash
curl https://barpel-ai.onrender.com/health
```

**Expected response:**
```json
{
  "database": true,
  "supabase": true,
  "backgroundJobs": true,
  "webhookQueue": true
}
```

**Key indicator:** `"webhookQueue": true` (was false before)

**Option B: Monitor Render Logs (Wait 1-2 minutes)**
1. In Render dashboard → Logs tab
2. Look for:
   - ✅ Success message: `"Redis connected successfully"`
   - ❌ Error message: `"Connection error"` or `"WRONGPASS"`
3. If you see "Redis connected" → **Fix successful!**

**Option C: Make a Test Call (End-to-end verification)**
1. Go to https://app-barpelai.odia.dev/dashboard
2. Start a test call
3. Hang up after it connects
4. Wait 5 seconds
5. Check dashboard call logs → should see new call entry
6. If call appears → **Background jobs working!**

---

## Troubleshooting

### Still Getting "WRONGPASS" Error?

**Check 1: Protocol is `rediss://` not `redis://`**
- ❌ Wrong: `redis://default:PASSWORD@host:6379`
- ✅ Right: `rediss://default:PASSWORD@host:6379`
- Action: Edit Render REDIS_URL, change `redis://` to `rediss://`

**Check 2: No embedded CLI flags**
- ❌ Wrong: `redis-cli --tls -u redis://...`
- ✅ Right: `rediss://...`
- Action: Make sure there's no `redis-cli `, `--tls`, or `-u ` at the start

**Check 3: Password contains special characters?**
- Some passwords have special chars like `@`, `#`, `$`
- Check Upstash dashboard to confirm exact password
- Ensure no accidental edits when copying
- Action: Get fresh copy from Upstash, paste carefully

**Check 4: Wrong Upstash instance?**
- Verify you're copying from `rapid-macaque-66085` instance
- Logs show this is the current instance
- Old instance `hip-flounder-31845` has different credentials
- Action: Confirm instance name matches logs

**Check 5: Render still using old code?**
- Sometimes Render cache issues
- Force a rebuild:
  1. In Render dashboard → Manual Deploy → Re-deploy
  2. Wait 5 minutes for fresh build
  3. Then test health check again

### After Fix: What Should Happen?

1. **Immediate (within 30s):**
   - Render shows "Update Complete"
   - Service goes from "Deploying" back to "Live"

2. **Within 1 minute:**
   - Logs show "Redis connected successfully"
   - Health check endpoint starts returning `webhookQueue: true`

3. **Within 5 minutes:**
   - Any pending webhooks start processing
   - Call logs begin appearing in dashboard
   - Wallet charges start recording

4. **Within 15 minutes:**
   - All queued jobs cleared
   - System fully operational
   - No more "WRONGPASS" errors in logs

---

## Prevention for Future

### 1. Document Redis Configuration
- Store connection string in password manager, not just env vars
- Mark as "Upstash - rapid-macaque-66085" for clarity
- Include setup date and rotation schedule

### 2. Set Up Monitoring Alerts
- Monitor Render logs for "WRONGPASS" errors
- Alert when `webhookQueue` status is false
- Set up Sentry alert for Redis connection failures
- Response: Check health endpoint immediately

### 3. Quarterly Credential Rotation
- Every 90 days: Rotate Redis password in Upstash
- Update Render REDIS_URL with new password
- Document in changelog
- Test with health endpoint

### 4. Testing Before Production
- Always test connection before deploying env changes
- Use: `redis-cli --tls -u [CONNECTION_STRING] PING`
- Expected response: `PONG`

---

## Technical Details

### Why `rediss://` instead of `redis://`?
- **`redis://`**: Plain connection (no encryption) — works for localhost only
- **`rediss://`**: TLS-encrypted connection — required by Upstash for security
- Upstash is a cloud service and enforces TLS
- Render is also cloud-based and requires secure connections

### Why does the password contain special characters?
- Upstash generates cryptographically-secure passwords
- Base64-encoded to ensure safely transmittable
- Long format: typically 80+ characters
- All characters are valid in URLs when properly encoded

### Why WebhookQueue first?
- BullMQ initializes all workers on startup
- If Redis fails to connect, ALL workers fail
- WebhookQueue is most visible (users see Vapi calls missing)
- Other queues silently fail without user notice

### Timeline of Events
```
17:34:17 UTC
├─ Redis password changed or instance rotated
├─ Backend code tries to connect with old REDIS_URL
├─ Auth command sent: AUTH default [OLD_PASSWORD]
├─ Server rejects: WRONGPASS invalid username-password pair
├─ All workers crash
├─ Webhooks start queuing up (not processing)
├─ Dashboard call logs stop updating
├─ User notices no new calls in dashboard
└─ (Fix applied)
    ├─ Render env var updated with new credentials
    ├─ Service restarts (30s)
    ├─ Auth command sent: AUTH default [NEW_PASSWORD]
    ├─ Server accepts: +OK
    ├─ Workers reconnect
    ├─ Queued webhooks start processing
    └─ Dashboard updates in real-time
```

---

## Checklist

- [ ] Read this entire document
- [ ] Log into Upstash or collect redis-cli command
- [ ] Convert connection string to env var format
- [ ] Log into Render dashboard
- [ ] Navigate to barpel-backend service settings
- [ ] Update REDIS_URL environment variable
- [ ] Click Save/Update
- [ ] Wait 30-60 seconds for restart
- [ ] Verify health check endpoint returns `webhookQueue: true`
- [ ] Check Render logs for "Redis connected" message
- [ ] Make test call to verify background jobs working
- [ ] Update MEMORY.md with completion status
- [ ] Update `.agent/prd.md` "CRITICAL ISSUE" section to mark resolved

---

## Contact & Escalation

**If fix doesn't work after 5 minutes:**
1. Check Render logs for exact error message
2. Verify REDIS_URL doesn't contain CLI flags
3. Try manual Render redeploy
4. Check Upstash dashboard for instance status
5. If still failing, escalate to Render support or Upstash support with:
   - Render service name: `barpel-backend`
   - Upstash instance: `rapid-macaque-66085`
   - Error: `WRONGPASS invalid username-password pair`
   - Time started: 2026-03-08 17:34:17 UTC

**Sentry alerting:** Once fixed, update Sentry to clear "Redis Connection Failed" alert

---

## Summary

**What broke:** Redis authentication failed → all job queues crashed
**Why it broke:** `REDIS_URL` has old credentials or wrong format
**How to fix:** Update env var to correct connection string (5 minutes)
**How to verify:** Health check endpoint + logs + test call
**How to prevent:** Quarterly password rotation + monitoring alerts

**Estimated fix time: 5 minutes**
**Estimated validation time: 2 minutes**
**Total time to resolution: ~7 minutes**
