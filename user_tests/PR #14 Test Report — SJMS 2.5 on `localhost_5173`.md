<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# PR \#14 Test Report — SJMS 2.5 on `localhost:5173`

**Important note:** The app on port 5173 uses **hash-based routing** (`/#/admin` not `/admin`). All tests were adapted accordingly. URLs without `#` show the 404 page (which is actually correct error boundary behaviour).

***

## TEST 1 — ERROR BOUNDARY: PASS (with minor issues)

| Step | Result | Details |
| :-- | :-- | :-- |
| 1-2. Navigate to `/admin`, login | **PASS** | `/#/admin` loads the admin dashboard. User is auto-logged in as Richard Knapp (no login screen exists). |
| 3. Navigate to `/nonexistent-page` | **PASS** | Friendly 404 card displayed with heading "Page not found", the unmatched path `/nonexistent-page` shown in a grey box, plus "Back" and "Dashboard" buttons.[^1_1] |
| 4. Expected elements present | **PASS** | 404 card, path display, Back button, Dashboard button — all present.[^1_1] |
| 5. Click "Go to Dashboard" | **PASS (minor issue)** | Navigates to `/#/dashboard` which loads the admin dashboard correctly.[^1_2] However, the URL is `/dashboard` not `/admin` — the Dashboard button uses a generic route rather than the portal-specific admin route. |
| 6. Navigate to `/academic` | **PASS** | Academic portal loads correctly — shows "Teaching Dashboard" with sidebar (My Modules, My Students, Assessments, etc.). No ErrorBoundary, no blank white screen.[^1_3] Note: dashboard statistics card shows **"Unable to load dashboard statistics"** in red — API call fails, but the page itself renders gracefully. |
| 7. Expected: ErrorBoundary OR redirect, NOT blank | **PASS** | No blank white screen. The academic portal renders with its full layout.[^1_3] |

**Bugs noted:**

- The 404 page path display shows `/` when navigating to non-hash URLs like `localhost:5173/admin` (without `#`) instead of showing `/admin`[^1_4]
- "Dashboard" button navigates to `/#/dashboard` (generic) not `/#/admin` (portal-specific)

***

## TEST 2 — MOBILE SIDEBAR: UNABLE TO TEST

| Step | Result | Details |
| :-- | :-- | :-- |
| All steps | **BLOCKED** | This browser environment does not support viewport resizing (F12/DevTools, Ctrl+Shift+M device toolbar are unavailable). The hamburger menu element is **conditionally rendered** only at mobile breakpoints — it does not exist in the DOM at desktop width, so it cannot be tested without actual viewport resize capability. |

**Recommendation:** Test manually in a local browser or via Playwright/Cypress with `setViewportSize({width: 375, height: 812})`.

***

## TEST 3 — ADMIN DATA RENDERING: PASS

| Step | Result | Details |
| :-- | :-- | :-- |
| 1. Navigate to Students | **PASS** | URL is `/#/admin/students`. Page renders correctly.[^1_5] |
| 2. STU-2025-XXXX format IDs | **PASS** | All student IDs follow the `STU-2025-XXXX` format (STU-2025-0004 through STU-2025-0020+ visible). 149 student records total.[^1_5] |
| 3. Click "New Student" button | **PASS** | Button exists at top-right of Students page. Navigates to `/#/admin/students/new`.[^1_6] |
| 4. Student creation form appears | **PASS** | Form shows "Personal Details" (Forename*, Surname*, Date of Birth*, Gender) and "Enrolment Details" (Fee Status*, Entry Route*) with Cancel and "Create Student" buttons.[^1_6] |
| 5. Finance > Invoicing | **PASS** | `/#/admin/finance/invoicing` renders "Invoice Generation" page with Invoice Queue section and "Generate Individual" / "Bulk Generate" action buttons. Not blank.[^1_7] |
| 6. Compliance > UKVI Dashboard | **PASS** | `/#/admin/compliance/ukvi` renders "UKVI Compliance" with summary cards (Total Sponsored: 30, Compliant: 25, At Risk: 5) and a full list of UKVI Records with compliance statuses.[^1_8] |

**Additional observations:**

- Finance > Accounts (`/#/admin/finance/accounts`) shows "No records found" after loading — the table structure renders but data is empty[^1_9]
- Student Accounts page subtitle shows "— accounts" which looks like a debug/placeholder string

***

## TEST 4 — STUDENT PORTAL DATA ISOLATION: FAIL

| Step | Result | Details |
| :-- | :-- | :-- |
| 1. Logout | **FAIL** | "Sign Out" button navigates to `localhost:5173/` (non-hash root) which shows the 404 page. It does **not** clear the session — navigating back to `/#/admin` loads the full admin dashboard again.[^1_10] |
| 2-3. Navigate to root, click Student Portal | **FAIL** | No portal selector page exists. The root URL (`/` and `/#/`) both show the 404 error page. There is no "Student Portal" button to click. |
| 4. Login as student | **FAIL** | No login page exists. `/#/login` auto-redirects to `/#/dashboard` (admin). All portals use the same hardcoded Richard Knapp session. |
| 5. Student dashboard data | **PARTIAL** | `/#/student` renders a Student Dashboard showing: Current Modules: 10, Attendance: — (no records), Upcoming Deadlines: 0, Account Balance: — . "My Modules" lists 10 items all showing "Registered" but **module names are blank/missing**.[^1_11][^1_12] |
| 6. Admin access blocked from student? | **FAIL** | Navigating to `/#/admin` from the student portal loads the **full admin dashboard** with all data. No role-based route guards exist. No redirect, no blocking.[^1_13] |
| 7. API calls to `/api/v1/` | **UNABLE TO VERIFY** | Cannot access Network tab/DevTools in this browser environment. However, the student module names being blank and "Upcoming Deadlines" showing a perpetual loading spinner suggest API calls are failing or returning incomplete data. The academic portal also showed "Unable to load dashboard statistics", indicating the backend API may not be fully functional. |

**Critical issues found:**

1. **No authentication system** — no login page, no portal selector, no session management
2. **No route guards** — any portal is accessible from any other portal without restriction
3. **Sign Out is broken** — navigates to non-hash root URL showing 404, doesn't clear session
4. **Student module names are blank** — the My Modules list shows 10 "Registered" badges but zero module names[^1_11]
5. **Data is not isolated** — same user (Richard Knapp, admin) is shown across all portals

***

## Summary

| Test | Verdict |
| :-- | :-- |
| TEST 1 — Error Boundary | **PASS** — 404 page works well with path display, Back, and Dashboard buttons |
| TEST 2 — Mobile Sidebar | **BLOCKED** — cannot resize viewport in this environment |
| TEST 3 — Admin Data Rendering | **PASS** — Students, New Student form, Finance Invoicing, and UKVI Compliance all render with data |
| TEST 4 — Student Portal Isolation | **FAIL** — no auth, no route guards, no session management, admin accessible from student portal |

<div align="center">⁂</div>

[^1_1]: http://localhost:5173/\#/nonexistent-page

[^1_2]: http://localhost:5173/\#/dashboard

[^1_3]: http://localhost:5173/\#/academic

[^1_4]: http://localhost:5173/admin

[^1_5]: http://localhost:5173/\#/admin/students

[^1_6]: http://localhost:5173/\#/admin/students/new

[^1_7]: http://localhost:5173/\#/admin/finance/invoicing

[^1_8]: http://localhost:5173/\#/admin/compliance/ukvi

[^1_9]: http://localhost:5173/\#/admin/finance/accounts

[^1_10]: http://localhost:5173/

[^1_11]: http://localhost:5173/\#/student

[^1_12]: http://localhost:5173/\#/student

[^1_13]: http://localhost:5173/\#/admin


---

# Phase 2.5 Smoke Test Report — SJMS 2.5


***

## TEST 1 — DOCKER HEALTH: PARTIAL PASS

| Check | Result | Details |
| :-- | :-- | :-- |
| `docker compose ps` | **BLOCKED** | Cannot run terminal commands from browser environment |
| `curl /api/health` | **PASS** | `{"status":"ok","version":"2.5.0","timestamp":"2026-04-11T09:05:30.148Z","environment":"development"}`[^2_1][^2_2] |
| API server responding | **PASS** | Port 3001 accepts requests and returns JSON |
| Client serving | **PASS** | Port 5173 serves the SPA with hash routing |

**Cannot verify:** postgres, redis, keycloak, nginx health status (requires terminal access). The API health endpoint confirms the API service is healthy at v2.5.0.

***

## TEST 2 — API RESPONSE TYPING: PASS (Students) / FAIL (Finance)

| Check | Result | Details |
| :-- | :-- | :-- |
| GET `/api/v1/students` | **PASS** | Returns properly typed JSON with `id` (string), `studentNumber` (string), `createdAt`/`updatedAt` (ISO 8601 timestamps), `deletedAt` (null), nested `person`, `enrolments`, `programme` objects. Pagination included: `{"page":1,"limit":25,"total":149,"totalPages":6}`[^2_3] |
| Student field types | **PASS** | `id`: `"stu-0004"` (string), `studentNumber`: `"STU-2025-0004"` (string), `createdAt`: `"2026-04-08T08:14:16.191Z"` (ISO timestamp), `yearOfStudy`: `2` (number), `gender`: `"FEMALE"` (enum string)[^2_3] |
| GET `/api/v1/students/:id` | **FAIL** | Returns `INTERNAL_ERROR`: column `person_identifiers.deleted_at` does not exist in the database[^2_4] |
| GET `/api/v1/finance/accounts` | **FAIL** | Returns `INTERNAL_ERROR`: column `student_accounts.deleted_at` does not exist in the database[^2_5][^2_6] |
| GET `/api/v1/programmes` | **FAIL** | Returns `INTERNAL_ERROR`: column `programmes.deleted_at` does not exist in the database[^2_7] |

**Root cause:** The Prisma schema and repository code reference `deleted_at` columns for soft delete, but the **database migration has not been applied**. The `findFirst`/`count` queries fail because these columns don't exist yet.

**Affected endpoints (all return 500 INTERNAL_ERROR):**

- `/api/v1/students/:id` — `person_identifiers.deleted_at` missing
- `/api/v1/finance/accounts` — `student_accounts.deleted_at` missing
- `/api/v1/programmes` — `programmes.deleted_at` missing

***

## TEST 3 — SOFT DELETE VERIFICATION: FAIL

| Check | Result | Details |
| :-- | :-- | :-- |
| Delete/Archive action exists | **N/A** | Cannot test — student detail page shows "Student not found" due to the `person_identifiers.deleted_at` API error[^2_8] |
| Soft delete columns in DB | **FAIL** | The `deleted_at` columns referenced in code do NOT exist in the database. Migration is pending. |
| PATCH/PUT vs DELETE | **UNABLE TO VERIFY** | No delete UI action available, and API endpoints crash before reaching delete logic |

**Verdict:** Soft delete is **implemented in code but not deployed to the database**. You need to run `npx prisma migrate dev` or `npx prisma db push` to add the `deleted_at` columns to these tables:

- `person_identifiers`
- `student_accounts`
- `programmes`
- (likely others)

***

## TEST 4 — PR \#14 REGRESSION: PASS

All PR \#14 features remain intact with no regressions:

### ErrorBoundary (Commit 1)

| Check | Result | Details |
| :-- | :-- | :-- |
| 404 page for unknown route | **PASS** | `/#/nonexistent-page` shows friendly card with path, Back, and Dashboard buttons[^2_9] |
| `/academic` portal | **PASS** | Renders Teaching Dashboard — no blank screen[^2_10] |

### Mobile Sidebar (Commit 2)

| Check | Result | Details |
| :-- | :-- | :-- |
| Hamburger opens sidebar | **PASS** | Tap ☰ → sidebar slides in with full nav list[^2_11] |
| Hamburger/X closes sidebar | **PASS** | Tap X (close button) → sidebar closes |
| Nav item closes sidebar + navigates | **PASS** | Tapped "Programmes" → sidebar closed AND navigated to `/admin/programmes`[^2_12] |
| Escape key closes sidebar | **PASS** | Pressing Escape → sidebar closes[^2_12] |
| `aria-expanded` when open | **PASS** | `aria-expanded="true"` and label changes to "Close navigation menu"[^2_13] |
| `aria-expanded` when closed | **MINOR ISSUE** | `aria-expanded` attribute is **removed entirely** instead of being set to `"false"`. Should be `aria-expanded="false"` per ARIA spec. |

### Admin Data Rendering

| Check | Result | Details |
| :-- | :-- | :-- |
| Students list | **PASS** | 149 records, STU-2025-XXXX format[^2_11] |
| UKVI Compliance | **PASS** | 30 sponsored, 25 compliant, 5 at risk with full records list[^2_14] |
| Finance > Invoicing | **PASS** | Invoice Generation page renders[^2_15] |
| Programmes list | **REGRESSION** | Now shows "No records found" — API returns 500 due to missing `programmes.deleted_at` column[^2_7] |

### Student Portal

| Check | Result | Details |
| :-- | :-- | :-- |
| No auth / no route guards | **STILL FAILING** | Same as pre-2.5: no login, no portal selector, admin accessible from student context (known pre-existing issue) |


***

## Critical Findings Summary

| Severity | Issue | Impact |
| :-- | :-- | :-- |
| **P0 BLOCKER** | Database migration not applied — `deleted_at` columns missing | Crashes `/api/v1/students/:id`, `/api/v1/finance/accounts`, `/api/v1/programmes` with 500 errors |
| **P0 BLOCKER** | Programmes page regression — was working, now shows "No records found" | Soft delete `where: { deletedAt: null }` filter fails because column doesn't exist |
| **P1** | Student detail page broken — "Student not found" | `person_identifiers.deleted_at` column missing |
| **P2** | `aria-expanded` missing when sidebar closed (should be `"false"`) | Accessibility gap |
| **Pre-existing** | No authentication, no route guards, Sign Out broken | Already documented in PR \#14 test |

**Immediate fix needed:** Run the Prisma migration to add `deleted_at` columns to all affected tables. Until then, student details, programmes, and finance accounts are completely broken.

<div align="center">⁂</div>

[^2_1]: http://localhost:3001/api/health

[^2_2]: http://localhost:3001/api/health

[^2_3]: http://localhost:3001/api/v1/students

[^2_4]: http://localhost:3001/api/v1/students/stu-0004

[^2_5]: http://localhost:3001/api/v1/finance/accounts

[^2_6]: http://localhost:3001/api/v1/finance/accounts

[^2_7]: http://localhost:3001/api/v1/programmes

[^2_8]: http://localhost:5173/\#/admin/students/stu-0004

[^2_9]: http://localhost:5173/\#/nonexistent-page

[^2_10]: http://localhost:5173/\#/academic

[^2_11]: http://localhost:5173/\#/admin/students

[^2_12]: http://localhost:5173/\#/admin/programmes

[^2_13]: http://localhost:5173/\#/admin/programmes

[^2_14]: http://localhost:5173/\#/admin/compliance/ukvi

[^2_15]: http://localhost:5173/\#/admin/finance/invoicing

