# SJMS 2.5 — UAT Review by Persona

> **Review Date:** 2026-04-15
> **Perspective:** UAT Lead
> **Method:** Task-based assessment per persona. A page existing is not enough — can the user complete a meaningful job?

---

## Classification Key

| Status | Meaning |
|--------|---------|
| **WORKS** | Task can be completed end-to-end with correct business outcome |
| **PARTIAL** | Task can be started but cannot be completed, or produces incomplete/unvalidated results |
| **BLOCKED** | Task cannot be meaningfully attempted |
| **NOT FOUND** | No UI or API path exists for this task |
| **MISLEADING** | UI suggests task works but outcome is unreliable or unvalidated |

---

## 1. Registry / Admin Staff

**Role:** Registrar, system administrator, registry officer
**Portal:** Admin (80+ pages)

| # | Critical Task | Status | Evidence | Friction / Trust Issues |
|---|--------------|--------|----------|------------------------|
| 1 | Search and view a student record | **WORKS** | StudentList page with search, filter, infinite scroll. Student detail page loads real data. | None — well-implemented |
| 2 | Create a new student record | **WORKS** | StudentCreate form with validation, submits to API. | Minimal — forename/surname fields, fee status dropdown, entry route. |
| 3 | Enrol a student onto a programme | **PARTIAL** | EnrolmentCreate page exists. Form submits. But no validation that student meets entry requirements or programme is available. | Staff must manually verify eligibility — system provides no guardrails. |
| 4 | Register a student for modules | **MISLEADING** | ModuleRegistration create works. But no prerequisite check, no credit limit enforcement, no timetable clash detection. System accepts any combination silently. | **High risk:** Invalid registrations would be accepted without warning. Staff would not know the data is unreliable. |
| 5 | Process an enrolment status change (interruption, withdrawal) | **PARTIAL** | Status can be changed via update. EnrolmentStatusHistory records the change. But no downstream effects (module registrations not suspended, finance not notified, UKVI not alerted). | Status changes are cosmetic — they update a field but don't cascade through the system. |
| 6 | View and export student data | **WORKS** | DataTable with CSV export on most list pages. Search and filter functional. | None — good implementation. |
| 7 | View audit trail for a student | **WORKS** | AuditLogViewer page exists. Audit entries captured for all CRUD operations. | Works for compliance review of who changed what. |
| 8 | Manage academic calendar | **PARTIAL** | AcademicCalendar and AcademicYears pages exist. CRUD works. But calendar events don't drive any system behaviour (no census dates, no term boundaries affecting enrolment windows). | Calendar is informational, not operational. |
| 9 | Generate HESA return | **BLOCKED** | HESA pages exist but service is CRUD only. No entity mapping, no validation, no export. | Staff would need to use a separate tool. |
| 10 | Manage system settings | **WORKS** | SystemSettings page exists. UKVI threshold configurable. | Functional for basic configuration. |
| 11 | View management dashboards | **PARTIAL** | ManagementDashboards page with Recharts. Shows aggregate counts. But no drill-down, no trend analysis, no comparison. | Basic statistics only — not operational decision support. |
| 12 | Run a progression board | **BLOCKED** | ExamBoard pages exist. But no mark aggregation, no progression rule evaluation, no board decision application. Cannot produce a progression recommendation from the system. | Board would need to use spreadsheets for actual decision-making. |

**Training Burden:** Medium for data entry; High for understanding system limitations.
**Trust Level:** LOW — system accepts invalid data without warning. Staff would need external validation for any business-critical operation.

---

## 2. Academic Staff

**Role:** Lecturer, module leader, programme leader
**Portal:** Academic (13 pages)

| # | Critical Task | Status | Evidence | Friction / Trust Issues |
|---|--------------|--------|----------|------------------------|
| 1 | View my assigned modules | **WORKS** | MyModules page loads module data from API. | Functional. |
| 2 | View students registered on my module | **PARTIAL** | MyStudents page exists. Data loads. But no clear indication of student status (active/withdrawn/interrupted). | Staff may see withdrawn students in their list. |
| 3 | Enter marks for an assessment | **WORKS** | MarksEntry page is well-implemented. Per-row validation (0-100), draft save, submission. Status tracking (MARKED → SUBMITTED). | Good implementation. One of the system's strongest features. |
| 4 | Submit marks for moderation | **PARTIAL** | Marks can be set to SUBMITTED status. But no moderation workflow — no second marker assignment, no discrepancy detection, no escalation. | Staff would submit marks but nothing happens next. No feedback loop. |
| 5 | View moderation outcomes | **PARTIAL** | MyModeration page exists but is partially implemented (minimal UI beyond placeholder). | Scaffolded, not functional. |
| 6 | View exam board outcomes for my modules | **PARTIAL** | MyExamBoards page exists. Data may load. But no aggregated view of module results. | Cannot see module-level pass rates or grade distributions from board perspective. |
| 7 | View my tutees | **PARTIAL** | MyTutees page exists. Data likely loads. But no case management, no meeting recording, no intervention tracking. | Display only — cannot record pastoral interactions. |
| 8 | View my timetable | **BLOCKED** | MyTimetable (academic) is a stub page. | Not implemented. |
| 9 | Record attendance for a teaching session | **PARTIAL** | AttendanceRecord can be created via API. But no academic portal page for session-based attendance marking. | Attendance recording may require admin portal. |
| 10 | View student engagement scores | **PARTIAL** | MyAttendance page exists with summary stats. But engagement scoring is at aggregate level, not per-student actionable. | Information display, not decision support. |

**Training Burden:** Low for mark entry; High for understanding what the system cannot do.
**Trust Level:** MEDIUM — mark entry works well, but the surrounding workflow (moderation, boards, progression) is absent.

---

## 3. Student

**Role:** Currently enrolled student
**Portal:** Student (15 pages)

| # | Critical Task | Status | Evidence | Friction / Trust Issues |
|---|--------------|--------|----------|------------------------|
| 1 | View my programme and modules | **WORKS** | MyModules page loads module registrations from API. | Functional. |
| 2 | View my marks and grades | **WORKS** | MyMarks page displays assessment results. | Functional — but grades may be manually entered rather than calculated, so accuracy depends on staff. |
| 3 | View my attendance and engagement | **WORKS** | Student dashboard shows attendance summary. | Functional. |
| 4 | View my personal details | **WORKS** | StudentProfile / MyAccount pages exist. | Functional for viewing. |
| 5 | Update my contact details | **PARTIAL** | Profile page exists but update capability not verified. PersonContact model allows updates. | May need admin intervention for address changes. |
| 6 | View my financial account | **PARTIAL** | Student dashboard may show finance summary. But MyPaymentPlan is a stub. | Limited financial visibility. |
| 7 | Raise a support ticket | **WORKS** | RaiseTicket form with Zod validation, category selection, submission. | Well-implemented. |
| 8 | View my timetable | **BLOCKED** | No student timetable page found. | Not available. |
| 9 | Submit an EC claim | **PARTIAL** | ECClaim model exists. Submission path likely via support or dedicated page. But no automatic deadline extension applied. | Students can submit but won't see the effect on their assessments. |
| 10 | View my transcript | **BLOCKED** | Transcript model exists but transcript generation not implemented. No downloadable document. | Student cannot obtain a formal transcript. |
| 11 | View my degree progress | **PARTIAL** | Dashboard may show credit accumulation. But no progression tracking, no classification estimate, no outstanding requirements view. | Students cannot assess their own progress toward a degree. |
| 12 | Upload documents | **WORKS** | MyDocuments page exists. Document upload via MinIO integration. | Functional. |

**Training Burden:** Low — student portal is intuitive for basic viewing.
**Trust Level:** MEDIUM — students can view data but cannot complete self-service tasks that affect their academic record.

---

## 4. Applicant

**Role:** Prospective student applying for a programme
**Portal:** Applicant (8 pages)

| # | Critical Task | Status | Evidence | Friction / Trust Issues |
|---|--------------|--------|----------|------------------------|
| 1 | Search available courses | **WORKS** | CourseSearch page with real-time search against programmes API. | Functional. |
| 2 | Start a new application | **WORKS** | Application creation via form. | Functional. |
| 3 | Complete and submit an application | **WORKS** | EditApplication page with conditional rendering. Fields disabled after submission. | Good implementation. |
| 4 | Upload supporting documents | **WORKS** | UploadDocuments page exists. MinIO integration. | Functional. |
| 5 | Track my application status | **PARTIAL** | MyApplication / ApplicantDashboard shows status. But no timeline, no decision timeline transparency, no expected next steps. | Applicant knows current status but not what happens next or when. |
| 6 | View and respond to an offer | **PARTIAL** | MyOffers page exists. Offer display likely works. But firm/insurance choice mechanism and deadline tracking not verified. | Cannot confirm whether applicant can actively respond to offer. |
| 7 | View admissions events | **PARTIAL** | Events page exists (applicant portal). But AdmissionsEvent is a separate module — connection to specific applicant not clear. | Generic events page, not personalised to applicant's programme. |
| 8 | Contact admissions | **PARTIAL** | ContactAdmissions page exists. Form likely works. But no ticketing or response tracking. | One-way communication — applicant cannot track responses. |

**Training Burden:** Low — applicant portal is straightforward.
**Trust Level:** MEDIUM — application submission works, but the post-submission experience (tracking, responding, communicating) is thin.

---

## 5. Finance Staff (if applicable)

**Role:** Finance officer, bursary administrator
**Portal:** Admin (Finance section)

| # | Critical Task | Status | Evidence | Friction / Trust Issues |
|---|--------------|--------|----------|------------------------|
| 1 | View a student's financial account | **WORKS** | AccountList and AccountDetail pages exist with real API data. | Functional for viewing. |
| 2 | Assess fees for a student | **MISLEADING** | FeeAssessment model exists. Finance pages allow data entry. But no fee calculation logic — all amounts manually entered. | System won't tell you what the fee should be. Staff must calculate externally. |
| 3 | Record a payment | **PARTIAL** | PaymentRecording page may be partially implemented. | Likely functional for basic recording. |
| 4 | Set up a payment plan | **PARTIAL** | PaymentPlans page exists. CRUD works. But no enforcement — missed payments don't trigger alerts or holds. | Plan exists on paper but system doesn't enforce it. |
| 5 | Process a bursary | **PARTIAL** | Bursaries page exists. CRUD likely works. But no eligibility calculation or means testing. | Manual bursary management only. |
| 6 | View outstanding debt | **PARTIAL** | Account detail shows balance. But no aged debt report, no debtor actions, no holds on re-enrolment. | Staff must manually manage debt — no automation. |
| 7 | Generate invoices | **PARTIAL** | Invoicing page exists. But invoice generation from charge lines may be manual. | Likely requires manual invoice creation per student. |
| 8 | Submit SLC data | **BLOCKED** | SponsorAgreement model exists. No SLC integration. | Cannot interact with Student Loans Company. |

**Training Burden:** High — system requires extensive manual calculation and external verification.
**Trust Level:** LOW — finance data entry works but no validation, calculation, or enforcement. Cannot be trusted for financial accuracy without external checks.

---

## 6. Compliance Staff (UKVI / HESA)

**Role:** Compliance officer, UKVI reporting officer, HESA returns officer
**Portal:** Admin (Compliance section)

| # | Critical Task | Status | Evidence | Friction / Trust Issues |
|---|--------------|--------|----------|------------------------|
| 1 | View UKVI-monitored students | **PARTIAL** | UKVIRecord pages exist. Data loads. | Can view records but not actionable intelligence. |
| 2 | Identify students below attendance threshold | **BLOCKED** | Threshold stored in SystemSetting. But no automatic evaluation. No list of non-compliant students. | Staff must manually cross-reference attendance records with threshold. |
| 3 | Generate UKVI attendance report | **BLOCKED** | HomeOfficeReports page is a stub (description only). | Not implemented. |
| 4 | Prepare HESA return | **BLOCKED** | HESA pages show notification list. No entity mapping, validation, or export. | Cannot prepare a HESA return. |
| 5 | Validate HESA data | **BLOCKED** | HESAValidationRule model exists but no validation engine. | Cannot validate data against HESA rules. |
| 6 | View regulatory audit trail | **PARTIAL** | AuditLog captures changes. But no compliance-specific views (e.g., all changes to Tier 4 students). | Generic audit, not compliance-focused. |

**Training Burden:** N/A — tools don't exist for compliance workflows.
**Trust Level:** VERY LOW — compliance staff cannot perform their core functions using this system.

---

## UAT Summary

| Persona | Tasks Assessed | WORKS | PARTIAL | BLOCKED | MISLEADING | NOT FOUND | UAT Ready? |
|---------|---------------|-------|---------|---------|------------|-----------|------------|
| Registry/Admin | 12 | 4 | 4 | 2 | 1 | 0 | **NO** |
| Academic Staff | 10 | 2 | 6 | 1 | 0 | 0 | **NO** |
| Student | 12 | 5 | 4 | 2 | 0 | 0 | **NO** |
| Applicant | 8 | 4 | 4 | 0 | 0 | 0 | **BORDERLINE** |
| Finance | 8 | 1 | 5 | 1 | 1 | 0 | **NO** |
| Compliance | 6 | 0 | 2 | 4 | 0 | 0 | **NO** |

**Overall UAT Verdict: NOT READY**

The applicant portal is the closest to UAT-ready — application submission, course search, and document upload work. All other personas have critical workflow gaps that prevent meaningful task completion. The system works for data entry and viewing but fails on business logic, validation, and cross-domain workflow completion.
