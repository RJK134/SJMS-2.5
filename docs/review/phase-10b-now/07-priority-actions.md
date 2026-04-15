# SJMS 2.5 — Priority Actions (Phase 10b)

> **Review date:** 2026-04-15
> **Focus:** Low-score areas first (business logic, compliance, validation, journeys, workflows)

---

## P0 — Before Any SME / UAT (12 hours)

| # | Action | Weak Area Addressed | Effort |
|---|--------|---------------------|--------|
| 1 | **Wire academic MyMarksEntry** to existing marks API (module → assessment → grid pattern) | Golden journeys, UAT | 2h |
| 2 | **Wire academic MyModeration** to marks API with status=SUBMITTED filter | Golden journeys | 1h |
| 3 | **Wire academic MyExamBoards** to exam-boards API | Golden journeys | 1h |
| 4 | **Add rawMark <= maxMark validation** in marks.service.ts create/update | Data trustworthiness | 1h |
| 5 | **Fix Keycloak schema bootstrap** — add init-schemas.sql to Docker init | Operational | 30m |
| 6 | **Wire student RaiseTicket** to POST /v1/support | UAT | 1h |
| 7 | **Wire student MyTickets** to GET /v1/support with scope | UAT | 1h |
| 8 | **Wire student StudentProfile** with enrolment data | UAT | 1h |
| 9 | **Fix finance sub-pages** — replace 3 misleading clones with honest states | Data trustworthiness | 1h |
| 10 | **Fix document upload no-op** — show helpful message | UAT | 30m |
| 11 | **Update CLAUDE.md** — correct endpoint count, remove "build complete" | Documentation | 30m |

---

## P1 — Before Wider SME Review (31 hours)

| # | Action | Weak Area Addressed | Effort |
|---|--------|---------------------|--------|
| 1 | Wire remaining academic pages (MyTimetable, MyAttendance, MyTutees, MyProfile) | Golden journeys | 4h |
| 2 | Wire student MyDocuments to documents API | UAT | 1h |
| 3 | Build student MyECClaims basic submission form | Compliance | 3h |
| 4 | Trigger one n8n workflow end-to-end and verify execution | Workflow activity | 2h |
| 5 | Add integration tests for marks pipeline (create → mark → moderate → ratify) | Data trustworthiness | 4h |
| 6 | Wire PaymentRecording with basic payment POST | Domain completeness | 2h |
| 7 | Add enrolment date validation (within academic year) | Data trustworthiness | 1h |
| 8 | Wire documents module (DocumentList, TemplateManagement) | Domain completeness | 4h |
| 9 | Complete MFA rollout (Batches A2-A5) | Compliance | 6h |
| 10 | Wire communications module (CommunicationLog, BulkCommunication) | Domain completeness | 4h |

---

## P2 — After Baseline Validation (22 days)

| # | Action | Weak Area Addressed | Effort |
|---|--------|---------------------|--------|
| 1 | Build EC/appeals workflow with deadline tracking | Compliance | 2d |
| 2 | Build re-enrolment / continuation workflow | Business logic | 2d |
| 3 | Wire HESA Data Futures XML export | Compliance | 3d |
| 4 | Implement GDPR encryption for special category data | Compliance | 2d |
| 5 | Build progression decision recording UI | Golden journeys | 1d |
| 6 | Add data scoping to remaining 35 routers | Security | 2d |
| 7 | Build report builder with CSV/PDF export | Domain completeness | 3d |
| 8 | Build engagement scoring engine | Business logic | 2d |
| 9 | Wire settings pages (SystemSettings, AcademicCalendar, UserManagement) | Domain completeness | 2d |
| 10 | End-to-end Playwright tests on golden journeys | Evidence quality | 3d |
