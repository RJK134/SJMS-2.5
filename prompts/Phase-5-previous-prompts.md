# SJMS 2.5 — Phase 5 Split Build Prompts (5A / 5B / 5C)

**Phase 5: Frontend Portal Build (136+ pages)
Split into 3 sub-phases to prevent context window overflow and ensure incremental git safety**

\---

## Execution Sequence

|Sub-Phase|Effort|Scope|Approx. Pages|Timeline|
|-|-|-|-|-|
|**5A**|Very High|Shared components + Students, Programmes, Modules, Enrolments|\~26 pages + 9 components|Week 11|
|**5B**|Very High|Admissions, Assessment/Marks, Finance, Attendance, Timetable, Reports|\~33 pages|Week 12|
|**5C**|Very High|Support, UKVI, EC/Appeals, Docs, Comms, Governance, Accommodation, Settings + Academic/Student/Applicant portals|\~50+ pages|Weeks 13–14|
|**Verify 5**|—|Combined verification across all 3 sub-phases|—|After 5C|

### Workflow Per Sub-Phase

1. Set Claude Code effort to **Very High**
2. Paste the sub-phase prompt
3. Wait for completion (expect 10–20 min bake time per sub-phase)
4. Claude will commit and push to GitHub at the end of each sub-phase
5. Send me Claude's output for a quick sanity check before proceeding to the next sub-phase
6. After 5C completes, paste the **Verify Prompt 5** for full validation

### Git Safety

Each prompt includes **GIT CHECKPOINT** instructions after every major step. Claude will make work-in-progress commits throughout the build so that if the session times out or crashes mid-build, you can resume from the last checkpoint rather than losing everything.

\---

## Build Prompt 5A (Claude Code — Effort: Very High)

*Foundation Components + Core Entity Pages (\~26 pages + 9 shared components)*

*Paste the following prompt into Claude Code:*

\---

```
\\\[ROLE: FRONTEND\\\_ARCHITECT]

SJMS 2.5 Phase 5A --- Foundation Components \\\& Core Entity Pages. This is part 1 of 3 for the Frontend Portal Build.

CONTEXT: Phase 4 complete. 37 API modules with Zod validation. 190+ Prisma models. Keycloak auth with 27+ roles. Effective-dated identity, HESA entities, financial ledger, GDPR controls all in place. Docker stack running. The project is at the current working directory. Frontend stack: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + @tanstack/react-query + wouter + recharts + lucide-react + date-fns.

GIT SAFETY RULE: After completing each STEP below, run:
  git add -A \\\&\\\& git commit -m "wip: Phase 5A --- <step description>"
This ensures no work is lost if a session times out. The final step does the proper commit message and push.

DESIGN SYSTEM:
- Primary: navy #1e3a5f
- Secondary: slate #334155
- Accent: amber #d97706
- Background: #f8fafc
- Error: #dc2626
- Success: #16a34a
- Card backgrounds: white with subtle border (#e2e8f0)
- Font: system sans-serif (Calibri, Arial fallback)
- All text in British English (enrolment, programme, colour, centre, organisation, behaviour)

STEP 1 --- SHARED COMPONENTS

Create/update these shared components in client/src/components/:

DataTable.tsx --- Reusable sortable, filterable, paginated table:
- Column definitions with sort, filter, render options
- Server-side pagination (calls API with page/limit/sort params)
- Row selection (single and multi-select)
- Export button (CSV download)
- Search bar integrated
- Empty state with illustration
- Loading skeleton

StatusBadge.tsx --- Colour-coded status badges:
- enrolled → green, interrupted → amber, suspended → red, withdrawn → grey, completed → blue
- Generic mapping: success/warning/danger/info/neutral

PageHeader.tsx --- Consistent page header:
- Title, breadcrumbs, action buttons

FilterPanel.tsx --- Collapsible filter sidebar:
- Programme, academic year, status, fee status, faculty, school, department filters
- Active filter chips with clear individual / clear all

StatCard.tsx --- KPI stat card:
- Large value, label, optional delta arrow, optional sparkline

FormField.tsx --- Form wrapper around shadcn/ui inputs:
- Label, description, error message, required indicator
- Integrates with react-hook-form + Zod resolver

ConfirmDialog.tsx --- Confirmation modal:
- Title, message, confirm/cancel buttons
- Destructive variant (red confirm button)

DateRangePicker.tsx --- Date range selection

FileUpload.tsx --- Drag-and-drop file upload to MinIO via API

>>> GIT CHECKPOINT: git add -A \\\&\\\& git commit -m "wip: Phase 5A step 1 --- shared components"

STEP 2 --- STUDENT MANAGEMENT PAGES

- /students --- Student list with DataTable, search, filters (programme, year, status, fee status)
- /students/new --- Create student form (Person + Student details, multi-step wizard)
- /students/:id --- Student profile with tabs:
  - Overview (photo, key details, active enrolment, current modules, recent marks)
  - Personal (effective-dated names, addresses, contacts, identifiers, demographics, next of kin)
  - Academic (enrolment history, module registrations, marks, progression, awards)
  - Finance (account balance, charges, payments, invoices, payment plans, sponsors)
  - Attendance (weekly engagement scores, attendance records, alerts, interventions)
  - Support (tickets, flags, personal tutoring records)
  - Documents (uploaded documents, generated letters, transcripts, certificates)
  - Compliance (UKVI record, contact points, reports --- for international students)
  - Audit (audit trail of all changes to this student record)

>>> GIT CHECKPOINT: git add -A \\\&\\\& git commit -m "wip: Phase 5A step 2 --- student management pages"

STEP 3 --- PROGRAMME MANAGEMENT PAGES

- /programmes --- Programme list with DataTable
- /programmes/new --- Create programme form
- /programmes/:id --- Programme detail with tabs:
  - Overview (code, title, level, credits, duration, accreditations)
  - Specification (learning outcomes, teaching methods, assessment strategy, entry requirements)
  - Modules (linked modules with core/optional/elective mapping, year/semester)
  - Students (enrolled students by year)
  - Approval (approval workflow history: draft → initial → faculty → academic\\\_board → senate)
  - Statistics (enrolment trends, completion rates, average marks by year)

>>> GIT CHECKPOINT: git add -A \\\&\\\& git commit -m "wip: Phase 5A step 3 --- programme management pages"

STEP 4 --- MODULE MANAGEMENT PAGES

- /modules --- Module list
- /modules/:id --- Module detail with tabs:
  - Overview, Specification, Assessments, Students, Marks, Attendance, Statistics

>>> GIT CHECKPOINT: git add -A \\\&\\\& git commit -m "wip: Phase 5A step 4 --- module management pages"

STEP 5 --- ENROLMENT PAGES

- /enrolments --- Enrolment list with filters
- /enrolments/new --- New enrolment wizard (select student → programme → year → modules)
- /enrolments/:id --- Enrolment detail (status history timeline, module registrations)
- /enrolments/module-registration --- Bulk module registration
- /enrolments/status-changes --- Status change requests (interruption, withdrawal, transfer)

>>> GIT CHECKPOINT: git add -A \\\&\\\& git commit -m "wip: Phase 5A step 5 --- enrolment pages"

STEP 6 --- ALL FORMS IN THIS PHASE MUST:
- Use react-hook-form with Zod resolver (same schemas as API)
- Show loading states during submission
- Show server-side validation errors inline
- Show success toast notifications
- Redirect appropriately after successful submission
- Handle network errors gracefully
- Support keyboard navigation
- Use British English labels and placeholders throughout

STEP 7 --- VERIFY AND COMMIT

Verify:
- TypeScript compiles: cd client \\\&\\\& npx tsc --noEmit (zero errors)
- All shared components render without errors
- /students page loads data from API with pagination
- /students/:id renders all 9 tabs
- /programmes page loads 30+ programmes
- /modules page loads 120+ modules
- /enrolments page loads with filters working
- British English check: grep -r "enrollment\\\\|program\\\[^m]\\\\| color\\\[^:]\\\\|center\\\\b" client/src/pages/ (should return nothing)

git add -A
git commit -m "feat: Phase 5A --- shared components, student/programme/module/enrolment pages"
git push origin main

ACCEPTANCE CRITERIA:
- \\\[ ] 9 shared components created and functional (DataTable, StatusBadge, PageHeader, FilterPanel, StatCard, FormField, ConfirmDialog, DateRangePicker, FileUpload)
- \\\[ ] Student list, create wizard, and profile (9 tabs) all rendering
- \\\[ ] Programme list, create form, and detail (6 tabs) all rendering
- \\\[ ] Module list and detail (7 tabs) rendering
- \\\[ ] Enrolment list, wizard, detail, bulk registration, status changes rendering
- \\\[ ] All DataTables load data from API with server-side pagination
- \\\[ ] All forms validate with Zod before submission
- \\\[ ] Loading states, error states, and empty states on every page
- \\\[ ] British English throughout
- \\\[ ] FHE branding (navy headers, amber accents, slate surfaces)
- \\\[ ] TypeScript compiles with zero errors
- \\\[ ] Pushed to GitHub
```

\---

## Build Prompt 5B (Claude Code — Effort: Very High)

*Staff Portal Operational Domains (\~33 pages)*

*Paste the following prompt into Claude Code:*

\---

```
\\\[ROLE: FRONTEND\\\_ARCHITECT]

SJMS 2.5 Phase 5B --- Staff Portal Operational Domains. This is part 2 of 3 for the Frontend Portal Build.

CONTEXT: Phase 5A complete. Shared components (DataTable, StatusBadge, PageHeader, FilterPanel, StatCard, FormField, ConfirmDialog, DateRangePicker, FileUpload) are built. Student, Programme, Module, and Enrolment pages are working. Docker stack running. The project is at the current working directory.

GIT SAFETY RULE: After completing each STEP below, run:
  git add -A \\\&\\\& git commit -m "wip: Phase 5B --- <step description>"
This ensures no work is lost if a session times out. The final step does the proper commit message and push.

DESIGN SYSTEM: Same as Phase 5A (navy #1e3a5f primary, slate #334155 secondary, amber #d97706 accent, #f8fafc background, white cards with #e2e8f0 border, British English throughout).

STEP 1 --- ADMISSIONS PAGES (7 pages)

- /admissions/applications --- Application pipeline (Kanban view AND table view toggle)
- /admissions/applications/:id --- Application detail (personal info, qualifications, references, offer conditions, clearance checks, interview notes)
- /admissions/offers --- Offer management dashboard (conditional/unconditional/firm/insurance counts)
- /admissions/interviews --- Interview scheduling calendar
- /admissions/events --- Events management (open days, visit days)
- /admissions/agents --- Agent management
- /admissions/dashboard --- Admissions funnel analytics (applications → offers → acceptances → enrolments)

>>> GIT CHECKPOINT: git add -A \\\&\\\& git commit -m "wip: Phase 5B step 1 --- admissions pages"

STEP 2 --- ASSESSMENT \\\& MARKS PAGES (6 pages)

- /assessment/marks-entry --- Marks entry grid (select module → assessment → enter marks for all students)
  - Spreadsheet-style grid with inline editing
  - Auto-calculation of weighted module marks
  - Moderation status indicators
  - Save as draft / Submit for moderation / Confirm marks
- /assessment/moderation --- Moderation queue (marks submitted awaiting moderation)
- /assessment/exam-boards --- Exam board management (schedule, manage members, record decisions)
- /assessment/exam-boards/:id --- Exam board detail (student list, marks review, progression decisions)
- /assessment/external-examiners --- External examiner management
- /assessment/grade-distribution --- Grade distribution charts by module/programme/year (use recharts)

>>> GIT CHECKPOINT: git add -A \\\&\\\& git commit -m "wip: Phase 5B step 2 --- assessment and marks pages"

STEP 3 --- FINANCE PAGES (9 pages)

- /finance/accounts --- Student account list with balance, overdue status
- /finance/accounts/:studentId --- Account detail (transactions, invoices, payments)
- /finance/invoicing --- Invoice generation (individual or bulk)
- /finance/payments --- Payment recording and reconciliation
- /finance/payment-plans --- Payment plan management
- /finance/sponsors --- Sponsor agreements (SLC, employers, embassies)
- /finance/bursaries --- Bursary fund management and applications
- /finance/debt-management --- Overdue accounts dashboard with escalation tracking
- /finance/refunds --- Refund approval workflow

>>> GIT CHECKPOINT: git add -A \\\&\\\& git commit -m "wip: Phase 5B step 3 --- finance pages"

STEP 4 --- ATTENDANCE \\\& ENGAGEMENT PAGES (4 pages)

- /attendance/records --- Attendance records with filters
- /attendance/engagement --- Engagement dashboard (RAG-rated student list with risk scores)
- /attendance/alerts --- Attendance alerts requiring action
- /attendance/interventions --- Intervention tracking

>>> GIT CHECKPOINT: git add -A \\\&\\\& git commit -m "wip: Phase 5B step 4 --- attendance pages"

STEP 5 --- TIMETABLE PAGES (3 pages)

- /timetable --- CELCAT-style weekly timetable view
- /timetable/rooms --- Room management and availability
- /timetable/clashes --- Clash detection and resolution

>>> GIT CHECKPOINT: git add -A \\\&\\\& git commit -m "wip: Phase 5B step 5 --- timetable pages"

STEP 6 --- REPORTS \\\& DASHBOARDS (4 pages)

- /reports/hesa --- HESA return preparation and validation
- /reports/statutory --- Other statutory returns (HESES, NSS, TEF, Graduate Outcomes)
- /reports/custom --- Custom report builder (select entity, fields, filters → export CSV/PDF)
- /reports/dashboards --- Management dashboards (enrolment trends, completion rates, financial overview --- use recharts for all charts)

>>> GIT CHECKPOINT: git add -A \\\&\\\& git commit -m "wip: Phase 5B step 6 --- reports and dashboards"

STEP 7 --- VERIFY AND COMMIT

Verify:
- TypeScript compiles: cd client \\\&\\\& npx tsc --noEmit (zero errors)
- /admissions/applications renders both Kanban and table views
- /assessment/marks-entry grid loads student list, inline editing works, auto-calculation works
- /finance/accounts shows balances for seeded students
- /attendance/engagement shows RAG-rated dashboard
- /timetable renders weekly view with time slots
- /reports/dashboards renders recharts visualisations
- British English check: grep -r "enrollment\\\\|program\\\[^m]\\\\| color\\\[^:]\\\\|center\\\\b" client/src/pages/ (should return nothing)

git add -A
git commit -m "feat: Phase 5B --- admissions, assessment, finance, attendance, timetable, reports pages"
git push origin main

ACCEPTANCE CRITERIA:
- \\\[ ] Admissions pipeline with Kanban AND table toggle working
- \\\[ ] Marks entry spreadsheet grid with inline editing and auto-calculation
- \\\[ ] Finance pages show account balances, transactions, invoicing
- \\\[ ] Attendance engagement dashboard with RAG rating
- \\\[ ] Timetable CELCAT-style weekly view rendering
- \\\[ ] Report dashboards with recharts visualisations
- \\\[ ] All DataTables use shared DataTable component with server-side pagination
- \\\[ ] All forms use react-hook-form + Zod resolver
- \\\[ ] Loading, error, and empty states on every page
- \\\[ ] British English throughout
- \\\[ ] TypeScript compiles with zero errors
- \\\[ ] Pushed to GitHub
```

\---

## Build Prompt 5C (Claude Code — Effort: Very High)

*Staff Admin, Support \& All Self-Service Portals (\~50+ pages)*

*Paste the following prompt into Claude Code:*

\---

```
\\\[ROLE: FRONTEND\\\_ARCHITECT]

SJMS 2.5 Phase 5C --- Staff Admin, Support \\\& Self-Service Portals. This is part 3 of 3 for the Frontend Portal Build.

CONTEXT: Phase 5B complete. All shared components built. Staff core pages (Students, Programmes, Modules, Enrolments) and operational pages (Admissions, Assessment, Finance, Attendance, Timetable, Reports) are working. Docker stack running. The project is at the current working directory.

GIT SAFETY RULE: After completing each STEP below, run:
  git add -A \\\&\\\& git commit -m "wip: Phase 5C --- <step description>"
This ensures no work is lost if a session times out. The final step does the proper commit message and push.

DESIGN SYSTEM: Same as Phase 5A/5B (navy #1e3a5f primary, slate #334155 secondary, amber #d97706 accent, #f8fafc background, white cards with #e2e8f0 border, British English throughout).

STEP 1 --- STUDENT SUPPORT PAGES (6 pages)

- /support/tickets --- Support ticket management (inbox-style)
- /support/tickets/:id --- Ticket detail with interaction timeline
- /support/flags --- Student flag management
- /support/personal-tutoring --- Personal tutor meeting records
- /support/wellbeing --- Wellbeing referrals and records
- /support/disability --- Disability records and adjustments

>>> GIT CHECKPOINT: git add -A \\\&\\\& git commit -m "wip: Phase 5C step 1 --- student support pages"

STEP 2 --- UKVI COMPLIANCE PAGES (4 pages)

- /compliance/ukvi --- UKVI record dashboard
- /compliance/ukvi/:studentId --- Student UKVI detail
- /compliance/contact-points --- Contact point schedule and tracking
- /compliance/reports --- Home Office reporting

>>> GIT CHECKPOINT: git add -A \\\&\\\& git commit -m "wip: Phase 5C step 2 --- UKVI compliance pages"

STEP 3 --- EC CLAIMS, APPEALS \\\& MISCONDUCT (3 pages)

- /ec-claims --- EC claim management
- /appeals --- Appeal management
- /academic-misconduct --- Plagiarism and disciplinary cases

STEP 4 --- DOCUMENTS \\\& COMMUNICATIONS (5 pages)

- /documents --- Document management
- /documents/letters --- Letter generation from templates
- /communications --- Communication log
- /communications/templates --- Template management
- /communications/bulk --- Bulk communication tool

>>> GIT CHECKPOINT: git add -A \\\&\\\& git commit -m "wip: Phase 5C steps 3-4 --- EC/appeals, documents, comms"

STEP 5 --- GOVERNANCE \\\& ACCOMMODATION (5 pages)

- /governance/committees --- Committee management
- /governance/meetings --- Meeting scheduling and minutes
- /accommodation/blocks --- Accommodation block management
- /accommodation/rooms --- Room management
- /accommodation/bookings --- Booking management

STEP 6 --- SETTINGS \\\& ADMIN (6 pages)

- /settings/system --- System settings
- /settings/users --- User management (Keycloak integration)
- /settings/roles --- Role management
- /settings/audit-log --- Audit log viewer (filterable by entity, user, action, date range)
- /settings/academic-calendar --- Academic calendar management
- /settings/academic-years --- Academic year configuration

>>> GIT CHECKPOINT: git add -A \\\&\\\& git commit -m "wip: Phase 5C steps 5-6 --- governance, accommodation, settings"

STEP 7 --- ACADEMIC PORTAL PAGES (12+ pages)

- /academic/dashboard --- Teaching dashboard (my modules this term, upcoming deadlines, marks to submit)
- /academic/modules --- My modules list
- /academic/modules/:id --- Module detail (my assigned assessments, student list, attendance)
- /academic/marks-entry --- Marks entry for my modules (same grid as staff but filtered to own modules)
- /academic/moderation --- My moderation queue
- /academic/attendance --- Record attendance for my teaching events
- /academic/tutees --- My personal tutees list
- /academic/tutees/:studentId --- Tutee profile (limited view --- academic + support info only)
- /academic/timetable --- My teaching timetable
- /academic/exam-boards --- Exam boards I'm a member of
- /academic/ec-claims --- EC claims for my modules (read-only view of decisions)
- /academic/profile --- My staff profile

>>> GIT CHECKPOINT: git add -A \\\&\\\& git commit -m "wip: Phase 5C step 7 --- academic portal"

STEP 8 --- STUDENT PORTAL PAGES (15+ pages)

- /student/dashboard --- Student dashboard (current modules, upcoming deadlines, attendance %, recent marks, account balance, announcements)
- /student/programme --- My programme (programme details, progression rules, expected graduation)
- /student/modules --- My modules this year (with assessment deadlines, marks received)
- /student/modules/:id --- Module detail (assessments, marks, feedback, teaching events)
- /student/marks --- All my marks \\\& results (by year, with classification calculator)
- /student/timetable --- My timetable (personal weekly view with teaching events)
- /student/finance/account --- My financial account (balance, transactions, invoices)
- /student/finance/payments --- Make a payment / view payment history
- /student/finance/payment-plan --- My payment plan
- /student/attendance --- My attendance record (by module, by week)
- /student/documents --- My documents (upload, view, download)
- /student/support/tickets --- My support tickets (raise new, view existing)
- /student/support/tickets/new --- Raise support ticket form
- /student/ec-claims --- My EC claims (submit new, track existing)
- /student/profile --- My profile (edit contact details, preferences)

>>> GIT CHECKPOINT: git add -A \\\&\\\& git commit -m "wip: Phase 5C step 8 --- student portal"

STEP 9 --- APPLICANT PORTAL PAGES (8+ pages)

- /applicant/dashboard --- Application status overview
- /applicant/application --- My application (view submitted application)
- /applicant/application/edit --- Edit application (if still in draft/submitted status)
- /applicant/offers --- My offers (conditional/unconditional, accept/decline)
- /applicant/documents --- Upload supporting documents
- /applicant/courses --- Course search and browse
- /applicant/events --- Open days and visit events (register)
- /applicant/contact --- Contact admissions team

>>> GIT CHECKPOINT: git add -A \\\&\\\& git commit -m "wip: Phase 5C step 9 --- applicant portal"

STEP 10 --- ALL FORMS IN THIS PHASE MUST:
- Use react-hook-form with Zod resolver (same schemas as API)
- Show loading states during submission
- Show server-side validation errors inline
- Show success toast notifications
- Redirect appropriately after successful submission
- Handle network errors gracefully
- Support keyboard navigation
- Use British English labels and placeholders throughout

STEP 11 --- VERIFY AND COMMIT

Verify:
- TypeScript compiles: cd client \\\&\\\& npx tsc --noEmit (zero errors)
- Count total page components in client/src/pages/ (target: 136+)
- /support/tickets renders inbox-style list
- /compliance/ukvi shows dashboard for international students
- /settings/audit-log renders filterable audit log
- Login as academic@fhe.ac.uk → academic portal pages render, staff pages not accessible
- Login as student@fhe.ac.uk → student portal pages render, sees own data only
- Login as applicant@fhe.ac.uk → applicant portal renders
- /student/dashboard shows current modules, deadlines, attendance, marks, balance
- /academic/dashboard shows my modules, deadlines, marks to submit
- British English check: grep -r "enrollment\\\\|program\\\[^m]\\\\| color\\\[^:]\\\\|center\\\\b" client/src/pages/ (should return nothing)

git add -A
git commit -m "feat: Phase 5C --- support, UKVI, settings, academic/student/applicant portals (136+ total pages)"
git push origin main

ACCEPTANCE CRITERIA:
- \\\[ ] Support ticket inbox-style management working
- \\\[ ] UKVI compliance dashboard rendering
- \\\[ ] Settings pages with audit log viewer
- \\\[ ] Academic portal: 12+ pages, data scoped to logged-in staff member
- \\\[ ] Student portal: 15+ pages, data scoped to logged-in student
- \\\[ ] Applicant portal: 8+ pages, application tracking working
- \\\[ ] Role-based rendering: each portal shows only authorised pages
- \\\[ ] Total page count across all portals: 136+
- \\\[ ] All DataTables use shared component with server-side pagination
- \\\[ ] All forms use react-hook-form + Zod resolver
- \\\[ ] Loading, error, and empty states on every page
- \\\[ ] British English throughout (no American spellings)
- \\\[ ] FHE branding consistent across all portals
- \\\[ ] Responsive: all pages usable at 1024px and 1440px widths
- \\\[ ] TypeScript compiles with zero errors
- \\\[ ] Pushed to GitHub
```

\---

## Verify Prompt 5 (Perplexity Computer)

*Run this AFTER all three sub-phases (5A + 5B + 5C) are complete.*

*Paste the following prompt into Perplexity Computer:*

\---

```
Review SJMS 2.5 Phase 5 (Frontend Portal Build). Pull latest from https://github.com/RJK134/SJMS-2.5 and verify:

1. PAGE COUNT
- Count total page components in client/src/pages/ (target: 136+)
- Staff portal: 71+ pages
- Academic portal: 15+ pages
- Student portal: 15+ pages
- Applicant portal: 8+ pages
- List any missing pages from the specification

2. DATA RENDERING (login as admin)
- /students --- loads 150+ students with pagination, search works, filters work
- /students/{id} --- profile renders with all tabs populated
- /programmes --- loads 30+ programmes
- /modules --- loads 120+ modules
- /admissions/applications --- renders pipeline view
- /finance/accounts --- shows account balances
- /assessment/marks-entry --- select a module, marks grid renders with student list

3. FORM VALIDATION (login as admin)
- /students/new --- submit empty form → validation errors on required fields
- /students/new --- submit with invalid date of birth → format error
- /enrolments/new --- submit with mismatched programme/module → validation error
- /support/tickets --- create ticket → success, appears in list

4. ROLE-BASED RENDERING
- Login as academic@fhe.ac.uk → only Academic portal pages accessible, no Staff admin pages
- Login as student@fhe.ac.uk → only Student portal pages, sees own data only
- Login as applicant@fhe.ac.uk → only Applicant portal pages
- Try accessing /settings/audit-log as student → redirected or 403

5. RESPONSIVE CHECK
- Check /students at 1024px width → table still usable, no horizontal overflow
- Check /student/dashboard at 1440px → full desktop layout
- Check sidebar collapses correctly at narrower widths

6. VISUAL CONSISTENCY
- All page headers follow consistent pattern (title + breadcrumbs + actions)
- Navy #1e3a5f used for primary headers and sidebar
- Amber #d97706 used for accent elements (badges, highlights)
- No unstyled or broken components

7. BRITISH ENGLISH CHECK
- Search codebase for American spellings: "enrollment" (should be "enrolment"), "program" (not followed by "me") (should be "programme"), "color" (should be "colour"), "center" (should be "centre"), "organization" (should be "organisation")
- All labels, placeholders, and messages use British English

Report: Pass/Fail for each check with screenshots where possible.

VERDICT: GO / NO-GO for Phase 6.
```

