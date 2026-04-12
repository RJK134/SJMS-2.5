# SJMS 2.5 — Revised Build/Test/Verify Cycle

## Senior Engineering Assessment

The Keycloak login failure exposed a structural gap in the SJMS 2.5 build process: **zero layers of the current verification cycle test runtime behaviour**. TypeScript compilation, Prisma validation, Docker config checks, and file-counting are all static analysis. They confirm code is syntactically correct — not that it works when systems communicate at runtime.

This document defines a revised, multi-tool verification cycle that closes that gap using all available tools: **Claude Code** (build + terminal verification), **Perplexity** (static code review + prompt generation), **Comet Browser** (runtime UI smoke tests), **Cursor Pro** (deep codebase analysis), and **GitHub Copilot** (PR-level code review).

---

## Tool Capabilities Matrix

| Tool | Strength | Limitation | Best Use In Cycle |
|------|----------|------------|-------------------|
| **Claude Code** | Builds code, runs terminal commands (tsc, curl, docker) | Cannot open a browser; marks its own homework | Build execution + terminal-based API verification |
| **Perplexity** | Deep static analysis, prompt design, architectural review | No runtime access, no browser, no repo clone | Verify prompt execution, cross-phase coherence review |
| **Comet Browser** | AI-driven browser automation, DOM interaction, accessibility tree | Brittle with complex SPAs; needs clear, step-by-step prompts | Runtime UI smoke tests — login, navigation, data rendering |
| **Cursor Pro** | Full codebase indexing, cross-file analysis, refactoring | IDE-bound, manual invocation | Deep code review: dead code, type coherence, import chains |
| **GitHub Copilot** | PR-level review, security scanning (CodeQL), auto-suggestions | Misses cross-service architectural issues; ~60% useful hit rate | Automated PR review gate on every push |

---

## The Revised 5-Layer Verification Cycle

Every phase now passes through **five layers** before receiving GO status:

### Layer 1: Claude Code Self-Test (Terminal)
*Already exists — enhanced with mandatory curl tests*

After build completion, Claude Code must:
- Run `npx tsc --noEmit` (both server and client)
- Run `docker compose config` validation
- Run `npx prisma validate` (if schema changed)
- **NEW**: Start the server and execute curl commands against live endpoints
- **NEW**: Report actual HTTP status codes and response bodies (not just "it works")

### Layer 2: Perplexity Static Review (Code Analysis)
*Already exists — the current Verify Prompts*

Perplexity reviews:
- File counts, structure, naming conventions
- Code patterns (British English, Prisma conventions, Zod schemas)
- Cross-phase coherence (does Phase 3 use Phase 2's auth middleware correctly?)
- Architectural consistency

### Layer 3: Comet Browser Smoke Test (Runtime UI)
*NEW — closes the critical gap*

Comet Browser executes a scripted UI test:
- Navigates to the application URL
- Performs login via Keycloak
- Verifies page rendering, data display, navigation
- Reports what it sees (or fails to see)

### Layer 4: Cursor Pro Deep Review (Codebase Analysis)
*NEW — periodic deep dives*

At milestone phases (2, 5, 7, 9), open the project in Cursor and run:
- "Review this codebase for dead imports, unused exports, and circular dependencies"
- "Check all API routes for consistent error handling patterns"
- "Verify all Prisma queries use select/include efficiently"
- "Find any hardcoded values that should be environment variables"

### Layer 5: GitHub Copilot PR Review (Automated Gate)
*NEW — on every git push*

Configure Copilot as automatic reviewer on RJK134/SJMS-2.5:
- Every push triggers Copilot code review
- Review catches: logic bugs, style inconsistencies, potential security issues
- CodeQL integration for security vulnerability scanning
- Must resolve all "critical" and "high" Copilot findings before proceeding

---

## Comet Browser Smoke Test Prompts

### Phase 2 Smoke Test — Authentication & Role-Based Access

Paste this into Comet Browser's assistant:

```
I need you to test a web application running at http://localhost:5173

TEST 1 — Admin Login Flow
1. Navigate to http://localhost:5173
2. You should see a login page with portal selection cards (Staff, Academic, Student, Applicant). Tell me what you see on this page.
3. Click the "Staff" portal card
4. You will be redirected to a Keycloak login page at localhost:8080. On the Keycloak login form, enter:
   - Username: richard.knapp@fhe.ac.uk
   - Password: Fhe100@
5. Click the "Sign In" button
6. After login, tell me:
   - What URL are you now on?
   - What page content do you see? (heading, sidebar items, any dashboard content)
   - Is there a sidebar navigation? If yes, list the top-level menu items you can see
   - Is the user's name displayed anywhere?

TEST 2 — Student Login Flow
1. If there is a logout button or user menu, click it to log out. If not, navigate directly to http://localhost:5173
2. Click the "Student" portal card
3. On the Keycloak login form, enter:
   - Username: student@fhe.ac.uk
   - Password: Fhe100@
4. Click "Sign In"
5. After login, tell me:
   - What page do you see?
   - What sidebar/navigation items are available?
   - Can you see any student-specific data (name, student number, programme)?
   - Is the sidebar different from the admin sidebar? (should be much shorter)

TEST 3 — Role Isolation Check
1. While logged in as the student, try navigating directly to http://localhost:5173/#/students
2. Tell me what happens — do you see the full student list, or are you blocked/redirected?

Report exactly what you see at each step. Include any error messages, blank pages, or unexpected behaviour.
```

### Phase 3 Smoke Test — API Data Flow & Page Rendering

Paste this into Comet Browser's assistant:

```
I need you to test API data rendering in a web application at http://localhost:5173

PREREQUISITE — Login as Admin
1. Navigate to http://localhost:5173
2. Click the "Staff" portal card
3. On the Keycloak login page, enter:
   - Username: richard.knapp@fhe.ac.uk
   - Password: Fhe100@
4. Click "Sign In"

TEST 1 — Student List Page
1. In the sidebar navigation, click "Students" (or the equivalent menu item)
2. Tell me:
   - Does a table/list of students appear?
   - How many students are shown? (should be 25 per page with pagination)
   - Can you see student names, student numbers (STU-2025-XXXX format), and programme names?
   - Is there a search box? If yes, type "Smith" and tell me if the results filter
   - Is there pagination? If yes, click page 2 and confirm different students appear

TEST 2 — Student Profile Page
1. Click on any student name/row in the list
2. Tell me:
   - Does a student profile page load?
   - What tabs or sections are visible? (e.g., Personal, Programme, Modules, Finance, Attendance)
   - Is there real data displayed (not placeholder text or empty sections)?
   - Click the "Modules" tab (or equivalent) — do module registrations appear?

TEST 3 — Programmes Page
1. Go back to the sidebar and click "Programmes"
2. Tell me:
   - Does a list of programmes appear?
   - How many are shown?
   - Can you see programme codes (like UG-CS-001)?
   - Click one programme — does a detail page load with modules listed?

TEST 4 — Finance Page
1. In the sidebar, click "Finance" then "Accounts" (or equivalent)
2. Tell me:
   - Does a finance page load?
   - Can you see student accounts with balances?
   - Click any account — do charge lines and payments appear?

Report exactly what you see at each step. Screenshots would be helpful. Note any blank pages, loading spinners that never resolve, error messages, or missing data.
```

---

## Cursor Pro Review Prompts

### After Phase 3 (API Decomposition) — Open project in Cursor, run these in Cursor Chat:

**Prompt 1 — Cross-Module Consistency:**
```
Review all 37 API modules under server/src/api/. For each module, check:
1. Does every router.ts import and use authenticateJWT middleware?
2. Does every controller.ts call the service layer (not the repository directly)?
3. Does every service.ts call the audit logger on create/update/delete?
4. Are all Zod schemas in schema.ts files consistent in their pagination parameter definitions?
5. Are there any routes missing role-based access control (requireRole)?
List any modules that deviate from the pattern.
```

**Prompt 2 — Dead Code & Import Health:**
```
Scan the entire server/src/ directory:
1. Find any exported functions or types that are never imported anywhere
2. Find any imported modules that are never used
3. Check for circular dependency chains between modules
4. Find any TODO, FIXME, or HACK comments that indicate incomplete work
5. Check if any file imports from '@prisma/client' directly instead of using the singleton from utils/prisma.ts
```

**Prompt 3 — Frontend-Backend Contract:**
```
Compare the Zod schemas in server/src/api/*/schema.ts with the TypeScript interfaces used in client/src/. For the students, programmes, and enrolments modules:
1. Do the frontend type definitions match the backend Zod schemas?
2. Are there fields the frontend expects that the backend doesn't provide?
3. Are there API response shapes that don't match what the frontend axios calls expect?
4. Check the API client in client/src/lib/api.ts — does it handle pagination metadata correctly?
```

### After Phase 5 (Frontend) — Additional Cursor review:

**Prompt 4 — Route & Navigation Audit:**
```
Review client/src/App.tsx and all layout components:
1. List every route defined in the router
2. For each route, verify the corresponding page component file exists
3. Check that all sidebar menu items in StaffLayout, AcademicLayout, StudentLayout, and ApplicantLayout have matching routes
4. Find any routes that exist but have no sidebar navigation link (orphan pages)
5. Find any sidebar links that point to routes that don't exist (broken navigation)
```

---

## GitHub Copilot Setup — Automated PR Review Gate

### One-Time Configuration

1. Go to https://github.com/RJK134/SJMS-2.5/settings
2. Under **Code review** → Enable "Copilot Code Review"
3. Set to **Automatic** — reviews every PR automatically
4. Under **Branch protection rules** for `main`:
   - Require pull request reviews before merging
   - Add **Copilot** as a required reviewer
   - Enable **CodeQL** analysis via GitHub Actions

### Workflow Change
Instead of committing directly to `main`, Claude Code should:
```
git checkout -b phase-X-description
git add .
git commit -m "feat: Phase X — description"
git push origin phase-X-description
```
Then create a PR → Copilot auto-reviews → resolve findings → merge to main.

This adds ~5 minutes per phase but catches issues Claude Code cannot self-detect.

### What Copilot Catches That Claude Misses
- Security vulnerabilities via CodeQL (SQL injection patterns, XSS vectors, secrets in code)
- Style inconsistencies across files (Copilot sees the diff, not just the current state)
- Logic bugs from operator confusion (=== vs ==, off-by-one errors)
- Missing null checks and unhandled promise rejections

### What Copilot Does NOT Catch
- Cross-service integration issues (the Keycloak class of bug)
- Business logic correctness (does the engagement score formula match the spec?)
- Runtime configuration problems (port mismatches, environment variable gaps)
- UI/UX issues (does the page actually look right?)

This is why all five layers are needed — no single tool covers everything.

---

## Revised Phase Workflow Summary

For each phase, execute in this order:

| Step | Tool | Action | Time |
|------|------|--------|------|
| 1 | **Claude Code** | Execute Build Prompt | 10-45 min |
| 2 | **Claude Code** | Run terminal self-test (tsc + curl + docker) | 5 min |
| 3 | **GitHub Copilot** | Push branch → auto PR review → resolve findings | 5-10 min |
| 4 | **Perplexity** | Execute Verify Prompt (static analysis) | 10-15 min |
| 5 | **Comet Browser** | Execute Smoke Test Prompt (runtime UI) | 5-10 min |
| 6 | **Cursor Pro** | Deep review (milestone phases only: 2, 5, 7, 9) | 15-20 min |
| 7 | **You** | Manual 2-minute sanity check in browser | 2 min |

**Total overhead per phase**: ~25-45 minutes (vs. current ~15 minutes)
**Bug prevention value**: Catches the entire class of runtime integration bugs that the current cycle misses

---

## Phase-Specific Smoke Test Prompts (Phases 4-9)

### Phase 4 — RED Workstream Enhancements
```
Login as admin (richard.knapp@fhe.ac.uk / Fhe100@) at http://localhost:5173
1. Navigate to any student profile
2. Click the "Personal" or "Identity" tab
3. Can you see effective-dated name history (current name with start date, any previous names)?
4. Navigate to Reports > HESA (or similar)
5. Does the HESA reporting page load?
6. Can you see Data Futures entity mappings?
Report what you see at each step.
```

### Phase 5 — Frontend Portal Build (Critical — 136 pages)
```
Login as admin (richard.knapp@fhe.ac.uk / Fhe100@) at http://localhost:5173

NAVIGATION AUDIT — Click through EVERY top-level sidebar item and report:
1. For each item: does the page load, or do you get a blank page/error?
2. List any sidebar items that lead to blank pages or "Page not found"
3. List any pages that show a loading spinner but never finish loading

Then test these specific pages:
- Students > List — does the table render with data?
- Admissions > Applications — does the list show applicant data?
- Assessment > Marks Entry — can you select a module and see a marks grid?
- Finance > Invoices — does the invoice list load?
- Attendance > Engagement — do engagement scores appear?
- Support > Tickets — does the ticket list render?
- UKVI > Records — do UKVI records appear?
- Settings > Audit Log — do audit entries appear?

Report exactly what works and what doesn't.
```

### Phase 6 — n8n Workflow Automation
```
Login as admin at http://localhost:5173

TEST 1: Navigate to Students > Create New Student (or equivalent)
1. Fill in the form with test data and submit
2. Did the creation succeed? Is the student visible in the list?
3. Now navigate to http://localhost:5678 (n8n)
4. Click "Executions" in the n8n sidebar
5. Do you see a recent execution for "student-welcome-journey" or similar workflow?
6. Was the execution successful (green) or failed (red)?

TEST 2: Navigate back to the SJMS application
1. Go to Communications > Logs (or equivalent)
2. Can you see a communication log entry for the student you just created?

Report what you see at each step.
```

### Phase 7 — Integration Layer
```
Login as admin at http://localhost:5173

TEST 1 — Document Upload
1. Navigate to any student profile, then to Documents tab
2. Is there an "Upload Document" button?
3. Click it and try uploading a small PDF or image file
4. Does the upload succeed? Does the document appear in the list?
5. Can you click the document to download/view it?

TEST 2 — Integration Health
1. Navigate to Settings > Integration Health (or the system dashboard)
2. Does it show connection status for PostgreSQL, Redis, MinIO, Keycloak, n8n?
3. Are all services showing as "connected" or "healthy"?

Report what you see.
```

### Phase 8 — AMBER/GREEN Workstreams
```
Login as admin at http://localhost:5173

TEST 1 — Engagement Scores
1. Navigate to Attendance > Engagement (or equivalent)
2. Do engagement scores load for students?
3. Can you see risk levels (GREEN/AMBER/RED)?
4. Click a RED student — does their detail show intervention history?

TEST 2 — Report Builder
1. Navigate to Reports > Report Builder (or Custom Reports)
2. Does the report builder interface load?
3. Can you select an entity type and fields?
4. Try generating a simple report — does CSV/data output appear?

TEST 3 — Accommodation
1. Navigate to Accommodation > Blocks (or Rooms)
2. Does the page load with data?
3. Click a room — can you see booking status?

Report what you see.
```

### Phase 9 — QA, Performance, Production
```
Login as admin at http://localhost:5173

FULL END-TO-END FLOW:
1. Create a new student (Students > Create)
2. Create an enrolment for that student
3. Register the student for a module
4. Navigate to Marks Entry, find the module, enter a mark for the student
5. View the student profile — verify all data appears across tabs
6. Check the Audit Log — do entries exist for each operation you just performed?

PERFORMANCE CHECK:
7. Navigate to the Students list — does it load within 2 seconds?
8. Search for a student — does the search respond within 1 second?
9. Navigate between pages rapidly — any blank flashes or errors?

ACCESSIBILITY CHECK:
10. Can you Tab through the navigation using only keyboard?
11. Do form fields have visible labels?
12. Is the text readable (sufficient contrast)?

Report everything.
```

---

## When To Use Each Tool — Decision Tree

```
Question: "Does the code compile?"
  → Claude Code (tsc --noEmit)

Question: "Is the code pattern correct?"
  → Perplexity (Verify Prompt) + Cursor Pro

Question: "Does the API return correct data?"
  → Claude Code (curl commands against running server)

Question: "Does the page actually render in a browser?"
  → Comet Browser (Smoke Test Prompt)

Question: "Are there security vulnerabilities?"
  → GitHub Copilot (CodeQL) + Cursor Pro

Question: "Does the login flow work end-to-end?"
  → Comet Browser (ONLY tool that can test this)

Question: "Is the code architecturally consistent?"
  → Cursor Pro (codebase-wide analysis)
```

---

## Implementation Priority

1. **Immediate (Phase 2 onwards)**: Add Comet Browser smoke tests — this is the single highest-value change
2. **Immediate**: Add Claude Code curl tests to every build prompt's acceptance criteria
3. **This week**: Enable GitHub Copilot auto-review on the repository
4. **Phase 5**: First Cursor Pro deep review (this is when the codebase is large enough to benefit)
5. **Phase 9**: Full tool convergence — all five layers active simultaneously
