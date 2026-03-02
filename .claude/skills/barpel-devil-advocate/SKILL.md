---
name: barpel-devil-advocate
description: Challenge every assumption in the Barpel AI dashboard data flow. Find failure modes, race conditions, null safety issues, missing fallbacks, data loss scenarios, and security vulnerabilities. Use when stress-testing implementations, finding edge cases, or validating error handling across the VAPI webhook to dashboard pipeline.
allowed-tools: Read, Grep, Glob
---

# Barpel Devil's Advocate

Devil's Advocate agent that challenges every assumption, finds what breaks under stress, and identifies failure modes across the entire data pipeline.

## Senior Engineer Review Criteria (Primary Focus)

1. **#2 Edge Cases** - What inputs/states are unhandled? What happens with null, undefined, empty arrays, 0 values?
2. **#5 Security** - Can an attacker access another org's data? Are there injection vectors? Is PII exposed?
3. **#7 Debug Code** - console.log with sensitive data? Hardcoded tokens? Test data in production code?
4. **#8 Scalability** - What happens with 10,000 calls? 100 concurrent webhooks? 500 appointments?

## Instructions

### Step 1: VAPI Webhook Failure Modes

**File:** `backend/src/routes/vapi-webhook.ts`

Challenge these assumptions:

**Q: What if VAPI doesn't send the `analysis` object?**
- The `analysisPlan` is configured in agent-sync, but VAPI may not return it
- Check: Is there a null check before accessing `analysis.structuredData.sentimentScore`?
- Impact: Sentiment columns stay NULL, avg sentiment shows 0%

**Q: What if `message.cost` is 0 or negative?**
- Check: Is there validation on cost before `Math.ceil(rawCost * 100)`?
- Math.ceil(0 * 100) = 0 — is this handled?
- Math.ceil(-0.5 * 100) = 0 — negative costs?

**Q: What if the recording URL expires?**
- VAPI recording URLs may be temporary
- Check: Does the backend store the URL or re-fetch it?
- Impact: Recording playback fails silently

**Q: What if a call has no phone number?**
- Test calls from VAPI dashboard may not have a phone number
- Check: Is `from_number` or `to_number` validated before contact lookup?
- Impact: Contact enrichment fails, caller_name stays NULL

**Q: What if the webhook fires twice for the same call?**
- Check: Is there idempotency checking on `vapi_call_id`?
- Impact: Duplicate call records, double-counted stats

**Q: What about test calls leaking into production stats?**
- Check: Is there filtering for test/demo calls?
- Impact: Stats inflated with non-real calls

### Step 2: Database View Missing Scenarios

**Check migrations directory:** `backend/supabase/migrations/`

**Q: What if `calls_with_caller_names` VIEW doesn't exist in Supabase?**
- This VIEW is referenced in: calls-dashboard.ts, analytics.ts, dashboard-mvp.ts
- Check: Is there a fallback query if the VIEW fails?
- Impact: ALL call list queries return 500 errors

**Q: What if `view_actionable_leads` VIEW doesn't exist?**
- Referenced in analytics.ts leads endpoint
- Check: There is NO fallback for this endpoint
- Impact: Leads page completely broken, returns 500

**Q: What if `get_dashboard_stats_optimized` RPC doesn't exist?**
- Referenced in calls-dashboard.ts stats endpoint
- Check: There IS a JS fallback — but does it compute the same fields?
- Impact: Stats may be inconsistent between RPC and fallback

### Step 3: Race Conditions and Concurrency

**Q: Two calls ending simultaneously for the same contact?**
- Both try to update the contact's lead score
- Check: Is there locking on contact updates?
- Impact: Lost updates, inconsistent lead scores

**Q: Appointment booking during webhook processing?**
- Webhook tries to link appointment, but user just cancelled it
- Check: Is the linkage atomic? What if appointment_id points to a deleted appointment?
- Impact: Orphaned references, broken appointment links

**Q: Cache staleness during high activity?**
- Stats endpoint uses caching
- Check: Is cache invalidated when new calls arrive?
- Impact: Dashboard shows stale numbers

### Step 4: Data Integrity Under Stress

**Q: What if there are 10,000 calls in the database?**
- Check: Are list queries paginated? Is there a LIMIT?
- Check: Does the stats query use aggregation or fetch all rows?
- Impact: Slow queries, timeouts, high memory usage

**Q: What if `hot_lead_alerts` table is empty?**
- Recent activity endpoint queries this table
- Check: Does it handle empty results gracefully?
- Impact: Activity feed shows nothing even if there are calls

**Q: What if appointments have no linked calls?**
- `transformAppointment()` merges call data
- Check: What if `call_id` is NULL? Does it still render correctly?
- Impact: Appointment row shows undefined values

### Step 5: Security Vulnerabilities

**Q: Can a user access another org's calls?**
- Check: Is `org_id` from JWT used in EVERY query?
- Check: Are RLS policies enforced AND application-level filtering present?
- Check: Can the `callId` parameter in GET /:callId be guessed to access other orgs?

**Q: Is the recording URL signed correctly?**
- Check: Is the signed URL scoped to the org?
- Check: Can a user generate a signed URL for another org's recording?

**Q: Are there SQL injection vectors?**
- Check: Is `call_type` parameter sanitized before use in queries?
- Check: Are search/filter parameters escaped?

**Q: Is PII exposed in error responses?**
- Check: Do 500 errors leak stack traces, database column names, or internal paths?
- Check: Are phone numbers, names, transcripts redacted in logs?

### Step 6: Frontend Failure Modes

**Q: What if the API returns an empty array?**
- Check: Do tables show "No calls found" or just a blank space?
- Check: Do stat cards show "0" or "N/A" or "--"?

**Q: What if the API returns a 500?**
- Check: Does SWR show an error state?
- Check: Is there a retry mechanism?
- Check: Does the UI gracefully degrade or crash?

**Q: What if a field is unexpectedly null?**
- Check: Does `sentiment_score?.toFixed(0)` handle null?
- Check: Does `duration_seconds / 60` handle null/0?
- Check: Does `new Date(created_at)` handle null?

**Q: What about timezone handling?**
- Check: Are dates displayed in the user's local timezone?
- Check: Are appointment times consistent between creation and display?

## Output Format

For each finding, report:
```
**[P0/P1/P2/P3]** [Category] - [Summary]
- File: [path:line_number]
- Scenario: [what triggers this failure]
- Current behavior: [what happens now]
- Expected behavior: [what should happen]
- Impact: [blast radius if unfixed]
- Fix: [recommended fix]
```

Severity levels:
- **P0**: Data loss, security breach, or complete feature failure
- **P1**: Incorrect data, race condition, or silent failure
- **P2**: Poor degradation, missing error handling, or scalability concern
- **P3**: Minor edge case, logging issue, or code quality concern
