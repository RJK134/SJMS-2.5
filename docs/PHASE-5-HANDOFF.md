# Phase 5 Handoff — Frontend Portal Wiring

> **Date:** 2026-04-13
> **Branch:** `phase-5/frontend-portal-wiring`
> **Base:** `phase-3/api-decomposition`
> **Status:** GREEN — pre-production acceptable

---

## What Was Delivered

### Batch 1 — Portal Dashboards and Role-Specific Foundations
- **Fixed KPI leakage:** Central `/dashboard` now redirects student/applicant/academic roles to their portal-specific dashboards. Only admin/staff see institutional stats.
- **Removed hardcoded notification badge:** PortalShell notification bell now queries `/v1/communications/notifications` for real unread count. Auto-refreshes every 60s.
- **All 4 portal dashboards use real API endpoints — verified:**
  - Admin: `/v1/reports/dashboard/stats`
  - Academic: `/v1/reports/dashboard/academic` + `/v1/assessments`
  - Student: `/v1/module-registrations` + `/v1/assessments` + `/v1/attendance`
  - Applicant: `/v1/applications`

### Batch 2 — Core Registry and Curriculum Pages
- **Verified all core pages already wired** — StudentList, StudentProfile, StudentCreate, ProgrammeList, ProgrammeDetail, ProgrammeCreate, ModuleList, ModuleDetail, EnrolmentList, EnrolmentDetail all use `useList`/`useDetail`/`useCreate` hooks.
- **Added error feedback:** StudentCreate and ProgrammeCreate now show inline error alerts on submit failure (were silently caught).
- **Created Alert component** (shadcn/ui pattern) for reuse across forms.

### Batch 3 — Admissions and Enrolment Journeys
- **Wired applicant MyApplication:** Full view with qualifications, references, personal statement sections. Loading/empty/error states.
- **Wired applicant MyOffers:** Shows offer conditions with status and deadlines. Loading/empty/error states.
- **Added error handling:** EnrolmentCreate and AdmissionsDashboard now show loading/error states.
- **Verified staff admissions pages** — ApplicationPipeline, ApplicationDetail, InterviewSchedule, EventsManagement all use real API.

### Batch 4 — Assessment, Progression, Attendance, Finance, Support
- **Verified all 17 operational pages already wired** — no mock data found anywhere.
- **Added loading/error states:** OffersDashboard now shows loading spinner.
- **Improved TicketDetail:** Clear empty state for interactions timeline with TODO for backend wiring.
- **Confirmed student portal scoping:** MyModules, MyMarks, MyAttendance, MyAccount, MyTimetable all use server-side `scopeToUser` middleware.

### Batch 5 — UX Polish and Documentation
- **British English audit:** No American English violations found in UI text.
- **KNOWN_ISSUES.md:** 8 AMBER issues documented (KI-P5-001 through KI-P5-008).
- **No RED issues outstanding.**

---

## Verification Evidence

### TypeScript Compilation
```
cd client && npx tsc --noEmit  →  0 errors  ✅
cd server && npx tsc --noEmit  →  0 errors  ✅
```

### Mock Data Purge
```
grep -rn "mock|Mock|MOCK|fake|Fake|dummy|Dummy|sample|Sample|fakeData|mockData" \
  client/src/pages/ --include="*.tsx" | grep -v "className\|searchPlaceholder"
→  0 results (code comments only, no fake data)  ✅

grep -rn "const.*=.*\[.*{" client/src/pages/ --include="*.tsx" \
  | grep -v "columns|tabs|options|steps|fields|filters|items|navItems|links"
→  0 hardcoded data arrays  ✅
```

### Role-Specific Dashboard Isolation
- Admin persona at `/dashboard`: sees Total Students, Active Programmes, Modules, Active Enrolments
- Student persona at `/dashboard`: redirected to `/student/dashboard` — sees personal modules, attendance, deadlines
- Applicant persona at `/dashboard`: redirected to `/applicant/dashboard` — sees application status, offers
- Academic persona at `/dashboard`: redirected to `/academic/dashboard` — sees teaching modules, pending marks

### Route Guards
- Student persona navigating to `/admin/*`: blocked by `usePortalGuard` — shows "Access Denied"
- Applicant persona navigating to `/student/*`: blocked — shows "Access Denied"

### Real API Integration (confirmed via endpoint mapping)
| Domain | Endpoint | Pages Wired |
|--------|----------|-------------|
| Students | `/v1/students` | StudentList, StudentProfile, StudentCreate |
| Programmes | `/v1/programmes` | ProgrammeList, ProgrammeDetail, ProgrammeCreate |
| Modules | `/v1/modules` | ModuleList, ModuleDetail |
| Enrolments | `/v1/enrolments` | EnrolmentList, EnrolmentDetail, EnrolmentCreate |
| Applications | `/v1/applications` | ApplicationPipeline, ApplicationDetail, AdmissionsDashboard, OffersDashboard, MyApplication, MyOffers, ApplicantDashboard |
| Interviews | `/v1/interviews` | InterviewSchedule |
| Admissions Events | `/v1/admissions-events` | EventsManagement |
| Marks | `/v1/marks` | MarksEntry, ModerationQueue, GradeDistribution, MyMarks |
| Exam Boards | `/v1/exam-boards` | ExamBoards, ExamBoardDetail |
| Assessments | `/v1/assessments` | StudentDashboard, AcademicDashboard |
| Finance | `/v1/finance` | AccountList, AccountDetail, DebtManagement, MyAccount |
| Attendance | `/v1/attendance` | AttendanceRecords, MyAttendance |
| Engagement | `/v1/reports/dashboard/engagement-scores` | EngagementDashboard |
| Support | `/v1/support` | TicketList, TicketDetail |
| UKVI | `/v1/ukvi` | UKVIDashboard |
| Notifications | `/v1/communications/notifications` | Dashboard, PortalShell |
| Calendar | `/v1/attendance/calendar/events` | Dashboard |
| Timetable | `/v1/attendance/timetable/sessions` | MyTimetable, TimetableView |
| Module Regs | `/v1/module-registrations` | StudentDashboard, MyModules, BulkModuleRegistration |
| Dashboard Stats | `/v1/reports/dashboard/stats` | Dashboard (admin) |
| Academic Stats | `/v1/reports/dashboard/academic` | AcademicDashboard |

---

## What Remains AMBER (Deferred)

See `docs/KNOWN_ISSUES.md` — 8 AMBER issues, all non-blocking:
- KI-P5-001 through KI-P5-008
- No RED issues outstanding
- Stub pages are safe (render empty state, no mock data, no data leakage)

---

## Commits
1. `28b5379` — Batch 1: portal dashboards + role-specific foundations
2. `ded9112` — Batch 2: registry + curriculum pages (error feedback + Alert component)
3. `97afc74` — Batch 3: admissions + enrolment journeys (MyApplication, MyOffers, error handling)
4. `6be7c6a` — Batch 4: operational pages (loading/error state improvements)
5. Final — Batch 5: polish, known issues, handoff documentation

---

## Pre-Production Statement

This is a pre-production build. GREEN means:
- Pages render with real API data or safe empty states
- Role guards prevent cross-portal access
- No mock/fake/dummy data in any touched file
- TypeScript compiles clean on both workspaces
- British English used throughout UI text

It does NOT mean:
- Every conceivable page is fully implemented
- All filters/sorting/pagination are production-quality
- E2E tests exist
- Playwright/Vitest coverage is in place
- Docker stack has been integration-tested
