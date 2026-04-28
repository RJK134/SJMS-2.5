# Observability runbook

> **Audience:** On-call engineers and anyone investigating a production
> incident in SJMS 2.5.
> **Purpose:** Document the existing correlation-ID pipeline, the structured
> log shape, the metrics surface, and the steps to follow when triaging.
> Pure observability evidence; no behavioural changes.
> **Last updated:** 2026-04-25

---

## 1. The correlation-ID pipeline (already wired)

Every inbound HTTP request gets a UUID v4 (or honours the inbound
`x-request-id` if it matches `^[\w.-]{1,128}$`). The same value is then
propagated through every downstream system on that request.

```
HTTP request
    │  x-request-id: <uuid>           ← honoured if inbound, else minted
    ▼
┌───────────────────────────────────────────────────────────────┐
│  server/src/middleware/request-id.ts                          │
│   - sets req.requestId                                        │
│   - sets res header x-request-id                              │
│   - calls runWithRequestContext({ requestId: id }, next)      │
└───────────────────────────────────────────────────────────────┘
    │
    ├── AsyncLocalStorage (utils/request-context.ts)
    │     └─ getRequestId() returns the same id for the lifetime of the request
    │
    ├── Morgan HTTP log line
    │     └─ ":method :url :status :res[content-length] - :response-time ms reqid=:reqid"
    │
    ├── Winston structured log
    │     └─ requestContextFormat() injects requestId into every log line
    │
    ├── Audit log (utils/audit.ts via logAudit)
    │     └─ requestId is folded into newData._meta and oldData._meta
    │
    └── Webhook (utils/webhooks.ts via emitEvent)
          ├─ x-request-id header on the outbound POST
          └─ requestId field in the JSON body
```

The wiring is verified by
`server/src/__tests__/unit/request-correlation.service.test.ts`:

- `binds the request ID into async context in the request-id middleware`
- `adds request metadata to audit JSON payloads without changing the Prisma schema`
- `propagates the request ID into outbound webhook payloads and headers`

Run that one suite with:

```bash
cd server && npx vitest run request-correlation
```

---

## 2. Structured log shape

In **production** the Winston `Console` transport emits one JSON line per log
event. The shape is:

```json
{
  "timestamp": "2026-04-25T21:30:00.000Z",
  "level": "info",
  "message": "GET /api/v1/students/stu-0001 200 1234 - 12.345 ms reqid=8c1...",
  "service": "sjms-api",
  "version": "2.5.0",
  "requestId": "8c1b2bdc-9f1f-4f4f-9b43-0c5a8c3f5a3a"
}
```

In **development** the same logger uses a colourised `printf` formatter; the
`requestId` is still attached as meta but printed in a friendlier form. Set
`LOG_LEVEL=debug` (default in `.env.example`) for service-call traces.

The `requestId` field is added by
`server/src/utils/logger.ts:requestContextFormat`, which reads from the
AsyncLocalStorage store. If you log from outside an HTTP request handler
(e.g. a background job not yet wrapped in `runWithRequestContext`), the
field will be absent rather than wrong.

### Fields not in every log line yet

- `userId` — present only when the log site explicitly includes it. The
  authenticated user is on `req.user.sub` (Keycloak `sub` claim) but is not
  injected into the AsyncLocalStorage store. This is deliberate so that
  logs from before authentication (e.g. JWKS errors) do not falsely claim
  attribution. When adding a new log site, prefer
  `logger.info('msg', { userId: req.user?.sub })`.

---

## 3. Metrics surface (Prometheus)

`GET /metrics` returns the default `prom-client` registry plus two custom
collectors defined in `server/src/utils/metrics.ts`:

- `http_request_duration_seconds` (histogram, labels: `method`, `route`,
  `status_code`).
- `http_request_total` (counter, same labels).

The route label uses `req.route?.path ?? req.path`, so dynamic routes
(`/students/:id`) collapse to a single bucket rather than exploding the
cardinality.

Scrape interval recommendation: 15 s, `metric_relabel_configs` rules at the
Prometheus side rather than dropping at source.

---

## 4. Health endpoint

`GET /api/health` performs a synchronous Postgres connectivity check:

```json
{
  "status": "ok",
  "version": "2.5.0",
  "timestamp": "2026-04-25T21:30:00.000Z",
  "environment": "production",
  "checks": { "database": "connected" }
}
```

Returns HTTP 503 with `status: degraded` if the DB check fails. Redis,
MinIO, Keycloak, and n8n connectivity are **not** part of this check today
— if the API can persist and read, it serves degraded responses for those
upstream blips rather than declaring itself unhealthy.

---

## 5. Triage flow

When an inbound report cites a problem URL or error message:

1. **Get the request ID.** Ask the reporter for the `x-request-id` from the
   response headers, or read it from the user-facing error body when one
   is surfaced. If they cannot provide it, ask for a tight time window and
   the URL.
2. **Find the Morgan line.** `grep reqid=<id> <log>` in the `combined.log`
   transport. The status code, response time, and route are right there.
3. **Find the Winston error line.** Same id, look in `error.log`. The
   stack and any logged context fields appear here.
4. **Find the audit row.** If the request mutated state, the AuditLog row
   carries `newData._meta.requestId = "<id>"` and `oldData._meta.requestId
   = "<id>"`. Query Postgres directly:
   ```sql
   SELECT id, action, "entityType", "entityId", "userId", "createdAt"
   FROM "AuditLog"
   WHERE "newData"->'_meta'->>'requestId' = '<id>'
      OR "oldData"->'_meta'->>'requestId' = '<id>';
   ```
5. **Find the webhook outbound.** Look in n8n for an execution with the
   matching `x-request-id` header. The body's `requestId` field is identical.

End-to-end correlation across HTTP → log → audit → outbound webhook is
designed to be a single grep + a single SQL query.

---

## 6. Known observability gaps

These are honest, deliberate omissions today:

- **No distributed-trace export.** OpenTelemetry is not wired. Adding it
  would benefit the n8n round-trip and the Postgres query layer; sequenced
  to the analytics/operability phase in `docs/delivery-plan/enterprise-readiness-plan.md` (Phase 22).
- **No userId in default log meta.** Documented in section 2 above.
- **Health endpoint does not check Redis/MinIO/Keycloak/n8n.** Intentional
  to avoid noisy 503s; revisit when SLO targets exist.
- **No log-level override per route.** Every endpoint logs at the
  service-default level. Consider `winston-daily-rotate-file` and a small
  per-route level override map if log volume becomes a problem.

---

## 7. Quick reference

| Need | Command |
|---|---|
| Latest request id from a curl | `curl -i http://localhost:3001/api/health \| grep -i x-request-id` |
| Current Morgan format | `grep "morgan(" server/src/index.ts` |
| Re-run the correlation suite | `cd server && npx vitest run request-correlation` |
| Inspect AuditLog by request id | (SQL above in section 5) |
| Prom metrics text | `curl http://localhost:3001/metrics` |
| Health JSON | `curl http://localhost:3001/api/health` |
