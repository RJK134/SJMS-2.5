# SJMS 2.5 — Executive Verdict

> **Review date:** 2026-04-15
> **Reviewer:** Principal SME + UAT Review (Claude Code)
> **Build:** main @ `7668c97` + phase-10 branch @ `a00ba65`

---

## Overall Product Effectiveness Score: 5.5 / 10

## Operational Readiness Status: **LIMITED PILOT**

The system cannot be used for real university operations today, but it is structurally sound enough for controlled SME walkthroughs on specific journeys with seeded data.

---

## Top 10 Strengths

| # | Strength | Evidence |
|---|----------|----------|
| 1 | **Enterprise data model** — 197 Prisma models covering 23 HE domains with correct SITS-aligned entity relationships | `prisma/schema.prisma`, comprehensive FK relationships |
| 2 | **Clean architectural layering** — router → controller → service → repository → Prisma pattern consistently applied across 44 modules | Zero direct Prisma imports in services, 50 repository files |
| 3 | **Comprehensive seeding** — 19 seed functions producing realistic UK university data (students, programmes, modules, assessments, finance, UKVI, HESA) | `prisma/seed.ts` (1,258 lines) |
| 4 | **8-service Docker stack operational** — PostgreSQL, Redis, MinIO, Keycloak, n8n, API, client, nginx all start and pass health checks | Verified via `docker compose ps` |
| 5 | **Webhook event architecture** — 44+ event types routed to 15 n8n workflows via unique paths, fully provisioned | `webhooks.ts` EVENT_ROUTES, verified provisioning |
| 6 | **Role hierarchy correct** — 36 Keycloak roles with composite hierarchy matching SITS operational structure (Registrar → Registry Officers, Dean → HoDs → Lecturers) | `keycloak-setup.ts`, `roles.ts` |
| 7 | **Soft delete discipline** — all student-facing entities use `deletedAt` pattern, only `systemSetting` has a hard delete (appropriate exception) | Verified via grep |
| 8 | **British English throughout** — zero American English violations in codebase (enrollment, program, color all absent) | Verified via grep |
| 9 | **Cursor pagination everywhere** — all 50 repositories use cursor-based pagination, zero offset pagination found | Verified via grep |
| 10 | **Production TLS infrastructure** — dual-mode (Let's Encrypt + institutional CA), HSTS, security headers, restricted admin paths, bootstrap script | `nginx.prod.conf`, verified curl |

## Top 10 Blockers

| # | Blocker | Severity | Evidence |
|---|---------|----------|----------|
| 1 | **40% of pages are static stubs** — 51 of 129 pages have zero API integration, rendering placeholder text only | grep for useList/useDetail = 0 |
| 2 | **No data scoping on 35 of 44 routers** — student/applicant roles are blocked by `requireRole` but admin-scoped data has no per-user filtering on most endpoints | grep for scopeToUser |
| 3 | **Academic portal entirely stub** — 11 of 13 academic staff pages have zero API integration (MyMarksEntry, MyModeration, MyExamBoards, MyTimetable, etc.) | File inspection |
| 4 | **Student self-service partially broken** — MyDocuments, MyECClaims, MyTickets, RaiseTicket, MakePayment, MyPaymentPlan all stubs | File inspection |
| 5 | **Zero end-to-end journey verified** — no journey from applicant→enrolled student→marks→progression has been tested with real API data flowing through all stages | No integration tests exist |
| 6 | **Documents, communications, EC/appeals modules entirely scaffold** — 8 pages with zero API integration, no template management, no letter generation | File inspection |
| 7 | **Only 51 unit tests** — coverage limited to 4 services (marks, finance, attendance, communications), 45 other services untested | Vitest count |
| 8 | **MFA not yet enforced** — Keycloak OTP policy configured but no conditional auth flow applied, no staff user has OTP enrolled | Batch A1 committed, A2-A5 pending |
| 9 | **Keycloak Liquibase lock issue** — Keycloak fails to create its schema on fresh start, requiring manual intervention | Observed during stack bring-up |
| 10 | **No data validation end-to-end** — Zod schemas validate input shape but no business rules (e.g., mark cannot exceed maxMark, enrolment dates must be within academic year) | Schema inspection |

---

## Recommended Next Move

**Freeze horizontal expansion and focus exclusively on wiring the 6 golden journeys end-to-end with real API data, starting with the admissions→enrolment→marks→progression pipeline.**
