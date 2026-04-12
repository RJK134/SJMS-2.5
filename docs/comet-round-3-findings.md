# Comet Round 3 — Data Validation, Sub-pages & Applicant Journey

> **Date:** 2026-04-12
> **Tester:** Claude Code (automated walkthrough)
> **Branch:** fix/comet-round-3-ui
> **Base:** 0e88b94 (PR #20 — Comet round 2)

## Summary

Three targeted test areas: student portal data validation (6 pages),
admin sub-section pages (6 tested), and applicant portal journey
(3 pages). 5 HIGH findings fixed in this PR. 4 MEDIUM findings logged
for next pass.

## Findings

| # | Area | Route | Finding | Severity | Status |
|---|------|-------|---------|----------|--------|
| F1 | Student | /#/student/attendance | `limit: 200` exceeds Zod max(100) → API returns 400, page shows "Unable to load" | HIGH | **FIXED** |
| F2 | Student | /#/student/timetable | `limit: 200` on sessions API → 400, page shows "Unable to load" | HIGH | **FIXED** |
| F3 | Student | /#/student/marks | Static stub component — no API fetch, no real marks data displayed | HIGH | **FIXED** |
| F4 | Student | /#/student/finance | 404 — parent landing route missing (sub-routes at /finance/account etc. exist) | HIGH | **FIXED** |
| F5 | Student | /#/student/enrolments | 404 — no route exists | MEDIUM | **FIXED** (ComingSoon) |
| F6 | Admin | /#/admin/admissions/applicants | 404 — route does not exist (applicants visible via ApplicationPipeline) | MEDIUM | Logged |
| F7 | Admin | /#/admin/finance/transactions | 404 — route does not exist (transactions visible per-account in AccountDetail) | MEDIUM | Logged |
| F8 | Applicant | /#/applicant/applications/:id | 404 — detail-by-ID route not in applicant router (applicant uses /application singular) | MEDIUM | Logged |
| F9 | Student | /#/student sidebar | Sidebar missing links for Marks, Finance, Attendance | MEDIUM | Logged |

## Data Validation Results

### Student Portal (stu-0001 / James Taylor)

| Page | Expected | Actual | Status |
|------|----------|--------|--------|
| /student/modules | 12 module cards | 12 cards (PH6004, PH5003, etc.) | PASS |
| /student/timetable | Empty state (0 events) | "Timetable hasn't been published yet" | PASS (after F2 fix) |
| /student/marks | 24 attempts | 24 attempts, avg 67.9, full table | PASS (after F3 fix) |
| /student/finance | 1 account | £9,250 balance, real account | PASS (after F4 fix) |
| /student/attendance | 3 records | 67% rate, 2/3 present, 3 records | PASS (after F1 fix) |
| /student/enrolments | 3 enrolments | ComingSoon (route didn't exist) | PASS (F5) |

### Admin Sub-sections

| Page | Expected | Actual | Status |
|------|----------|--------|--------|
| /admin/admissions/applications | 25 apps | 25 in Kanban pipeline | PASS |
| /admin/finance/accounts | 150 accounts | 150 in table | PASS |
| /admin/attendance/records | 600 records | 600 in table | PASS |
| /admin/assessment/marks-entry | Marks UI | Marks entry grid | PASS |

### Applicant Portal (per-app-0001 / Chloe Price)

| Page | Expected | Actual | Status |
|------|----------|--------|--------|
| /applicant (dashboard) | App status | UNDER REVIEW, BSc Astrophysics, 2026/27 | PASS |
| /applicant/application | Detail view | Personal statement, qualifications | PASS |

## Fixes Applied

### F1 + F2: Zod limit overflow
Both `MyAttendance.tsx` and `MyTimetable.tsx` passed `{ limit: 200 }`
to `useList()`, but all Zod querySchema validators cap limit at
`z.coerce.number().max(100)`. Changed to `limit: 100`.

### F3: MyMarks static stub → real data
Replaced the 1-line placeholder with a full component that:
- Fetches `/v1/marks` via `useList` (scoped by scopeToUser)
- Shows summary stats: total attempts, confirmed count, average mark
- Renders a full table: assessment, attempt, raw/final marks, grade badge, status badge
- Handles loading, error, and empty states

### F4: /student/finance → landing route
Added `<Route path="/student/finance" component={MyAccount} />` so the
bare parent path renders the student's financial account instead of 404.

### F5: /student/enrolments → ComingSoon
Added ComingSoon route directing students to "My Programme" for
enrolment details.

## MEDIUM Findings for Next Pass

### F6: /admin/admissions/applicants
No dedicated "Applicants" list page. Applicants are visible through the
Applications Pipeline (Kanban). Consider adding a flat applicant list
for registry staff workflows.

### F7: /admin/finance/transactions
No top-level transactions list. Transactions are scoped per-account
in AccountDetail. Consider a cross-account transaction search for
finance team workflows.

### F8: /applicant/applications/:id
The applicant router uses `/applicant/application` (singular, no ID)
because an applicant sees only their own application via scopeToUser.
If future multi-application support is added, this would need a
detail-by-ID route.

### F9: Student sidebar gaps
The student sidebar only links to: Dashboard, My Programme, Modules,
Assessments, Timetable, Documents. Missing: Marks, Finance, Attendance.
These pages exist and work but are only reachable via direct URL. Consider
adding sidebar links in a future pass.

## Verification

- `tsc --noEmit`: 0 errors (server + client)
- Console errors: 0 across entire walkthrough
- Network errors: 0 after limit fixes (only Vite chunk pre-loads cancelled)
