# SJMS 2.5 — Golden Journey Assessment

> **Review date:** 2026-04-15

---

## Journey 1: Applicant Submits and Tracks Application

**Expected path:** Applicant creates account → searches courses → submits application with personal statement + qualifications → receives acknowledgement → tracks status → receives offer/rejection

**Actual path:** Applicant dashboard shows existing application → MyApplication displays full detail → EditApplication allows modification (DRAFT/SUBMITTED only) → CourseSearch browses programmes → MyOffers shows offer conditions

**Breakpoints:** Application creation is admin-initiated (POST `/v1/applications` requires `applicantId` + `programmeId`). No self-service application submission form exists for applicants — they can only view and edit existing applications created by admissions staff.

**Missing controls:** No UCAS integration for automated application import.

**Verdict: PARTIAL — viewing works, self-service creation absent**

---

## Journey 2: Admissions Decision to Offer

**Expected path:** Application received → assigned to reviewer → interview scheduled → decision made (conditional/unconditional/rejected) → offer generated with conditions → conditions tracked → firm/insurance recorded

**Actual path:** ApplicationPipeline lists all applications → ApplicationDetail shows single application → Status can be changed via PATCH → OfferConditions display → InterviewSchedule lists interviews

**Breakpoints:** No multi-reviewer workflow. No offer letter generation. No conditional→unconditional transition automation when conditions are met. No firm/insurance preference handling.

**Verdict: PARTIAL — individual steps exist, end-to-end workflow not orchestrated**

---

## Journey 3: Offer to Enrolment

**Expected path:** Applicant accepts firm offer → fee assessment → enrolment task list generated → student registers online → module selection → ID card/credentials issued → enrolment confirmed

**Actual path:** EnrolmentCreate form allows admin to create enrolment → EnrolmentDetail shows record → ModuleRegistration can be created. No self-service enrolment workflow.

**Breakpoints:** No offer-acceptance-to-enrolment automation. No enrolment task list. No self-service module selection for students. Enrolment is entirely admin-created.

**Verdict: PARTIAL — admin can create enrolments, no self-service flow**

---

## Journey 4: Student Module Registration

**Expected path:** Student views available modules → selects core + optional modules → system validates credits/prerequisites → registration confirmed → timetable generated

**Actual path:** BulkModuleRegistration page exists (admin) with `useList` hooks. Student MyModules displays registered modules. No self-service module selection.

**Breakpoints:** No prerequisite validation. No credit total validation. No student-facing module choice interface.

**Verdict: PARTIAL — admin bulk registration works, student self-service absent**

---

## Journey 5: Attendance Capture and Monitoring

**Expected path:** Teaching event occurs → attendance recorded (swipe/manual) → absence tracked → engagement score calculated → at-risk students flagged → interventions triggered

**Actual path:** AttendanceRecords page wired (admin view). Student MyAttendance page wired. UKVI breach threshold reads from SystemSetting. n8n workflows exist for attendance escalation and missed-contact-point.

**Breakpoints:** No attendance recording mechanism (no POST endpoint used by any UI). AttendanceAlerts page is a stub. EngagementDashboard is a stub. Interventions page is a stub.

**Verdict: PARTIAL — records viewable, no capture or monitoring workflow**

---

## Journey 6: Marks Entry and Assessment Processing

**Expected path:** Academic enters marks → second marker verifies → moderation → exam board reviews → progression decision → marks published to students

**Actual path:** MarksEntry (admin) has editable grid wired to API. ModerationQueue displays moderated marks. ExamBoard list/detail wired. GradeDistribution shows charts.

**Breakpoints:** Academic staff cannot enter marks (MyMarksEntry is a stub). No second-marking workflow. No moderation approval workflow. No exam board decision recording UI. No marks publication toggle.

**Hidden assumptions:** The system assumes admin staff enter marks, not academics. This inverts the real-world workflow where academics mark and admin staff administer the board.

**Verdict: NO-GO — core workflow participants (academics) are locked out**

---

## Journey 7: Progression / Board Outcome

**Expected path:** Exam board meets → reviews student results → progression decision recorded (progress/repeat/refer/award) → students notified → transcript updated

**Actual path:** ExamBoardDecision model exists. ProgressionRecord model exists. AwardRecord model exists. No UI for recording board decisions. No notification trigger for decisions.

**Verdict: BLOCKED — models exist, no operational UI**

---

## Journey 8: Fee / Charge Visibility

**Expected path:** Student views tuition fee → sees charges, payments, balance → can make payment → views payment plan

**Actual path:** Student MyAccount page wired showing account detail. Admin AccountList/AccountDetail wired. Finance sub-pages (Invoicing, Sponsors, Bursaries, Refunds) show account lists.

**Breakpoints:** MakePayment is a stub. MyPaymentPlan is a stub. No charge generation workflow. Finance sub-pages are cosmetically distinct but functionally identical (all show same account endpoint).

**Verdict: PARTIAL — view-only balance works, no transactions**

---

## Journey 9: Student Self-Service Record Access

**Expected path:** Student logs in → views dashboard → navigates to modules, marks, attendance, timetable, finance, support, documents

**Actual path:** Dashboard, MyModules, MyMarks, MyAttendance, MyTimetable, MyProgramme, MyAccount all work. StudentProfile, MyDocuments, MyECClaims, MyTickets, RaiseTicket, MakePayment are stubs.

**Verdict: PARTIAL — read-only viewing works well, interactive self-service absent**

---

## Journey 10: Admin Oversight / Audit / Reporting

**Expected path:** Admin views audit log → runs reports → exports data → reviews HESA compliance → monitors system health

**Actual path:** AuditLogViewer wired. ManagementDashboards wired with charts. StatutoryReturns page wired. Prometheus /metrics endpoint operational.

**Breakpoints:** CustomReports is a stub. No report builder. No HESA XML export. No data export beyond CSV from DataTable.

**Verdict: PARTIAL — basic oversight works, advanced reporting absent**

---

## Journey Verdict Summary

| # | Journey | Verdict |
|---|---------|---------|
| 1 | Applicant submits application | PARTIAL |
| 2 | Admissions decision to offer | PARTIAL |
| 3 | Offer to enrolment | PARTIAL |
| 4 | Student module registration | PARTIAL |
| 5 | Attendance capture | PARTIAL |
| 6 | Marks entry and processing | **NO-GO** |
| 7 | Progression / board outcome | **BLOCKED** |
| 8 | Fee / charge visibility | PARTIAL |
| 9 | Student self-service | PARTIAL |
| 10 | Admin oversight / reporting | PARTIAL |

**No journey achieves a full GO rating.** The marks pipeline (Journey 6) is the critical blocker — it is the reason this system cannot be used for real academic operations.
