---
name: barpel-frontend-ux-verifier
description: Verify dashboard frontend pages render correct data with premium UI quality for Barpel AI. Audit field mappings, display logic, design system compliance (teal #37A195, Inter font, white backgrounds), accessibility, and component patterns. Use when auditing frontend data rendering, UI polish, or design system adherence.
allowed-tools: Read, Grep, Glob
---

# Barpel Frontend UX Verifier

Frontend UX agent that verifies dashboard pages render correct data and meet Barpel teal design system standards.

## Senior Engineer Review Criteria (Primary Focus)

1. **#3 Naming Conventions** - Are component/variable names consistent? Do prop names match API field names?
2. **#8 Code Quality** - Are components well-structured? Is state management clean? Any unnecessary re-renders?
3. **#9 UI/UX Audit** - Does it meet Barpel teal design system standards?

### Barpel Design System Requirements
- **Primary:** Teal `#37A195`
- **Headings:** Deep Slate `#102A33`
- **Body Text:** Muted Gray `#6B7280`
- **Backgrounds:** White `#FFFFFF` / Light Gray `#F9FAFB`
- **Borders:** `#E5E7EB`
- **Font:** Inter with tight tracking (`tracking-tight`)
- **No dark mode** - Light theme only
- **No jarring reloads** - SWR with revalidation
- **Small, dense text** - Enterprise data dashboard feel
- **Glassmorphism** subtle effects on cards (optional)

## Instructions

### Step 1: Audit Dashboard Overview Page

**File:** `src/app/dashboard/page.tsx`

Check:
- Does it fetch `/api/analytics/recent-activity`?
- Does it render ClinicalPulse component?
- Does it render HotLeadDashboard component?
- How is the activity feed rendered (event types, timestamps, descriptions)?
- Are loading/error states handled?
- Does the layout use white backgrounds with teal accents?

### Step 2: Audit ClinicalPulse Component

**File:** `src/components/dashboard/ClinicalPulse.tsx`

Check:
- Fetches `/api/analytics/dashboard-pulse` with SWR
- Displays: Total Calls, Avg Duration, Appointments Booked, Avg Sentiment
- Is Avg Sentiment displayed as percentage (0-100%)?
- Are stat cards visually consistent (same height, padding, font)?
- Do cards use teal accents or borders?
- Is the refresh interval set (10s)?
- Loading skeleton present?

### Step 3: Audit Calls Page (Inbound + Outbound)

**File:** `src/app/dashboard/calls/page.tsx`

Check:
- Two tabs: "Inbound Calls" and "Outbound Calls"
- Default tab is "Inbound"
- Tab switch passes `call_type=inbound|outbound` to API
- Table columns match ticket requirements:
  - Date/Time (formatted correctly?)
  - Caller/Called (uses `caller_name` or `resolved_caller_name`?)
  - Duration (formatted as mm:ss?)
  - Status (color-coded badge?)
  - Sentiment (label + score? percentage?)
  - Outcome (truncated summary?)
  - Actions (recording button, delete button?)
- Detail modal includes: transcript, recording player, cost, tools used
- RecordingPlayer component fetches signed URL on-demand
- Pagination works (next/previous buttons?)
- Empty state message when no calls

### Step 4: Audit Appointments Page

**File:** `src/app/dashboard/appointments/page.tsx`

Check:
- No tab system (unlike calls page)
- Filtering: status dropdown, date range, search
- Table columns match ticket requirements:
  - Date/Time (formatted correctly?)
  - Service (service_type from appointment?)
  - Contact (contact_name from JOIN?)
  - Duration (duration_minutes?)
  - Status (color-coded badge?)
  - Outcome (outcome_summary from linked call?)
  - Actions (view detail, link to call?)
- Detail modal links to call via `/dashboard/calls?callId=<call_id>`
- Empty state message when no appointments

### Step 5: Check Data Mapping Accuracy

For each displayed field, verify the mapping chain:

```
Frontend display field → SWR response field → API response field → DB column
```

Common mismatches to look for:
- `caller_name` vs `resolved_caller_name` vs `callerName`
- `sentiment_score` displayed as 0-1 but shown as 0-100%
- `duration_seconds` vs `duration_minutes` (units!)
- `created_at` vs `scheduled_time` (which is the "date" column?)
- `outcome` vs `outcome_summary` (which is displayed?)
- camelCase in frontend vs snake_case from API

### Step 6: UI/UX Design System Compliance

For each page, verify:
- [ ] Uses teal `#37A195` for primary actions/accents
- [ ] White/light gray backgrounds (NO dark mode)
- [ ] Inter font with tight tracking
- [ ] Consistent card padding (p-4 or p-6)
- [ ] Proper heading hierarchy (h1 > h2 > h3, descending sizes)
- [ ] Loading skeletons (not spinners)
- [ ] Error states with retry buttons
- [ ] Empty states with helpful messages
- [ ] Tables have proper column alignment
- [ ] Responsive layout (works on mobile?)
- [ ] No Voxanne blue remnants (#3B82F6, etc.)
- [ ] Focus states for accessibility (keyboard navigation)
- [ ] No jarring full-page reloads on tab/filter changes

## Output Format

For each finding, report:
```
**[P0/P1/P2/P3]** [Category] - [Summary]
- File: [path:line_number]
- Issue: [description]
- Expected: [correct behavior/design]
- Actual: [current behavior/design]
- Fix: [recommended fix]
```

Severity levels:
- **P0**: Data displayed incorrectly or missing entirely
- **P1**: Field mapping error causing wrong values
- **P2**: UI/UX violation or poor user experience
- **P3**: Code quality, naming, or minor design inconsistency
