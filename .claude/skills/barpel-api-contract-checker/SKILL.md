---
name: barpel-api-contract-checker
description: Verify backend API endpoint response contracts match frontend expectations for the Barpel AI dashboard. Check field name mappings, response shapes, error handling, caching, and naming consistency across calls-dashboard, analytics, and appointments routes. Use when auditing API layer correctness or debugging frontend-backend mismatches.
allowed-tools: Read, Grep, Glob
---

# Barpel API Contract Checker

Backend API agent that verifies endpoint response contracts match frontend expectations across all dashboard routes.

## Senior Engineer Review Criteria (Primary Focus)

1. **#1 Logical Mistakes** - Do response field names match what the frontend expects? Are transformations correct?
2. **#3 Naming Conventions** - Is there consistent camelCase vs snake_case? Are deprecated fields still being sent?
3. **#4 Performance** - N+1 queries? Redundant database calls? Missing pagination?
4. **#6 Ambiguous Code** - Are response shapes documented? Are fallback paths clear?
5. **#7 Debug Code** - console.log statements? Hardcoded test data? TODO comments that affect behavior?

## Instructions

### Step 1: Audit calls-dashboard.ts Response Contracts

**File:** `backend/src/routes/calls-dashboard.ts`

For each endpoint, document the EXACT response shape:

**GET /api/calls-dashboard** (paginated call list)
- What fields are returned per call?
- Does `call_type` parameter correctly filter by `call_direction`?
- Is `resolved_caller_name` from the VIEW mapped to frontend's expected `caller_name`?
- Are `sentiment_label`, `sentiment_score` included in response?
- Is pagination correct (offset/limit)?

**GET /api/calls-dashboard/stats** (dashboard stats)
- What fields: `totalCalls`, `avgDuration`, `recentCalls`?
- Does the RPC fallback calculate the same fields as the VIEW?
- Is the cache import correct? Check if `getCached`/`setCached` are imported properly.
- Are `timeWindow` values validated?

**GET /api/calls-dashboard/:callId** (call detail)
- Does it include `transcript`, `recording_url`, `cost_cents`, `tools_used`?
- Is the contacts JOIN correct for caller details?

**GET /api/calls-dashboard/:callId/recording-url** (signed URL)
- Does it handle missing recording_url?
- Is the signed URL expiry reasonable?

**DELETE /api/calls-dashboard/:callId** (delete call)
- Does it verify org_id before deletion?

### Step 2: Audit analytics.ts Response Contracts

**File:** `backend/src/routes/analytics.ts`

**GET /api/analytics/dashboard-pulse**
- What fields: `total_calls`, `avg_sentiment`, `appointments_booked`, `avg_duration`?
- Does the VIEW fallback compute the same fields?
- Are hardcoded `0` values for `pipeline_value`, `success_rate`, `hot_leads_count`?

**GET /api/analytics/leads**
- What fields per lead?
- Is there a fallback if `view_actionable_leads` VIEW doesn't exist?
- What happens when the VIEW query fails?

**GET /api/analytics/recent-activity**
- What are the 3 parallel queries?
- How are results merged and sorted?
- What is the event type schema: `call_completed`, `hot_lead_detected`, `appointment_booked`?

### Step 3: Audit appointments.ts Response Contracts

**File:** `backend/src/routes/appointments.ts`

**GET /api/appointments** (paginated list)
- What fields per appointment?
- How is `contact_name` resolved (JOIN with contacts)?
- How is call enrichment done (batch query via `appointment_id` IN)?
- Does `transformAppointment()` merge call data correctly?
- Are `outcome_summary`, `sentiment_label`, `has_recording` from the linked call?

### Step 4: Cross-Reference Frontend Expectations

Search frontend files for the field names they expect:

**Files to check:**
- `src/app/dashboard/calls/page.tsx` - What fields does the table render?
- `src/app/dashboard/appointments/page.tsx` - What fields does the table render?
- `src/app/dashboard/page.tsx` - What fields does the overview use?
- `src/components/dashboard/ClinicalPulse.tsx` - What fields do stat cards use?

For each frontend field, trace back to:
1. The SWR fetch URL
2. The backend route handler
3. The database query/VIEW
4. The actual column in the `calls` or `appointments` table

### Step 5: Check Error Handling Patterns

For each endpoint:
- Is there a try-catch block?
- Does it return consistent error shapes (`{ error: string, details?: string }`)?
- Are 404s vs 500s distinguished?
- Is org_id validated from JWT before database queries?

## Output Format

For each finding, report:
```
**[P0/P1/P2/P3]** [Category] - [Summary]
- File: [path:line_number]
- Issue: [description]
- Frontend expects: [field name/shape]
- Backend returns: [field name/shape]
- Fix: [recommended fix]
```

Severity levels:
- **P0**: Frontend displays wrong/missing data
- **P1**: Inconsistent field names causing silent failures
- **P2**: Missing error handling or poor performance
- **P3**: Code quality, naming, or documentation issue
