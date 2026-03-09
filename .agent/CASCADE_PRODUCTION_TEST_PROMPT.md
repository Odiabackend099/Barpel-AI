# CASCADE UNIFIED E2E TEST PROMPT - PRODUCTION
**Browser MCP Automation - Single Consolidated Prompt for Production Testing**

---

## 🎯 YOUR MISSION

You are **Cascade**, a business user testing the Barpel AI platform end-to-end on production. Use **Browser MCP** to:
1. Navigate the production website and create an agent
2. Sign up and complete onboarding
3. Configure settings (calendar, wallet, phone)
4. Test agent fetching (inbound vs outbound)
5. Audit error display quality (user-friendly vs developer errors)
6. Report everything you find

**Expected Duration:** 60-90 minutes
**Success Criteria:** Complete all steps with zero critical errors
**Environment:** PRODUCTION

---

## 📍 PRODUCTION URLS

### Primary URLs
- **Dashboard (Main App):** https://app-barpelai.odia.dev
- **Backend API:** https://barpel-ai.onrender.com
- **Health Check:** https://barpel-ai.onrender.com/health

### Test Credentials
- **Email:** Use any Gmail account (Google OAuth signup)
- **Test Phone for Callback:** +238-141-995-397
- **Stripe Test Card:** 4242 4242 4242 4242 (expiry: any future date, CVC: any 3 digits)

---

## PHASE 1: WEBSITE → AGENT CREATION

### Step 1.1: Navigate & Verify Website
- [ ] Open browser to: **https://app-barpelai.odia.dev**
- [ ] Page loads completely
- [ ] See "Start Free Trial" button
- [ ] See "Pay As You Go" pricing section visible
- **Report:** Website loads successfully, all CTAs visible

### Step 1.2: Click "Pay As You Go"
- [ ] Click the "Pay As You Go" pricing card
- [ ] Wait for page load
- [ ] Expected: Agent creation form appears or redirects to signup
- **Report:** Successfully navigated to agent creation page

### Step 1.3: Create Agent Named "Alight"
- [ ] If redirected to signup, complete Google signup first
- [ ] Return to agent creation
- [ ] Agent Name field: Type `Alight`
- [ ] Model field: Note the DEFAULT option selected (don't change)
- [ ] Description: Type `Alight - AI receptionist test agent`
- [ ] Click "Create Agent" button
- **Report:**
  - Agent created successfully ✓
  - Agent ID generated: `___________`
  - Model selected: `___________`

### Step 1.4: Update Agent System Prompt & First Message
- [ ] Navigate to agent settings/configuration
- [ ] Find "System Prompt" field
- [ ] Clear and replace with:
  ```
  You are Alight, an AI receptionist for a professional services firm.
  You answer calls with warmth and professionalism.
  Help callers book appointments or connect with the right person.
  ```
- [ ] Find "First Message" field
- [ ] Clear and replace with:
  ```
  Hello! Welcome to Alight. How can I help you today?
  ```
- [ ] Click "Save Agent"
- **Report:**
  - System prompt updated ✓
  - First message updated ✓
  - Save successful ✓

### Step 1.5: Verify Agent in Database & VAPI (Verification)
- [ ] Open DevTools: **F12 → Network tab**
- [ ] If needed, click Save again to capture API call
- [ ] Find API call to `/api/agents` (POST)
- [ ] **Report API details:**
  - Request URL: `___________`
  - Response status: `___________`
  - Agent ID in response: `___________`
  - VAPI Assistant ID in response: `___________`

---

## PHASE 2: SIGNUP → ONBOARDING → KNOWLEDGE BASE

### Step 2.1: Sign Up with Google
- [ ] If not already signed in, click "Sign Up" or "Get Started"
- [ ] Select "Sign up with Google"
- [ ] Use any Gmail account (recommended: dedicated test account)
- [ ] Grant all requested permissions
- [ ] Wait for redirect
- **Report:**
  - Google signup successful ✓
  - Account email: `___________`
  - Permissions granted ✓

### Step 2.2: Complete 5-Step Onboarding
Complete each step in sequence:

**Step 1 - Business Info:**
- Business Name: `Alight Demo Business`
- Phone: `+1-555-123-4567`
- Timezone: Select your timezone
- Click "Next"

**Step 2 - Availability:**
- Hours: `9am-5pm`
- Days: `Mon-Fri`
- Click "Next"

**Step 3 - Services:**
- Services: `Consultation, Treatment, Follow-up`
- Click "Next"

**Step 4 - Review:**
- Review all info
- Click "Continue"

**Step 5 - Complete:**
- Click "Complete Onboarding"

**Report:**
- All 5 steps completed ✓
- No validation errors ✓
- Redirected to dashboard ✓

### Step 2.3: Upload Knowledge Base
- [ ] Navigate to Dashboard → Knowledge Base
- [ ] Click "Upload Document" or "Add Knowledge Base"
- [ ] Create/download file with content:
  ```
  Business Hours: Monday-Friday 9am-5pm EST
  Services: Consultation, Treatment, Follow-up
  Pricing: Premium $99/month, Standard $49/month
  Cancellation Policy: 24 hours notice required
  Insurance: We accept most major plans
  ```
- [ ] Upload the file
- [ ] Wait for status to show "Ready" or "Active"
- **Report:**
  - Upload initiated ✓
  - Status: `Ready / Active / Processing`
  - Upload time: `___ seconds`

### Step 2.4: Verify Agent Accesses Knowledge Base
- [ ] Go to Dashboard → Test Agent (Browser Test tab)
- [ ] Click "Start Call"
- [ ] Wait for "Connected" status
- [ ] Ask agent: `"What are your business hours?"`
- [ ] Listen to response
- **Report:**
  - Call connected ✓
  - Agent response: `_____________________________`
  - Agent cited knowledge base: Yes / No
  - Response quality: Good / Acceptable / Poor

---

## PHASE 3: BILLING → CALENDAR

### Step 3.1: Top Up Wallet with Stripe
- [ ] Navigate to Dashboard → Wallet or Billing
- [ ] Click "Add Credit" or "Top Up Wallet"
- [ ] Enter amount: `50.00` (USD)
- [ ] Click to payment form
- [ ] Enter Stripe test card:
  - Card: `4242 4242 4242 4242`
  - Expiry: `12/25`
  - CVC: `123`
  - Zip: `12345`
- [ ] Click "Complete Payment"
- **Report:**
  - Payment processed ✓
  - Wallet balance: `$50.00`
  - No payment errors ✓

### Step 3.2: Connect Google Calendar
- [ ] Navigate to Dashboard → Settings → Calendar
- [ ] Click "Connect Google Calendar"
- [ ] In Google popup, sign in with **same Google account** used for signup
- [ ] Grant all calendar permissions
- [ ] Wait for redirect to dashboard
- **Report:**
  - Calendar connected ✓
  - Permissions granted ✓
  - Calendar name: `___________`

### Step 3.3: Verify Calendar Integration
- [ ] Navigate to Agent Configuration
- [ ] Look for "Calendar Integration" section
- [ ] Verify status shows: "Connected" or "Active"
- [ ] Make test call: Go to Test Agent
- [ ] Ask agent: `"What times are available tomorrow?"`
- [ ] Agent should respond with real availability
- **Report:**
  - Calendar shows as connected ✓
  - Agent accessed calendar ✓
  - Available times provided: `_____________________________`

---

## PHASE 4: AGENT TESTING - INBOUND & OUTBOUND

### Step 4.1: Test Browser Call with Inbound Agent
- [ ] Go to Dashboard → Test Agent (Browser Test tab)
- [ ] Verify agent dropdown shows "Alight"
- [ ] Click "Start Call"
- [ ] Wait for connection
- **Report:**
  - Browser test connected ✓
  - Agent fetched: "Alight" (confirm it's INBOUND)
  - Call status: Connected / Failed
  - **ERROR QUALITY:**
    - Friendly error shown: Yes / No
    - Developer error shown: Yes / No
    - Clarity: Good / Confusing
  - Error message (if any): `_____________________________`
- [ ] Click "End Call"
- **Report:**
  - Call ended gracefully ✓

### Step 4.2: Test Outbound Agent & Live Call
- [ ] Navigate to Dashboard → Agent Configuration
- [ ] Look for "Outbound Agent" or "Live Call Testing"
- [ ] Select an outbound agent from dropdown
- [ ] Click "Start Live Call Test"
- [ ] Enter phone number: `+238-141-995-397`
- [ ] Click "Initiate Call"
- **Report:**
  - Outbound agent selected: `___________`
  - Phone number accepted ✓
  - Call status: Connecting / Connected / Failed
  - Call duration: `___ seconds`
  - **ERROR QUALITY:**
    - Friendly error: Yes / No
    - Developer error: Yes / No
    - Actionable: Yes / No
  - Error message (if any): `_____________________________`
- [ ] End the call
- **Report:**
  - Call ended successfully ✓

### Step 4.3: Verify Agent Fetching Correctness
- [ ] Open DevTools: **F12 → Network tab**
- [ ] Repeat Step 4.1 (Browser test)
- [ ] Look for API calls: `GET /api/agents`
- **Report:**
  - API called with org ID: `___________`
  - Agent returned: "Alight" (inbound) ✓
  - Only ONE agent returned: Yes / No
  - No multiple agents: Verified ✓

- [ ] Repeat Step 4.2 (Outbound test)
- [ ] Look for API calls:
  - `GET /api/agents`
  - `POST /api/calls/initiate`
- **Report:**
  - API called with org ID: `___________`
  - Agent returned: Outbound agent ✓
  - Correct agent fetched (not inbound): Yes / No
  - Phone number included in request: Yes / No
  - Call initiated successfully: Yes / No

---

## PHASE 5: PHONE PROVISIONING

### Step 5.1: Provision Inbound Number
- [ ] Navigate to Dashboard → Settings → Phone Numbers
- [ ] Click "Provision New Number"
- [ ] Select:
  - Country: `United States`
  - Area Code: `212` (or your choice)
  - Voice capability: Checked ✓
- [ ] Click "Get Number"
- **Report:**
  - Form submitted ✓
  - Number provisioned: `___________` (e.g., +1-212-555-0123)
  - Status: Active / Pending / Failed
  - Monthly cost: `$___________`
  - **ERROR QUALITY (if error):**
    - Friendly error: Yes / No
    - User can understand: Yes / No
    - Next steps clear: Yes / No

---

## 🔍 ERROR DISPLAY QUALITY AUDIT

For EVERY error encountered, assess:

**ERROR #[N]:**
```
Page: _______________
Action: _______________
Error shown: _______________

Assessment:
☐ User-friendly? (Yes/No)
☐ Non-technical user understands? (Yes/No)
☐ Explains what happened? (Yes/No)
☐ Suggests how to fix? (Yes/No)
☐ Has action button? (Yes/No)
☐ No stack traces? (Yes/No)
☐ No error codes? (Yes/No)

Classification: FRIENDLY / DEVELOPER / MIXED
```

**Error Quality Examples:**

**GOOD (Friendly):**
- "Connection lost. Please try again."
- "Please enter a valid phone number (format: +1-555-123-4567)"
- "Your session expired. Please sign in again. [Sign In]"

**BAD (Developer):**
- "HTTPError 503 Service Unavailable"
- "ValidationError: phoneNumber must match /^\\+[1-9]\\d{1,14}$/"
- "AgentConfigError: agent_id is undefined"

---

## 📋 FINAL CHECKLIST

Mark each with ✓ or ✗:

**PHASE 1: WEBSITE & AGENT**
- [ ] Website loads (https://app-barpelai.odia.dev)
- [ ] "Pay As You Go" clickable
- [ ] Agent "Alight" created
- [ ] System prompt updated from default
- [ ] First message updated from default
- [ ] Agent in database verified

**PHASE 2: SIGNUP & ONBOARDING**
- [ ] Google signup with real account
- [ ] 5-step onboarding completed
- [ ] All steps without validation errors
- [ ] Knowledge base uploaded
- [ ] KB shows "Ready" status
- [ ] Agent can access KB in calls

**PHASE 3: BILLING & CALENDAR**
- [ ] Wallet topped up: $50.00
- [ ] Stripe test card accepted
- [ ] Wallet balance updated
- [ ] Google Calendar connected
- [ ] Same account used as signup
- [ ] Calendar shows "Connected"
- [ ] Agent can access calendar availability

**PHASE 4: AGENT TESTING**
- [ ] Browser test: Inbound agent fetched
- [ ] Only ONE agent returned (not multiple)
- [ ] Outbound test: Correct agent fetched
- [ ] Live call to +238-141-995-397 initiated
- [ ] Phone number format accepted
- [ ] API calls verified in Network tab
- [ ] No agent data leakage between orgs

**PHASE 5: PHONE PROVISIONING**
- [ ] Phone settings page accessible
- [ ] Number provisioning form visible
- [ ] Number provisioned (or error logged)
- [ ] Status shows: Active/Pending/Failed

**ERROR DISPLAY QUALITY**
- [ ] All errors user-friendly (not developer-first)
- [ ] No stack traces exposed
- [ ] No error codes (HTTP, etc.)
- [ ] No technical field names
- [ ] Error messages suggest next steps
- [ ] Action buttons provided
- [ ] Friendly errors: `___%`
- [ ] Developer errors: `___%`

**CONSOLE VALIDATION**
- [ ] Critical errors in console: `___`
- [ ] Warnings in console: `___`
- [ ] Network failures: `___`

---

## 📊 FINAL REPORT

Provide this summary:

```
CASCADE E2E TEST REPORT (PRODUCTION)
Date: _______________
Duration: ___ minutes
Environment: PRODUCTION (https://app-barpelai.odia.dev)

AGENT CREATION:
✓ Agent "Alight" created
✓ System prompt: "You are Alight..."
✓ First message: "Hello! Welcome to Alight..."
✓ Database verified

SIGNUP & SETUP:
✓ Google signup: [your email]
✓ Onboarding: 5/5 steps completed
✓ Knowledge base: Uploaded and Ready
✓ Wallet: $50.00 topped up
✓ Calendar: Connected

AGENT TESTING:
✓ Browser test: Inbound agent "Alight" fetched
✓ Outbound test: Correct agent fetched for live call
✓ Live call: +238-141-995-397 initiated
✓ Agent isolation: No data leakage verified

PHONE PROVISIONING:
[Status and result]

ERROR QUALITY:
✓ Friendly errors: ___%
✓ Developer errors: ___%
✓ Overall quality: Excellent/Good/Fair/Poor

CRITICAL ISSUES FOUND:
[List any developer-first errors that need fixing]

NEXT PHASE:
- User takes over phone number management
- All critical verification complete
- Platform ready for wider user testing
```

---

## ✅ SUCCESS CRITERIA

**PASS:** All checklist items marked ✓, <5% developer errors, 0 critical blocking issues
**FAIL:** Any ✗ items in critical sections, >20% developer errors, any critical blocking issues

---

**Status:** Ready to execute production testing
**URL:** https://app-barpelai.odia.dev
**Backend:** https://barpel-ai.onrender.com
**Use Browser MCP to complete all steps. Report every action and finding.**
