# SJMS 2.5 — Golden Journeys Assessment

> **Review Date:** 2026-04-15
> **Perspective:** End-to-end business workflow verification
> **Principle:** A journey is only complete if a user can start it, complete every step, and the system produces a correct, trustworthy outcome.

---

## Journey 1: Applicant Submits and Tracks Application

**Expected Business Path:**
Applicant searches courses → selects programme → creates application → enters personal details, qualifications, personal statement → uploads supporting documents → submits application → receives acknowledgement → tracks status → receives decision notification.

**Actual Implemented Path:**
CourseSearch (real API search) → Application creation (form submission) → EditApplication (conditional fields, status-dependent disabling) → UploadDocuments (MinIO) → Submit (status change to SUBMITTED) → MyApplication/ApplicantDashboard (view status) → n8n notification on status change (workflow exists but inactive).

**Breakpoints:**
- No acknowledgement notification sent (n8n workflow inactive)
- No decision timeline transparency for applicant
- Status tracking shows current status but no expected next steps

**Hidden Assumptions:**
- Application qualifications entered by applicant are trusted (no UCAS data feed)
- Application completeness not validated before submission (Zod validates field types but not business completeness)

**Missing Controls:**
- No application deadline enforcement
- No duplicate application detection
- No UCAS code validation

**Evidence of Completion:** CourseSearch, EditApplication, UploadDocuments pages reviewed. API endpoints for applications CRUD verified. Status lifecycle exists in schema.

**Verdict: PARTIAL — GO for SME walkthrough, NO-GO for UAT**

The applicant can submit an application and view its status. But the post-submission experience (notifications, decision tracking, offer response) is incomplete. This is the closest journey to being complete.

---

## Journey 2: Admissions Decision to Offer

**Expected Business Path:**
Application received → assigned to admissions officer → qualifications assessed (tariff calculation) → interview scheduled (if applicable) → decision made (conditional/unconditional offer, rejection) → offer conditions specified → offer letter generated → applicant notified → applicant responds (firm/insurance/decline).

**Actual Implemented Path:**
Application visible in ApplicationPipeline (Kanban view) → staff can manually change status → if status set to CONDITIONAL_OFFER or UNCONDITIONAL_OFFER, webhook event emitted → OfferCondition records can be manually created → n8n workflow for offer notification exists (inactive).

**Breakpoints:**
- No tariff calculation — staff must manually assess qualifications against entry requirements
- No interview scheduling workflow (Interview model exists, but no scheduling logic or calendar integration)
- No offer letter generation (LetterGeneration page is a stub)
- No applicant response mechanism verified in UI
- No automatic condition tracking (conditions manually marked MET/WAIVED)

**Hidden Assumptions:**
- Admissions staff know the entry requirements and can calculate tariff manually
- Offer decisions are entirely manual with no decision support
- Condition fulfilment verified externally (e.g., UCAS results service)

**Missing Controls:**
- No tariff threshold enforcement
- No offer-to-student-number ratio tracking
- No clearing vacancy management
- No CMA timeline compliance

**Evidence of Completion:** ApplicationPipeline page reviewed. applications.service.ts shows status transitions emit events. OfferCondition model exists in schema. No decision logic in any service file.

**Verdict: NO-GO**

Staff can view applications and change statuses. But without tariff calculation, decision support, or offer letter generation, this is a manual status-tracking system, not an admissions processing system.

---

## Journey 3: Offer to Enrolment

**Expected Business Path:**
Applicant firms offer → conditions met (results day) → status changes to UNCONDITIONAL → enrolment invitation sent → applicant completes pre-enrolment tasks → enrolment confirmed → student record created → fee assessment generated → programme enrolment active.

**Actual Implemented Path:**
Application status manually changed to UNCONDITIONAL_OFFER → Student record manually created (StudentCreate page) → Enrolment manually created (EnrolmentCreate page) → Fee assessment manually created (finance CRUD) → no automated link between application acceptance and enrolment creation.

**Breakpoints:**
- No automated transition from accepted application to enrolment
- Student record must be manually created (no applicant-to-student conversion)
- No pre-enrolment task management
- No automatic fee assessment on enrolment
- No CAS generation for international students

**Hidden Assumptions:**
- Staff manually coordinate between admissions and registry to create student records
- Fee status carried from application to enrolment manually
- No identity deduplication (applicant and student could be separate Person records)

**Missing Controls:**
- No enrolment deadline enforcement
- No fee payment prerequisite for enrolment
- No UKVI compliance checks before enrolment of Tier 4 students

**Evidence of Completion:** StudentCreate and EnrolmentCreate pages exist. No service-level automation linking applications to enrolments. No conversion workflow.

**Verdict: NO-GO**

Every step from offer acceptance to active enrolment requires manual staff intervention with no system guidance or validation. The system does not connect the admissions and enrolment domains.

---

## Journey 4: Student Registration / Module Enrolment

**Expected Business Path:**
Student logs in → views programme structure → sees available modules → selects modules within credit limits → system validates prerequisites and timetable → confirms registration → timetable updated → attendance tracking begins.

**Actual Implemented Path:**
ModuleRegistration can be created via admin portal → links student enrolment to module → status set to REGISTERED → no validation of any kind.

**Breakpoints:**
- No student self-service module selection
- No programme structure browser for students
- No prerequisite validation
- No credit limit enforcement
- No timetable integration
- No confirmation workflow

**Hidden Assumptions:**
- Module registration is entirely staff-driven
- Staff know which modules are valid for which programmes
- Staff manually check prerequisites and credit totals

**Missing Controls:**
- No prerequisite enforcement (Critical — student could be registered for Level 6 module without Level 5 prerequisite)
- No credit limit check (student could register for 200 credits when programme allows 120)
- No timetable clash detection
- No module capacity tracking

**Evidence of Completion:** module-registrations.service.ts reviewed — pure CRUD, no validation. ModuleRegistration schema reviewed — prerequisites field exists on Module but is JSON and never consulted.

**Verdict: NO-GO**

Module registration exists as a data entry function. It lacks every validation a real registration system requires. This is the single most dangerous gap — it produces invalid academic records silently.

---

## Journey 5: Timetable / Attendance Capture

**Expected Business Path:**
Teaching events scheduled → timetable published → students view personal timetable → sessions delivered → attendance recorded (register/card swipe/biometric) → engagement scores calculated → low-attendance alerts triggered → UKVI compliance monitored → interventions created.

**Actual Implemented Path:**
TeachingEvent and TimetableSlot models exist → attendance records can be created → engagement score calculated as percentage → displayed on dashboard → UKVI threshold stored in SystemSetting.

**Breakpoints:**
- No timetable generation or publication
- Student timetable view is a stub
- Attendance recording has no session-linked UI (no "mark attendance for this teaching event")
- Alert triggering logic is un-wired (TODO comments in code)
- No UKVI breach detection or reporting
- No intervention creation workflow

**Hidden Assumptions:**
- Timetable managed externally (e.g., Scientia)
- Attendance recorded ad-hoc, not session-by-session
- UKVI monitoring done manually

**Missing Controls:**
- No automatic low-attendance alerts
- No UKVI compliance monitoring
- No intervention workflow
- No attendance amnesty/medical certificate handling

**Evidence of Completion:** attendance.service.ts reviewed — engagement calculation works but alert emission commented as TODO. TimetableSlot model in schema but timetable service is read-only sub-service.

**Verdict: NO-GO**

Attendance can be recorded and viewed. But the monitoring, alerting, and compliance loop that makes attendance tracking operationally useful is not implemented.

---

## Journey 6: Marks Entry and Assessment Processing

**Expected Business Path:**
Assessment created → components defined with weightings → marking scheme set → marks entered by first marker → anonymous marking maintained → second marker enters marks (if required) → discrepancy detected → moderation → marks aggregated with component weightings → grade assigned from boundaries → module result calculated → submitted to exam board.

**Actual Implemented Path:**
Assessment CRUD → AssessmentComponent CRUD → MarksEntry page (well-implemented: per-row entry, 0-100 validation, draft save, submission status tracking) → SecondMarkingRecord can be created → grade boundaries can be created → status can be manually changed through pipeline stages.

**Breakpoints:**
- Marks entered but never aggregated (no weighted calculation from components)
- Grade boundaries exist but are never consulted to auto-assign grades
- Second marking captured but no discrepancy detection
- No moderation escalation
- No module result auto-calculation
- No exam board aggregation view

**Hidden Assumptions:**
- Grade assignment is manual (staff types in "A" rather than system deriving it from mark 73)
- Component weightings are decorative — system stores 40% and 60% but never calculates
- Moderation is a status change, not a workflow

**Missing Controls:**
- No weighted mark aggregation
- No grade boundary enforcement
- No second-marking discrepancy threshold
- No external examiner sampling
- No academic misconduct detection

**Evidence of Completion:** MarksEntry page reviewed (well-implemented UI). marks.service.ts reviewed — CRUD with status tracking. GradeBoundary model in schema. No calculation functions in any service file.

**Verdict: NO-GO**

Mark entry is the system's best-implemented UI feature. But marks go in and never come out as meaningful results. The entire assessment pipeline after data entry is absent.

---

## Journey 7: Progression / Board Outcome

**Expected Business Path:**
Exam board convenes → module results reviewed → progression rules applied (credit thresholds, compensation, condoned fails) → progression decision recorded (progress/repeat/withdraw/award) → award classification calculated (First/2:1/2:2/Third based on weighted year averages) → board minutes recorded → students notified → transcript updated.

**Actual Implemented Path:**
ExamBoard CRUD → ProgressionRecord CRUD (totalCreditsAttempted, totalCreditsPassed, averageMark, progressionDecision can be manually entered) → AwardRecord CRUD (classification, finalAverage can be manually entered) → DegreeCalculation CRUD (year weights stored but never used).

**Breakpoints:**
- No mark aggregation feeding into progression decisions
- No progression rule evaluation
- No credit threshold checking
- No compensation logic
- No classification calculation from marks
- No board minutes or formal decision recording workflow
- No transcript generation

**Hidden Assumptions:**
- Board decisions made entirely outside the system
- All progression data (credits, averages, decisions) manually entered after external calculation
- DegreeCalculation year weights are informational only

**Missing Controls:**
- No FHEQ credit minimums enforcement
- No compensation rule engine
- No classification boundary validation (a student could have finalAverage 65 and classification FIRST without system warning)
- No referred/deferred assessment scheduling

**Evidence of Completion:** progressions.service.ts — pure CRUD. DegreeCalculation model in schema — yearWeights as JSON, never used in any service. No calculation or rule evaluation functions.

**Verdict: NO-GO**

The most critical journey in a university system (determining whether students progress and what degree class they receive) is entirely manual data entry. The system has no intelligence in this domain.

---

## Journey 8: Fee or Charge Visibility

**Expected Business Path:**
Student enrols → tuition fee automatically calculated based on fee status, programme, mode of study → charge line created → invoice generated → payment plan offered → payments recorded → balance tracked → debt actions if overdue → SLC payments applied → student can view balance and plan.

**Actual Implemented Path:**
StudentAccount CRUD → ChargeLine CRUD (manual entry) → Payment CRUD → PaymentPlan CRUD → AccountDetail page shows balance. MyPaymentPlan (student portal) is a stub.

**Breakpoints:**
- No automatic fee calculation
- No automatic charge creation on enrolment
- No invoice generation workflow
- No payment plan enforcement
- No debt hold mechanism
- Student payment plan view is a stub

**Evidence of Completion:** finance.service.ts — CRUD only. FeeAssessment model exists but no calculation logic. MyPaymentPlan page confirmed as stub.

**Verdict: NO-GO**

Finance exists as a manual ledger. No automation, no student visibility, no enforcement.

---

## Journey 9: Student Self-Service Record Access

**Expected Business Path:**
Student logs in → views dashboard (modules, marks, attendance, finance summary) → accesses personal details → views/downloads timetable → views/downloads transcript → raises support ticket → submits EC claim → views progression status.

**Actual Implemented Path:**
Student dashboard → MyModules (works) → MyMarks (works) → MyAccount (works) → RaiseTicket (works) → MyDocuments (works).

**Breakpoints:**
- No timetable view
- No transcript download
- No progression status view
- MyPaymentPlan is a stub
- EC claim submission unclear

**Evidence of Completion:** Student portal pages reviewed. 5 of 9 self-service functions work.

**Verdict: PARTIAL — NO-GO for comprehensive UAT, possible for limited pilot on viewing functions**

Students can view their core academic data and raise support tickets. But cannot access timetable, transcript, progression status, or financial details.

---

## Journey 10: Admin Oversight / Audit / Reporting

**Expected Business Path:**
Admin views management dashboards → drills into domain-specific reports → filters by programme, cohort, demographic → exports data for governance → reviews audit trail for compliance → generates statutory returns (HESA, OFS, UKVI).

**Actual Implemented Path:**
ManagementDashboards with Recharts (basic counts and charts) → AuditLogViewer (functional) → DataTable CSV export on list pages → HESA/UKVI pages exist but are CRUD only or stubs.

**Breakpoints:**
- Dashboards show aggregate counts, not operational intelligence
- No drill-down from dashboard to detailed records
- No cohort analysis or demographic breakdown
- No HESA return generation
- No UKVI compliance reports
- No OFS reportable event tracking

**Evidence of Completion:** ManagementDashboards page uses Recharts. AuditLogViewer page exists. HomeOfficeReports is a stub. HESA service is CRUD only.

**Verdict: NO-GO**

Audit trail works for compliance review. But reporting, statutory returns, and management intelligence are not implemented.

---

## Journey Summary

| # | Journey | Verdict | Key Blocker |
|---|---------|---------|-------------|
| 1 | Application submission | **PARTIAL** | Post-submission experience incomplete |
| 2 | Admissions decision | **NO-GO** | No tariff, no decision support |
| 3 | Offer to enrolment | **NO-GO** | No automated conversion |
| 4 | Module registration | **NO-GO** | No prerequisite/credit validation |
| 5 | Attendance capture | **NO-GO** | Alert/compliance loop un-wired |
| 6 | Marks entry/processing | **NO-GO** | No aggregation or grade calculation |
| 7 | Progression/board | **NO-GO** | No rule evaluation or classification |
| 8 | Fee visibility | **NO-GO** | No calculation or student view |
| 9 | Student self-service | **PARTIAL** | Viewing works, actions limited |
| 10 | Admin reporting | **NO-GO** | No statutory returns or analytics |

**Journeys with GO or PARTIAL: 2 of 10**
**Journeys with NO-GO: 8 of 10**

No golden journey can be completed end-to-end with business-correct outcomes. The system supports data entry and viewing but does not process, validate, calculate, or enforce business rules at any point in any journey.
