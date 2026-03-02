---
name: barpel-data-flow-verifier
description: Verify database schema integrity, VIEW/RPC existence, webhook data flow, and Golden Record SSOT implementation for the Barpel AI dashboard. Use when auditing data layer correctness, checking migrations, verifying Supabase views and RPCs, or validating webhook-to-database writes.
allowed-tools: Read, Grep, Glob
---

# Barpel Data Flow Verifier

Technical Architecture agent that verifies the database layer, webhook handler, and VAPI integration correctness for the Barpel AI dashboard.

## Senior Engineer Review Criteria (Primary Focus)

This agent applies these criteria from the 9-point senior engineer review framework:

1. **#1 Logical Mistakes** - Do webhook writes match the database schema? Are column names correct? Are types compatible?
2. **#2 Edge Cases** - What happens when VAPI sends null/missing fields? When cost is 0? When analysis object is absent?
3. **#4 Performance** - Are there missing indexes? N+1 queries? Unnecessary full-table scans?
4. **#5 Security** - Is org_id filtering enforced on all queries? Are RLS policies active? Any SQL injection vectors?

## Instructions

### Step 1: Verify Database Schema Against Golden Record SSOT

Read the database SSOT file and verify all expected columns exist:

**File to read:** `.agent/database-ssot.md`

Check that the `calls` table has ALL Golden Record columns:
- `id`, `org_id`, `vapi_call_id`, `call_direction`
- `from_number`, `to_number`, `phone_number`, `caller_name`
- `status`, `ended_reason`, `duration_seconds`
- `transcript`, `recording_url`, `recording_status`
- `summary`, `outcome`, `outcome_summary`
- `sentiment_label`, `sentiment_score`, `sentiment_summary`, `sentiment_urgency`
- `cost_cents`, `cost_breakdown`
- `tools_used`, `appointment_id`
- `vapi_assistant_id`, `contact_id`
- `created_at`, `updated_at`

### Step 2: Check Supabase VIEWs and RPCs Exist

Search migrations directory for these critical database objects:

**Directory:** `backend/supabase/migrations/`

Look for CREATE VIEW/FUNCTION statements for:
1. `calls_with_caller_names` VIEW - Used by ALL call list queries
2. `view_clinical_dashboard_pulse` VIEW - Used by dashboard pulse endpoint
3. `view_actionable_leads` VIEW - Used by leads endpoint (NO fallback!)
4. `get_dashboard_stats_optimized` RPC - Used by stats endpoint
5. `book_appointment_with_lock` RPC - Used by appointment booking

For each, document:
- Does the migration file exist?
- What columns/fields does it return?
- Is it referenced correctly in backend code?

### Step 3: Verify Webhook Handler Writes

Read the webhook handler and verify all Golden Record columns are written correctly:

**File:** `backend/src/routes/vapi-webhook.ts`

Check the `end-of-call-report` handler for:
- Cost calculation: `Math.ceil(rawCost * 100)` from `message.cost ?? call.cost ?? call.costs.total`
- Sentiment extraction: `analysis.sentiment`, `analysis.structuredData.sentimentScore`
- Transcript storage: `artifact.transcript` or `artifact.messages`
- Recording URL: `artifact.recordingUrl`
- Tools used: `artifact.messages.filter(m => m.role === 'tool_calls')`
- Appointment linkage: time-bounded query for unlinked appointments
- Hot lead alerts: score >= 60 threshold
- Caller name enrichment: contact lookup by phone number

### Step 4: Verify Agent Sync Configuration

Read the agent sync route and verify `analysisPlan` is configured:

**File:** `backend/src/routes/agent-sync.ts`

Check that `analysisPlan.structuredDataSchema` includes:
- `sentimentScore` (number)
- `sentimentUrgency` (string)
- `shortOutcome` (string)
- `appointmentBooked` (boolean)

### Step 5: Check Index Coverage

Verify performance-critical indexes exist:
- `calls(org_id, created_at DESC)` - Call list pagination
- `calls(org_id, call_direction)` - Inbound/outbound filtering
- `calls(vapi_call_id)` - Webhook upsert lookup
- `appointments(org_id, scheduled_time)` - Appointment queries
- `hot_lead_alerts(org_id, created_at)` - Recent activity feed

## Output Format

For each finding, report:
```
**[P0/P1/P2/P3]** [Category] - [Summary]
- File: [path:line_number]
- Issue: [description]
- Impact: [what breaks if unfixed]
- Fix: [recommended fix]
```

Severity levels:
- **P0**: Data loss or complete feature failure
- **P1**: Incorrect data displayed or security vulnerability
- **P2**: Performance degradation or poor UX
- **P3**: Code quality, naming, or documentation issue
