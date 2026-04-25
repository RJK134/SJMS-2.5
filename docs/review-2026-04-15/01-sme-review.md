# SJMS 2.5 — Domain SME Review

> **Review date:** 2026-04-15
> **Perspective:** UK Higher Education operational realism

---

## Domain Assessment Summary

| Domain | Business Realism | Completeness | Workflow Coherence | Regulatory Plausibility | Staff Usability | Student Usability | Confidence |
|--------|-----------------|-------------|-------------------|------------------------|----------------|------------------|------------|
| Admissions | Good | 70% | Partial | Medium | Medium | Good | Medium |
| Applicant Management | Good | 65% | Partial | Medium | N/A | Medium | Medium |
| Student Core Record | Strong | 80% | Good | High | Good | Limited | High |
| Curriculum/Programme/Module | Strong | 75% | Good | High | Medium | N/A | High |
| Enrolment/Registration | Good | 65% | Partial | Medium | Medium | Low | Medium |
| Timetable/Teaching | Weak | 20% | Stub | Low | Not usable | Not usable | Low |
| Attendance/Engagement | Moderate | 45% | Partial | Medium | Limited | Limited | Medium |
| Assessment/Marks/Boards | Good | 60% | Partial | Medium | Limited | Limited | Medium |
| Finance | Moderate | 40% | Partial | Low | Limited | Stub | Low |
| Casework/Support/Compliance | Moderate | 35% | Stub-heavy | Low | Limited | Stub | Low |
| Reporting/HESA | Moderate | 30% | Stub-heavy | Low | Not tested | N/A | Low |
| Role-based Portals | Moderate | 50% | Partial | Medium | Mixed | Mixed | Medium |

---

## Detailed Domain Assessments

### 1. Admissions

**Business realism: Good.** Application model covers UCAS, direct, clearing, and international routes. Offer conditions, interviews, clearance checks, and agent management are modelled. UCAS choice and tariff entities exist in schema.

**Completeness: 70%.** Pipeline view, application detail, interview schedule, and events management are wired to real API data. Agent management is a stub. Offer conditions display but the conditional-to-unconditional workflow transition is not explicitly implemented as a state machine.

**Workflow coherence: Partial.** An application can be created and its status changed, but the business-critical decision workflow (multiple decision-makers, panel review, conditional offer generation) is a single status field update, not a governed process.

**Finding [F-BIZ-001]:** Offer decision is a flat status change. Real admissions requires: tutor recommendation → admissions officer review → conditional offer generation → condition tracking → firm/insurance selection. **Severity: Medium. Confidence: High.**

### 2. Student Core Record

**Business realism: Strong.** Person model with effective-dated names, addresses, contacts, identifiers (HUSID, ULN, UCAS ID), and demographics. Student extends Person with studentNumber, feeStatus, entryRoute. Matches SITS STU/PRS pattern.

**Completeness: 80%.** StudentList, StudentProfile, StudentCreate all wired. Profile has tabbed views (Academic, Attendance, Finance, Compliance, Documents, Support). Some tabs are stubs (Audit, Overview, Personal).

**Regulatory plausibility: High.** HESA-aligned fields present (ethnicity, disability, POLAR quintile via PersonDemographic). Fee status covers Home/Overseas/EU Transitional/Islands.

**Finding [F-BIZ-002]:** Student profile Overview and Personal tabs are stubs — the most basic registry task (view a student's full record) is incomplete in the UI despite data being available via API. **Severity: Medium. Confidence: High.**

### 3. Curriculum / Programme / Module

**Business realism: Strong.** Programme with specifications, pathways, accreditations, JACS/HECoS codes, and credit framework. Module with specifications, prerequisites, delivery patterns. ProgrammeModule junction with core/optional/elective types and year-of-study mapping.

**Completeness: 75%.** List, detail, and create pages wired. Programme approval workflow has a UI form (Batch 8A fix). Module detail has assessments and students tabs wired.

**Finding [F-BIZ-003]:** Programme approval is a single-step POST, not a multi-stage governance workflow. Real universities require: programme team → faculty board → academic board → senate, with version control on specifications. **Severity: Low (acceptable for first release). Confidence: High.**

### 4. Enrolment / Registration

**Business realism: Good.** Enrolment model covers academic year, year of study, mode of study, fee status, and status history. ModuleRegistration with attempt tracking. Bulk module registration page exists.

**Completeness: 65%.** List, detail, create, and status changes wired to API. Bulk registration page partially wired (useList hooks present). The re-enrolment workflow (returning students) is not explicitly modelled.

**Finding [F-BIZ-004]:** No re-enrolment or continuation workflow. In UK HE, students re-enrol annually — this is one of the busiest registry operations. Current model treats enrolment as a one-time event. **Severity: High. Confidence: High.**

### 5. Timetable / Teaching

**Business realism: Weak.** TeachingEvent, Room, TimetableSlot, and TimetableClash models exist in schema. But the UI has only 2 wired pages (RoomManagement, TimetableView) and 1 stub (ClashDetection).

**Completeness: 20%.** No timetable generation, no teaching event creation, no student-timetable view that works end-to-end. The student MyTimetable page exists but depends on `/v1/attendance/timetable/sessions` which is a read endpoint only.

**Finding [F-BIZ-005]:** Timetabling is entirely scaffold. A university cannot operate without a functioning timetable. This is appropriately deferred (most institutions use external timetabling systems like Scientia/Celcat and import via integration). **Severity: Low (integration expected). Confidence: Medium.**

### 6. Assessment / Marks / Boards / Progression

**Business realism: Good.** Assessment → AssessmentComponent → AssessmentAttempt → ModuleResult → ExamBoard → ProgressionRecord → AwardRecord chain is modelled. Mark pipeline stages (DRAFT → FIRST_MARK → SECOND_MARK → AGREED → MODERATED → RATIFIED → PUBLISHED) exist in schema.

**Completeness: 60%.** MarksEntry page wired with editable grid. ModerationQueue and GradeDistribution wired. ExamBoard list and detail wired. But: academic staff MyMarksEntry is a stub, MyModeration is a stub, MyExamBoards is a stub. The people who actually enter marks cannot use this system.

**Finding [F-BIZ-006]:** Marks entry is available to admin staff but NOT to academic staff (the actual markers). The academic portal has 11 stub pages. This is the single most critical workflow gap — marks cannot flow through the system without academic staff participation. **Severity: Critical. Confidence: High.**

### 7. Finance

**Business realism: Moderate.** Double-entry ledger model (StudentAccount → ChargeLine → Invoice → Payment → PaymentPlan). SponsorAgreement, BursaryFund, RefundApproval exist.

**Completeness: 40%.** AccountList and AccountDetail wired. Invoicing, Sponsors, Bursaries, Refunds pages show DataTable views of finance accounts (not dedicated invoice/sponsor endpoints). PaymentPlans and PaymentRecording are stubs.

**Finding [F-BIZ-007]:** Finance sub-pages (Invoicing, Sponsors, Bursaries, Refunds) all display the same StudentAccount list endpoint. They are visually distinct pages but functionally identical. No invoice generation, no payment recording, no sponsor billing exists. **Severity: High. Confidence: High.**

### 8. Casework / Support / Compliance

**Business realism: Moderate.** SupportTicket with interactions, StudentFlag, PersonalTutoring, WellbeingRecord models. UKVI with CAS tracking, contact points, and attendance monitoring.

**Completeness: 35%.** Ticket list and detail wired (including interaction timeline from Phase 8). UKVI dashboard wired. But: DisabilityRecords, FlagManagement, PersonalTutoring, WellbeingRecords are all stubs. ECClaims, Appeals, AcademicMisconduct are all stubs.

**Finding [F-BIZ-008]:** The EC/appeals system — arguably the most legally sensitive area for UK universities — is entirely stub. Extenuating circumstances claims, academic appeals, and misconduct cases are critical governance requirements with strict regulatory deadlines. **Severity: High (for production). Confidence: High.**

### 9. Reporting / HESA

**Business realism: Moderate for models, weak for implementation.** HESA entities (HESAReturn, HESASnapshot, HESAStudent, HESAModule, HESAStudentModule) exist. HESANotification queue added in Phase 7. StatutoryReturn model exists.

**Completeness: 30%.** HESAReturn page and StatutoryReturns page are wired but display simple lists. No HESA XML generation, no Data Futures entity chain validation, no coding frame enforcement. CustomReports page is a stub.

**Finding [F-BIZ-009]:** HESA Data Futures compliance is schema-modelled but functionally absent. No XML generation, no validation rules execution, no dry-run capability. This is expected for pre-UAT but must not be claimed as "implemented". **Severity: Medium (deferred correctly). Confidence: High.**

### 10. Role-Based Portals

**Business realism: Moderate.** Four portals (Admin, Academic, Student, Applicant) with role-based routing and portal guards. Dev personas correctly isolate access.

**Finding [F-BIZ-010]:** The admin portal is the only substantially functional portal. Academic portal is 85% stub. Student portal is 50% stub. Applicant portal is the most complete after admin (70% wired). **Severity: High. Confidence: High.**
