# SJMS 2.5 — Comet Browser User Testing Scripts

## Run tonight against local dev (`npm run dev` on both server:3001 and client:5173)

## AUTH\_BYPASS=true means all portals are accessible without Keycloak

\---

## Test Environment Setup

* **URL**: `http://localhost:5173`
* **Auth mode**: AUTH\_BYPASS=true (all roles granted automatically)
* **Seed data**: 150 students, 33 programmes, 132 modules, 503 enrolments, 264 marks, 25 support tickets
* **Goal**: Identify UI/UX issues, broken pages, missing data, and navigation problems BEFORE Phase 2 begins

\---

## Test Suite 1: Admin Portal — Registry Officer Journey

**Persona**: Sarah Chen, Senior Registry Officer
**Entry point**: Navigate to `http://localhost:5173/#/admin`

### Test 1.1: Dashboard \& Navigation

1. Verify the admin dashboard loads with stat cards (student count, enrolment count, etc.)
2. Click through EVERY sidebar menu item — record which ones:

   * ✅ Load with real data
   * ⚠️ Load but show empty state ("No records found")
   * ❌ Show an error, blank white screen, or "Staff Dashboard" stub
3. Check the sidebar has logical grouping of menu items
4. Verify breadcrumbs/page titles update correctly on navigation

### Test 1.2: Student Records (core CRUD)

1. Navigate to Students → Student List
2. Verify the list shows students with pagination (should be 150 students)
3. Use the search box — search for a partial name
4. Click into a student profile — verify all tabs load:

   * Overview, Personal, Academic, Finance, Attendance, Documents, Compliance, Support, Audit
5. Check that each tab shows relevant data (not all empty)
6. Navigate to Students → Create Student
7. Fill in the form — check field validation fires on submit with missing required fields
8. Check: does the student list have sortable column headers?

### Test 1.3: Programme \& Module Management

1. Navigate to Programmes → Programme List
2. Verify 33 programmes display with correct details
3. Click into a programme — check programme details, module list, routes
4. Navigate to Modules → Module List
5. Verify 132 modules display
6. Click into a module — check module details, assessment info, registered students

### Test 1.4: Enrolment Management

1. Navigate to Enrolments → Enrolment List
2. Verify enrolments display (should be 503)
3. Click into an enrolment detail — verify student info, programme, module registrations
4. Check Status Changes page — does it show enrolment status history?
5. Navigate to Bulk Module Registration — does the page load and make sense?

### Test 1.5: Assessment \& Marks

1. Navigate to Assessment → Marks Entry
2. Verify the marks entry interface loads with module/assessment selection
3. Navigate to Assessment → Exam Boards — verify list loads
4. Click into an Exam Board detail — check it shows relevant data
5. Navigate to Assessment → Moderation Queue
6. Navigate to Assessment → Grade Distribution — does it show a chart/visualisation?
7. Navigate to Assessment → External Examiners

### Test 1.6: Finance

1. Navigate to Finance → Account List
2. Verify student financial accounts display
3. Click into an Account Detail — check balance, charges, payments
4. Navigate to Finance → Invoicing, Payment Recording, Payment Plans, Bursaries, Refunds, Debt Management, Sponsors
5. Record which finance pages have real data vs empty states

### Test 1.7: Attendance \& Engagement

1. Navigate to Attendance → Attendance Records
2. Verify records display with student names, dates, statuses
3. Navigate to Attendance → Engagement Dashboard — does it show metrics/charts?
4. Navigate to Attendance → Alerts List and Interventions

### Test 1.8: Admissions Pipeline

1. Navigate to Admissions → Application Pipeline
2. Verify applications display with status indicators
3. Click into an Application Detail
4. Navigate to Admissions → Offers Dashboard
5. Navigate to Admissions → Interview Schedule, Events Management, Agent Management

### Test 1.9: Compliance \& UKVI

1. Navigate to Compliance → UKVI Dashboard
2. Verify international student monitoring data displays
3. Click into a UKVI Detail record
4. Navigate to Compliance → Home Office Reports, Contact Points

### Test 1.10: Documents \& Communications

1. Navigate to Documents → Document List
2. Navigate to Documents → Letter Generation, Template Management
3. Navigate to Documents → Communication Log, Bulk Communication

### Test 1.11: Support \& Wellbeing

1. Navigate to Support → Ticket List (should show 25 tickets)
2. Click into a Ticket Detail — verify ticket info, status, responses
3. Navigate to Support → Disability Records, Wellbeing Records, Personal Tutoring
4. Navigate to Support → Flag Management

### Test 1.12: Settings \& System

1. Navigate to Settings → User Management, Role Management
2. Navigate to Settings → Academic Calendar, Academic Years
3. Navigate to Settings → Audit Log Viewer — verify it shows audit entries
4. Navigate to Settings → System Settings

### Test 1.13: Reports \& Statutory Returns

1. Navigate to Reports → Management Dashboards
2. Navigate to Reports → HESA Return, Statutory Returns, Custom Reports

### Test 1.14: Other Admin Pages

1. Navigate to EC \& Appeals → EC Claims, Appeals, Academic Misconduct
2. Navigate to Governance → Committees, Meetings
3. Navigate to Timetable → Timetable View, Room Management, Clash Detection
4. Navigate to Accommodation → Blocks, Rooms, Bookings (expected: placeholders)

\---

## Test Suite 2: Academic Portal — Module Leader Journey

**Persona**: Dr James Morrison, Module Leader for Business Analytics
**Entry point**: Navigate to `http://localhost:5173/#/academic`

### Test 2.1: Academic Dashboard

1. Verify the academic dashboard loads
2. Check stat cards show relevant academic data (my modules, my tutees, etc.)

### Test 2.2: My Modules

1. Navigate to My Modules — verify module list loads
2. Click into a module detail (My Module Detail)
3. Check: student list, assessment info, attendance summary

### Test 2.3: My Teaching Activities

1. Navigate to My Marks Entry — verify marks entry interface
2. Navigate to My Moderation — check moderation queue
3. Navigate to My Exam Boards — check exam board list
4. Navigate to My Attendance — check attendance recording interface

### Test 2.4: My Tutees

1. Navigate to My Tutees — verify tutee list
2. Click into a Tutee Profile — check student info, flags, notes

### Test 2.5: Other Academic Pages

1. Navigate to My Timetable
2. Navigate to My EC Claims
3. Navigate to My Profile

\---

## Test Suite 3: Student Portal — Student Journey

**Persona**: Amara Okafor, 2nd year BSc Computer Science student
**Entry point**: Navigate to `http://localhost:5173/#/student`

### Test 3.1: Student Dashboard

1. Verify student dashboard loads with personalised data
2. Check stat cards (my modules, upcoming deadlines, attendance %, etc.)

### Test 3.2: Academic Information

1. Navigate to My Programme — verify programme details display
2. Navigate to My Modules — verify enrolled modules list
3. Click into a Student Module Detail
4. Navigate to My Marks — verify marks/grades display
5. Navigate to My Timetable

### Test 3.3: Student Services

1. Navigate to My Attendance — verify attendance record
2. Navigate to My EC Claims — check extenuating circumstances
3. Navigate to My Documents — check document list
4. Navigate to My Tickets — check support tickets
5. Navigate to Raise Ticket — verify the form loads and validates

### Test 3.4: Finance

1. Navigate to My Account — verify financial summary
2. Navigate to My Payment Plan
3. Navigate to Make Payment — verify payment interface

### Test 3.5: Profile

1. Navigate to Student Profile — verify personal details display

\---

## Test Suite 4: Applicant Portal — Prospective Student Journey

**Persona**: Tom Williams, applying for MSc Data Science
**Entry point**: Navigate to `http://localhost:5173/#/applicant`

### Test 4.1: Applicant Dashboard

1. Verify applicant dashboard loads

### Test 4.2: Application Journey

1. Navigate to My Application — check application status display
2. Navigate to Edit Application — verify form loads
3. Navigate to My Offers — check offer status
4. Navigate to Upload Documents — verify upload interface

### Test 4.3: Discovery

1. Navigate to Course Search — verify programme search works
2. Navigate to Events — check events listing
3. Navigate to Contact Admissions

\---

## Test Suite 5: Cross-Cutting UX Tests

### Test 5.1: Responsive Design

1. Resize browser to mobile width (375px) on 3 key pages:

   * Admin student list
   * Student dashboard
   * Applicant course search
2. Check: tables collapse or scroll, navigation adapts, no horizontal overflow

### Test 5.2: Error States

1. Navigate to a non-existent URL like `/#/admin/nonexistent` — what happens?
2. Check browser console for JavaScript errors on each portal's main dashboard page

### Test 5.3: Data Consistency

1. On admin Student List, note the total count
2. On admin Dashboard stats, check the student count matches
3. On admin Enrolment List, check the total matches the dashboard stat

### Test 5.4: Performance (Subjective)

1. Note any pages that take >3 seconds to load
2. Note any pages where you see a flash of empty content before data appears
3. Note any pages where the spinner never resolves

\---

## Recording Template

For each test, record in this format:

|Test ID|Page/Feature|Result|Notes|
|-|-|-|-|
|1.1|Admin Dashboard|✅/⚠️/❌|Description of what you observed|

### Result Key

* ✅ **PASS** — Page loads, shows real data, navigation works
* ⚠️ **PARTIAL** — Page loads but has issues (empty data, layout problem, missing feature)
* ❌ **FAIL** — Page errors, blank screen, crashes, or completely non-functional

\---

## What These Results Tell Us Tomorrow

* **✅ pages** → Confirmed working, no Phase 2 regressions to worry about
* **⚠️ pages** → Need attention but not blockers — document for post-Phase 2
* **❌ pages** → Must be fixed before or during Phase 2 — these inform the Claude Code prompt
* **Navigation issues** → May indicate remaining routing bugs from the wouter migration
* **Empty data pages** → Distinguish between "seed data doesn't cover this domain" vs "API endpoint broken"

