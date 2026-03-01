# Sign-Up Flow Verification Checklist

## ✅ Backend Fixes Already Applied
- [x] CORS fix: Added localhost:8000 and localhost:8001 to defaultOrigins in `backend/src/server.ts`
- [x] Backend restarted and CSRF endpoint verified working
- [x] Supabase Google provider enabled with credentials
- [x] Supabase URL configuration: Site URL = http://localhost:8000, Redirects = http://localhost:8000/**

---

## STEP 1: Verify CSRF Endpoint (Backend)

**Test in terminal:**
```bash
curl -s http://localhost:8001/api/csrf-token | jq .
```

**Expected response:**
```json
{
  "csrfToken": "1772337235595:...",
  "expiresAt": "2026-03-02T03:53:55.595Z"
}
```

**If you see:**
- ✅ Valid JSON with csrfToken → **PASS** - CORS fix is working
- ❌ "CORS not allowed" or connection refused → **FAIL** - Backend issue

---

## STEP 2: Test Email/Password Sign-Up

**Steps:**
1. Open browser to http://localhost:8000/sign-up
2. Check page loads with **dark background** (not white)
3. Fill in the form:
   - Name: "Test User"
   - Email: "test@company.com"
   - Password: "SecurePassword123!"
4. Click "Create Account →"

**Network tab expectations:**
1. First request: `GET http://localhost:8001/api/csrf-token` → 200 ✅
2. Second request: `POST http://localhost:8001/api/auth/signup` → 200 or 201 ✅
3. Third: Redirect to `/dashboard/onboarding`

**Expected outcome:**
- ✅ No "Unable to reach the server" error
- ✅ Form submits successfully
- ✅ Redirects to `/dashboard/onboarding` within 2 seconds
- ✅ No console errors (open DevTools → Console tab)

**If you see "Unable to reach the server":**
- Check Network tab for failed requests
- Look for CORS error in response headers
- Verify backend is running: `ps aux | grep "npm run dev" | grep -v grep`

---

## STEP 3: Test Google OAuth Login

**Steps:**
1. On `/sign-up` page, scroll down
2. Click "Continue with Google" button
3. You should be redirected to Google consent screen (not an error page)

**Expected flow:**
1. Click "Continue with Google"
2. Redirects to Google login (or consent if already logged in)
3. Grant permissions
4. Redirected back to `http://localhost:8000/auth/callback`
5. Automatically redirects to `/dashboard/onboarding`

**Expected outcome:**
- ✅ Google consent screen loads (not error page)
- ✅ Successfully redirected back after grant
- ✅ Authenticated and logged in

**If you see "Unsupported provider" error:**
- This means Google provider is disabled in Supabase
- Go to Supabase Dashboard → Auth → Providers
- Toggle Google **ON** and save credentials

**If callback URL fails:**
- Error: "Redirect URL not allowed"
- Go to Supabase Dashboard → Auth → URL Configuration
- Verify `http://localhost:8000/**` is in Redirect URLs
- Verify Site URL is `http://localhost:8000`

---

## STEP 4: Verify Visual Theme

**Check the sign-up page:**
- [ ] Left panel background is **dark** (#1C1C1E, not white)
- [ ] Text is **light** (barpel-dim-text, not black)
- [ ] Input fields have **dark background** (clinical-surface)
- [ ] Right panel has **dark background** with **brandy-colored dot pattern** (not blue)
- [ ] Gradient uses **dark brandy** tones (not blue)

**If page has white background:**
- Check browser cache: Hard refresh with Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)
- Check that CSS is loaded: DevTools → Network → Filter by "css" → Should show styles.css
- Verify tailwind classes: DevTools → Elements → Select body element → Check computed styles

---

## STEP 5: Test Login Page

**Steps:**
1. After successful signup, go to `/login`
2. Sign in with the account you just created
3. Should redirect to `/dashboard`

**Expected:**
- ✅ Page has dark theme (matches sign-up)
- ✅ Login succeeds
- ✅ Redirects to dashboard

---

## STEP 6: Verify Dashboard Access

**Expected state after signup:**
1. Redirect to `/dashboard/onboarding`
2. Should see onboarding flow or setup wizard
3. Check Network tab: Should show user authenticated (Authorization header in requests)

**If redirected to `/login` instead:**
- Session didn't persist
- Check browser Storage → Cookies → `sb-auth-token` should exist
- Check browser Storage → Local Storage → Supabase session data should exist

---

## SUMMARY: How to Interpret Results

| Test | Pass | Fail | Status |
|------|------|------|--------|
| CSRF endpoint | Returns token | CORS error | **Should PASS** |
| Email signup | Redirects to dashboard | "Unable to reach server" | **Should PASS** |
| Google OAuth | Consent screen appears | "Unsupported provider" | **Should PASS** |
| Visual theme | Dark background | White background | **Should PASS** |
| Login redirect | Goes to dashboard | Stays on login | **Should PASS** |

---

## Quick Verification (< 2 minutes)

If you don't have time for full testing, run these quick checks:

```bash
# 1. Is backend running?
curl http://localhost:8001/api/health | jq .

# 2. Is CSRF endpoint working?
curl http://localhost:8001/api/csrf-token | jq .

# 3. Is frontend running?
curl http://localhost:8000 | head -20
```

**All three should return 200 OK responses.**

---

## Troubleshooting Guide

**Problem: "Unable to reach the server" error**
```bash
# Check if backend is running
lsof -i :8001
# Should show: node ... listening on 8001

# If not, restart:
cd /Users/mac/Desktop/Barpel
npm run dev
# Wait for "Backend server running on port 8001"
```

**Problem: Google OAuth fails with "Unsupported provider"**
- Supabase Dashboard → Auth → Providers
- Click Google → Toggle ON → Paste credentials from your backend `.env`
- Save and wait 10 seconds for propagation

**Problem: Callback redirect not working**
- Supabase Dashboard → Auth → URL Configuration
- Site URL: `http://localhost:8000`
- Redirect URLs: Add `http://localhost:8000/**`
- Save

**Problem: Still seeing white background**
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Clear browser cache: Settings → Clear browsing data → Cached images/files
- Check Network tab → Disable cache during dev tools (DevTools → Settings → Network)

---

## What to Report If Issues Occur

When running tests, note:

1. **HTTP status codes** from Network tab
2. **Error messages** from console (DevTools → Console)
3. **Request/response bodies** for failed requests
4. **Which step** failed (CSRF, signup, OAuth, theme, etc.)
5. **Environment** (localhost:8000/8001 ports)

Example good report:
> "CSRF endpoint works (200), email signup fails with 'TypeError: orgId is undefined in signup handler', happens at step 2 of form submission"

---

## Success Criteria

✅ **Sign-up flow is ready for demo if:**
1. CSRF endpoint returns valid token
2. Email/password signup works without CORS errors
3. Google OAuth loads consent screen (not error page)
4. Both auth pages have dark theme
5. Dashboard loads after authentication
6. No console errors in browser DevTools

**If all 5 pass → Sign-up flow is PRODUCTION READY for demo!**
