# SJMS 2.5 — Domain SME Review

> **Review Date:** 2026-04-15
> **Perspective:** UK Higher Education Domain Expert
> **Question:** Does this product make operational sense for a real university?

---

## Review Method

Each domain assessed against: business realism (does the data model reflect real university operations?), completeness (how much of the domain is implemented beyond CRUD?), workflow coherence (do the steps connect logically?), policy/regulatory plausibility (could this support real institutional policies?), staff usability (would staff trust and use this?), student usability (would students find this helpful?), and confidence level (how sure is this assessment?).

**Rating Scale:** Strong / Adequate / Weak / Critical Gap / Not Implemented

---

## 1. Admissions

| Criterion | Rating | Notes |
|-----------|--------|-------|
| Business Realism | Adequate | Application model captures UCAS/Direct/Clearing routes, qualifications, references. Status lifecycle is realistic (SUBMITTED → UNDER_REVIEW → CONDITIONAL_OFFER → FIRM). |
| Completeness | Weak | CRUD only. No tariff calculation, no clearing auto-matching, no condition fulfilment automation, no UCAS data feed integration. |
| Workflow Coherence | Weak | Status transitions stored but not enforced. An application could jump from SUBMITTED to FIRM without passing through review. n8n workflow sends notification on offer but no decision logic. |
| Policy/Regulatory | Critical Gap | No tariff engine means admissions staff would need to manually calculate UCAS points for every applicant. No clearing deadline enforcement. |
| Staff Usability | Adequate | Pipeline Kanban view (ApplicationPipeline page) is well-designed. Application detail page shows qualifications, conditions. Staff can change statuses manually. |
| Student Usability | Adequate | Applicant portal exists: CourseSearch, MyApplication, EditApplication, MyOffers, UploadDocuments. Forms work and submit to API. |
| Confidence | High | Service files, schema, and UI all reviewed. |

**SME Verdict:** The admissions data model is sound and the UI is usable for basic tracking. But without tariff calculation, condition fulfilment logic, or UCAS integration, this is a manual tracking system, not an admissions processing system. A real admissions team would need to use spreadsheets alongside SJMS for any quantitative decision-making.

---

## 2. Applicant Management

| Criterion | Rating | Notes |
|-----------|--------|-------|
| Business Realism | Adequate | Applicant portal with 8 pages covers core self-service: dashboard, course search, application editing, offer tracking, document upload. |
| Completeness | Adequate | Forms submit real data. Status-dependent field disabling (can't edit after submission). |
| Workflow Coherence | Weak | Applicant can submit but has no visibility into decision timeline, no automated acknowledgement beyond n8n notification (which is inactive). |
| Policy/Regulatory | Weak | No CMA (Competition and Markets Authority) compliance — no transparency on decision criteria or timelines. |
| Staff Usability | N/A | Staff-facing admissions covered above. |
| Student Usability | Adequate | Clean UI. Course search, application form, and document upload are functional. |
| Confidence | High | UI pages and API endpoints reviewed. |

**SME Verdict:** Adequate for basic applicant self-service. Would need significant enhancement for CMA compliance and applicant communication transparency.

---

## 3. Student Core Record

| Criterion | Rating | Notes |
|-----------|--------|-------|
| Business Realism | Strong | Person model with separate PersonName, PersonAddress, PersonContact, PersonIdentifier, PersonDemographic entities follows SITS/HERM patterns correctly. Student entity links to Person with fee status, entry route, original entry date. |
| Completeness | Adequate | Full CRUD with audit. 150 seeded students. Student list with infinite scroll, search, and filtering. |
| Workflow Coherence | Adequate | Student creation → enrolment → module registration chain is logically structured in the data model. |
| Policy/Regulatory | Adequate | Demographics capture aligns with HESA requirements (ethnicity, disability, domicile). |
| Staff Usability | Strong | Student list page with DataTable, search, and CSV export. Student detail/create forms work. |
| Student Usability | Adequate | Student portal dashboard shows modules, marks, attendance. MyAccount page exists. |
| Confidence | High | Schema, service, and UI all reviewed. |

**SME Verdict:** The person/student data model is well-designed and follows sector patterns. This is one of the stronger domains — the foundational record structure is realistic and usable.

---

## 4. Curriculum / Programme / Module Structures

| Criterion | Rating | Notes |
|-----------|--------|-------|
| Business Realism | Strong | Faculty → School → Department hierarchy. Programme with FHEQ levels (4-8), modes (FULL_TIME/PART_TIME/DISTANCE), credits. Module with JACS codes, teaching periods, prerequisites (as JSON). ProgrammeModule junction with core/optional/elective classification. |
| Completeness | Adequate | CRUD for all entities. 30 programmes and ~120 modules seeded. Programme approval workflow model exists. |
| Workflow Coherence | Weak | ProgrammeSpecification model exists but specification authoring workflow not implemented. Programme approval statuses (DRAFT → SUBMITTED → APPROVED) stored but not enforced. No connection between curriculum changes and affected enrolments. |
| Policy/Regulatory | Adequate | FHEQ level alignment, credit values, QAA subject benchmarks referenced in model design. |
| Staff Usability | Adequate | Programme and module list/detail/create pages exist and are API-connected. |
| Student Usability | Weak | Students can view modules but cannot browse programme structure or see how their modules map to programme requirements. |
| Confidence | High | Schema and UI reviewed. |

**SME Verdict:** Curriculum structure is architecturally sound and SITS-aligned. Programme approval workflow is scaffolded but not enforced. The biggest gap is the absence of prerequisite enforcement downstream in module registration.

---

## 5. Enrolment / Registration

| Criterion | Rating | Notes |
|-----------|--------|-------|
| Business Realism | Adequate | Enrolment model links student to programme with status lifecycle (ENROLLED → INTERRUPTED → SUSPENDED → WITHDRAWN → COMPLETED). ModuleRegistration links to module with status and attempt tracking. EnrolmentStatusHistory captures transitions with reasons. |
| Completeness | Weak | CRUD with status tracking. No prerequisite validation. No credit limit enforcement. No re-enrolment automation. No interrupt/suspend business rules. |
| Workflow Coherence | Critical Gap | A student can be registered for any module regardless of prerequisites, credit limits, timetable clashes, or programme requirements. Status transitions not validated — can jump from ENROLLED to COMPLETED without passing modules. |
| Policy/Regulatory | Critical Gap | No enforcement of FHEQ credit requirements. No validation that student meets progression criteria before re-enrolment. Interrupted students can still be registered for modules. |
| Staff Usability | Adequate | Enrolment list/create pages work. Module registration pages exist. |
| Student Usability | Weak | Students cannot self-service register for modules with any confidence that choices are valid. |
| Confidence | High | Service logic, schema, and UI reviewed. |

**SME Verdict:** The data model supports enrolment operations, but the complete absence of validation makes this unsuitable for real registration. Without prerequisite and credit checks, the system would produce invalid academic records.

---

## 6. Timetable / Teaching Support

| Criterion | Rating | Notes |
|-----------|--------|-------|
| Business Realism | Adequate | TeachingEvent, Room, TimetableSlot, TimetableClash models exist. Room capacity and type tracked. Teaching weeks modelled. |
| Completeness | Weak | Models exist but timetable service is read-only (sub-service of attendance). No timetable generation. No room booking logic. TimetableClash model exists but no clash detection algorithm. |
| Workflow Coherence | Critical Gap | No connection between module registration and timetable allocation. No student personal timetable generation. |
| Policy/Regulatory | Weak | Room capacity tracked but not enforced (no overbooking prevention). |
| Staff Usability | Weak | TimetableView page exists and renders a grid, but limited functionality. |
| Student Usability | Weak | MyTimetable page is a stub (academic portal). |
| Confidence | Medium | Schema reviewed; service logic is minimal. |

**SME Verdict:** Timetabling is scaffolded at the data model level but has no operational logic. Universities typically use specialist timetabling software (Syllabus Plus, Scientia) — SJMS would need integration points rather than native timetabling.

---

## 7. Attendance / Engagement Monitoring

| Criterion | Rating | Notes |
|-----------|--------|-------|
| Business Realism | Adequate | AttendanceRecord with multiple marking methods (REGISTER/CARD_SWIPE/BIOMETRIC/ONLINE). EngagementScore computed as percentage. AttendanceAlert model with alert types. |
| Completeness | Weak | Attendance recording works. Engagement scoring computed on dashboard. But alert triggering logic is un-wired ("TODO Phase 7" comments in code). No automatic intervention creation. |
| Workflow Coherence | Critical Gap | Attendance recorded → engagement score computed → but nothing happens when score drops below threshold. UKVI threshold stored in SystemSetting but breach detection not implemented. |
| Policy/Regulatory | Critical Gap | UKVI compliance requires automatic identification and reporting of students below attendance threshold. Current system stores threshold but does not evaluate it. |
| Staff Usability | Adequate | Attendance pages exist for recording and viewing. Dashboard shows engagement scores. |
| Student Usability | Adequate | Students can view their attendance and engagement scores. |
| Confidence | High | Service code reviewed; TODO comments noted. |

**SME Verdict:** Attendance recording and display works. But the compliance-critical monitoring loop (detect → alert → intervene → report) is not implemented. This is a significant regulatory risk for institutions with Tier 4/Student Route visa holders.

---

## 8. Assessment / Marks / Boards / Progression

| Criterion | Rating | Notes |
|-----------|--------|-------|
| Business Realism | Strong (model) / Critical Gap (logic) | Comprehensive assessment model: Assessment → AssessmentComponent → MarkEntry chain with first/second marking, moderation, anonymous marking, grade boundaries, exam boards. 7-stage marks pipeline (PENDING → SUBMITTED → MARKED → MODERATED → RATIFIED → RELEASED). |
| Completeness | Critical Gap | All entities are CRUD only. No weighted mark calculation. No grade boundary application. No moderation escalation. No board aggregation. No classification computation. |
| Workflow Coherence | Critical Gap | Marks can be entered but never aggregated into module results. Module results never feed into progression decisions. Progression decisions never trigger award classification. The entire assessment-to-award pipeline is disconnected. |
| Policy/Regulatory | Critical Gap | UK assessment regulations require: anonymous marking for summative assessment, double marking for dissertations, external examiner oversight, exam board formal decisions, moderation where markers disagree >5%. None of these rules are enforced. |
| Staff Usability | Adequate | MarksEntry page is well-implemented with per-row validation, draft save, and submission. ExamBoard pages exist. |
| Student Usability | Adequate | Students can view their marks and module results. |
| Confidence | High | Service files, schema, mark entry UI, and test files all reviewed. |

**SME Verdict:** The assessment data model is the most impressive part of the schema — it correctly models the full UK assessment lifecycle including second marking, moderation, anonymous marking, and grade boundaries. But none of these models have operational logic. Marks go in, marks come out, but nothing is calculated, validated, or enforced between those points. This domain needs the most work to become functional.

---

## 9. Finance / Charges / Payments

| Criterion | Rating | Notes |
|-----------|--------|-------|
| Business Realism | Adequate | StudentAccount, ChargeLine, Payment, PaymentPlan, FeeAssessment, SponsorAgreement models. Fee status (HOME/OVERSEAS/EU_TRANSITIONAL). Financial transaction types. |
| Completeness | Weak | Ledger-style CRUD. No fee calculation engine. No automatic charge generation on enrolment. No payment plan enforcement. No debt holds. No SLC integration. |
| Workflow Coherence | Critical Gap | Enrolment does not trigger tuition charges. Fee assessment is manual data entry. No link between payment status and academic access. |
| Policy/Regulatory | Critical Gap | No OFS (Office for Students) fee cap enforcement. No SLC data submission. No refund policy automation. |
| Staff Usability | Adequate | Finance pages exist: Accounts, Invoicing, Bursaries, PaymentPlans, PaymentRecording. |
| Student Usability | Weak | MyPaymentPlan is a stub page. |
| Confidence | High | Service and UI reviewed. |

**SME Verdict:** Finance is a manual ledger. Adequate for recording what happened after the fact, but cannot automate any financial processes. Unsuitable for a university finance department without significant enhancement.

---

## 10. Casework / Support / Compliance

| Criterion | Rating | Notes |
|-----------|--------|-------|
| Business Realism | Adequate | SupportTicket with interactions, ECClaim, Appeal, PlagiarismCase, DisciplinaryCase models. StudentFlag for at-risk identification. PersonalTutoring model. |
| Completeness | Adequate | CRUD for all entities. Ticket creation with category, priority, status tracking. 6 support pages. |
| Workflow Coherence | Weak | Tickets created and tracked but no SLA enforcement, no automatic escalation, no workload distribution. EC claims submitted but no automatic deadline extension applied to affected assessments. |
| Policy/Regulatory | Weak | EC claims exist but no integration with assessment deadlines. Appeals exist but no link to board decisions. |
| Staff Usability | Adequate | Support ticket list, detail, and flag pages work. |
| Student Usability | Adequate | RaiseTicket form works with validation. |
| Confidence | Medium | UI and service reviewed; limited depth in casework logic. |

**SME Verdict:** Basic casework tracking. Adequate for a support team to log and track issues. But the cross-domain connections (EC → assessment, appeal → board decision, flag → intervention) are not implemented, so casework exists in isolation from the academic lifecycle.

---

## 11. Reporting / HESA / Regulatory Structures

| Criterion | Rating | Notes |
|-----------|--------|-------|
| Business Realism | Weak | HESA models exist (HESAStudent, HESAModule, HESAReturn, HESASnapshot, HESAValidationRule). Management dashboard with Recharts visualisations. CustomReports page exists. |
| Completeness | Critical Gap | HESA is CRUD only — no entity mapping, no validation rules, no XML export, no snapshot generation. Dashboard shows statistics but sourced from basic counts, not analytical queries. |
| Workflow Coherence | Not Implemented | No HESA submission workflow. No regulatory return cycle management. No census date processing. |
| Policy/Regulatory | Critical Gap | HESA Data Futures is a statutory requirement. Current implementation cannot produce a valid HESA return. Would require external ETL tool or complete mapping layer development. |
| Staff Usability | Weak | Dashboard exists but reports are basic aggregate counts, not the operational reports staff need (module pass rates, progression statistics, HESA error lists). |
| Student Usability | N/A | Students don't interact with HESA directly. |
| Confidence | High | HESA service reviewed; no mapping or validation logic found. |

**SME Verdict:** HESA compliance is the most significant regulatory gap. The data model is HESA-aware (JACS codes, qualification levels, ethnicity categories align with HESA fields), but the transformation and submission layer does not exist. A university using SJMS would need a separate HESA reporting tool.

---

## 12. Role-Based Portals and Operational Realism

| Criterion | Rating | Notes |
|-----------|--------|-------|
| Business Realism | Adequate | 4 portals (Admin/Staff, Academic, Student, Applicant) with role-based isolation. 36 roles across 13 groups. Portal guards prevent cross-role access. |
| Completeness | Adequate | Admin portal: 80+ pages. Student portal: 15 pages. Academic portal: 13 pages. Applicant portal: 8 pages. |
| Workflow Coherence | Weak | Portal isolation works but persona-specific workflows are thin. Academic staff can view modules but cannot complete a full marking workflow (enter marks → submit for moderation → review board outcome). |
| Policy/Regulatory | Adequate | Role separation is appropriate. Data scoping ensures students see only their records. |
| Staff Usability | Adequate | Staff portal is comprehensive in page count. Navigation is logical. DataTable and search patterns are consistent. |
| Student Usability | Adequate | Student portal shows relevant information. Dashboard aggregates modules, marks, attendance. |
| Confidence | High | All portals reviewed via routing and page files. |

**SME Verdict:** Portal structure is well-designed and role isolation is correctly implemented. The issue is not access control but content — most portals present data without enabling complete workflows.

---

## Overall SME Assessment

| Domain | Business Realism | Completeness | Workflow Coherence | Regulatory | Confidence |
|--------|-----------------|-------------|-------------------|------------|------------|
| Admissions | Adequate | Weak | Weak | Critical Gap | High |
| Applicant Mgmt | Adequate | Adequate | Weak | Weak | High |
| Student Core Record | Strong | Adequate | Adequate | Adequate | High |
| Curriculum | Strong | Adequate | Weak | Adequate | High |
| Enrolment | Adequate | Weak | Critical Gap | Critical Gap | High |
| Timetable | Adequate | Weak | Critical Gap | Weak | Medium |
| Attendance | Adequate | Weak | Critical Gap | Critical Gap | High |
| Assessment/Marks | Strong (model) | Critical Gap | Critical Gap | Critical Gap | High |
| Finance | Adequate | Weak | Critical Gap | Critical Gap | High |
| Casework/Support | Adequate | Adequate | Weak | Weak | Medium |
| HESA/Reporting | Weak | Critical Gap | Not Implemented | Critical Gap | High |
| Portals/Roles | Adequate | Adequate | Weak | Adequate | High |

**Summary:** The data model is the product's strongest asset — it reflects genuine understanding of UK HE operations. But the operational logic that makes a student records system useful (calculations, validations, rule enforcement, workflow automation) is absent across every domain. The gap between model quality and logic quality is the defining characteristic of SJMS 2.5's current state.
