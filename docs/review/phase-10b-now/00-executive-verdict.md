# SJMS 2.5 — Executive Verdict (Phase 10b Review)

> **Review date:** 2026-04-15
> **Branch:** `phase-10b/review-remediation`
> **Prior baseline:** 4.2/10 from overnight Claude run

---

## Overall Product Effectiveness Score: 5.8 / 10

**The prior 4.2/10 is too low and should be revised upward to 5.8/10.**

The prior review's claim that "0 of 44 services contain business logic beyond CRUD" is factually incorrect. At least 14 services contain status-transition-aware conditional logic with domain-specific event emission. The claim that "all 15 n8n workflows are inactive" is misleading — the JSON files store `active: false` as source-control default, but the provisioning script activates all 15 at deploy time (verified via `npm run provision:workflows` output showing "15 updated + activated"). The architecture and infrastructure scores remain correctly high.

However, the system remains incomplete for UAT. The academic portal is non-functional, student self-service is partial, and no golden journey can be completed end-to-end without manual intervention.

## Operational Readiness Status: **LIMITED PILOT (SME Walkthrough Only)**

The system is suitable for structured registry/admin SME walkthroughs on seeded data. It is not suitable for academic staff or student UAT without the P0 remediation work.

---

## Top 10 Strengths

| # | Strength | Evidence |
|---|----------|----------|
| 1 | **197-model data schema with SITS alignment** — Person, Student, Enrolment, Assessment, MarkEntry chain matches STU/SCJ/SCE/SMO/SMR patterns correctly | `prisma/schema.prisma` inspection |
| 2 | **14 services with status-transition logic** — applications, marks, enrolments, support, finance, documents, and others emit domain-specific events on status changes | `grep` across all 44 services |
| 3 | **Clean 4-layer architecture** — router→controller→service→repository with zero direct Prisma imports in services, 50 repositories | Verified via grep |
| 4 | **15 n8n workflows provisioned and activated** — covering application submitted, offer decision, enrolment confirmed, marks ratified, UKVI breach, visa expiry, and more | Verified via `npm run provision:workflows` output |
| 5 | **Comprehensive seed data** — 19 seed functions (1,258 lines) producing realistic UK university data across students, programmes, modules, assessments, finance, UKVI, HESA | `prisma/seed.ts` |
| 6 | **8-service Docker stack operational** — postgres, redis, minio, keycloak, n8n, api, client, nginx all healthy (with workaround for Keycloak schema) | Verified via `docker compose ps` |
| 7 | **Production TLS infrastructure** — dual-mode (Let's Encrypt + institutional CA), HSTS, security headers, restricted admin paths, bootstrap script | `nginx.prod.conf`, curl verification |
| 8 | **51 unit tests + 11 E2E specs** — marks pipeline, finance, attendance (UKVI threshold with 6 edge cases), communications | Vitest 51/51 passing |
| 9 | **Webhook event architecture** — 44+ event types mapped to unique paths in EVENT_ROUTES, n8n workflows listen on matching paths | `webhooks.ts` |
| 10 | **36 Keycloak roles with composite hierarchy** — super_admin → registrar → officers; dean → HoDs → lecturers; correctly mirrors university reporting lines | `keycloak-setup.ts` |

## Top 10 Blockers

| # | Blocker | Severity | Evidence |
|---|---------|----------|----------|
| 1 | **Academic portal 80% stub** — MyMarksEntry, MyModeration, MyExamBoards, MyTimetable, MyAttendance all non-functional | 11/13 pages with 0 API hooks |
| 2 | **No golden journey completable end-to-end** — admissions→enrolment→marks→progression chain untested as an integrated flow | No integration tests |
| 3 | **No rawMark validation against maxMark** — marks can exceed the assessment maximum without rejection | marks.schema.ts, marks.service.ts |
| 4 | **35/44 routers lack data scoping** — `scopeToUser` present on only 9 routers (students, enrolments, marks, applications, etc.) | grep verification |
| 5 | **Keycloak schema bootstrap failure** — no init script creates the `keycloak` schema; first-time deployments fail | docker-compose.yml inspection |
| 6 | **Student self-service incomplete** — RaiseTicket, MyTickets, StudentProfile, MyDocuments, MyECClaims all stubs | Code inspection |
| 7 | **Finance sub-pages misleadingly identical** — Invoicing, Sponsors, Bursaries, Refunds show same Account list | All use `/v1/finance` endpoint |
| 8 | **Document upload handler is a no-op** — `onFilesSelected={() => {}}` | `UploadDocuments.tsx` line 27 |
| 9 | **Documentation overstates readiness** — CLAUDE.md claims "build complete", "~650 endpoints" (actual: 246) | CLAUDE.md inspection |
| 10 | **No compliance workflow operational** — HESA export, GDPR encryption, EC/appeals all schema-only | No XML generation, no encryption layer |

---

## One-Sentence Recommendation

**Fix the 3 critical P0 items (academic marks entry, Keycloak bootstrap, documentation accuracy), then proceed to structured SME walkthroughs on the admin and applicant portals with seeded data.**
