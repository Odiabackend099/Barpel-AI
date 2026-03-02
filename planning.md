# Planning: Fix Render Production Redis / VapiReconciliationWorker Crash Loop

**Date:** 2026-03-02
**Triggered by:** Render backend logs showing `ENOTFOUND red-d636tj7pm1nc73efjljg` flooding every ~100ms
**Service status:** HTTP serving works. Redis-dependent BullMQ workers fail continuously.

---

## Root Cause Analysis

### Issue 1 (Critical) — `vapi-reconciliation-worker.ts` creates Redis at module load time

Every other queue file (`webhook-queue.ts`, `wallet-queue.ts`, `billing-queue.ts`) follows the same safe pattern:
- Module-level variable starts as `null`
- `initialize*()` function calls `createRedisConnection()` from `config/redis.ts`
- If Redis is unavailable, returns early with a warning — no crash, no flood

`vapi-reconciliation-worker.ts` violates this pattern. It creates the Redis connection, Queue, AND Worker at the **top level of the module** (lines 16–52), meaning the moment the module is imported by `server.ts`, it:
1. Instantiates `new Redis(process.env.REDIS_URL || 'redis://localhost:6379')` — bypassing the circuit-breaker-aware `createRedisConnection()`
2. Instantiates `new Queue(...)` and `new Worker(...)` immediately against a failing Redis connection
3. BullMQ's Worker emits `error` events continuously as it retries, flooding logs every ~100ms

This is the direct cause of the crash loop in production logs.

### Issue 2 (Secondary) — `billing-reconciliation.ts` /history endpoint crashes on null queue

Line 178-179 in `billing-reconciliation.ts`:
```typescript
const [completed, failed] = await Promise.all([
  vapiReconcileQueue.getCompleted(0, limit - 1),  // TypeError if null
  vapiReconcileQueue.getFailed(0, limit - 1)
]);
```
After the fix, `vapiReconcileQueue` is `Queue | null`. This endpoint needs a null guard.

### Issue 3 (Infrastructure) — `REDIS_URL` not auto-injected by render.yaml

`render.yaml` has `REDIS_URL: sync: false` requiring manual entry. The proper Blueprint approach uses `fromDatabase` which Render auto-resolves to the correct internal connection string.

---

## Why Redis is ENOTFOUND

The Render Redis internal hostname `red-d636tj7pm1nc73efjljg` only resolves within Render's private network.

Likely cause: The `REDIS_URL` env var hasn't been set in the Render dashboard yet (secrets are `sync: false` — user must enter manually). Without it set, the code falls back to `'redis://localhost:6379'`... **but wait**: the error shows hostname `red-d636tj7pm1nc73efjljg`, so the env var IS set.

Alternative cause: The Render Redis service and web service aren't in the same private network region, OR Render's internal DNS isn't resolving for the free plan. The `fromDatabase` fix in render.yaml resolves this permanently.

---

## Implementation Phases

### Phase 1 — Fix `vapi-reconciliation-worker.ts` (the crash loop)

**File:** `backend/src/jobs/vapi-reconciliation-worker.ts`

Remove ALL module-level instantiation. Refactor to match `wallet-queue.ts`:

- `let vapiReconcileQueue: Queue | null = null`
- `let vapiReconcileWorker: Worker | null = null`
- New exported `initializeVapiReconciliationWorker()` function:
  - Calls `createRedisConnection()` (two separate connections — BullMQ Queue and Worker need separate connections)
  - Returns early if null (warns once, no crash)
  - Attaches event handlers inside this function
- `scheduleVapiReconciliation()`: guard `if (!vapiReconcileQueue) { warn + return }`
- `triggerManualReconciliation()`: guard `if (!vapiReconcileQueue) { throw descriptive Error }`
- `getReconciliationStatus()`: guard returns `{ available: false, ... }` shape
- `shutdownReconciliationWorker()`: null-safe close

### Phase 2 — Fix `billing-reconciliation.ts` `/history` endpoint

**File:** `backend/src/routes/billing-reconciliation.ts`

Add null guard before calling `vapiReconcileQueue.getCompleted/getFailed`:
```typescript
if (!vapiReconcileQueue) {
  return res.json({ success: true, history: [], message: 'Queue not available (Redis not connected)' });
}
```

Also fix `/health` endpoint: `getReconciliationStatus()` now returns `{ available: boolean, active: number, ... }`.
Guard: `if (!status.available) { return healthy: false with descriptive message }`.

### Phase 3 — Update `server.ts`

**File:** `backend/src/server.ts`

Add `initializeVapiReconciliationWorker` to the import (line 78).
Call it after `initializeSmsQueue()` (line 164).

### Phase 4 — Update `render.yaml`

Add a `databases:` section with a managed Redis instance. Change `REDIS_URL: sync: false` to `fromDatabase` auto-injection:

```yaml
databases:
  - type: redis
    name: barpel-redis
    plan: free
    region: oregon
    maxmemoryPolicy: noeviction

# In the web service envVars:
- key: REDIS_URL
  fromDatabase:
    name: barpel-redis
    property: connectionString
```

**Note:** When Blueprint sync is run, Render provisions a managed Redis named `barpel-redis` and injects the correct internal URL automatically. The existing manually-created Redis instance can be deleted after Blueprint sync succeeds.

---

## Testing Criteria

1. **Unit**: After fix, importing `vapi-reconciliation-worker.ts` must NOT trigger any Redis connection attempt
2. **Integration**: With `REDIS_URL` unset, server starts cleanly with a single WARN log — no error flood
3. **Integration**: With valid `REDIS_URL`, worker initializes and `scheduleVapiReconciliation()` runs successfully
4. **Route**: `GET /api/billing/reconciliation/history` returns `{ success: true, history: [] }` when Redis unavailable (no 500)
5. **Route**: `GET /api/billing/reconciliation/health` returns `{ healthy: false }` when Redis unavailable (no 500)
6. **Render**: After adding `fromDatabase`, `barpel-backend` health check passes with no Redis errors in logs

---

## Critical Invariants (Do Not Violate)

1. `vapiReconcileQueue` and `vapiReconcileWorker` must remain exported for `billing-reconciliation.ts`
2. `shutdownReconciliationWorker()` must remain exported for `server.ts` graceful shutdown
3. `scheduleVapiReconciliation()` must remain exported — called from `server.ts` line 854
4. All functions must be null-safe: server must start clean even without Redis
