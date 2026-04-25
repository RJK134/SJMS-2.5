# SJMS 2.5 — Regression and Risk Register

> **Review Date:** 2026-04-15
> **Focus:** Hidden regressions, false-complete UI, mock-data fallback, persona leakage, documentation vs reality mismatch, and operational risks.

---

## Risk Severity and Likelihood Scale

| Severity | Definition |
|----------|-----------|
| **Critical** | System produces incorrect data or enables regulatory breach |
| **High** | Core workflow blocked or major user trust issue |
| **Medium** | Functional limitation that can be worked around |
| **Low** | Cosmetic or minor friction |

| Likelihood | Definition |
|-----------|-----------|
| **Certain** | Will occur in normal use |
| **Likely** | Will occur in common scenarios |
| **Possible** | May occur in edge cases |
| **Unlikely** | Requires unusual circumstances |

---

## Risk Register

### R-001: Invalid Module Registrations Accepted Silently

| Field | Value |
|-------|-------|
| **Tag** | F-DATA, F-BIZ |
| **Description** | Module registration accepts any student-module combination without checking prerequisites, credit limits, timetable clashes, or programme requirements. Invalid academic records can be created without warning. |
| **Severity** | Critical |
| **Likelihood** | Certain |
| **Evidence** | `server/src/api/module-registrations/module-registrations.service.ts` — pure CRUD, no validation. Module model has `prerequisites` JSON field but it is never consulted. |
| **Impacted Personas** | Registry staff, students, academic staff, exam boards |
| **Recommended Containment** | Implement pre-flight validation: prerequisite check, credit total check, programme-module membership check. Add as middleware or service-layer guard before create. |
| **Blocks UAT?** | **YES** |

---

### R-002: Marks and Grades Can Be Inconsistent

| Field | Value |
|-------|-------|
| **Tag** | F-DATA, F-BIZ |
| **Description** | rawMark, moderatedMark, finalMark, and grade are independently editable fields. A student could have finalMark=45 (fail) and grade="A" (first class) without system warning. Grade boundaries exist in the database but are never consulted. |
| **Severity** | Critical |
| **Likelihood** | Likely |
| **Evidence** | `server/src/api/marks/marks.service.ts` — CRUD with status tracking. GradeBoundary model in schema but no lookup logic in any service. |
| **Impacted Personas** | Academic staff, exam boards, students, registry |
| **Recommended Containment** | Implement grade-from-mark calculation using GradeBoundary lookup. Add validation that grade matches mark range on save. |
| **Blocks UAT?** | **YES** |

---

### R-003: Progression and Classification Without Calculation

| Field | Value |
|-------|-------|
| **Tag** | F-DATA, F-BIZ |
| **Description** | ProgressionRecord and AwardRecord accept manually-entered values for totalCreditsPassed, averageMark, progressionDecision, classification, and finalAverage. No calculation validates these against actual module results. A student could be awarded a First with failing marks. |
| **Severity** | Critical |
| **Likelihood** | Likely |
| **Evidence** | `server/src/api/progressions/progressions.service.ts` — pure CRUD. `DegreeCalculation` model stores yearWeights but no calculation function exists. |
| **Impacted Personas** | Exam boards, registry, students |
| **Recommended Containment** | Implement classification calculation from module results with year weighting. Add validation that manually-entered classification matches calculated value. |
| **Blocks UAT?** | **YES** |

---

### R-004: Soft Delete Coverage Gap (78.2% of Models)

| Field | Value |
|-------|-------|
| **Tag** | F-DATA, F-SEC |
| **Description** | 154 of 197 models lack `deletedAt` field. DELETE operations on these models perform hard deletes, permanently removing data. This includes finance child entities (ChargeLine, Payment, Invoice), assessment components (AssessmentComponent, MarkEntry), HESA entities, governance entities, and teaching/timetable entities. |
| **Severity** | High |
| **Likelihood** | Likely |
| **Evidence** | Schema audit: 43 models have deletedAt, 154 do not. Service `remove()` methods call `prisma.delete()` on models without deletedAt. |
| **Impacted Personas** | All — data loss risk |
| **Recommended Containment** | Add deletedAt to all student-facing and financial entities. Implement soft-delete middleware in repository layer. Priority: MarkEntry, AssessmentComponent, ChargeLine, Payment. |
| **Blocks UAT?** | **YES** — financial and assessment data must not be hard-deletable |

---

### R-005: AnonymousMarking Cascade Delete Violation

| Field | Value |
|-------|-------|
| **Tag** | F-DATA, F-SEC |
| **Description** | AnonymousMarking relation to Assessment uses `onDelete: Cascade`. Deleting an Assessment would cascade-delete all AnonymousMarking records, destroying the audit trail for anonymous marking mappings. This violates the marks domain rule that academic marks must never cascade-delete. |
| **Severity** | High |
| **Likelihood** | Possible |
| **Evidence** | `prisma/schema.prisma` AnonymousMarking model — `assessment Assessment @relation(..., onDelete: Cascade)`. All other marks-domain relations correctly use Restrict. |
| **Impacted Personas** | Academic staff, exam boards, compliance |
| **Recommended Containment** | Change to `onDelete: Restrict`. Create migration. |
| **Blocks UAT?** | **YES** |

---

### R-006: n8n Workflows All Inactive

| Field | Value |
|-------|-------|
| **Tag** | F-OPS |
| **Description** | All 15 n8n workflow JSON files have `"active": false`. The event-driven architecture (webhook emission from 42 services) fires events but nothing receives them. Notifications, escalations, and automated actions do not execute. |
| **Severity** | High |
| **Likelihood** | Certain |
| **Evidence** | All files in `n8n-workflows/` checked — `"active": false` in every workflow JSON. |
| **Impacted Personas** | All — no automated notifications or escalations |
| **Recommended Containment** | Run provisioning script to import and activate workflows. Test each workflow with a sample event. |
| **Blocks UAT?** | **No** — but significantly reduces product value |

---

### R-007: Documentation Overstates Production Readiness

| Field | Value |
|-------|-------|
| **Tag** | F-DOC |
| **Description** | CLAUDE.md states Phase 9 is complete and system is "Ready for staging UAT." BUILD-QUEUE.md marks all batches DONE. KNOWN_ISSUES.md shows 0 open issues. But the system lacks business logic across all domains, has 8/10 golden journeys at NO-GO, and scores 4.34/10 on product effectiveness. The documentation creates false confidence about operational readiness. |
| **Severity** | High |
| **Likelihood** | Certain |
| **Evidence** | CLAUDE.md: "SJMS 2.5 build complete. Ready for staging UAT." vs this review's findings. |
| **Impacted Personas** | Project owner, stakeholders, SMEs |
| **Recommended Containment** | Update documentation to accurately reflect current state: "Platform infrastructure complete. Business logic implementation required before UAT." |
| **Blocks UAT?** | **No** — but risks misguided decisions |

---

### R-008: No CI/CD Pipeline

| Field | Value |
|-------|-------|
| **Tag** | F-OPS |
| **Description** | No GitHub Actions workflows exist. Tests, linting, type checking, and builds are manual. No automated quality gates on PR merge. Pull request template exists but no automated checks run. |
| **Severity** | Medium |
| **Likelihood** | Certain |
| **Evidence** | `.github/` directory contains only `pull_request_template.md`. No workflow YAML files. |
| **Impacted Personas** | Developers, project owner |
| **Recommended Containment** | Create basic CI pipeline: TypeScript compilation, Vitest tests, Prisma validation on every PR. |
| **Blocks UAT?** | **No** — but increases regression risk |

---

### R-009: Test Coverage Shallow (4/44 Services)

| Field | Value |
|-------|-------|
| **Tag** | F-OPS |
| **Description** | 51 unit tests cover only 4 services (attendance, marks, finance, communications). 40 services have zero tests. E2E tests mock API endpoints (smoke tests only). No integration tests. No business logic tests (because no business logic exists). |
| **Severity** | Medium |
| **Likelihood** | Certain |
| **Evidence** | `server/src/api/**/*.test.ts` — 4 files. Vitest config targets `src/api/**/*.service.ts` but most services untested. |
| **Impacted Personas** | Developers, project owner |
| **Recommended Containment** | As business logic is added, write tests for each rule. Target 60% coverage before UAT. |
| **Blocks UAT?** | **No** — but reduces confidence in changes |

---

### R-010: Rate Limiting Degrades Without Redis

| Field | Value |
|-------|-------|
| **Tag** | F-SEC |
| **Description** | Rate limiting uses Redis store. If Redis is unavailable, falls back to permissive in-memory counting that provides no actual rate limiting. In production, Redis outage would disable rate limiting. |
| **Severity** | Medium |
| **Likelihood** | Possible |
| **Evidence** | `server/src/middleware/rate-limit.ts` — Redis store with fallback. |
| **Impacted Personas** | All — security exposure |
| **Recommended Containment** | Log rate-limit fallback events. Add health check that alerts when Redis is unavailable. Consider failing closed (rejecting requests) rather than open. |
| **Blocks UAT?** | **No** |

---

### R-011: Repository Coverage Gap (25.4%)

| Field | Value |
|-------|-------|
| **Tag** | F-ARCH |
| **Description** | Only 50 of 197 models have dedicated repository files. Child entities (AssessmentComponent, ChargeLine, Payment, HESA entities) use direct Prisma calls in services. This bypasses the repository pattern's benefits (testability, query encapsulation) for 74.6% of models. |
| **Severity** | Medium |
| **Likelihood** | Certain |
| **Evidence** | Repository file count vs model count. Services for child entities call Prisma directly. |
| **Impacted Personas** | Developers |
| **Recommended Containment** | Create composite repositories for Assessment (10 child models), Finance (10 child models), HESA (9 child models). |
| **Blocks UAT?** | **No** |

---

### R-012: Enrolment Status Changes Don't Cascade

| Field | Value |
|-------|-------|
| **Tag** | F-BIZ |
| **Description** | Changing an enrolment status (e.g., ENROLLED → INTERRUPTED) updates the status field and creates a history record, but does not affect downstream entities. Module registrations remain active. Attendance tracking continues. Finance charges are unaffected. An interrupted student appears active in every other system. |
| **Severity** | High |
| **Likelihood** | Likely |
| **Evidence** | `server/src/api/enrolments/enrolments.service.ts` — status update emits webhook event but performs no downstream updates. |
| **Impacted Personas** | Registry staff, finance, compliance |
| **Recommended Containment** | Implement status change side-effects: suspend module registrations, pause attendance tracking, adjust finance charges based on interruption/withdrawal policies. |
| **Blocks UAT?** | **YES** |

---

### R-013: EC Claims Not Linked to Assessment Deadlines

| Field | Value |
|-------|-------|
| **Tag** | F-BIZ |
| **Description** | EC (Extenuating Circumstances) claims can be submitted but have no effect on assessment deadlines, submission windows, or module results. An approved EC claim should extend a deadline or offer a deferral, but the system does not connect these domains. |
| **Severity** | Medium |
| **Likelihood** | Likely |
| **Evidence** | `server/src/api/ec-claims/ec-claims.service.ts` — CRUD only. No cross-reference to assessment or submission models. |
| **Impacted Personas** | Students, academic staff, registry |
| **Recommended Containment** | Implement EC-to-assessment linkage: on EC approval, extend affected assessment deadlines or create deferral records. |
| **Blocks UAT?** | **No** — but reduces student trust |

---

### R-014: Dev Auth Bypass in Non-Production

| Field | Value |
|-------|-------|
| **Tag** | F-SEC |
| **Description** | `AUTH_BYPASS=true` disables JWT verification and assigns a dev persona. The bypass is environment-gated but relies on correct environment variable configuration. If accidentally enabled in staging/production, all API endpoints are unprotected. |
| **Severity** | Medium |
| **Likelihood** | Unlikely |
| **Evidence** | `server/src/middleware/auth.ts` — `AUTH_BYPASS` check with dev persona assignment. |
| **Impacted Personas** | All — security exposure |
| **Recommended Containment** | Add startup warning/exit when AUTH_BYPASS=true and NODE_ENV=production. Log all requests using bypass mode. |
| **Blocks UAT?** | **No** — if correctly configured |

---

### R-015: No Health Check Integration (n8n, MinIO)

| Field | Value |
|-------|-------|
| **Tag** | F-OPS |
| **Description** | Docker health checks defined for PostgreSQL, Redis, Keycloak, and API. But n8n and MinIO lack health checks. API health endpoint (`/api/health`) does not verify downstream dependencies (database, Redis, MinIO connectivity). |
| **Severity** | Low |
| **Likelihood** | Possible |
| **Evidence** | `docker-compose.yml` — n8n and MinIO services have no healthcheck directive. `/api/health` returns static JSON. |
| **Impacted Personas** | Operations, developers |
| **Recommended Containment** | Add health checks for n8n and MinIO. Enhance `/api/health` to verify database, Redis, and MinIO connectivity. |
| **Blocks UAT?** | **No** |

---

## Risk Summary

| Severity | Count | Blocks UAT |
|----------|-------|------------|
| Critical | 3 | 3 |
| High | 5 | 3 |
| Medium | 5 | 0 |
| Low | 1 | 0 |
| **Total** | **14** | **6** |

**UAT-blocking risks:** R-001 (invalid registrations), R-002 (inconsistent marks/grades), R-003 (unvalidated progression), R-004 (hard delete exposure), R-005 (cascade delete violation), R-012 (non-cascading status changes).

All 6 UAT-blocking risks relate to **data integrity and business logic absence** — they are not infrastructure bugs but fundamental missing functionality.
