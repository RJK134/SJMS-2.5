# SJMS 2.5 — UAT Review by Persona

> **Review date:** 2026-04-15
> **Method:** Task-based assessment per persona

---

## 1. Registry / Admin Persona

**Portal:** `/admin/*`
**Role:** `registrar` / `registry_officer`

| # | Task | Status | Evidence | Notes |
|---|------|--------|----------|-------|
| 1 | View student list with search | WORKS | StudentList wired to `/v1/students`, search functional | Infinite scroll migrated |
| 2 | View student profile (all tabs) | PARTIAL | Profile loads, 5 of 8 tabs wired (Academic, Attendance, Finance, Compliance, Support, Documents) | Overview, Personal, Audit tabs are stubs |
| 3 | Create new student | WORKS | StudentCreate form wired to POST `/v1/students` | |
| 4 | View programme list | WORKS | ProgrammeList wired | |
| 5 | View programme detail with approvals | WORKS | ProgrammeDetail with approval workflow dialog | Phase 8 fix |
| 6 | Create enrolment | WORKS | EnrolmentCreate form wired | |
| 7 | View enrolment detail | WORKS | EnrolmentDetail wired | |
| 8 | Enter/view marks | WORKS | MarksEntry grid with editable cells | Admin only — academics cannot |
| 9 | View exam board | WORKS | ExamBoard list and detail wired | |
| 10 | View support tickets | WORKS | TicketList + TicketDetail with interactions | Phase 8 fix |
| 11 | Manage accommodation | PARTIAL | Blocks/Rooms/Bookings pages wired to API | Phase 8, new module |
| 12 | Generate reports | PARTIAL | ManagementDashboards and StatutoryReturns wired; CustomReports is a stub | |

**Overall: 8 WORKS, 3 PARTIAL, 1 STUB**
**Training burden:** Moderate — UI is clean but many sub-pages lead to dead ends
**Trust issues:** Student profile missing basic tabs creates impression of incomplete system

---

## 2. Academic Staff Persona

**Portal:** `/academic/*`
**Role:** `lecturer` / `module_leader` / `programme_leader`

| # | Task | Status | Evidence | Notes |
|---|------|--------|----------|-------|
| 1 | View my modules | WORKS | MyModules wired to `/v1/modules` | |
| 2 | View my students | WORKS | MyStudents wired to `/v1/students` | |
| 3 | Enter marks for my module | BLOCKED | MyMarksEntry is a stub (0 API hooks) | **Critical gap** |
| 4 | Moderate marks | BLOCKED | MyModeration is a stub | |
| 5 | View my exam boards | BLOCKED | MyExamBoards is a stub | |
| 6 | View my timetable | BLOCKED | MyTimetable is a stub | |
| 7 | View my attendance | BLOCKED | MyAttendance is a stub | |
| 8 | View tutee profiles | BLOCKED | MyTutees + TuteeProfile are stubs | |
| 9 | View my profile | BLOCKED | MyProfile is a stub | |
| 10 | Submit EC claims | BLOCKED | MyECClaims is a stub | |

**Overall: 2 WORKS, 0 PARTIAL, 8 BLOCKED**
**Training burden:** N/A — portal is not functional for core academic tasks
**Trust issues:** CRITICAL — the primary users of an assessment system cannot perform their core function

---

## 3. Student Persona

**Portal:** `/student/*`
**Role:** `student`

| # | Task | Status | Evidence | Notes |
|---|------|--------|----------|-------|
| 1 | View dashboard | WORKS | StudentDashboard wired (modules, assessments, attendance) | |
| 2 | View my modules | WORKS | MyModules wired to `/v1/module-registrations` | |
| 3 | View my marks | WORKS | MyMarks wired to `/v1/marks` | |
| 4 | View my attendance | WORKS | MyAttendance wired to `/v1/attendance` | |
| 5 | View my programme | WORKS | MyProgramme wired to `/v1/enrolments` | |
| 6 | View my account/finance | WORKS | MyAccount wired to `/v1/finance` | |
| 7 | View my timetable | WORKS | MyTimetable wired to `/v1/attendance/timetable/sessions` | |
| 8 | View my profile | BLOCKED | StudentProfile is a stub | |
| 9 | View/upload documents | BLOCKED | MyDocuments is a stub | |
| 10 | Submit EC claim | BLOCKED | MyECClaims is a stub | |
| 11 | Raise support ticket | BLOCKED | RaiseTicket is a stub | |
| 12 | View support tickets | BLOCKED | MyTickets is a stub | |

**Overall: 7 WORKS, 0 PARTIAL, 5 BLOCKED**
**Training burden:** Low for working pages — standard dashboard+list pattern
**Trust issues:** Medium — core viewing works but inability to raise tickets or submit EC claims means students cannot interact with the institution when they have problems

---

## 4. Applicant Persona

**Portal:** `/applicant/*`
**Role:** `applicant`

| # | Task | Status | Evidence | Notes |
|---|------|--------|----------|-------|
| 1 | View dashboard | WORKS | ApplicantDashboard wired to `/v1/applications` | |
| 2 | View my application | WORKS | MyApplication wired with qualifications, references, statement | |
| 3 | Edit my application | WORKS | EditApplication form with useDetail, status-gated | Phase 8 + BugBot fix |
| 4 | View offers | WORKS | MyOffers wired to `/v1/offers` | |
| 5 | Search courses | WORKS | CourseSearch wired to `/v1/programmes` | Phase 8 fix |
| 6 | View events | WORKS | Events wired to `/v1/admissions-events` | Phase 8 fix |
| 7 | Upload documents | PARTIAL | UploadDocuments shows list from API but upload handler is empty (`onFilesSelected={() => {}}`) | |
| 8 | Contact admissions | WORKS | Static contact info (appropriate) | |

**Overall: 7 WORKS, 1 PARTIAL, 0 BLOCKED**
**Training burden:** Low — cleanest portal experience
**Trust issues:** Low — applicant journey is the most complete

---

## Cross-Persona Summary

| Persona | WORKS | PARTIAL | BLOCKED | Functional % |
|---------|-------|---------|---------|-------------|
| Admin/Registry | 8 | 3 | 1 | 79% |
| Academic Staff | 2 | 0 | 8 | 20% |
| Student | 7 | 0 | 5 | 58% |
| Applicant | 7 | 1 | 0 | 94% |

**The academic staff persona is the critical gap.** Without functional marks entry, moderation, and exam board access for academics, the assessment pipeline — the core purpose of a student records system — cannot operate.
