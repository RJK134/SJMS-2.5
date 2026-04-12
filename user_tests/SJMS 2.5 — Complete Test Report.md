<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# SJMS 2.5 — Complete Test Report

**Tested:** 10 April 2026, 23:00 CEST
**Environment:** localhost:5173, narrow mobile viewport (~315px)
**Logged in as:** Richard K (super admin, system admin)

***

## Test Suite 1: Admin Portal — Registry Officer Journey

| Test ID | Page/Feature | Result | Notes |
| :-- | :-- | :-- | :-- |
| **1.1** | **Admin Dashboard** | ✅ | Dashboard loads at `/#/admin` with stat cards: 150 students, 33 programmes, 132 modules, 114 active enrolments[^1_1]. Recent Notifications and Upcoming Events sections present (both empty). Sidebar has 18 logically grouped menu items (Dashboard through Settings + Sign Out)[^1_2]. Breadcrumbs update correctly (e.g. "Staff > Students > Ms Lily Singh")[^1_3]. |
| 1.1 | Sidebar Navigation | ⚠️ | All 18 sidebar items present and logically grouped. However, on mobile viewport the sidebar overlays the entire content area with no dismiss mechanism — blocks all interaction with page content[^1_4]. Hamburger menu toggles sidebar but doesn't close it on narrow viewport. |
| **1.2** | **Student List** | ✅ | 150 students displayed with pagination (25 per page, 6 pages)[^1_5]. Table columns: Student No., Name, Programme, Fee Status, Entry Route, Entry Date. Filters for Fee Status (dropdown) and Entry Route (UCAS, Direct, Clearing, International)[^1_4]. Search box and Export CSV button present. |
| 1.2 | Student Search | ✅ | Searching "Brown" correctly filters to 3 records (STU-2025-0003, STU-2025-0009, STU-2025-0121)[^1_4]. Search persists across navigation. |
| 1.2 | Sortable Columns | ✅ | Column headers are clickable and sort the table (confirmed on Programmes list Code column). |
| 1.2 | Student Profile | ⚠️ | Profile loads for `/#/admin/students/stu-0002` with student details (Ms Lily Singh, STU-2025-0002, EU Transitional, DIRECT entry)[^1_3]. 9 tabs present: Overview, Personal, Academic, Finance, Attendance, Support, Documents, Compliance, Audit. **BUG:** Tab content is mismatched — "Personal" tab shows attendance records, "Academic" also shows attendance, "Finance" shows documents section[^1_6]. Only Overview and Audit tabs show correct content. |
| 1.2 | Create Student | ❌ | `/#/admin/students/create` route treated as student ID lookup → "Student not found"[^1_7]. "New Student" button exists on list page but is clipped/hidden on mobile viewport. Cannot test create form. |
| **1.3** | **Programme List** | ✅ | 33 programmes displayed with correct details (Code, Title, Level, Credits, Duration, Mode, Status)[^1_8]. Filters for Level and Status. All programmes show "Approved" status. Pagination (25 per page, 2 pages). |
| 1.3 | Programme Detail | ✅ | Detail loads (e.g. BA Hons Childhood Studies, UG-CY-001)[^1_9]. Shows UCAS Code, Mode of Study, Awarding Body, Department. 6 tabs: Overview, Specification, Modules, Students, Approval, Statistics. |
| 1.3 | Module List | ✅ | 132 modules displayed with Status/Level filters[^1_10]. |
| 1.3 | Module Detail | ✅ | Detail loads (e.g. Deep Learning, AI7001)[^1_11]. Shows Department, Status, Credits, Level. 7 tabs: Overview, Specification, Assessments, Students, Marks, Attendance, Statistics. |
| **1.4** | **Enrolment List** | ✅ | 503 enrolment records displayed[^1_12]. Academic Year and Status filters. Export CSV. |
| 1.4 | Enrolment Detail | ✅ | Detail loads showing student (James Taylor), programme (BSc Hons Physics, 2023/24), module registrations (PH4001-PH6004) with Code, Title, Type, Attempt, Status[^1_13]. |
| 1.4 | Status Changes | ⚠️ | Page loads with proper title "Status Change Requests" and description, Type/Status filters, Export CSV[^1_14]. Table is empty (0 records). |
| 1.4 | Bulk Module Registration | ❌ | URL `/#/admin/enrolments/bulk-registration` treated as enrolment ID → "Enrolment not found"[^1_15]. Route not implemented. |
| **1.5** | **Marks Entry** | ⚠️ | Page loads with Module/Assessment selection dropdowns and "Marks Grid" section[^1_16]. Grid shows loading spinner (no module selected). Functional but needs module selection to show data. |
| 1.5 | Exam Boards | ⚠️ | Page loads with table structure but shows 0 records[^1_17]. |
| 1.5 | Moderation Queue | ❌ | Blank white screen — no content rendered[^1_18]. |
| 1.5 | Grade Distribution | ❌ | Blank white screen[^1_19]. |
| 1.5 | External Examiners | ❌ | Blank white screen[^1_20]. |
| **1.6** | **Finance — All pages** | ❌ | `/#/admin/finance/accounts` = blank[^1_21]. `/#/admin/finance/invoicing` = blank[^1_22]. All Finance sub-pages (Account List, Account Detail, Invoicing, Payment Recording, Payment Plans, Bursaries, Refunds, Debt Management, Sponsors) render completely blank. **Entire Finance module is unimplemented.** |
| **1.7** | **Attendance — All pages** | ❌ | `/#/admin/attendance/records` = blank[^1_23]. Attendance Records, Engagement Dashboard, Alerts List, Interventions — all blank white screens. **Entire Attendance module is unimplemented.** |
| **1.8** | **Admissions — All pages** | ❌ | `/#/admin/admissions/dashboard` = blank[^1_24]. `/#/admin/admissions/applications` = blank[^1_25]. Application Pipeline, Offers Dashboard, Interview Schedule, Events Management, Agent Management — all blank. **Entire Admissions module is unimplemented.** |
| **1.9** | **Compliance — UKVI** | ❌ | `/#/admin/compliance/ukvi` = blank white screen[^1_26]. **Entire Compliance module is unimplemented.** |
| **1.10** | **Documents — All pages** | ❌ | `/#/admin/documents` = blank[^1_27]. **Entire Documents module is unimplemented.** |
| **1.11** | **Support — Tickets** | ❌ | `/#/admin/support/tickets` = blank[^1_28]. **Entire Support module is unimplemented.** |
| **1.12** | **Settings — All pages** | ❌ | `/#/admin/settings/system` = blank[^1_29]. **Entire Settings module is unimplemented.** |
| **1.13** | **Reports — All pages** | ❌ | `/#/admin/reports/dashboards` = blank[^1_30]. **Entire Reports module is unimplemented.** |
| **1.14a** | **EC \& Appeals** | ❌ | `/#/admin/ec-claims` = blank[^1_31]. |
| **1.14b** | **Governance** | ❌ | `/#/admin/governance/committees` = blank[^1_32]. |
| **1.14c** | **Timetable** | ❌ | `/#/admin/timetable` = blank[^1_33]. |
| **1.14d** | **Accommodation** | ❌ | `/#/admin/accommodation/blocks` = blank[^1_34]. |


***

## Test Suite 2: Academic Portal

| Test ID | Page/Feature | Result | Notes |
| :-- | :-- | :-- | :-- |
| **2.1–2.5** | **Entire Academic Portal** | ❌ | `/#/academic` = blank white screen[^1_35]. `/#/academic/dashboard` = blank[^1_36]. `/#/academic/modules` = blank[^1_37]. **The entire Academic Portal is completely unimplemented.** No dashboard, no modules, no marks entry, no tutees, no timetable, no profile. |


***

## Test Suite 3: Student Portal

| Test ID | Page/Feature | Result | Notes |
| :-- | :-- | :-- | :-- |
| **3.1–3.5** | **Entire Student Portal** | ❌ | `/#/student` = blank white screen[^1_38]. **The entire Student Portal is completely unimplemented.** No dashboard, no programme info, no modules, no marks, no attendance, no finance. |


***

## Test Suite 4: Applicant Portal

| Test ID | Page/Feature | Result | Notes |
| :-- | :-- | :-- | :-- |
| **4.1–4.3** | **Entire Applicant Portal** | ❌ | `/#/applicant` = blank white screen[^1_39]. **The entire Applicant Portal is completely unimplemented.** No dashboard, no application form, no offers, no course search. |


***

## Test Suite 5: Cross-Cutting UX Tests

| Test ID | Page/Feature | Result | Notes |
| :-- | :-- | :-- | :-- |
| **5.1** | Responsive Design (mobile ~315px) | ❌ | **Critical issues:** (1) Sidebar overlays entire content on mobile with no way to dismiss[^1_4]. (2) "New Student" button hidden/clipped on narrow viewport. (3) Student profile tabs overlap/garble on mobile[^1_6]. (4) Table columns truncated — only Student No. visible without horizontal scroll. |
| **5.2** | Error States — Non-existent URL | ❌ | `/#/admin/nonexistent` shows blank white screen[^1_40] — no 404 page, no error message. **CRITICAL BUG:** Navigating to unimplemented routes (e.g. `/#/academic`, `/#/student`, then back to `/#/admin`) crashes the entire SPA — all pages go blank, requiring a hard refresh (Ctrl+Shift+R) to recover[^1_41]. |
| **5.3** | Data Consistency | ⚠️ | Dashboard: 150 students ↔ Student List: 150 students ✅. Dashboard: 33 programmes ↔ Programme List: 33 ✅. Dashboard: 132 modules ↔ Module List: 132 ✅. Dashboard: 114 **active** enrolments vs Enrolment List: 503 **total** enrolments — technically consistent (different metrics), but potentially confusing for users. |
| **5.4** | Performance | ⚠️ | Student list and programme list load quickly (<1s). Student detail has brief loading spinner. Marks Entry grid shows persistent spinner until module selected. No pages observed taking >3 seconds except when navigating to unimplemented routes which caused app crash. |


***

## Summary

### What Works (✅)

- **Admin Dashboard** — stat cards with real data, role badges
- **Student List** — 150 records, pagination, search, filters, column sorting, CSV export
- **Student Detail** — loads with real data, 9 tabs present (content bug on some tabs)
- **Programme List** — 33 programmes, full details, filters
- **Programme Detail** — full details with 6 tabs
- **Module List** — 132 modules, filters
- **Module Detail** — full details with 7 tabs
- **Enrolment List** — 503 records, filters
- **Enrolment Detail** — student info, module registrations
- **Enrolment Status Changes** — page loads (empty data)
- **Assessment Marks Entry** — interface loads with selectors
- **Assessment Exam Boards** — page loads (empty data)
- **Breadcrumbs** — update correctly across navigation


### What's Partially Working (⚠️)

- **Student Profile Tabs** — tabs exist but content is mismatched (Personal shows Attendance, Finance shows Documents)
- **Sidebar on mobile** — can't be dismissed, blocks all content interaction
- **New Student form** — route not implemented (treated as student ID)
- **Bulk Module Registration** — route not implemented


### What's Completely Missing (❌) — 12 out of 18 admin modules

Finance, Attendance, Admissions, Support, Compliance, Documents, EC \& Appeals, Governance, Timetable, Accommodation, Reports, Settings — **all render blank white screens**.

### Three Entire Portals Missing (❌)

- **Academic Portal** — completely blank
- **Student Portal** — completely blank
- **Applicant Portal** — completely blank


### Critical Bugs

1. **SPA Router Crash:** Navigating to unimplemented routes can crash the entire app, rendering ALL pages blank until hard refresh
2. **No 404 Page:** Invalid URLs show blank screen instead of error page
3. **Student Profile Tab Content Mismatch:** Tab content doesn't match tab labels
4. **Mobile Sidebar Blocks Content:** No dismiss mechanism on narrow viewports

### Overall Assessment

Approximately **25-30% of the planned admin functionality is implemented** (core CRUD for Students, Programmes, Modules, Enrolments). The three non-admin portals (Academic, Student, Applicant) are 0% implemented. The sidebar links to 12 modules that are empty stubs, suggesting the navigation was built ahead of the page implementations.

<div align="center">⁂</div>

[^1_1]: http://localhost:5173/\#/dashboard

[^1_2]: http://localhost:5173/\#/admin

[^1_3]: http://localhost:5173/\#/admin/students/stu-0002

[^1_4]: http://localhost:5173/\#/admin/students

[^1_5]: http://localhost:5173/\#/admin/students

[^1_6]: http://localhost:5173/\#/admin/students/stu-0002

[^1_7]: http://localhost:5173/\#/admin/students/create

[^1_8]: http://localhost:5173/\#/admin/programmes

[^1_9]: http://localhost:5173/\#/admin/programmes/prg-024

[^1_10]: http://localhost:5173/\#/admin/modules

[^1_11]: http://localhost:5173/\#/admin/modules/mod-109

[^1_12]: http://localhost:5173/\#/admin/enrolments

[^1_13]: http://localhost:5173/\#/admin/enrolments/enr-0002

[^1_14]: http://localhost:5173/\#/admin/enrolments/status-changes

[^1_15]: http://localhost:5173/\#/admin/enrolments/bulk-registration

[^1_16]: http://localhost:5173/\#/admin/assessment/marks-entry

[^1_17]: http://localhost:5173/\#/admin/assessment/exam-boards

[^1_18]: http://localhost:5173/\#/admin/assessment/moderation

[^1_19]: http://localhost:5173/\#/admin/assessment/grade-distribution

[^1_20]: http://localhost:5173/\#/admin/assessment/external-examiners

[^1_21]: http://localhost:5173/\#/admin/finance/accounts

[^1_22]: http://localhost:5173/\#/admin/finance/invoicing

[^1_23]: http://localhost:5173/\#/admin/attendance/records

[^1_24]: http://localhost:5173/\#/admin/admissions/dashboard

[^1_25]: http://localhost:5173/\#/admin/admissions/applications

[^1_26]: http://localhost:5173/\#/admin/compliance/ukvi

[^1_27]: http://localhost:5173/\#/admin/documents

[^1_28]: http://localhost:5173/\#/admin/support/tickets

[^1_29]: http://localhost:5173/\#/admin/settings/system

[^1_30]: http://localhost:5173/\#/admin/reports/dashboards

[^1_31]: http://localhost:5173/\#/admin/ec-claims

[^1_32]: http://localhost:5173/\#/admin/governance/committees

[^1_33]: http://localhost:5173/\#/admin/timetable

[^1_34]: http://localhost:5173/\#/admin/accommodation/blocks

[^1_35]: http://localhost:5173/\#/academic

[^1_36]: http://localhost:5173/\#/academic/dashboard

[^1_37]: http://localhost:5173/\#/academic/modules

[^1_38]: http://localhost:5173/\#/student

[^1_39]: http://localhost:5173/\#/applicant

[^1_40]: http://localhost:5173/\#/admin/nonexistent

[^1_41]: http://localhost:5173/\#/admin

