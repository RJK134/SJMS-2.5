# SJMS 2.5 — Executive Verdict

> **Review Date:** 2026-04-15
> **Reviewer Role:** SME / UAT Lead / Product Assessor / Solution Architect / Risk Analyst
> **Candidate Build:** SJMS 2.5 Phase 9 (main branch, commit d9e0157)
> **Classification:** CONFIDENTIAL

---

## Overall Product Effectiveness Score: 4.2 / 10

## Operational Readiness Status: **LIMITED PILOT — SME WALKTHROUGH ONLY**

The system is **not ready for UAT**. It is ready for structured SME walkthroughs to validate the data model, UI flow, and architecture — but no persona can complete a meaningful end-to-end business journey today.

---

## Why 4.2 and Not Higher

SJMS 2.5 has excellent infrastructure, a well-designed 197-model schema, 44 fully-wired API modules with 246 endpoints, 123 UI pages with 65 connected to real APIs, and a solid security posture. By code volume and architectural discipline, it appears mature.

However, **business logic is almost entirely absent**. The system is a well-structured CRUD layer over a comprehensive data model, with event-driven hooks to n8n. It does not calculate, validate, enforce, aggregate, or automate any of the core university operations it models. No tariff calculations. No prerequisite enforcement. No mark aggregation. No grade boundary application. No progression rule evaluation. No fee computation. No HESA data transformation. No UKVI alert triggering.

A university registrar sitting down to process a student through admissions → enrolment → assessment → progression → award would find: forms that accept data, pages that display it, but no system intelligence connecting the steps or enforcing institutional rules.

**This is a platform, not a product.** The distinction matters for every decision that follows.

---

## Top 10 Strengths

| # | Strength | Evidence |
|---|----------|----------|
| 1 | **Comprehensive data model** — 197 models across 23 domains, SITS-aligned, HESA-ready | `prisma/schema.prisma` (5,449 lines), zero MemStorage |
| 2 | **Complete API layer** — 44 modules, 246 endpoints, all real Prisma queries | `server/src/api/` — 0 mocks, 0 stubs |
| 3 | **Consistent architecture** — Router → Controller → Service → Repository pattern across 100% of modules | All 44 modules follow identical pattern |
| 4 | **Security posture** — Helmet, 3-tier rate limiting, Zod on all inputs, memory-only tokens, HMAC-signed webhooks | `server/src/middleware/` |
| 5 | **Audit trail** — 90% of services log CREATE/UPDATE/DELETE with before/after data, user, IP | `server/src/utils/audit.ts` |
| 6 | **Event-driven integration** — 42/44 modules emit webhook events to n8n with retry and signature | `server/src/utils/webhooks.ts` |
| 7 | **Role-based access** — 36 roles, portal isolation, data scoping (students see only their records) | `server/src/middleware/auth.ts`, `data-scope.ts` |
| 8 | **Production infrastructure** — 9 Docker services, multi-stage builds, SSL support, Prometheus metrics | `docker-compose.yml`, `docker-compose.prod.yml` |
| 9 | **UI connected to real data** — 65 pages fetch from API; forms submit via React Query mutations | `client/src/hooks/useApi.ts` |
| 10 | **British English compliance** — Consistent throughout UI, schema, and API | Verified across all layers |

---

## Top 10 Blockers

| # | Blocker | Severity | Evidence |
|---|---------|----------|----------|
| 1 | **No business logic in any domain** — All 44 services are CRUD-only; zero calculations, validations, or rule enforcement | All service files reviewed; no prerequisite checks, grade calculations, fee computations, or progression rules | Critical |
| 2 | **No mark aggregation or grade boundary application** — Marks manually entered; no weighted calculation from components; grade boundaries exist but are never consulted | `server/src/api/marks/marks.service.ts` | Critical |
| 3 | **No progression/classification calculation** — DegreeCalculation model stores year weights but no algorithm computes classification from marks | `server/src/api/progressions/progressions.service.ts` | Critical |
| 4 | **No prerequisite or credit validation on module registration** — Students can register for any module with no constraint checking | `server/src/api/module-registrations/module-registrations.service.ts` | Critical |
| 5 | **No fee calculation engine** — Fee assessment is manual data entry; no automatic charging on enrolment; no SLC integration | `server/src/api/finance/finance.service.ts` | High |
| 6 | **HESA not implementable** — No data mapping, no validation rules, no XML export; only a notification CRUD wrapper | `server/src/api/hesa/hesa.service.ts` | High |
| 7 | **UKVI attendance alerts un-wired** — Threshold stored in SystemSetting but alert logic has TODO comments; no automatic escalation | `server/src/api/attendance/attendance.service.ts` | High |
| 8 | **Soft delete coverage only 21.8%** — 154 of 197 models lack `deletedAt`; hard deletes possible on most entities | `prisma/schema.prisma` | High |
| 9 | **Test coverage shallow** — 51 unit tests across 4 of 44 services; E2E tests mock API endpoints; no business logic tests because no business logic exists | `server/src/api/**/*.test.ts` | High |
| 10 | **n8n workflows inactive** — All 15 workflows have `active: false`; event-driven architecture is designed but not operational | `n8n-workflows/*.json` | Medium |

---

## Recommended Next Move

**Freeze scope expansion. Conduct structured SME walkthroughs on the data model and UI to validate domain correctness. Then implement business logic for 3 golden journeys (admissions-to-enrolment, mark-entry-to-progression, attendance-to-UKVI-alert) before attempting any form of UAT.**

---

## Primary Recommendation: **B — Proceed to Limited SME Walkthroughs Only**

With elements of **A — Freeze expansion and remediate foundations**.

**Rationale:** The platform layer is solid enough to demonstrate to domain experts. SME walkthroughs will validate whether the data model and UI correctly represent university operations before investing in business logic implementation. But no user acceptance testing is meaningful until at least 3 complete end-to-end journeys work with real business rules, not just data entry and display.

**Hybrid approach:**
1. **Immediate (Week 1):** SME walkthroughs with registrar, admissions lead, assessment lead
2. **Weeks 2-4:** Implement business logic for top 3 golden journeys based on SME feedback
3. **Weeks 5-6:** Controlled UAT on those 3 journeys only
4. **Weeks 7+:** Expand business logic to remaining domains based on UAT findings
