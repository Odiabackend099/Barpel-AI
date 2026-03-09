# planning.md — BYOC Wallet Top-Up (Onboarding Step 1)

## What Problem It Solves

BYOC users skip payment entirely (goToStep(2)) and start with wallet_balance_pence = 0.
At 56p/min, they hit the £5 debt limit after ~9 minutes on their first call and the platform
cuts them off. They need prepaid credits before going live — just without paying for a managed
phone number they don't need.

## Inputs / Outputs / Constraints

**Inputs:**
- numberSource = 'byoc' in Zustand store
- byocSaved = true (credentials verified, vapiPhoneId set)
- selectedAmountPence chosen by user (min £10 = 1000 pence)

**Outputs:**
- paymentComplete = true in Zustand store
- organizations.wallet_balance_pence incremented in DB (via Stripe webhook → BillingQueue)
- User advances to Step 2 (TelecomRouting) — no phone provisioning

**Constraints:**
- No phone number cost (managed = £10 deducted, BYOC = £0 deducted)
- Same Stripe checkout endpoint (POST /api/billing/wallet/topup) — backend is path-agnostic
- Same ?topup=success return handler in onboarding/page.tsx — no change needed
- No backend changes needed
- No DB schema changes needed

## Dependencies & Assumptions

- POST /api/billing/wallet/topup already handles credits without knowing about phone provisioning
- BillingQueue processes Stripe webhook → credits wallet (this is the existing Redis-dependent path)
- onboarding/page.tsx ?topup=success handler already does: setPaymentComplete(true), goToStep(1)
- StepPayment already gates provisioning behind: !paymentComplete || phoneNumber || hasAttemptedProvision.current
  → we add numberSource !== 'byoc' to that gate

---

## Implementation Phases

### Phase 1 — Fix navigation: BYOC → Step 1 (not Step 2)

**File:** src/components/onboarding/StepNumberSelection.tsx
**Change:** handleContinue() line 148
```
// BEFORE
goToStep(2); // Skip payment step — BYOC users already paid externally

// AFTER
nextStep(); // Go to Step 1 (wallet top-up) — BYOC users need call credits
```
**Why:** BYOC users bring their own number but still need credits. nextStep() = Step 1 = StepPayment.

### Phase 2 — BYOC mode in StepPayment

**File:** src/components/onboarding/StepPayment.tsx
**What changes:**

2a. Read numberSource from store
2b. Phase A (pre-payment) BYOC mode:
    - Title: "Add Call Credits"
    - Subtitle: "Top up your wallet to start making and receiving AI calls."
    - No phone cost row in breakdown (no PHONE_COST_PENCE deduction)
    - creditsPence = selectedAmountPence (full amount = credits)
    - Presets start at 1000 (£10) not 2500 — no number cost to offset
    - Button: "Add Credits — £XX" instead of "Get My AI Number — £XX"

2c. Phase B (post-payment) BYOC mode:
    - Skip provisioning useEffect entirely (gate: numberSource !== 'byoc')
    - Success state: "Credits Added!" title + wallet icon + green check
    - No phone number display
    - "Continue Setup" button → handleContinue() → nextStep()

**Pre-payment breakdown for BYOC:**
```
Your top-up       £XX.XX
Call Credits      £XX.XX   ← full amount, no phone deduction
────────────────────────
Total             £XX.XX
≈ N minutes of calls
```

**Pre-payment breakdown for Managed (unchanged):**
```
Your top-up       £XX.XX
AI Phone Number   -£10.00
Call Credits      £XX.XX
────────────────────────
Total             £XX.XX
≈ N minutes of calls
```

---

## Testing Criteria

1. BYOC user sees "Add Call Credits" headline in Step 1 (not "Activate Your AI Number")
2. BYOC user sees no £10 phone deduction in price breakdown
3. BYOC user clicks "Add Credits" → redirected to Stripe
4. After Stripe → ?topup=success → back to Step 1 with paymentComplete=true
5. BYOC user sees "Credits Added!" not "Setting Up Your Number..."
6. BYOC user is NOT sent through phone provisioning (no POST /api/onboarding/provision-number)
7. "Continue" → advances to Step 2 (TelecomRouting)
8. Managed user flow completely unchanged

## Files to Modify

| File | Change |
|------|--------|
| src/components/onboarding/StepNumberSelection.tsx | goToStep(2) → nextStep() for BYOC |
| src/components/onboarding/StepPayment.tsx | BYOC mode: UI + skip provisioning |

## Files NOT Changed

| File | Reason |
|------|--------|
| src/app/dashboard/onboarding/page.tsx | ?topup=success handler works for both paths |
| backend/src/routes/billing-api.ts | Wallet topup endpoint is path-agnostic |
| backend/src/config/billing-queue.ts | No change |
| database | No schema changes |
