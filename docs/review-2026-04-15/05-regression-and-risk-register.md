# SJMS 2.5 — Regression and Risk Register

> **Review date:** 2026-04-15

---

## Risk Register

### R-001: Academic Portal Non-Functional [F-UAT]

**Description:** 11 of 13 academic portal pages are static stubs with zero API integration. Academic staff — the primary marks-entry users — cannot perform their core function.
**Severity:** Critical
**Likelihood:** Certain (verified by code inspection)
**Evidence:** `grep` shows 0 useList/useDetail hooks in MyMarksEntry, MyModeration, MyExamBoards, MyTimetable, MyAttendance, MyProfile, MyTutees, TuteeProfile, MyECClaims, MyModuleDetail, MyMarksEntry
**Impacted personas:** Academic staff (lecturers, module leaders, programme leaders, deans)
**Containment:** Wire MyMarksEntry and MyModeration to existing API endpoints as P0
**Blocks UAT:** Yes — marks pipeline cannot be tested

### R-002: Data Scoping Gap on 35/44 Routers [F-SEC]

**Description:** Only 9 of 44 API routers use `scopeToUser` or `requireOwnership` middleware. Remaining routers rely solely on `requireRole` — meaning a student role is blocked but any admin-level user can see all data for all entities without per-user filtering.
**Severity:** High
**Likelihood:** Medium (mitigated by role gates, but any role escalation exposes all data)
**Evidence:** `grep scopeToUser` returns 22 usages across 9 routers; 35 routers have none
**Impacted personas:** All — data leakage risk for any multi-tenancy scenario
**Containment:** Not immediately blocking for single-institution use, but must be addressed before any shared-service or multi-department deployment
**Blocks UAT:** No for single-institution staging; Yes for production

### R-003: Finance Pages Functionally Identical [F-BIZ]

**Description:** Invoicing, Sponsors, Bursaries, and Refunds pages all render the same StudentAccount list endpoint with identical columns. No dedicated invoice, sponsor agreement, bursary, or refund endpoints exist in the router.
**Severity:** High
**Likelihood:** Certain (verified by code inspection)
**Evidence:** All four pages import `useList<Account>('finance-*', '/v1/finance', params)` with the same Account interface
**Impacted personas:** Finance staff
**Containment:** Either wire dedicated sub-endpoints or consolidate into a single Finance page with tabs
**Blocks UAT:** Yes for finance UAT

### R-004: Document Upload Handler Empty [F-UAT]

**Description:** The applicant UploadDocuments page renders a FileUpload component but the `onFilesSelected` callback is `() => {}` — files selected are discarded.
**Severity:** Medium
**Likelihood:** Certain (code inspection)
**Evidence:** `client/src/pages/applicant/UploadDocuments.tsx` line: `onFilesSelected={() => {}}`
**Impacted personas:** Applicants
**Containment:** Wire to MinIO document upload endpoint
**Blocks UAT:** No for core journeys; Yes for document submission

### R-005: No Business Validation Beyond Shape [F-DATA]

**Description:** Zod schemas validate input structure (required fields, types, enums) but no business rules are enforced: marks can exceed maxMark, enrolment dates can be outside academic year, credits can total incorrectly.
**Severity:** High
**Likelihood:** High (any data entry without training will produce invalid data)
**Evidence:** Assessment schema allows `rawMark: z.number().min(0)` with no `.max()` referencing the assessment's maxMark
**Impacted personas:** All data-entry users
**Containment:** Add business validation in service layer for marks, enrolments, and registrations
**Blocks UAT:** Yes for data integrity

### R-006: Keycloak Schema Bootstrap Failure [F-OPS]

**Description:** Keycloak fails to start with a Liquibase lock error because the `keycloak` schema does not exist in PostgreSQL. The `KC_DB_SCHEMA: keycloak` setting requires manual schema creation or a clean database.
**Severity:** High
**Likelihood:** High (observed during stack bring-up)
**Evidence:** `docker compose logs keycloak` shows "Cannot invoke CustomLockService.waitForLock" + schema not found
**Impacted personas:** DevOps / deployment
**Containment:** Add Keycloak schema creation to staging runbook or init script
**Blocks UAT:** Yes for first-time deployment

### R-007: EC/Appeals System Entirely Stub [F-BIZ]

**Description:** ECClaims, Appeals, and AcademicMisconduct pages are all stubs. No API integration, no workflow, no deadline tracking. These are legally mandated governance processes.
**Severity:** High (for production); Low (for controlled pilot)
**Likelihood:** Certain
**Evidence:** 3 pages with 0 API hooks
**Impacted personas:** Registry, students, compliance
**Containment:** Acceptable deferral for pilot; must be functional before any student-facing deployment
**Blocks UAT:** No for admin-focused pilot

### R-008: Student Self-Service Incomplete [F-UAT]

**Description:** 5 of 12 student portal pages are stubs (Profile, Documents, ECClaims, Tickets, RaiseTicket). Students can view but cannot interact with the institution.
**Severity:** Medium
**Likelihood:** Certain
**Evidence:** Code inspection shows 0 API hooks in 5 student pages
**Impacted personas:** Students
**Containment:** Wire RaiseTicket and MyTickets as minimum viable self-service
**Blocks UAT:** No for admin-focused pilot

### R-009: No Integration Tests [F-DATA]

**Description:** 51 unit tests exist but all mock the repository layer. No tests verify actual database queries, API responses, or multi-service interactions.
**Severity:** Medium
**Likelihood:** High (untested query logic may produce incorrect results)
**Evidence:** All test files use `vi.mock()` for repositories
**Impacted personas:** All — data correctness unproven
**Containment:** Add integration tests for the 6 golden journeys using a test database
**Blocks UAT:** No (but reduces confidence)

### R-010: Documentation Overstates Maturity [F-DOC]

**Description:** CLAUDE.md states "SJMS 2.5 build complete. Ready for staging UAT." with 0 open KIs. This review finds 40% stub pages, non-functional academic portal, and no end-to-end journey verified.
**Severity:** Medium
**Likelihood:** Certain (documentation reviewed)
**Evidence:** CLAUDE.md Phase 9 section
**Impacted personas:** Project stakeholders making deployment decisions
**Containment:** Update documentation to reflect actual readiness level (LIMITED PILOT, not UAT READY)
**Blocks UAT:** No (documentation issue, not system issue)
