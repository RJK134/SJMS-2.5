# SJMS 2.5 — Overnight Remediation Pass (2026-04-21)

**Branch:** `claude/sjms-remediation-pass-ZnE8G`
**Base:** `main @ b9d6a81`
**Scope:** A single focused pass aimed at raising enterprise readiness across compliance
depth, business-process rule enforcement, event/audit consistency, security hardening
and documentation honesty. Delivered as surgical, reviewable diffs — no broad rewrites.

## Repository state at session start

| Signal | Value |
|---|---|
| `npx tsc --noEmit` (server) | 0 errors |
| `npx vitest run` | 120 passing / 120 total |
| Prisma models | 197 |
| API routers | 44 (9 group barrels additive) |
| Services | 49 |
| Keycloak realm roles | 36 |
| Deprecated `emitEvent('name', {id})` call-sites | 66 |
| Services with mutations but no `emitEvent` | 1 (`communications/notifications.service.ts`) |
| Unit test files | 10 |
| ComingSoon pages | 34 |

## Priority items

Each item has an ID, a severity, a one-line problem statement, the file(s) touched,
and an acceptance check. Anything marked **DEFERRED** is logged to
`docs/KNOWN_ISSUES.md` at the end of the session.

### Tier 1 — critical today

| ID | Severity | Problem | File(s) | Accept |
|---|---|---|---|---|
| R-01 | HIGH | Dead role `registry_manager` in dev-bypass admin persona — does not exist in `roles.ts` or realm JSON | `server/src/middleware/auth.ts` | `grep registry_manager server/src/` returns 0 |
| R-02 | HIGH | `module-registrations.update()` does not re-run prereq / credit-limit checks when moduleId or academicYear changes | `server/src/api/module-registrations/module-registrations.service.ts` | New unit tests pass |
| R-03 | HIGH | Attendance threshold alerts & UKVI breach detection are dead code (TODO on line 129) | `server/src/api/attendance/attendance.service.ts` | On `create()`/`update()` rolling attendance % is computed and an `AttendanceAlert` row is written when below threshold, and UKVI breach emitted for Tier-4 holders |
| R-04 | HIGH | No Content-Security-Policy header in nginx prod config | `docker/nginx/nginx.prod.conf` | Response contains `Content-Security-Policy` |
| R-05 | MEDIUM | No request/correlation ID in Winston or Morgan logs — incident forensics impossible | `server/src/middleware/request-id.ts` (new), `server/src/index.ts`, `server/src/utils/logger.ts` | `x-request-id` on every response; Winston JSON has `requestId` field |
| R-06 | MEDIUM | Appeals service: no status_changed event, no lifecycle transition guard | `server/src/api/appeals/appeals.service.ts` | Invalid status hops throw `ValidationError`; status_changed event emitted |
| R-07 | MEDIUM | EC claim service: no lifecycle transition guard (SUBMITTED→EVIDENCE_RECEIVED→PRE_PANEL→PANEL→DECIDED→CLOSED) | `server/src/api/ec-claims/ec-claims.service.ts` | Invalid status hops throw `ValidationError` |
| R-08 | MEDIUM | `communications/notifications.service.ts` mutates without `emitEvent` | `server/src/api/communications/notifications.service.ts` | Events fired on create/update/markRead |
| R-09 | MEDIUM | No CI gating workflow | `.github/workflows/ci.yml` (new) | PR triggers tsc + vitest + prisma validate |
| R-10 | LOW | Role count drift: CLAUDE.md still references "27 roles" | `CLAUDE.md`, `.claude/CLAUDE.md` | Single source of truth: 36 roles, matches `roles.ts` and realm JSON |
| R-11 | LOW | Migrate deprecated `emitEvent` callers in audit-sensitive services | `progressions`, `module-results`, `submissions`, `clearance-checks`, `communications`, `references`, `interviews`, `programme-approvals` | All migrated services use the object form with `actorId`/`entityType`/`entityId` |

### Tier 2 — high value this session

| ID | Severity | Problem | Acceptance |
|---|---|---|---|
| R-12 | MEDIUM | Extend unit tests to cover the new business rules | New tests in existing `*.service.test.ts` files — module-registrations update-path, attendance alert emission, appeals/EC status guards, notifications event emission |

### Deferred / backlog (logged to KNOWN_ISSUES.md)

- MFA enforcement in Keycloak realm.
- Identity cache → Redis.
- MinIO presigned uploads (KI-P10b-002).
- Teaching-assignment model for academic scoping (KI-P10b-003).
- Finance sub-domains — Sponsors, Bursaries, Refunds (KI-P10b-001).
- Multi-tenancy substrate.
- Remaining ~55 deprecated `emitEvent` callers in low-traffic CRUD services.
- Activating the 15 n8n workflows under a live n8n instance.

## Non-goals

- No schema migrations tonight — changing the data model requires a migration plan and a
  fresh seed; leave this to Phase 14.
- No changes to authentication primitives (`auth.ts` JWT/Keycloak flow, rate-limiting, CORS).
- No large refactors. Surgical edits only.

## Rollback

Every commit is atomic and reviewable. Any item can be reverted individually with
`git revert <hash>` without breaking the others. The PR will be opened as `draft` so
Richard can cherry-pick.
