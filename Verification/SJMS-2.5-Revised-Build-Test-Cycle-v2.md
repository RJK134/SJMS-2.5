# SJMS 2.5 — Revised Multi-Tool Build/Test/Verify/Fix Cycle

**Version 2.0 — April 2026**
**Classification: CONFIDENTIAL**

---

## How to Use This Document

This document replaces the original two-tool workflow (Claude Code + Perplexity) with a **five-tool cycle** that closes the runtime verification gap exposed during Phase 2 smoke testing. It incorporates:

- **Claude Code** — Build execution + terminal verification (tsc, curl, docker)
- **Perplexity** — Static code review + architectural coherence analysis
- **Comet Browser** — Runtime UI smoke tests (login flows, data rendering, navigation)
- **Cursor Pro** — Deep codebase analysis (cross-file consistency, dead code, contract matching)
- **GitHub Copilot** — Automated PR review + CodeQL security scanning

### Document Structure

| Section | Purpose |
|---------|---------|
| Part 1 | Revised Build/Test Cycle Matrix — the visual map of all steps |
| Part 2 | Retrospective Remediation — Comet test prompts for Phases 0–5 (already built) |
| Part 3 | Forward Build Prompts — Phases 6–9 with multi-tool verification baked in |
| Part 4 | Comet Browser Test 1 Remediation Prompts — Claude Code fix prompts |
| Part 5 | Tool Setup Guide — one-time configuration for each tool |

---

# PART 1 — THE REVISED BUILD/TEST CYCLE

## Cycle Overview

Every phase now follows a **7-step cycle**. No phase receives GO status until all 7 steps pass.

```
┌─────────────────────────────────────────────────────────────┐
│                    PHASE N BUILD CYCLE                       │
│                                                             │
│  Step 1: CLAUDE CODE — Execute Build Prompt                 │
│     ↓                                                       │
│  Step 2: CLAUDE CODE — Terminal Self-Test                   │
│     │  • npx tsc --noEmit (server + client)                 │
│     │  • docker compose config                              │
│     │  • curl tests against running API                     │
│     │  • npx prisma validate (if schema changed)            │
│     ↓                                                       │
│  Step 3: GITHUB COPILOT — Push branch → Auto PR review     │
│     │  • CodeQL security scan                               │
│     │  • Style/logic review                                 │
│     │  • Resolve all critical/high findings                 │
│     ↓                                                       │
│  Step 4: PERPLEXITY — Execute Verify Prompt                 │
│     │  • Static code analysis                               │
│     │  • File counts, patterns, naming                      │
│     │  • Cross-phase coherence check                        │
│     ↓                                                       │
│  Step 5: COMET BROWSER — Execute Smoke Test Prompt          │
│     │  • Login flow verification                            │
│     │  • Page rendering with real data                      │
│     │  • Role-based navigation check                        │
│     │  • Cross-portal data isolation                        │
│     ↓                                                       │
│  Step 6: CURSOR PRO — Deep Review (milestone phases only)   │
│     │  • Cross-file type consistency                        │
│     │  • Dead code / unused exports                         │
│     │  • Frontend-backend contract matching                 │
│     ↓                                                       │
│  Step 7: MANUAL — 2-minute sanity check in browser          │
│     │  • Quick visual inspection                            │
│     │  • Click critical path once                           │
│     ↓                                                       │
│  ┌─────────────────────────────────┐                        │
│  │  ALL PASS? → GO for Phase N+1   │                        │
│  │  ANY FAIL? → Fix Cycle          │                        │
│  └─────────────────────────────────┘                        │
│                                                             │
│  FIX CYCLE (when findings exist):                           │
│     1. Create Claude Code Remediation Prompt from findings  │
│     2. Execute remediation in Claude Code                   │
│     3. Re-run Steps 2 + 5 (terminal + Comet) to verify     │
│     4. Only then proceed to next phase                      │
└─────────────────────────────────────────────────────────────┘
```

## Phase-by-Phase Tool Matrix

| Phase | Description | Step 1: Claude Code Build | Step 2: Terminal Test | Step 3: Copilot PR | Step 4: Perplexity Verify | Step 5: Comet Smoke | Step 6: Cursor Deep | Step 7: Manual |
|-------|-------------|---------------------------|----------------------|--------------------|--------------------------|--------------------|--------------------| ---------------|
| 0 | Bootstrap | Build Prompt 0 | tsc, docker config | PR review | Verify Prompt 0 | Health check only | — | Check localhost |
| 1A | Schema | Build Prompt 1A | prisma validate, db push | PR review | Verify Prompt 1 | — (no UI change) | — | — |
| 1B | Seed + Repos | Build Prompt 1B | tsc, seed run, curl | PR review | Verify Prompt 1 | — (no UI change) | — | — |
| 2 | Auth/Security | Build Prompt 2 | tsc, curl JWT, curl roles | PR review | Verify Prompt 2 | **Login flows, sidebars, data scoping** | **Full review** | Login all 4 portals |
| 3 | API Modules | Build Prompt 3 | tsc, curl all 37 modules | PR review | Verify Prompt 3 | **Data rendering, pagination, search** | — | Browse 5 pages |
| 4 | RED Workstream | Build Prompt 4 | tsc, prisma migrate, curl | PR review | Verify Prompt 4 | **Effective-dated data, HESA pages** | — | Check person history |
| 5 | Frontend 136pp | Build Prompt 5 | tsc, lighthouse | PR review | Verify Prompt 5 | **Full navigation audit, all portals** | **Full review** | Browse 10 pages |
| 6 | n8n Workflows | Build Prompt 6 | tsc, curl webhooks, n8n API | PR review | Verify Prompt 6 | **Create student → check n8n fired** | — | Check n8n executions |
| 7 | Integrations | Build Prompt 7 | tsc, curl uploads, curl analytics | PR review | Verify Prompt 7 | **File upload, integration health page** | **Full review** | Upload a document |
| 8 | AMBER/GREEN | Build Prompt 8 | tsc, curl engagement, curl comms | PR review | Verify Prompt 8 | **Engagement scores, report builder, accommodation** | — | Generate a report |
| 9 | QA/Production | Build Prompt 9 | Playwright, k6, security scan | PR review | Verify Prompt 9 | **Full E2E journey, accessibility** | **Full review** | Full walkthrough |

### When Cursor Pro Deep Review is Required

Cursor deep reviews are scheduled at **4 milestone phases** where the codebase grows significantly:

| Phase | Cursor Focus | Why |
|-------|-------------|-----|
| Phase 2 | Auth middleware consistency, role hierarchy correctness, data scoping logic | Authentication touches every file — mistakes compound |
| Phase 5 | Route-navigation matching, component-API contract, dead imports | 136 new pages = highest risk of orphan routes and broken links |
| Phase 7 | Integration service patterns, error handling consistency, env var usage | External systems = highest risk of config bugs |
| Phase 9 | Full codebase health, test coverage gaps, production readiness | Final quality gate before deployment |

---

## Fix Cycle Detail

When Comet, Copilot, Perplexity, or Cursor finds issues:

```
FINDING → TRIAGE → REMEDIATE → RE-VERIFY → GO

1. TRIAGE: Classify each finding
   - Critical: Data leak, security hole, broken core flow → Fix immediately
   - High: Missing feature, incorrect data, broken page → Fix before next phase
   - Medium: UX issue, naming, cosmetic → Fix in batch before Phase 9
   - Low: Minor label, date format → Log for Phase 9 polish

2. REMEDIATE: Create a Claude Code Remediation Prompt
   - One prompt per finding set (batch related fixes)
   - Include exact file paths and expected behaviour
   - Include verification commands Claude must run after fixing

3. RE-VERIFY: Re-run the test that found the issue
   - Comet finding → Re-run Comet smoke test
   - Copilot finding → Re-push branch for re-review
   - Cursor finding → Re-run the same Cursor prompt
   - Perplexity finding → Re-run verify prompt section

4. GO: Only when re-verification passes
```

---

# PART 2 — RETROSPECTIVE REMEDIATION FOR PHASES 0–5

These are Comet Browser and Cursor Pro prompts to retrospectively test the already-built phases. Run these to establish a baseline of runtime quality before proceeding to Phase 6.

## Comet Browser: Phase 0 Retrospective Smoke Test

```
Navigate to http://localhost:5173

BASIC HEALTH CHECK:
1. Does the page load? What do you see?
2. Is there a "Future Horizons Education" header/logo?
3. Are there portal selection cards visible?
4. Open browser dev tools (F12) — are there any red errors in the Console?
5. Navigate to http://localhost:3001/api/health — what does the response say?

Report exactly what you see.
```

## Comet Browser: Phase 1B Retrospective — Data Verification

```
PREREQUISITE: Login as admin at http://localhost:5173
- Click "Admin Portal" (or "Staff Portal")
- Keycloak login: richard.knapp@fhe.ac.uk / Fhe100@

DATA VERIFICATION:
1. Navigate to Students in the sidebar
2. Does the student list load? How many total students does it report?
3. Click page 2 (or scroll) — do more students appear?
4. Does each student row show a student number in STU-2025-XXXX format?
5. Navigate to Programmes — how many programmes are listed?
6. Do programme codes follow UG-XX-NNN or PGT-XX-NNN format?
7. Navigate to Modules — are modules listed with credit values?

Report exact counts and any issues.
```

## Comet Browser: Phase 2 Smoke Test (ALREADY EXECUTED — Test 1)

*Results from Test 1 are documented. See Part 4 for remediation prompts.*

## Comet Browser: Phase 3 Retrospective — API Data Rendering

```
PREREQUISITE: Login as admin at http://localhost:5173
- Click "Staff Portal" / "Admin Portal"
- Keycloak login: richard.knapp@fhe.ac.uk / Fhe100@

API DATA RENDERING:
1. Navigate to Students — does the list show real data with names and student numbers?
2. Click any student name — does a profile page load?
3. On the student profile, click through each tab (Personal, Programme, Modules, Assessment, Finance, Attendance, Documents, UKVI if visible)
4. For each tab, report: Does it show data, show "No data", show a loading spinner, or show an error?
5. Go back to the sidebar. Click Programmes > pick any programme > does it show linked modules?
6. Click Admissions > Applications — are applications listed?
7. Click Finance > Accounts — do student accounts appear with balances?
8. Click Attendance > Engagement — do engagement scores appear?
9. Click UKVI > Records — do compliance records appear?
10. Click Settings > Audit Log — do audit entries appear?

For each page, report: WORKS (shows data), EMPTY (no data message), LOADING (spinner never resolves), ERROR (shows error), or BLANK (nothing renders).
```

## Comet Browser: Phase 4 Retrospective — RED Workstream Data

```
PREREQUISITE: Login as admin at http://localhost:5173
Login: richard.knapp@fhe.ac.uk / Fhe100@

EFFECTIVE-DATED IDENTITY:
1. Navigate to any student profile
2. Click the Personal or Identity tab
3. Can you see name history with dates (current name, any previous names)?
4. Can you see address history with start/end dates?
5. Can you see contact details with primary flags?

HESA DATA:
6. Navigate to Reports > HESA (or similar)
7. Does a HESA reporting page load?
8. Can you see Data Futures entity references?

FINANCE:
9. Navigate to Finance > Accounts
10. Click any student account
11. Can you see charge lines (tuition fees, bench fees)?
12. Can you see payment records?
13. Does the balance calculation look correct (charges minus payments)?

Report what you see at each step.
```

## Comet Browser: Phase 5 Retrospective — Full Navigation Audit

```
PREREQUISITE: Login as admin at http://localhost:5173
Login: richard.knapp@fhe.ac.uk / Fhe100@

NAVIGATION AUDIT — Click through EVERY top-level sidebar item and report for each:
- Page name
- Does it load? (YES / BLANK / ERROR / LOADING)
- Does it show data? (YES / EMPTY / PLACEHOLDER)

Expected sidebar items to test:
1. Dashboard
2. Students (list)
3. Programmes (list)
4. Modules (list)
5. Assessments
6. Timetable
7. Admissions
8. Reports
9. Settings

For items with sub-menus, click each sub-item and report the same.

Then switch portals:

ACADEMIC PORTAL TEST:
1. Logout, go to http://localhost:5173
2. Click Academic Portal
3. Login: academic@fhe.ac.uk / Fhe100@
4. List all sidebar items visible
5. Click each one — report WORKS/BLANK/ERROR/LOADING for each

APPLICANT PORTAL TEST:
1. Logout, go to http://localhost:5173
2. Click Applicant Portal
3. Login: applicant@fhe.ac.uk / Fhe100@
4. List all sidebar items visible
5. Click each one — report WORKS/BLANK/ERROR/LOADING for each

Report EVERYTHING. This is a full system audit.
```

## Cursor Pro: Phase 2–5 Retrospective Deep Review

### Cursor Prompt 1 — Auth & Data Scoping Consistency
```
Review server/src/middleware/auth.ts and all files that import from it.

1. Is authenticateJWT applied to every route in server/src/api/*/router.ts?
   List any routers that DON'T use authenticateJWT.
2. Is requireRole used on routes that modify data (POST, PATCH, DELETE)?
   List any mutation routes missing role checks.
3. Does the dataScope middleware exist? If so, is it applied to routes
   where students should only see their own data?
4. Check server/src/api/students/students.controller.ts — when a student
   calls GET /api/v1/students/me, does it filter by the JWT's linkedStudentId?
5. Check the Dashboard page (client/src/pages/Dashboard.tsx or similar) —
   does it check user roles before deciding what data to fetch?
```

### Cursor Prompt 2 — Frontend-Backend Contract Audit
```
Compare the API response shapes with what the frontend expects:

1. In client/src/lib/api.ts, what base URL and headers are configured?
2. For the Students list page (client/src/pages/staff/Students*.tsx or similar),
   what API endpoint does it call? What fields does it expect in the response?
3. Does the server's students controller return those exact fields?
4. Check 5 more pages: Programmes list, Module detail, Enrolment list,
   Finance accounts, Attendance records. For each:
   - What endpoint does the frontend call?
   - What does the backend actually return?
   - Are there mismatches in field names, nesting, or pagination format?
5. Does the pagination metadata format match between server (pagination.ts)
   and client (any usePagination hook or query params)?
```

### Cursor Prompt 3 — Code Health Scan
```
Scan the entire project for code quality issues:

1. Find all files that import directly from '@prisma/client' instead of
   using the singleton from server/src/utils/prisma.ts
2. Find any exported functions or types in server/src/ that are never
   imported anywhere else
3. Find any TODO, FIXME, or HACK comments
4. Find any hardcoded URLs, ports, or credentials (should be in .env)
5. Check for console.log statements in production code
   (should use logger.ts instead)
6. Find any American English in UI-visible strings:
   - "enrollment" should be "enrolment"
   - "program" (when meaning programme) should be "programme"
   - "color" should be "colour"
   - "center" should be "centre"
   - "organization" should be "organisation"
7. Check if all catch blocks in async functions actually handle the error
   (not empty catch blocks)
```

---

# PART 3 — FORWARD BUILD PROMPTS (Phases 6–9 with Multi-Tool Verification)

## Phase 6: n8n Workflow Automation

### Step 1: Claude Code Build Prompt 6

*Use the existing Build Prompt 6 from the original document unchanged.*

### Step 2: Claude Code Terminal Self-Test (NEW — add to end of Build Prompt 6)

Add this to the end of the existing Build Prompt 6 acceptance criteria:

```
TERMINAL VERIFICATION (mandatory before commit):
1. TypeScript compilation:
   cd server && npx tsc --noEmit
   cd ../client && npx tsc --noEmit

2. Webhook event test (start server first):
   # Get admin token
   TOKEN=$(curl -s -X POST http://localhost:8080/realms/fhe/protocol/openid-connect/token \
     -d "client_id=sjms-client" \
     -d "username=richard.knapp@fhe.ac.uk" \
     -d "password=Fhe100@" \
     -d "grant_type=password" | jq -r '.access_token')

   # Create a test student to trigger webhook
   curl -s -X POST http://localhost:3001/api/v1/students \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"person":{"forename":"Test","surname":"Webhook","dateOfBirth":"2000-01-01","gender":"male","nationality":"GB"},"feeStatus":"home","entryRoute":"direct","programmeId":"<first-programme-cuid>","academicYear":"2025/26"}' \
     | head -c 200

   # Check n8n received the webhook (wait 5 seconds)
   sleep 5
   curl -s http://localhost:5678/api/v1/executions?limit=1 \
     -H "Authorization: Basic $(echo -n 'admin:password' | base64)" \
     | jq '.data[0].workflowData.name, .data[0].status'

3. Webhook registry:
   curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/v1/webhooks | head -c 500

Report the EXACT output of each command.
```

### Step 3: GitHub Copilot PR Review
```
git checkout -b phase-6-n8n-workflows
git add .
git commit -m "feat: Phase 6 — 15 n8n workflows, webhook registry, event-driven automation"
git push origin phase-6-n8n-workflows
# Create PR → Copilot auto-reviews → resolve findings → merge
```

### Step 4: Perplexity Verify Prompt 6
*Use existing Verify Prompt 6 unchanged.*

### Step 5: Comet Browser Smoke Test — Phase 6

```
I need you to test workflow automation in a web application.

PREREQUISITE — Login as Admin
1. Navigate to http://localhost:5173
2. Click "Staff Portal" (or "Admin Portal")
3. On the Keycloak login page, enter:
   - Username: richard.knapp@fhe.ac.uk
   - Password: Fhe100@
4. Click "Sign In"

TEST 1 — Create Student Triggers Workflow
1. In the sidebar, navigate to Students
2. Look for a "Create Student" or "Add Student" or "New" button — click it
3. Fill in the form with:
   - Forename: Test
   - Surname: Workflow
   - Date of Birth: 01/01/2000
   - Any other required fields
4. Submit the form
5. Did the creation succeed? Is the new student visible in the list?
6. Now open a new tab and go to http://localhost:5678 (n8n dashboard)
7. If prompted for credentials, try admin/password or check if it auto-logs in
8. Click "Executions" in the n8n sidebar
9. Do you see a recent execution? What workflow name is shown? Was it successful (green) or failed (red)?

TEST 2 — Communication Log
1. Go back to the SJMS tab (http://localhost:5173)
2. Navigate to Communications > Log (or equivalent sidebar item)
3. Can you see any communication log entries?
4. Is there a recent entry related to the student you just created (e.g., "welcome email")?

TEST 3 — Webhook Registry
1. Navigate to Settings or a Webhooks section if visible
2. Can you see a list of registered webhooks?
3. How many webhooks are registered?
4. Do they show event types (e.g., student.created, enrolment.statusChanged)?

Report exactly what you see at each step. Include any error messages or blank pages.
```

### Step 6: Cursor Pro — Not required for Phase 6

### Step 7: Manual Check
Open http://localhost:5678 and visually confirm workflow executions appear.

---

## Phase 7: Integration Layer

### Step 1: Claude Code Build Prompt 7
*Use existing Build Prompt 7 unchanged.*

### Step 2: Claude Code Terminal Self-Test (NEW)

```
TERMINAL VERIFICATION (mandatory before commit):
1. TypeScript: cd server && npx tsc --noEmit && cd ../client && npx tsc --noEmit

2. MinIO bucket check:
   curl -s http://localhost:9000/minio/health/ready
   # Should return 200

3. Document upload test:
   TOKEN=$(curl -s -X POST http://localhost:8080/realms/fhe/protocol/openid-connect/token \
     -d "client_id=sjms-client" -d "username=richard.knapp@fhe.ac.uk" \
     -d "password=Fhe100@" -d "grant_type=password" | jq -r '.access_token')

   echo "test content" > /tmp/test-upload.txt
   curl -s -X POST http://localhost:3001/api/v1/documents/upload \
     -H "Authorization: Bearer $TOKEN" \
     -F "file=@/tmp/test-upload.txt" \
     -F "studentId=<first-student-cuid>" \
     -F "documentType=evidence" \
     | head -c 300

4. Analytics endpoints:
   curl -s -H "Authorization: Bearer $TOKEN" \
     http://localhost:3001/api/v1/analytics/enrolment-summary | head -c 300
   curl -s -H "Authorization: Bearer $TOKEN" \
     http://localhost:3001/api/v1/analytics/attendance-summary | head -c 300

5. Integration health:
   curl -s -H "Authorization: Bearer $TOKEN" \
     http://localhost:3001/api/v1/health/detailed | jq '.'

6. Prometheus metrics:
   curl -s http://localhost:3001/api/metrics | head -20

Report EXACT output of each command.
```

### Step 5: Comet Browser Smoke Test — Phase 7

```
I need you to test file uploads and integration features.

PREREQUISITE — Login as Admin
1. Navigate to http://localhost:5173
2. Click "Staff Portal" → Keycloak login:
   richard.knapp@fhe.ac.uk / Fhe100@

TEST 1 — Document Upload
1. Navigate to any student profile (Students > click first student)
2. Click the "Documents" tab
3. Is there an "Upload" button? Click it.
4. Try uploading a small file (any PDF or image)
5. Does the upload progress bar appear?
6. After upload, does the document appear in the documents list?
7. Can you click the document to download or preview it?

TEST 2 — UCAS Import
1. Navigate to Admissions or a dedicated "Imports" section
2. Is there a UCAS Import page?
3. Does it have a file upload area for UCAS data files?

TEST 3 — Integration Health Dashboard
1. Navigate to Settings > Integration Health (or System Health)
2. Does it show connection status for each service?
3. List the services shown and their status (connected/disconnected)
4. Are all services showing as healthy?

TEST 4 — Analytics/Reporting
1. Navigate to Reports or Analytics
2. Does a reporting dashboard load?
3. Can you see charts or data summaries?
4. What metrics are displayed?

Report exactly what you see at each step.
```

### Step 6: Cursor Pro Deep Review — Phase 7 (MILESTONE)

```
Review all integration and external service code:

1. Check server/src/services/minio.service.ts:
   - Are MinIO credentials loaded from environment variables (not hardcoded)?
   - Is there error handling for connection failures?
   - Are file types validated before upload?
   - Is there a file size limit enforced?

2. Check all files under server/src/api/imports/:
   - Is UCAS file parsing defensive (handles malformed CSV/XML)?
   - Are import operations wrapped in database transactions?
   - Is there duplicate detection on import?

3. Check server/src/api/analytics/:
   - Do all analytics endpoints require admin or analytics role?
   - Are responses cached with Redis?
   - Are date range filters validated?

4. Check server/src/middleware/metrics.ts:
   - Does it track request count, duration, error rate?
   - Does it expose a /api/metrics endpoint?
   - Is it mounted before route handlers?

5. Environment variable audit:
   - List ALL environment variables used across the codebase
   - Check .env.example has every one documented
   - Find any hardcoded URLs, ports, or secrets
```

---

## Phase 8: AMBER/GREEN Workstreams

### Step 2: Claude Code Terminal Self-Test (NEW)

```
TERMINAL VERIFICATION:
1. TypeScript: cd server && npx tsc --noEmit && cd ../client && npx tsc --noEmit

2. Engagement score calculation:
   TOKEN=$(curl -s -X POST http://localhost:8080/realms/fhe/protocol/openid-connect/token \
     -d "client_id=sjms-client" -d "username=richard.knapp@fhe.ac.uk" \
     -d "password=Fhe100@" -d "grant_type=password" | jq -r '.access_token')

   curl -s -H "Authorization: Bearer $TOKEN" \
     "http://localhost:3001/api/v1/engagement/scores?academicYear=2025/26&limit=5" | jq '.'

3. Communication template:
   curl -s -H "Authorization: Bearer $TOKEN" \
     http://localhost:3001/api/v1/communications/templates | head -c 300

4. Report builder:
   curl -s -H "Authorization: Bearer $TOKEN" \
     -X POST http://localhost:3001/api/v1/reports/generate \
     -H "Content-Type: application/json" \
     -d '{"entityType":"student","fields":["studentNumber","surname","programmeTitle"],"filters":{"academicYear":"2025/26"},"format":"json"}' \
     | head -c 500

5. GDPR encryption check (direct DB query):
   docker exec sjms-postgres psql -U sjms -d sjms \
     -c "SELECT id, concern FROM wellbeing_records LIMIT 1;"
   # The concern field should show encrypted/unreadable content

Report EXACT output.
```

### Step 5: Comet Browser Smoke Test — Phase 8

```
PREREQUISITE — Login as Admin
http://localhost:5173 → Staff Portal → richard.knapp@fhe.ac.uk / Fhe100@

TEST 1 — Engagement Scores
1. Navigate to Attendance > Engagement (or equivalent)
2. Do engagement scores load for students?
3. Can you see risk levels colour-coded (GREEN/AMBER/RED)?
4. How many students are shown as RED?
5. Click a RED student — does their detail show intervention history?

TEST 2 — Communications
1. Navigate to Communications > Templates
2. Are email templates listed?
3. Click one template — can you see the template body with variable placeholders?
4. Navigate to Communications > Compose (or Send)
5. Can you compose a message, select a recipient, and see a preview?

TEST 3 — Report Builder
1. Navigate to Reports > Report Builder (or Custom Reports)
2. Does the report builder interface load?
3. Can you select an entity type (e.g., Students)?
4. Can you select fields to include?
5. Try generating a report — does a download button or data table appear?

TEST 4 — Accommodation
1. Navigate to Accommodation > Blocks (or Rooms)
2. Does the page load with data?
3. Can you see accommodation blocks with room counts?
4. Click a block — do individual rooms appear with status?

TEST 5 — Student Portal Engagement View
1. Logout and login as student:
   Student Portal → student@fhe.ac.uk / Fhe100@
2. Navigate to My Attendance (or equivalent)
3. Can the student see their own engagement score?
4. Is the score personalised (shows their actual percentage, not system-wide)?

Report exactly what you see at each step.
```

---

## Phase 9: QA, Performance, Production

### Step 2: Claude Code Terminal Self-Test (NEW)

```
TERMINAL VERIFICATION:
1. Playwright tests:
   cd tests && npx playwright test --reporter=list 2>&1 | tail -30

2. Performance check:
   TOKEN=$(curl -s -X POST http://localhost:8080/realms/fhe/protocol/openid-connect/token \
     -d "client_id=sjms-client" -d "username=richard.knapp@fhe.ac.uk" \
     -d "password=Fhe100@" -d "grant_type=password" | jq -r '.access_token')

   # API response time
   time curl -s -H "Authorization: Bearer $TOKEN" \
     "http://localhost:3001/api/v1/students?page=1&limit=25" > /dev/null

   # Search response time
   time curl -s -H "Authorization: Bearer $TOKEN" \
     "http://localhost:3001/api/v1/students?search=Smith" > /dev/null

3. Security headers:
   curl -sI http://localhost:3001/api/health | grep -E "X-Frame|X-Content|Content-Security|Strict-Transport"

4. British English audit:
   npx tsx scripts/british-english-audit.ts 2>&1 | tail -20

5. Production docker validation:
   docker compose -f docker-compose.prod.yml config 2>&1 | head -10

6. Backup test:
   bash scripts/backup.sh 2>&1 | tail -10
   ls -la backups/

Report EXACT output.
```

### Step 5: Comet Browser Smoke Test — Phase 9 (COMPREHENSIVE)

```
This is the FINAL comprehensive smoke test before production. Test thoroughly.

PREREQUISITE: Login as admin
http://localhost:5173 → Staff Portal → richard.knapp@fhe.ac.uk / Fhe100@

FULL END-TO-END JOURNEY:

Step 1 — Create Student
1. Navigate to Students > Create (or New Student button)
2. Fill in all required fields
3. Submit — does it succeed? Note the student number generated.

Step 2 — Create Enrolment
1. On the new student's profile, find Enrolments or an "Enrol" button
2. Select a programme and academic year 2025/26
3. Submit the enrolment

Step 3 — Register Modules
1. On the enrolment, find Module Registration
2. Register for at least 2 modules
3. Confirm registration succeeded

Step 4 — Enter Marks
1. Navigate to Assessment > Marks Entry
2. Select one of the modules the student is registered for
3. Enter a mark (e.g., 65) for the student
4. Submit the mark
5. Does the mark appear as "submitted" or "pending moderation"?

Step 5 — View Student Profile
1. Go back to the student's profile
2. Click through ALL tabs
3. Verify: Personal data, Programme/Enrolment, Modules, Marks, Finance, Attendance, Documents
4. Is there data in each tab reflecting what we just created?

Step 6 — Audit Trail
1. Navigate to Settings > Audit Log
2. Search for the student we created
3. Do audit entries exist for: student created, enrolment created, module registered, mark entered?

Step 7 — Student Self-View
1. Logout
2. Login as student: Student Portal → student@fhe.ac.uk / Fhe100@
3. Does the student see ONLY their own data?
4. Do they see their modules, marks, attendance, finance?

PERFORMANCE CHECK:
8. Time how long the Students list takes to load (count seconds)
9. Navigate between 5 different pages rapidly — any blank flashes or errors?

ACCESSIBILITY CHECK:
10. Can you see all text clearly (no low-contrast text)?
11. Do buttons and links look clickable (not just plain text)?

Report EVERYTHING you see at each step. This determines production readiness.
```

### Step 6: Cursor Pro Deep Review — Phase 9 (FINAL MILESTONE)

```
FINAL PRODUCTION READINESS REVIEW — scan the entire codebase:

1. SECURITY AUDIT:
   - Are there any API routes without authentication middleware?
   - Are there any raw SQL queries (should all be Prisma)?
   - Are there any hardcoded secrets, tokens, or passwords?
   - Is CSP (Content Security Policy) configured?
   - Are all user inputs sanitised before database operations?

2. ERROR HANDLING:
   - Do all async controller functions have try/catch?
   - Do all catch blocks return appropriate HTTP status codes?
   - Are there any empty catch blocks?
   - Is the global error handler in server/src/middleware/error-handler.ts
     handling all error types?

3. PERFORMANCE:
   - Are there any N+1 query patterns (Prisma includes without limits)?
   - Are list endpoints using select/include to limit fields?
   - Is Redis caching used on frequently-read endpoints?
   - Are there any synchronous operations blocking the event loop?

4. COMPLETENESS:
   - List any files with TODO/FIXME/HACK comments
   - Find any placeholder or mock data still in production code
   - Check all sidebar navigation items have corresponding page files
   - Verify all page files have corresponding API endpoints

5. BRITISH ENGLISH:
   - Search all .tsx files for American English in UI strings
   - Check "Enrollment" → "Enrolment", "Program" → "Programme",
     "Color" → "Colour", "Center" → "Centre"
```

---

# PART 4 — COMET TEST 1 REMEDIATION PROMPTS

## Claude Code Remediation Prompt — Phase 2 Smoke Test Findings

Based on Comet Browser Test 1 results (Admin Login, Student Login, Role Isolation):

```
[ROLE: SECURITY_ENGINEER]

Phase 2 Smoke Test Remediation — 5 findings from Comet Browser runtime testing.

CONTEXT: Phase 2 passed TypeScript compilation and static verification, but
browser-based smoke testing revealed runtime issues with role-based dashboard
rendering and Keycloak session handling. All findings are runtime-only bugs
that static analysis cannot detect.

FINDING 1 — CRITICAL: Student Dashboard Shows Admin KPIs (Data Leak)
The student dashboard displays system-wide KPI data:
- "Total Students: 2,847" — students must NOT see institutional counts
- "Active Programmes: 45" — aggregate data not appropriate for students
- "Modules Running: 312" — system-level metric
- "Pending Assessments: 156" — admin-level workload metric

The student dashboard also shows the same notifications ("Exam board meeting",
"3 new MSc Data Science applications") and events ("Academic Board Meeting")
as the admin dashboard. These are clearly admin-only content.

FIX: Create role-specific dashboard components:
- client/src/pages/dashboards/AdminDashboard.tsx
  Show: Total Students, Active Programmes, Modules Running, Pending Assessments
  Show: System notifications, upcoming admin events, quick actions
- client/src/pages/dashboards/AcademicDashboard.tsx
  Show: My Modules count, My Tutees count, Upcoming Teaching, Marking Deadlines
  Show: Academic-specific notifications only
- client/src/pages/dashboards/StudentDashboard.tsx
  Show: My Programme (name + year), My Modules This Term (count + list),
        My Next Assessment (name + due date), My Attendance (% this term),
        My Finance Balance (£ amount), My Recent Marks
  ALL data fetched using the logged-in student's linkedStudentId
  NO aggregate institutional data whatsoever
- client/src/pages/dashboards/ApplicantDashboard.tsx
  Show: Application status, Offer conditions progress, Required documents,
        Key dates (deadline, enrolment date)

Update client/src/pages/Dashboard.tsx (or equivalent) to route by role:
```typescript
const { user, hasRole } = useAuth();
if (hasRole('superadmin') || hasRole('registrar') || hasRole('systemadmin'))
  return <AdminDashboard />;
if (hasRole('academicstaff') || hasRole('programmeleader') || hasRole('moduleleader'))
  return <AcademicDashboard />;
if (hasRole('student'))
  return <StudentDashboard />;
if (hasRole('applicant'))
  return <ApplicantDashboard />;
```

If student-scoped API endpoints don't exist yet, create them:
- GET /api/v1/dashboard/student — returns ONLY the logged-in student's data
  (programme, modules, next assessment, attendance %, finance balance)
  Must use req.user.linkedStudentId to scope all queries
- GET /api/v1/dashboard/student should return 403 if caller is not a student

FINDING 2 — HIGH: Student Dashboard Shows No Personal Data
After login, the student sees "Welcome back, Student" but no student-specific
content — no student number, no enrolled programme, no modules, no marks.

FIX: The StudentDashboard component must fetch and display:
- Student's full name and student number (STU-YYYY-NNNN)
- Enrolled programme title and year of study
- Current term's modules with upcoming assessment dates
- Attendance percentage for current academic year
- Finance balance (amount owed or "No outstanding balance")
- Most recent 3 marks/grades received

FINDING 3 — MEDIUM: Keycloak Logout Blank Page Flash
Clicking "Sign Out" briefly shows a blank white page with URL containing
?error=login_required before the portal selection page loads.

FIX: In client/src/lib/auth.ts (or AuthContext.tsx):
- In the Keycloak init/check-sso handler, explicitly catch the
  'login_required' error response
- When login_required is received, treat it as "unauthenticated" — clear
  any stale auth state and immediately render the portal selection page
- Do NOT let the error appear in the URL bar
- Set the post-logout redirect URI to the portal selection page root
- The logout function should call keycloak.logout({ redirectUri: window.location.origin })

FINDING 4 — LOW: Portal Card Naming
The first portal card says "Admin Portal" but the build spec specified
"Staff Portal" (it covers non-admin functions like Finance, Admissions, QA).
The description text "Registry, Finance, Admissions, QA & Compliance" confirms
this is a staff portal, not just admin.

FIX: In client/src/pages/Login.tsx:
- Rename "Admin Portal" to "Staff Portal"
- Keep the description and icon unchanged

FINDING 5 — INFO: Footer Copyright Year
The footer shows "© 2025 Future Horizons Education" but it is currently 2026.

FIX: Update the footer year to 2026, or better, use dynamic year:
```typescript
© {new Date().getFullYear()} Future Horizons Education
```

VERIFICATION — After all fixes, Claude MUST run:

1. TypeScript compilation:
   cd server && npx tsc --noEmit
   cd ../client && npx tsc --noEmit

2. Student dashboard API scoping test:
   # Get student token
   STUDENT_TOKEN=$(curl -s -X POST http://localhost:8080/realms/fhe/protocol/openid-connect/token \
     -d "client_id=sjms-client" \
     -d "username=student@fhe.ac.uk" \
     -d "password=Fhe100@" \
     -d "grant_type=password" | jq -r '.access_token')

   # Student dashboard must return only own data
   curl -s -H "Authorization: Bearer $STUDENT_TOKEN" \
     http://localhost:3001/api/v1/dashboard/student | head -c 500
   # Must NOT contain "2847" or aggregate counts

   # Student must NOT access admin dashboard
   curl -s -o /dev/null -w "%{http_code}" \
     -H "Authorization: Bearer $STUDENT_TOKEN" \
     http://localhost:3001/api/v1/dashboard/admin
   # Must return 403

3. Admin dashboard still works:
   ADMIN_TOKEN=$(curl -s -X POST http://localhost:8080/realms/fhe/protocol/openid-connect/token \
     -d "client_id=sjms-client" \
     -d "username=richard.knapp@fhe.ac.uk" \
     -d "password=Fhe100@" \
     -d "grant_type=password" | jq -r '.access_token')

   curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
     http://localhost:3001/api/v1/dashboard/admin | head -c 500

Report the EXACT output of all verification commands.

COMMIT:
git add .
git commit -m "fix: Phase 2 smoke test remediation — role-specific dashboards, data leak fix, logout handling

- CRITICAL: Create role-specific dashboard components (Admin, Academic, Student, Applicant)
- CRITICAL: Student dashboard no longer shows institutional KPIs — scoped to own data only
- HIGH: Student dashboard displays personal data (programme, modules, marks, finance, attendance)
- MEDIUM: Handle Keycloak login_required error gracefully on logout
- LOW: Rename Admin Portal to Staff Portal
- INFO: Dynamic copyright year in footer"
git push origin main
```

---

# PART 5 — TOOL SETUP GUIDE (One-Time Configuration)

## GitHub Copilot — Automated PR Review

### Setup Steps:
1. Go to https://github.com/RJK134/SJMS-2.5/settings
2. Under Code review → Enable "Copilot Code Review"
3. Set to Automatic — reviews every PR
4. Under Branch protection rules for `main`:
   - Require pull request reviews before merging
   - Add Copilot as a required reviewer
   - Enable CodeQL analysis

### Workflow Change:
Instead of pushing directly to main, Claude Code should:
```bash
git checkout -b phase-X-description
git add .
git commit -m "feat: Phase X — description"
git push origin phase-X-description
```
Then create a PR → Copilot auto-reviews → resolve findings → merge to main.

## Cursor Pro — Project Setup

### Setup Steps:
1. Open Cursor Pro
2. File > Open Folder > Navigate to SJMS 2.5 project directory
3. Wait for Cursor to index the entire codebase (may take 2-3 minutes)
4. Open Cursor Chat (Cmd+L / Ctrl+L)
5. Paste the review prompts from Part 2 or Part 3

### Best Practices:
- Let Cursor fully index before running prompts
- Run one prompt at a time — don't batch them
- Copy Cursor's findings into a text file for reference
- If Cursor suggests fixes, review them manually before applying

## Comet Browser — Test Execution

### Setup Steps:
1. Open Comet Browser
2. Ensure the SJMS application is running:
   - Docker services: docker compose up -d
   - Server: cd server && npm run dev
   - Client: cd client && npm run dev
3. Open Comet assistant
4. Paste the smoke test prompt for the current phase
5. Let Comet execute — it will navigate, click, and report

### Best Practices:
- Clear Comet's browser state between test runs (clear cookies)
- If Comet gets stuck, break the prompt into smaller steps
- Save Comet's output as a text file for each phase
- Use Comet's output as input for Claude Code remediation prompts

---

# APPENDIX — Phase Status Tracker

| Phase | Claude Build | Terminal Test | Copilot PR | Perplexity Verify | Comet Smoke | Cursor Review | Manual | Status |
|-------|-------------|--------------|-----------|------------------|------------|--------------|--------|--------|
| 0 | ✅ Done | ✅ Done | ⬜ Retro | ✅ Done | ⬜ Run retro | — | ✅ | Retro needed |
| 1A | ✅ Done | ✅ Done | ⬜ Retro | ✅ Done | — (no UI) | — | — | ✅ GO |
| 1B | ✅ Done | ✅ Done | ⬜ Retro | ✅ Done | ⬜ Run retro | — | — | Retro needed |
| 2 | ✅ Done | ✅ Done | ⬜ Retro | ✅ Done | ✅ Test 1 done | ⬜ Run retro | ✅ | **FIXING** |
| 3 | ✅ Done | ✅ Done | ⬜ Retro | ✅ Done | ⬜ Run retro | — | — | Retro needed |
| 4 | ✅ Done | ✅ Done | ⬜ Retro | ✅ Done | ⬜ Run retro | — | — | Retro needed |
| 5 | ✅ Done | ✅ Done | ⬜ Retro | ✅ Done | ⬜ Run retro | ⬜ Run retro | — | Retro needed |
| 6 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | — | ⬜ | Not started |
| 7 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | Not started |
| 8 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | — | ⬜ | Not started |
| 9 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | Not started |

### Recommended Execution Order:
1. **Now**: Execute the Phase 2 Remediation Prompt (Part 4) in Claude Code
2. **Next**: Re-run Phase 2 Comet smoke test to verify fixes
3. **Then**: Run retrospective Comet tests for Phases 0, 1B, 3, 4, 5 (Part 2)
4. **Then**: Run Cursor Pro retrospective review (Part 2)
5. **Then**: Set up GitHub Copilot auto-review (Part 5)
6. **Then**: Proceed to Phase 6 with full multi-tool cycle

---

*End of Document*
