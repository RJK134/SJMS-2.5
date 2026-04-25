# SJMS 2.5 — Review Evidence Index

> **Review date:** 2026-04-15

---

## Files Reviewed

### Configuration and Infrastructure
| File | Purpose | Findings |
|------|---------|----------|
| `CLAUDE.md` | Project constitution | Maturity overstated; endpoint count inflated |
| `docs/BUILD-QUEUE.md` | Phase tracking | Phase 9 marked complete |
| `docs/KNOWN_ISSUES.md` | Issue register | 0 open KIs (all closed Phase 8-9) |
| `docs/STAGING-RUNBOOK.md` | Deployment guide | Comprehensive but untested end-to-end |
| `docs/OPERATIONS-SSL-RUNBOOK.md` | TLS operations | Thorough dual-mode documentation |
| `docker-compose.yml` | Service definitions | 8 services, client/nginx uncommented in Phase 9 |
| `docker/docker-compose.prod.yml` | Production overlay | Resource limits, certbot, port removal |
| `docker/nginx/nginx.prod.conf` | Production nginx | TLS, HSTS, restricted paths verified |
| `.env.example` | Environment documentation | Comprehensive variable coverage |
| `.gitignore` | Repository exclusions | Certificate exclusions added |
| `prisma/schema.prisma` | Data model | 197 models inspected for domain coverage |
| `prisma/seed.ts` | Seed data | 19 functions, 1,258 lines, realistic UK data |

### Server Code
| File/Pattern | Count | Findings |
|-------------|-------|----------|
| `server/src/api/*/` | 44 modules | All follow 4-file pattern (router, controller, service, schema) |
| `server/src/repositories/*.ts` | 50 files | All use cursor pagination; 1 hard delete (systemSetting) |
| `server/src/middleware/auth.ts` | 1 file | JWKS + static JWT verification, dev bypass gated on NODE_ENV |
| `server/src/middleware/data-scope.ts` | 1 file | scopeToUser/requireOwnership used in only 9 routers |
| `server/src/utils/webhooks.ts` | 1 file | 44+ event types mapped to unique webhook paths |
| `server/src/constants/roles.ts` | 1 file | 36 roles in 12 groups, type-safe |
| `scripts/keycloak-setup.ts` | 1 file | Realm, roles, client, users, SMTP, OTP policy |

### Client Code
| File/Pattern | Count | Findings |
|-------------|-------|----------|
| `client/src/pages/**/*.tsx` | 129 files | 78 wired to API, 51 stubs |
| `client/src/hooks/useApi.ts` | 1 file | useList, useDetail, useCreate, useUpdate, useInfiniteList |
| `client/src/lib/auth.ts` | 1 file | Dev personas + Keycloak PKCE flow |
| `client/src/components/shared/DataTable.tsx` | 1 file | Infinite scroll with IntersectionObserver |

### Test Files
| File | Tests | Scope |
|------|-------|-------|
| `server/src/__tests__/unit/marks.service.test.ts` | 11 | CRUD, status events, marks.released |
| `server/src/__tests__/unit/finance.service.test.ts` | 10 | CRUD, status transitions, transactions |
| `server/src/__tests__/unit/attendance.service.test.ts` | 17 | CRUD, alerts, UKVI threshold (6 edge cases) |
| `server/src/__tests__/unit/communications.service.test.ts` | 13 | CRUD, send, bulk, template resolution |
| `client/e2e/student-enrolment.spec.ts` | 3 specs | Student list, detail, enrolment form |
| `client/e2e/assessment-submission.spec.ts` | 3 specs | Dashboard, assessments, marks |
| `client/e2e/admin-auth.spec.ts` | 5 specs | Portal routing, error boundary |

---

## Runtime Checks Attempted

| Check | Method | Result |
|-------|--------|--------|
| Docker stack start | `docker compose up -d` | 7/8 services healthy (Keycloak schema issue) |
| API health check | `curl http://localhost/api/health` | 200 OK via nginx |
| HTTPS with self-signed cert | `curl -sk https://localhost/api/health` | 200 OK |
| HTTP→HTTPS redirect | `curl -sI http://localhost/` | 301 Moved Permanently |
| Security headers | `curl -skI https://localhost/` | HSTS, X-Frame-Options, nosniff present |
| Unauthenticated request | `curl /api/v1/students` | 401 Unauthorized |
| Swagger UI | `curl /api/docs/` | 200 OK |
| Prometheus metrics | `curl /metrics` | Operational (prom-client output) |
| n8n workflow provisioning | `npm run provision:workflows` | 15/15 updated and activated |
| Vitest unit tests | `npm test` | 51/51 passing |
| npm audit | Both workspaces | 0 vulnerabilities |
| TypeScript compilation | `tsc --noEmit` | 0 errors (server + client) |

---

## Limitations of This Review

1. **No live browser testing** — pages were assessed by code inspection, not by navigating in a browser with seeded data. Some pages classified as "wired" may have runtime rendering issues.

2. **No Keycloak auth flow testing** — Keycloak failed to start due to schema bootstrap issue. All auth assessment is based on code inspection of `auth.ts` and the dev persona bypass path.

3. **No n8n workflow execution testing** — workflows are provisioned but no webhook event was triggered to verify end-to-end workflow execution.

4. **No database query correctness testing** — unit tests mock the repository layer. No integration tests verify that Prisma queries return correct data against a real database.

5. **No cross-browser or accessibility testing** — WCAG 2.1 AA compliance is claimed as a target but not verified.

6. **Single reviewer** — this review was conducted by a single AI reviewer. Human SME validation of domain findings is essential.

---

## Unknowns

| Item | Why Unknown |
|------|------------|
| Actual page rendering with seeded data | No browser testing conducted |
| Keycloak OIDC flow correctness | Keycloak did not start cleanly |
| n8n workflow execution correctness | No events triggered |
| Seed data relationship integrity | No FK validation test exists |
| Performance under load | No load testing conducted |
| HESA XML export accuracy | No export function exists |
| MinIO file upload/download | Not tested at runtime |
