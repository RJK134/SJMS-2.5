# SJMS 2.5 — UAT Review by Persona (Phase 10b)

> **Review date:** 2026-04-15

---

## Cross-Persona Summary

| Persona | WORKS | PARTIAL | BLOCKED | Functional % |
|---------|-------|---------|---------|-------------|
| Admin/Registry | 8 | 3 | 1 | 79% |
| Academic Staff | 2 | 1 | 8 | 23% |
| Student | 7 | 0 | 5 | 58% |
| Applicant | 7 | 1 | 0 | 94% |

**Unchanged from prior review.** The functional percentages are accurate — the academic portal remains the critical gap. No new pages were wired between the prior review and this one.

---

## Registry / Admin (79% functional)

| Task | Status | Evidence |
|------|--------|----------|
| View/search students | WORKS | StudentList with infinite scroll (useInfiniteList) |
| View student profile | PARTIAL | 5/8 tabs wired; Overview, Personal, Audit stubs |
| Create student | WORKS | StudentCreate form with POST |
| Programme management | WORKS | List, detail, create, approval workflow dialog |
| Enrolment management | WORKS | List, detail, create, status changes |
| Marks entry (admin) | WORKS | Editable grid with module/assessment selectors |
| Exam boards | WORKS | List and detail with members |
| Support tickets | WORKS | List with interaction timeline (Phase 8 fix) |
| Accommodation | PARTIAL | Blocks, Rooms, Bookings DataTables (Phase 8 new module) |
| Governance | PARTIAL | Committees, Meetings DataTables (Phase 8 new module) |
| HESA reporting | PARTIAL | Notification queue list; no export |
| Documents/Comms | BLOCKED | 5 stub pages (DocumentList, TemplateManagement, LetterGeneration, BulkCommunication, CommunicationLog) |

## Academic Staff (23% functional)

| Task | Status | Evidence |
|------|--------|----------|
| View my modules | WORKS | MyModules wired to /v1/modules |
| View my students | WORKS | MyStudents with module selector |
| Dashboard | WORKS | AcademicDashboard with stats + upcoming assessments |
| Enter marks | BLOCKED | MyMarksEntry is stub (0 API hooks) |
| Moderate marks | BLOCKED | MyModeration is stub |
| View exam boards | BLOCKED | MyExamBoards is stub |
| View timetable | BLOCKED | MyTimetable is stub |
| Record attendance | BLOCKED | MyAttendance is stub |
| View tutees | BLOCKED | MyTutees + TuteeProfile are stubs |
| View profile | BLOCKED | MyProfile is stub |
| EC claims | BLOCKED | MyECClaims is stub |

**Critical finding reconfirmed:** The people who perform the most important business process (academic marks entry) cannot use this system.

## Student (58% functional)

| Task | Status | Evidence |
|------|--------|----------|
| Dashboard | WORKS | Modules, assessments, attendance |
| View modules | WORKS | MyModules with registrations |
| View marks | WORKS | MyMarks with grade badges |
| View attendance | WORKS | MyAttendance records |
| View programme | WORKS | MyProgramme with enrolment detail |
| View finance | WORKS | MyAccount with balance |
| View timetable | WORKS | MyTimetable sessions |
| View profile | BLOCKED | StudentProfile is stub |
| Upload documents | BLOCKED | MyDocuments is stub |
| Submit EC claim | BLOCKED | MyECClaims is stub |
| Raise ticket | BLOCKED | RaiseTicket form exists but doesn't call API |
| View tickets | BLOCKED | MyTickets is stub |

## Applicant (94% functional)

| Task | Status | Evidence |
|------|--------|----------|
| Dashboard | WORKS | Application status overview |
| View application | WORKS | Full detail with qualifications, references |
| Edit application | WORKS | Form with useDetail (BugBot-fixed) |
| View offers | WORKS | Offer conditions display |
| Search courses | WORKS | Programme search with cards |
| View events | WORKS | Admissions events list |
| Upload documents | PARTIAL | FileUpload renders but handler is no-op |
| Contact admissions | WORKS | Static info (appropriate) |
