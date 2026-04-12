# SJMS 2.5 — Overnight Autonomous Build Session

## Saturday 11 April 2026 — Developer is asleep. Work carefully, commit often.

\---

## Your Identity

You are continuing the SJMS 2.5 build in `D:\\\\Projects\\\\sjms 2.5 New Build`. This is an AUTONOMOUS overnight session. The developer will review your work in the morning. Follow every instruction precisely.

## Remote

`https://github.com/RJK134/SJMS-2.5` — push to feature branches only, never main.

## Pre-Flight Checks (MANDATORY)

```bash
cd "D:\\\\Projects\\\\sjms 2.5 New Build"
git checkout main
git pull origin main
git status
```

If `git status` shows uncommitted changes, STOP. Do not proceed.

Then verify TSC state:

```bash
cd server \\\&\\\& npx tsc --noEmit 2>\\\&1 | tail -5
cd ../client \\\&\\\& npx tsc --noEmit 2>\\\&1 | tail -5
```

Record the starting error counts. If server shows 0, the TSC fixes were already committed — skip Task 1 and go to Task 2.

\---

## TASK 1: TSC Error Fixes (if not already done)

If `npx tsc --noEmit` on server still shows errors, proceed with this task. If it shows 0, skip to Task 2.

```bash
git checkout -b fix/tsc-cleanup
```

### Priority Fix: data-scope.ts (KI-001 — Phase 2 blocker)

* `server/src/middleware/data-scope.ts` lines 44, 50: change `person.students` → `person.student` (1:1 relation)
* Commit: `fix(middleware): correct person.student relation name in data-scope`

### Category 1: Query param typing (7 errors)

Files: `dashboard.controller.ts`, `finance.controller.ts`, `notifications.controller.ts`, `timetable.controller.ts`
Fix: Add type narrowing: `const x = typeof req.query.x === 'string' ? req.query.x : undefined;`
Commit: `fix(types): add query param type narrowing to controllers — TSC 21→14`

### Category 2a: StudentAccount field renames (2 errors)

File: `dashboard.service.ts` lines 74-78
Fix: `totalCharges` → `totalDebits`, `totalPayments` → `totalCredits` (match Prisma schema)
Commit: `fix(types): rename StudentAccount totalCharges/Payments to totalDebits/Credits — TSC 14→12`

### Category 2b: Application model alignment (10 errors)

File: `dashboard.service.ts` lines 82-105
Fix: Align `getApplicantDashboard` with current schema — Application.personId moved to Applicant, offers → conditions, entryRoute → applicationRoute
Add NOTE comments documenting the renames for Phase 5 frontend team.
Commit: `fix(types): align dashboard.getApplicantDashboard with Application schema — TSC 12→2`

### Category 3: RedisStore prefix (4 errors)

File: `server/src/middleware/rate-limit.ts` line 10
Fix: Remove `private` modifier from `prefix` property (Store interface requires it public)
Commit: `fix(types): make RedisStore.prefix public to satisfy Store interface — TSC 2→0`

### After all fixes:

```bash
cd server \\\&\\\& npx tsc --noEmit  # expect: 0
cd ../client \\\&\\\& npx tsc --noEmit  # expect: 0
git push origin fix/tsc-cleanup
```

### Rules

* One commit per category, explicit file paths only (never `git add -A`)
* Do NOT modify `prisma/schema.prisma`
* Do NOT refactor services or wire repositories
* 15-minute rule per error — use `@ts-expect-error` if stuck
* STOP if >20 files edited or >500 lines changed

\---

## TASK 2: Fix Critical Bugs from Comet User Testing

The Comet browser test suite was run on 10 April 2026 against the local dev environment. Results below. Create a new branch for this work:

```bash
git checkout main
git pull origin main
git checkout -b fix/comet-test-findings
```

### Context: What Comet Found

**Working well (25-30% of admin):**

* Admin Dashboard: stat cards correct (150 students, 33 programmes, 132 modules, 114 active enrolments)
* Student List: 150 records, pagination, search, filters, sorting, CSV export
* Programme List: 33 programmes, all details, filters, pagination
* Programme Detail: full details with 6 tabs
* Module List: 132 modules, filters
* Module Detail: full details with 7 tabs
* Enrolment List: 503 records, filters
* Enrolment Detail: student info, module registrations
* Breadcrumbs update correctly
* Data consistency across dashboard stats and list pages

**CRITICAL BUG 1 — SPA Router Crash (HIGHEST PRIORITY)**
Navigating to unimplemented routes (e.g. /academic, /student) then back to /admin crashes the ENTIRE SPA — all pages go blank, requiring a hard refresh (Ctrl+Shift+R). This is a showstopper.

**CRITICAL BUG 2 — Student Profile Tab Content Mismatch**
Student detail page at `/admin/students/:id` has 9 tabs (Overview, Personal, Academic, Finance, Attendance, Support, Documents, Compliance, Audit). BUG: Tab content is mismatched — Personal tab shows attendance records, Academic also shows attendance, Finance shows documents section. Only Overview and Audit tabs show correct content.

**CRITICAL BUG 3 — No 404 Page**
Navigating to invalid URLs like `/admin/nonexistent` shows a blank white screen — no error page, no redirect.

**BUG 4 — Mobile Sidebar Cannot Be Dismissed**
On mobile viewport, the sidebar overlays the entire content area with no dismiss mechanism — blocks ALL interaction with page content. Hamburger menu toggles sidebar open but doesn't close it.

**BUG 5 — Create Student Route Broken**
`/admin/students/create` is treated as a student ID lookup — shows "Student not found". Route order issue.

**BUG 6 — Bulk Module Registration Route Broken**
`/admin/enrolments/bulk-registration` is treated as an enrolment ID lookup — shows "Enrolment not found". Same route order issue as Bug 5.

**12 Admin Modules Render Completely Blank:**
Finance (all sub-pages), Attendance (all), Admissions (all), Support (all), Compliance/UKVI (all), Documents (all), Settings (all), Reports (all), EC \& Appeals, Governance, Timetable, Accommodation.

**3 Non-Admin Portals Completely Blank:**
Academic Portal, Student Portal, Applicant Portal — all render blank white screens.

**Assessment partial:** Marks Entry loads with selectors, Exam Boards page loads (0 records), but Moderation Queue, Grade Distribution, and External Examiners are blank.

\---

### Fix Priority Order

#### Fix 2.1: SPA Router Crash (CRITICAL — fix first)

Read `client/src/App.tsx` and all router files to understand the routing structure. The crash likely happens because:

* Navigating to `/academic`, `/student`, or `/applicant` hits a route that renders an empty portal component
* Something in the unmount/remount cycle when navigating back corrupts React state
* OR wouter's route matching leaves stale state

**Investigation steps:**

1. Read `client/src/App.tsx` — check how portal routes are defined
2. Read each portal's entry component (e.g., `AcademicPortal.tsx`, `StudentPortal.tsx`, `ApplicantPortal.tsx`)
3. Check if portals have a proper layout wrapper or are returning null/undefined
4. Add proper catch-all error boundaries

**Fix approach:**

* Ensure every portal route has a valid React component that renders at minimum a layout shell with "Coming soon" or a redirect
* Add a React Error Boundary wrapper around the router to catch and recover from crashes
* Add a 404 catch-all route that renders a proper "Page not found" component with a "Go to Dashboard" link

**Commit:** `fix(router): prevent SPA crash on unimplemented portal routes + add 404 page`

#### Fix 2.2: Student Profile Tab Content Mismatch (CRITICAL)

Read the student detail/profile component (likely `client/src/pages/admin/students/StudentDetail.tsx` or similar).

**Investigation:**

1. Read the component — look at the tab panel content mapping
2. Each tab likely uses an index-based or key-based content switcher
3. The mismatch suggests tab indices are wrong, or tab panel components are in the wrong order

**Fix:** Align tab labels with their content panels. Verify each tab renders the correct component:

* Overview → student overview/summary
* Personal → personal details (name, DOB, address, demographics)
* Academic → programme, modules, marks
* Finance → account balance, charges, payments
* Attendance → attendance records, engagement metrics
* Support → support tickets, disability, wellbeing
* Documents → uploaded documents
* Compliance → UKVI, visa status
* Audit → audit log for this student

**Commit:** `fix(ui): correct student profile tab content mapping`

#### Fix 2.3: Route Order Bugs (/create and /bulk-registration)

The wouter router is matching `/admin/students/create` as `/admin/students/:id` with id="create". Same for bulk-registration.

**Fix:** In the relevant router files, move static routes BEFORE parameterised routes:

```tsx
// BEFORE dynamic :id routes
<Route path="/admin/students/create" component={CreateStudent} />
<Route path="/admin/students/:id" component={StudentDetail} />
```

Check and fix this pattern for ALL routers that have both `/create` and `/:id` routes.

**Commit:** `fix(router): order static routes before parameterised routes`

#### Fix 2.4: Mobile Sidebar Dismiss

Read the sidebar component (likely in `client/src/components/layout/` or similar).

**Fix:**

* Add an overlay backdrop behind the sidebar on mobile that closes the sidebar on click/tap
* Ensure the hamburger toggle also closes the sidebar when it's already open
* Add Escape key handler to close sidebar

**Commit:** `fix(ui): add mobile sidebar dismiss via overlay + escape key`

#### Fix 2.5: Blank Admin Module Pages (LOWER PRIORITY — do as many as time allows)

The 12 blank admin modules need at minimum a proper empty state component instead of a blank white screen. For each blank module:

1. Read the existing page component — determine if it's returning null, has a broken import, or just has no content
2. If the component exists but returns nothing useful → add a proper placeholder:

```tsx
export default function ModulePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-2">Module Name</h1>
      <p className="text-muted-foreground">This module is under development and will be available in a future release.</p>
    </div>
  );
}
```

3. If the component imports data hooks that fail silently → add error boundaries and loading states

**Priority order for blank modules** (based on user importance):

1. Finance (7 sub-pages) — highest business value
2. Support/Tickets — student-facing
3. Attendance — used daily
4. Admissions — pipeline management
5. Documents — required for compliance
6. Compliance/UKVI — regulatory
7. Settings — admin config
8. Reports — analytics
9. EC \& Appeals
10. Governance
11. Timetable
12. Accommodation

For each module: check if the API endpoints return data (use `curl http://localhost:3001/api/v1/{module}` if the dev server is running — but DO NOT start the dev server yourself). If you can determine the API structure from the service files, wire the frontend hooks.

**IMPORTANT:** Do NOT spend more than 15 minutes per module. If a module needs significant work, add a proper placeholder component and move on. The goal is eliminating blank white screens, not building complete features.

**Commit per module group:** `feat(ui): wire \\\[module] admin pages with data hooks and loading states`

#### Fix 2.6: Non-Admin Portals (LOWEST PRIORITY — do if time allows)

The Academic, Student, and Applicant portals are completely blank. At minimum, each needs:

1. A layout shell (sidebar + header matching admin portal's pattern)
2. A dashboard page with stat cards reading from the existing API
3. Proper routing within the portal

**Read first:**

* The admin portal layout to understand the pattern
* `server/src/api/dashboard/dashboard.service.ts` — it already has `getStudentDashboard` and `getApplicantDashboard` functions
* The existing client-side hooks for dashboard data

**Start with Student Portal only** (highest user value):

* Dashboard with student's programme, modules, marks summary, attendance %
* My Modules page (read-only list of enrolled modules)
* My Marks page (read-only view of assessment results)

**Commit:** `feat(portal): implement student portal shell with dashboard + modules + marks`

If time allows after student portal, do Academic Portal, then Applicant Portal.

\---

### Rules (STRICT — read these)

* **British English** throughout — enrolment, programme, colour, organisation
* **One commit per logical fix** — not one mega-commit
* **Feature branch `fix/comet-test-findings`** — never commit to main
* **Run `npx tsc --noEmit` on both server and client after EVERY commit** — must stay at 0 errors
* **15-minute rule**: If any single bug takes >15 min, add a placeholder component and move on
* **Soft delete only**: Never use `prisma.Model.delete()` if you touch any service code
* **Do NOT modify `prisma/schema.prisma`** — schema is source of truth
* **Do NOT modify `.env.example`, `docker-compose.yml`, or Dockerfiles**
* **Do NOT install new npm packages** — work with what's already in package.json
* **Do NOT delete any existing components** — only fix or enhance
* **Test with `npx tsc --noEmit`** — do NOT start the dev server (you can't test visually)

### Stop Conditions — halt immediately if:

* You find yourself editing >40 files in a single commit (scope creep)
* `git diff --stat` shows >2000 lines changed total across all commits
* A fix requires changing the Prisma schema
* A fix requires installing new packages
* You've been working for >4 hours total
* Any fix breaks the TSC clean state (0 errors on server + client)

If you hit a stop condition, commit what you have, push, and add "STOPPED — \[reason]" to the final commit message.

### Commit Strategy

```bash
# After each fix:
cd "D:\\\\Projects\\\\sjms 2.5 New Build"
cd server \\\&\\\& npx tsc --noEmit 2>\\\&1 | tail -3
cd ../client \\\&\\\& npx tsc --noEmit 2>\\\&1 | tail -3
cd ..
git add \\\[specific files only]  # NEVER git add -A
git commit -m "fix/feat: description"
```

### When All Done

```bash
git push origin fix/comet-test-findings
# Create PR with full description of what was fixed
```

PR description must include:

* List of Comet test IDs addressed (e.g., "Fixes: 1.2 tab mismatch, 5.2 SPA crash, 5.2 no 404")
* For each fix: what was wrong, what you did, files changed
* Any fixes NOT attempted and why
* Final `npx tsc --noEmit` output for both server and client
* A summary of which Comet tests should now pass vs still failing

### DO NOT DO ANY OF THESE

* ❌ Do not start Phase 2 work (Keycloak, encryption, auth middleware)
* ❌ Do not wire the repository layer (Phase 3)
* ❌ Do not modify seed data or database schema
* ❌ Do not touch docker-compose.yml, Dockerfiles, or .env files
* ❌ Do not install or upgrade npm packages
* ❌ Do not start the dev server
* ❌ Do not spend >15 min on any single bug — placeholder and move on
* ❌ Do not create new API endpoints — only wire existing ones to frontend
* ❌ Do not use American English spellings

