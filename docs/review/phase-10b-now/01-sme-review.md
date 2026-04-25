# SJMS 2.5 — Domain SME Review (Phase 10b)

> **Review date:** 2026-04-15
> **Correcting prior claim:** "0 of 44 services contain business logic beyond CRUD" — FALSE

---

## Domain Assessment Summary

| Domain | Rating | Business Logic | Completeness | Confidence |
|--------|--------|---------------|-------------|------------|
| Admissions / Applicant | **Partial** | Status transitions + offer detection | 70% | High |
| Student Core Record | **Strong** | SITS-aligned entity model with demographics | 80% | High |
| Curriculum / Programmes / Modules | **Strong** | Approval workflow + specifications | 75% | High |
| Enrolment / Registration | **Partial** | Status change events + history tracking | 65% | High |
| Timetable / Teaching | **Thin scaffold** | Models exist, minimal API | 20% | Medium |
| Attendance / Engagement | **Partial** | UKVI threshold from SystemSetting, alert emission | 45% | High |
| Assessment / Marks / Boards | **Partial** | Status-based event mapping (6 event types), exam board CRUD | 60% | High |
| Finance / Charges / Payments | **Thin CRUD** | Double-entry model exists but no charge generation, payment recording | 40% | High |
| Casework / Support / Compliance | **Partial** | Ticket assignment + resolution detection in service layer | 35% | Medium |
| Reporting / HESA / Regulatory | **Misleadingly complete** | HESA models exist (11 entities) but no export/validation | 30% | High |
| Role-Based Portals | **Mixed** | Admin 79%, Applicant 94%, Student 58%, Academic 20% | 50% | High |

---

## Key Corrections to Prior Review

### Business Logic Is Not Zero

The prior review claimed "0 of 44 services contain business logic beyond CRUD". This is incorrect. Evidence:

| Service | Business Logic Found |
|---------|---------------------|
| `applications.service.ts` | Status transition detection, offer-made vs withdrawn branching, enquiry event for DIRECT route |
| `marks.service.ts` | Event-type mapping by status (PENDING→created, SUBMITTED→submitted, GRADED→graded, RATIFIED→ratified), status-change-specific events on update, marks.released detection |
| `support.service.ts` | Assignment detection (assignedTo changed), resolution detection (status→RESOLVED), distinct event types per transition |
| `enrolments.service.ts` | Status change event with previous/new status in payload |
| `attendance.service.ts` | UKVI threshold lookup from SystemSetting with fallback, two distinct alert types (general + UKVI breach) |
| `communications.service.ts` | Template resolution by code, delivery logging with PENDING→SENT/FAILED lifecycle, error handling path |
| `documents.service.ts` | Verification status change detection with domain event |
| `finance.service.ts` | Status transition events |
| `dashboard.service.ts` | 234 lines of aggregation logic across 6 dashboard views (staff, student, applicant, academic, engagement, tutees) |

**Revised assessment: ~14 services have meaningful business logic beyond CRUD.** The remaining ~30 are pure CRUD — which is architecturally correct for reference-data domains (faculties, schools, departments, programme-modules, etc.) that genuinely don't need business rules.

### n8n Workflows Are Provisioned and Activated

The JSON files store `active: false` as a version-control default. The provisioning script (`scripts/provision-n8n-workflows.ts`) activates all 15 workflows when run. The output confirmed "15 updated + activated". The prior claim of "all 15 inactive" was based on inspecting JSON only, not the runtime state.

However, **no workflow has been triggered by a real event end-to-end**. The workflows are structurally correct (5-7 nodes each with webhook trigger → filter → API callback → notification) but functionally unverified.

---

## Detailed Domain Notes

### Admissions (Partial — not "thin CRUD")
The applications service has genuine status-transition branching: it detects offer-made (conditional/unconditional), withdrawn, and emits enquiry.created for DIRECT-route applications. This is domain-appropriate logic. Missing: multi-reviewer workflow, UCAS integration, clearing workflow.

### Assessment / Marks (Partial — has event mapping)
The marks service maps status to 6 different event types and detects first-time mark assignment (marks.released). The exam board service has scheduled/in_progress/completed lifecycle events. Missing: maxMark validation, grade boundary calculation as a function, moderation approval workflow, board decision recording UI.

### Finance (Thin CRUD — correctly assessed)
The finance service has status-transition events but no charge calculation, no payment allocation, no invoice generation. The double-entry model (StudentAccount → ChargeLine → Invoice → Payment) is correctly designed in Prisma but the service layer treats finance as a single Account entity. The 4 sub-pages (Invoicing, Sponsors, Bursaries, Refunds) all hit the same endpoint — this is misleading.

### Compliance (Schema-rich, functionally thin)
HESA has 11 Prisma models (HESAReturn, HESANotification, HESASnapshot, HESAValidationRule, HESAFieldMapping, HESAStudent, HESAModule, HESAStudentModule, HESAEntryQualification, HESACodeTable, plus DataFuturesEntity). The HESA notification queue is operational (Phase 7). But no XML export, no coding-frame validation, no Data Futures entity-chain builder exists. This domain is correctly deferred but should not be claimed as "implemented".

### Attendance / Engagement (Better than 1/10)
The UKVI attendance threshold is genuinely config-driven (reads from SystemSetting, falls back to 70). Two distinct alert emission functions exist (general + UKVI breach). The engagement scoring engine doesn't exist as a calculation service, but the monitoring-alerting pattern is in place. The prior 1/10 for business logic in this domain was too harsh — it should be 3-4/10.
