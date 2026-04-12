<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# SJMS 2.5 Smoke Test Report

**Important note:** The client runs on **port 5174** (not 5173). Port 5173 serves API proxy only. The API backend is proxied through 5173 (no standalone API port 3001 or 5001 running).

***

## TEST 1: API HEALTH — PASS

- `http://localhost:3001/api/health` → **ERR_CONNECTION_REFUSED**[^1_1]
- `http://localhost:5001/api/health` → **ERR_CONNECTION_REFUSED**[^1_2]
- `http://localhost:5174/api/health` → **HTTP 500**[^1_3]
- `http://localhost:5173/api/health` → **SUCCESS**[^1_4]
- JSON response: `{"status":"ok","version":"2.5.0","timestamp":"2026-04-11T14:16:26.657Z","environment":"development"}`
- `http://localhost:5173/api/v1/students` → Returns JSON with student records (150 students with enrolment data)[^1_5]
- **Working API port: 5173** (Vite proxy)

***

## TEST 2: ADMIN PORTAL LOADS — PASS (with caveats)

- `/#/admin/dashboard` → **BLANK page** — this route doesn't exist[^1_6]
- `/#/admin` → **LOADS correctly** — this is the actual dashboard route[^1_7]
- Dashboard shows: "Welcome back, Richard", roles: super admin, system admin, dean, +31 more
- **KPI cards:** Total Students: 150, Active Programmes: 33, Modules: 132, Active Enrolments: 114
- Recent Notifications: none. Upcoming Events: none.
- **Sidebar** (via hamburger menu): YES, contains 18 items + Sign Out[^1_7]
- **Note:** `/#/admin/dashboard` is not a valid route — the dashboard is at `/#/admin`

***

## TEST 3: ADMIN NAVIGATION — MIXED

| \# | Page | Route | Loads? | Has Data? |
| :-- | :-- | :-- | :-- | :-- |
| 1 | **Dashboard** | `/#/admin` | YES | YES — 4 KPI cards with counts |
| 2 | **Students** | `/#/admin/students` | YES | YES — 150 records, table with search, filters, pagination (25/page, 6 pages)[^1_8] |
| 3 | **Programmes** | `/#/admin/programmes` | YES | YES — 33 programmes with codes (PGR-BM-001, etc.)[^1_9] |
| 4 | **Modules** | `/#/admin/modules` | YES | YES — 132 modules[^1_10] |
| 5 | **Enrolments** | `/#/admin/enrolments` | YES | YES — 503 enrolment records[^1_11] |
| 6 | **Admissions** | `/#/admin/admissions` | REDIRECTS to dashboard | NO — no dedicated page |
| 7 | **Assessment** | `/#/admin/assessment` | REDIRECTS to dashboard | NO — no dedicated page |
| 8 | **Finance** | `/#/admin/finance` | REDIRECTS to dashboard | NO — no dedicated page |
| 9 | **Attendance** | `/#/admin/attendance` | REDIRECTS to dashboard | NO — no dedicated page |
| 10 | **Timetable** | `/#/admin/timetable` | YES | EMPTY — weekly calendar grid, "No timetable sessions found"[^1_12] |
| 11 | **Support** | `/#/admin/support` | REDIRECTS to dashboard | NO — no dedicated page |
| 12 | **Compliance** | `/#/admin/compliance` | REDIRECTS to dashboard | NO — no dedicated page |
| 13 | **EC \& Appeals** | `/#/admin/ec-appeals` | REDIRECTS to dashboard | NO — no dedicated page |
| 14 | **Documents** | `/#/admin/documents` | YES | PLACEHOLDER — "Document Management" description only[^1_13] |
| 15 | **Governance** | `/#/admin/governance` | REDIRECTS to dashboard | NO — no dedicated page |
| 16 | **Accommodation** | `/#/admin/accommodation` | REDIRECTS to dashboard | NO — no dedicated page |
| 17 | **Reports** | `/#/admin/reports` | REDIRECTS to dashboard | NO — no dedicated page |
| 18 | **Settings** | `/#/admin/settings` | REDIRECTS to dashboard | NO — no dedicated page |

**Summary:** 6 of 18 sidebar items have dedicated pages (Dashboard, Students, Programmes, Modules, Enrolments, Timetable). Documents has a placeholder. The remaining 11 silently redirect to dashboard — no "Coming Soon" or error page shown.

***

## TEST 4: ERROR BOUNDARY CHECK — FAIL

- `/#/admin/this-page-does-not-exist` → **Silently redirects to dashboard**[^1_14]
- No "Page not found" card visible
- No "Back" or "Dashboard" buttons
- The router catchall simply renders the admin dashboard for any unrecognized admin subroute

***

## TEST 5: STUDENT DATA DETAIL (admin view) — PASS

- Students table: 150 records shown, STU-2025-XXXX format[^1_8]
- **Search:** Typing "Taylor" filters to 6 results correctly[^1_8]
- **Pagination:** Showing 1–25 of 150, Page 1 of 6. Page 2 shows different students.
- **Student profile** (clicked STU-2025-0027, Mr Mohammed Clark):[^1_15]
    - Header: Name, student number, fee status badge (Home)
    - KPI cards: Student Number, Fee Status, Entry Route, Entry Date
    - **Tabs and status:**

| Tab | Status |
| :-- | :-- |
| Overview | WORKS — Key Details, Current Enrolments, Home Address |
| Personal | WORKS — shows Enrolment History table (3 years) |
| Academic | WORKS — same enrolment data |
| Finance | WORKS — Balance £0.00, Account History[^1_15] |
| Attendance | WORKS — Recent records (ABSENT/PRESENT)[^1_15] |
| Support | WORKS — "No support tickets" |
| Documents | WORKS — "No documents uploaded" |
| Compliance | WORKS — "UKVI compliance records are only applicable to overseas students" |
| Audit | WORKS — Record Created/Last Modified timestamps[^1_15] |


***

## TEST 6: PROGRAMMES PAGE — PASS

- 33 programmes listed with codes (PGR-BM-001, PGT-AI-001, etc.)[^1_9]
- Programme detail loads (PhD Business Management, PGR-BM-001)[^1_16]
- Detail shows: Level 8, 540 credits, 3 years, 2 currently enrolled
- Tabs: Overview, Specification, Modules, Students, Approval, Statistics
- **Linked Modules tab:** Shows 4 modules (RB8001–RB8004, CORE/OPTIONAL)[^1_16]

***

## TEST 7: STUDENT PORTAL — PASS

- `/#/student/dashboard` loads[^1_17]
- Shows: "Welcome, Richard — Student Dashboard"
- KPI cards: Current Modules: 10, Attendance: No records, Upcoming Deadlines: 5 (Due soon), Account Balance: —
- My Modules: 10 items (all "Registered")
- Upcoming Deadlines: 5 coursework items (PH6004, PH4002, PH4001, PH5003, AS4001)
- **Sidebar** (much shorter than admin): Dashboard, My Programme, Modules, Assessments, Timetable, Documents, Sign Out[^1_17]

| Sidebar Item | Route | Result |
| :-- | :-- | :-- |
| Dashboard | `/#/student/dashboard` | WORKS — shows data |
| My Programme | `/#/student/programme` | WORKS — BSc (Hons) Mathematics, UG-MA-001[^1_18] |
| Modules | `/#/student/modules` | LOADS — placeholder card only ("2025/26 Modules")[^1_19] |
| Assessments | `/#/student/assessments` | REDIRECTS to dashboard |
| Timetable | `/#/student/timetable` | LOADS — placeholder ("This Week")[^1_20] |
| Documents | `/#/student/documents` | WORKS — upload area + document list[^1_21] |


***

## TEST 8: ACADEMIC PORTAL — PASS

- `/#/academic/dashboard` loads[^1_22]
- Shows: "Welcome, Richard — Teaching Dashboard"
- KPI: Modules: 132, Marks to Submit: 100 (Pending), My Tutees: not configured, Teaching Hours: not configured
- Upcoming Deadlines and Recent Activity sections
- **Sidebar:** Dashboard, My Modules, My Students, Assessments, Timetable, Reports, Sign Out[^1_22]

| Sidebar Item | Route | Result |
| :-- | :-- | :-- |
| My Modules | `/#/academic/modules` | WORKS — grid of module cards with credits and status[^1_23] |
| My Students | `/#/academic/students` | REDIRECTS to dashboard |
| Assessments | `/#/academic/assessments` | REDIRECTS to dashboard |


***

## TEST 9: STUDENT CANNOT ACCESS ADMIN ROUTES — FAIL

- Set student persona at `/#/student/dashboard`
- Opened new tab → `/#/admin/students` → **Full student list loaded (150 records)**[^1_8]
- `/#/admin` → **Full admin dashboard with all KPI data visible**[^1_7]
- **No role-based access control enforced.** The URL hash alone determines the persona. Any user can access any portal by changing the URL. There is no server-side enforcement or client-side guard.

***

## TEST 10: STUDENT ENROLMENT OWNERSHIP — PASS (at UI level)

- Student dashboard shows student-specific data: Richard's 10 modules, BSc Mathematics programme
- The student portal UI restricts views to "my" data (My Programme, My Modules, My Documents)
- API calls return 200 (data renders successfully)
- **Caveat:** Since TEST 9 failed, the "ownership" is UI-level only — admin routes are accessible

***

## TEST 11: MOBILE RESPONSIVENESS — PASS

- The app already renders in mobile-responsive mode (the viewport throughout testing was narrow)
- Hamburger menu (three-line icon) present at top-left on all pages[^1_7]
- Clicking hamburger opens full sidebar overlay[^1_7]
- Clicking X or a nav link closes the sidebar and navigates
- Layout is single-column, cards stack vertically — responsive design works

***

## TEST 12: APPLICANT PORTAL — PASS

- `/#/applicant/dashboard` loads[^1_24]
- Shows: "Welcome, Richard — Application Portal"
- KPI cards: Application Status: UNDER REVIEW, Conditions: None, Next Event: none, Messages: No unread
- My Application: BSc (Hons) Astrophysics, 2026/27, Status: Under Review
- **Sidebar:** Dashboard, My Application, Programmes, Documents, Sign Out[^1_24]

***

## SUMMARY TABLE

| Test | Description | Result |
| :-- | :-- | :-- |
| 1 | API Health | **PASS** (port 5173 proxy) |
| 2 | Admin Portal Loads | **PASS** (route is `/#/admin` not `/#/admin/dashboard`) |
| 3 | Admin Navigation | **PARTIAL** — 6/18 sidebar items have pages, 11 redirect silently to dashboard |
| 4 | Error Boundary | **FAIL** — no 404 page, unknown routes fall to dashboard |
| 5 | Student Data Detail | **PASS** — all 9 profile tabs work |
| 6 | Programmes Page | **PASS** — detail page with linked modules |
| 7 | Student Portal | **PASS** — dashboard and 4/6 sidebar items work |
| 8 | Academic Portal | **PASS** — dashboard and My Modules work |
| 9 | Role Isolation | **FAIL** — no access control, any portal accessible via URL |
| 10 | Enrolment Ownership | **PASS** (UI level only) |
| 11 | Mobile Responsiveness | **PASS** — hamburger menu, responsive layout |
| 12 | Applicant Portal | **PASS** — dashboard shows application data |

## KEY ISSUES

1. **No standalone API server** — ports 3001 and 5001 refuse connections. API only accessible via Vite proxy on 5173.
2. **Client on 5174, not 5173** — the task instructions specify 5173 but the app runs on 5174.
3. **11 sidebar items have no dedicated page** — Admissions, Assessment, Finance, Attendance, Support, Compliance, EC \& Appeals, Governance, Accommodation, Reports, Settings all silently redirect to dashboard.
4. **No error boundary / 404 page** — unknown routes render the dashboard instead of a "Page not found" card.
5. **No role-based access control** — critical security issue. Persona is determined entirely by URL hash with no server-side or client-side enforcement.
6. **`/#/admin/dashboard` is a dead route** — renders blank. The correct dashboard route is `/#/admin`.

<div align="center">⁂</div>

[^1_1]: http://localhost:3001/api/health

[^1_2]: http://localhost:5001/api/health

[^1_3]: http://localhost:5174/api/health

[^1_4]: http://localhost:5173/api/health

[^1_5]: http://localhost:5173/api/v1/students

[^1_6]: http://localhost:5174/\#/admin/dashboard

[^1_7]: http://localhost:5174/\#/admin

[^1_8]: http://localhost:5174/\#/admin/students

[^1_9]: http://localhost:5174/\#/admin/programmes

[^1_10]: http://localhost:5174/\#/admin/modules

[^1_11]: http://localhost:5174/\#/admin/enrolments

[^1_12]: http://localhost:5174/\#/admin/timetable

[^1_13]: http://localhost:5174/\#/admin/documents

[^1_14]: http://localhost:5174/\#/admin/this-page-does-not-exist

[^1_15]: http://localhost:5174/\#/admin/students/stu-0027

[^1_16]: http://localhost:5174/\#/admin/programmes/prg-032

[^1_17]: http://localhost:5174/\#/student/dashboard

[^1_18]: http://localhost:5174/\#/student/programme

[^1_19]: http://localhost:5174/\#/student/modules

[^1_20]: http://localhost:5174/\#/student/timetable

[^1_21]: http://localhost:5174/\#/student/documents

[^1_22]: http://localhost:5174/\#/academic/dashboard

[^1_23]: http://localhost:5174/\#/academic/modules

[^1_24]: http://localhost:5174/\#/applicant/dashboard


---

# Ultrathink ROLE: FRONTEND_REMEDIATION_ENGINEER

PROJECT: D:\\Projects\\sjms 2.5 New Build
BRANCH: fix/comet-round-1-ui (create from main after latest merge)

Read .claude/skills/ before starting.

This session fixes 6 findings from the Comet browser smoke test.
All changes are client-side. One commit.

CURRENT STATE OF MAIN (after merge):

- 6959065 — applicant scope filtering wired
- 4a03521 — KI-001/002/003 closed in KNOWN_ISSUES.md
- 41ad587 — Prisma at sjms_app schema
- da143e6 — Phase 2.5 remediation (personas, ownership, skills)
- TSC clean both workspaces. 0 hard deletes. 42 deleted_at columns.
- Start: cd server \&\& npm run dev, cd client \&\& npm run dev
Client on 5174, Vite proxy on 5173, server on 3001.

═══════════════════════════════════════════════════════════════════
COMMIT 1: fix(ui): Comet smoke test round 1 — routes, empty states,
error boundary, persona names
═══════════════════════════════════════════════════════════════════

FINDING F2 — 11 admin sidebar items silently redirect to dashboard
These routes have no page component. Navigating to them silently
falls through to the dashboard catch-all with ZERO user feedback:

Admin portal (11):
/\#/admin/admissions
/\#/admin/assessment
/\#/admin/finance
/\#/admin/attendance
/\#/admin/support
/\#/admin/compliance
/\#/admin/ec-appeals
/\#/admin/governance
/\#/admin/accommodation
/\#/admin/reports
/\#/admin/settings

Student portal (1):
/\#/student/assessments

Academic portal (2):
/\#/academic/students
/\#/academic/assessments

FIX: Create a reusable component:
client/src/components/ComingSoon.tsx

interface ComingSoonProps {
title: string;
description?: string;
}

Renders a centered Card (shadcn/ui) containing:

- A construction/clock icon from lucide-react (e.g., Construction
or Wrench or Clock)
- The page title as a heading
- "This section is under development and will be available soon."
- A "Back to Dashboard" link/button that navigates to the portal
root (/\#/admin, /\#/student/dashboard, /\#/academic/dashboard)

Style: use existing Tailwind classes consistent with the design
system. Centered vertically and horizontally in the content area.
Muted text colour for the description.

Then register a route for EACH of the 14 items listed above so
they render <ComingSoon title="Finance" /> (etc.) instead of
falling through. The route registration goes in App.tsx or
wherever the portal route groups are defined.

IMPORTANT: Do NOT just add a single catch-all that renders
ComingSoon for everything. Each route must be explicit so that
genuinely unknown URLs still hit the NotFound page (see F3).

──────────────────────────────────────────────────────────────

FINDING F3 — No error boundary within portals
/\#/admin/this-page-does-not-exist renders the dashboard silently.
There is no "Page not found" feedback for unknown routes.

FIX: In the route configuration for EACH portal group
(admin, student, academic, applicant), ensure the LAST route
is a catch-all that renders a NotFound component:

For wouter:  <Route path="/admin/:rest*" component={NotFoundPage} />
For react-router: <Route path="*" element={<NotFoundPage />} />

The NotFoundPage should show:

- "Page Not Found" heading
- "The page you're looking for doesn't exist." message
- "Back to Dashboard" button

If a NotFound component already exists in the codebase, reuse it.
The key requirement: it must be registered AFTER all named routes
AND after all ComingSoon routes, so it only catches genuinely
unknown paths.

Test: /\#/admin/xyz → NotFound. /\#/admin/finance → ComingSoon.
/\#/admin/students → Students list (existing page).

──────────────────────────────────────────────────────────────

FINDING F4 — /\#/admin/dashboard is a dead route (blank page)
The dashboard lives at /\#/admin. Anyone typing or bookmarking
/\#/admin/dashboard sees a blank page.

FIX: Add a route so /\#/admin/dashboard renders the same Dashboard
component as /\#/admin. Either:
a) Add a second <Route path="/admin/dashboard" ...> pointing to
the same component, OR
b) Add a <Redirect from="/admin/dashboard" to="/admin" />

Do the same check for the other portals — ensure
/\#/student/dashboard, /\#/academic/dashboard, and
/\#/applicant/dashboard all work (Comet confirmed these DO work,
so this may only be needed for admin).

──────────────────────────────────────────────────────────────

FINDING F5 — Student Modules and Timetable show placeholder cards
/\#/student/modules shows "2025/26 Modules" placeholder card only.
/\#/student/timetable shows "This Week" placeholder only.

The student persona (stu-0001) has 10 module registrations — data
exists in the DB.

FIX: Investigate why these pages don't render data:
a) Does the component fetch from the API? If so, what endpoint?
b) Does the API return data for the student persona?
curl -s -H "X-Dev-Persona: student" \\
http://localhost:3001/api/v1/module-registrations | head -c 300
c) If the fetch works but rendering is broken, fix the component.
d) If these are genuinely unfinished stub pages, replace the
placeholder with the ComingSoon component.

For timetable: the admin timetable page (/\#/admin/timetable) loaded
but showed "No timetable sessions found" — this may be a seed data
gap, not a code bug. If there's no timetable data, ComingSoon or
an empty state is appropriate.

──────────────────────────────────────────────────────────────

FINDING F7 — Dev persona display names don't match seed data
The student portal shows "Welcome, Richard" — this is the admin
user's name bleeding into the student persona.

FIX: In server/src/middleware/auth.ts, find DEV_PERSONA_PAYLOADS.
Update the display names to match actual seed data:

Step 1 — query names from the DB:
docker exec sjms-postgres psql -U sjms -d sjms -c \\
"SELECT p.id, pn.forename, pn.surname
FROM sjms_app.persons p
JOIN sjms_app.person_names pn ON pn.person_id = p.id
WHERE p.id IN ('per-stu-0001', 'per-app-0001')
AND pn.name_type = 'CURRENT';"

Also find the academic persona's person:
docker exec sjms-postgres psql -U sjms -d sjms -c \\
"SELECT p.id, pn.forename, pn.surname
FROM sjms_app.persons p
JOIN sjms_app.person_names pn ON pn.person_id = p.id
JOIN sjms_app.person_contacts pc ON pc.person_id = p.id
WHERE pc.value = 'lecturer.demo@fhe.ac.uk'
AND pn.name_type = 'CURRENT';"

Step 2 — update DEV_PERSONA_PAYLOADS:
student persona: displayName → actual forename + surname from DB
academic persona: displayName → actual lecturer name from DB
applicant persona: displayName → actual applicant name from DB
admin persona: keep "Richard Knapp" (correct)

If the client reads displayName from the JWT payload or auth
context, this server-side change is sufficient. If the client
has a hardcoded "Richard" somewhere, fix that too.

══════════════════════════════════════════════════════════════
VERIFICATION
══════════════════════════════════════════════════════════════

1. cd server \&\& npx tsc --noEmit → 0 errors
2. cd ../client \&\& npx tsc --noEmit → 0 errors
3. Route tests (start server + client, check in browser or curl):
/\#/admin/dashboard     → Dashboard (not blank)
/\#/admin/finance       → ComingSoon card with "Finance" title
/\#/admin/settings      → ComingSoon card with "Settings" title
/\#/admin/reports       → ComingSoon card with "Reports" title
/\#/admin/xyz-not-real  → NotFound card
/\#/admin/students      → Student list (existing, unchanged)
/\#/student/assessments → ComingSoon card
/\#/academic/students   → ComingSoon card
/\#/academic/assessments→ ComingSoon card
4. Persona name check:
curl -s -H "X-Dev-Persona: student" \\
http://localhost:3001/api/v1/enrolments/enr-0001 | head -c 50
→ 200 (confirm student persona still works)
5. Count ComingSoon routes registered (should be 14):
grep -c "ComingSoon" client/src/App.tsx (or wherever routes live)

COMMIT: git add . \&\& git commit -m "fix(ui): Comet round 1 — ComingSoon empty states, NotFound error boundary, route aliases, persona names

- F2: 14 sidebar items (11 admin + 1 student + 2 academic) → ComingSoon component
- F3: NotFound catch-all within all 4 portal route groups
- F4: /\#/admin/dashboard route alias → Dashboard component
- F5: Student modules/timetable placeholder assessment
- F7: Dev persona displayName matches seed data for all 4 personas

Comet findings: F1 (role isolation) documented as dev-mode by-design.
F8 (port 3001) is test environment config, not a bug."

git push origin fix/comet-round-1-ui

Then open PR to main:
Title: "fix(ui): Comet round 1 — empty states, error boundary, persona names"
Then merge it.

Report EXACT output of all verification commands. Then STOP.

Based on the App.tsx source I extracted from the Vite dev server (decoded from the sourcemap), I have full understanding of the routing architecture. The app uses **wouter v3** with `useHashLocation`, routing each portal to its own sub-router. Let me generate all the code changes.
<span style="display:none">[^2_1]</span>

<div align="center">⁂</div>

[^2_1]: http://localhost:5174/\#/admin/finance/accounts

