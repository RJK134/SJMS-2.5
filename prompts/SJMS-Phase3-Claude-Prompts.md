# SJMS Phase 3 — Claude Code Prompt Suite
## API Decomposition: 37 Domain Modules
### With Git Commit, GitHub Branch, and PR Management Protocol

**Classification:** Internal Development  
**Author:** Richard Knapp  
**Date:** April 2026  
**Phase:** 3 of 9 — API Decomposition  
**Repo:** RJK134/SJMS-2.5  

---

## How to Use This Document

This document contains **three master prompts** for Phase 3, structured into batch groups of 5–7 API modules each. Each prompt includes:

1. **BRANCH SETUP** — branch creation and git initialisation command
2. **BUILD PROMPT** — paste directly into Claude Code
3. **COMMIT PROTOCOL** — exact commit message and push commands
4. **PR CREATION** — GitHub PR template with Cursor BugBot trigger
5. **POST-REVIEW MERGE GATE** — decision rules after BugBot returns findings

**Pre-Production Acceptance Threshold:**
- 🟢 **GREEN** — Compiles, routes respond, core flows work end-to-end → GO
- 🟡 **AMBER** — Known gaps, non-critical issues → log in `KNOWN-ISSUES.md`, proceed
- 🔴 **RED** — Security defects, data integrity failures, or build-breaking errors → fix before proceeding

---

## PHASE 3 ENTRY CONDITIONS

Before running any prompt below, confirm all of the following:

```bash
# Run these checks in your terminal before starting Phase 3
cd "C:\XPS\Documents\Record System Build 2.5\New Build"

# 1. Confirm you are on the correct base commit
git log --oneline -5

# 2. Confirm TypeScript compiles clean from Phase 2.5
cd server && npx tsc --noEmit
cd ../client && npx tsc --noEmit

# 3. Confirm Docker stack is healthy
docker compose ps

# 4. Confirm Keycloak seed is in place
# GET http://localhost:3001/api/v1/health → should return 200
```

**Expected git log:** Last commit should be the Phase 2.5 remediation close-out commit.  
**If any check fails:** Do NOT start Phase 3. Resolve Phase 2.5 exit conditions first.

---

## BATCH 1 — Modules 1–6: Identity, Admissions & Enrolment APIs

### Step 1 — Create the Branch

Run in your terminal **before** pasting the build prompt into Claude Code:

```bash
cd "C:\XPS\Documents\Record System Build 2.5\New Build"
git checkout main
git pull origin main
git checkout -b phase-3/batch-1-identity-admissions-enrolment
git push -u origin phase-3/batch-1-identity-admissions-enrolment
```

---

### Step 2 — BUILD PROMPT (paste into Claude Code)

```
ROLE: LEAD_SYSTEMS_ENGINEER
EFFORT: HIGH

You are continuing the SJMS 2.5 build. Phase 2.5 architecture remediation is complete.
You are now in Phase 3: API Decomposition. You will build Batch 1 of the 37 domain API modules.

READ CLAUDE.md FIRST. Confirm you understand all conventions before writing any code.

---

CONTEXT
- Repo: current working directory (SJMS-2.5)
- Active branch: phase-3/batch-1-identity-admissions-enrolment
- Stack: Node 20, TypeScript 5 strict, Express 4, Prisma 5, PostgreSQL 16
- Auth: Keycloak 24 OIDC — JWT middleware is in src/middleware/auth.ts
- Validation: Zod — middleware is in src/middleware/validate.ts
- Error handling: src/middleware/error-handler.ts
- Repository pattern: ALL database access goes through src/repositories/ — services MUST NOT import from utils/prisma directly
- British English: enforced throughout — programme, enrolment, organisation, authorise, colour

---

PHASE 3 BATCH 1 SCOPE — 6 MODULES

Build the following 6 domain API route modules. Each module must follow the pattern:
  src/routes/{domain}/{entity}.routes.ts   ← route file (max 300 lines)
  src/services/{domain}/{entity}.service.ts ← service (max 500 lines)
  (repositories already exist from Phase 2.5 — reuse them, do not recreate)

MODULE 1: Person / Student Identity — src/routes/identity/person.routes.ts
  GET    /api/v1/persons/:id              → get person by ID (roles: registry-staff, admin, self)
  GET    /api/v1/persons/:id/addresses    → get effective-dated addresses (roles: registry-staff, admin)
  GET    /api/v1/persons/:id/contacts     → get contact details (roles: registry-staff, admin, self)
  PUT    /api/v1/persons/:id              → update person (roles: registry-staff, admin)
  POST   /api/v1/persons/:id/addresses    → add address (roles: registry-staff, admin)
  GET    /api/v1/persons                  → paginated list with filters (roles: registry-staff, admin)

MODULE 2: Student — src/routes/identity/student.routes.ts
  GET    /api/v1/students                 → paginated list (roles: registry-staff, admin, academic-staff)
  GET    /api/v1/students/:id             → get student detail (roles: registry-staff, admin, academic-staff, self)
  POST   /api/v1/students                 → create student from applicant (roles: registry-staff, admin)
  PUT    /api/v1/students/:id/fee-status  → update fee status with audit (roles: registry-staff, admin)
  GET    /api/v1/students/:id/timeline    → full student journey summary (roles: registry-staff, admin)

MODULE 3: Applicant — src/routes/admissions/applicant.routes.ts
  GET    /api/v1/applicants               → paginated list with status filter (roles: admissions-staff, admin)
  GET    /api/v1/applicants/:id           → applicant detail with application (roles: admissions-staff, admin)
  POST   /api/v1/applicants               → create applicant (roles: admissions-staff, admin, self)
  PUT    /api/v1/applicants/:id/status    → update application status (roles: admissions-staff, admin)

MODULE 4: Application — src/routes/admissions/application.routes.ts
  GET    /api/v1/applications             → paginated list (roles: admissions-staff, admin)
  GET    /api/v1/applications/:id         → application detail (roles: admissions-staff, admin, self)
  POST   /api/v1/applications             → submit application (roles: admissions-staff, admin, applicant)
  POST   /api/v1/applications/:id/offer   → create offer (roles: admissions-staff, admin)
  PUT    /api/v1/applications/:id/offer   → update offer conditions (roles: admissions-staff, admin)

MODULE 5: Enrolment — src/routes/enrolment/enrolment.routes.ts
  GET    /api/v1/enrolments               → paginated list (roles: registry-staff, admin)
  GET    /api/v1/enrolments/:id           → enrolment detail (roles: registry-staff, admin, academic-staff)
  POST   /api/v1/enrolments               → create enrolment (roles: registry-staff, admin)
  PUT    /api/v1/enrolments/:id/status    → status change with audit entry (roles: registry-staff, admin)
  GET    /api/v1/enrolments/:id/history   → status change history (roles: registry-staff, admin)
  DELETE /api/v1/enrolments/:id           → SOFT DELETE only — set deletedAt (roles: admin)

MODULE 6: Module Registration — src/routes/enrolment/module-registration.routes.ts
  GET    /api/v1/module-registrations                    → paginated list (roles: registry-staff, academic-staff, admin)
  GET    /api/v1/enrolments/:enrolmentId/registrations   → registrations for an enrolment (roles: registry-staff, admin, self)
  POST   /api/v1/enrolments/:enrolmentId/registrations   → register for module (roles: registry-staff, admin)
  DELETE /api/v1/module-registrations/:id                → SOFT DELETE only (roles: registry-staff, admin)

---

CODING STANDARDS — MANDATORY FOR ALL 6 MODULES

1. Every route must use authenticateJWT middleware
2. Every route must use requireRole([...]) middleware — use exact role strings from src/constants/roles.ts
3. Every route with a request body must use validateRequest(schema) with a Zod schema
4. All path parameters must be validated with validateParams
5. Pagination: all list endpoints accept ?page=&limit=&sort=&order= (use pagination utility)
6. Error responses: use the custom error classes (NotFoundError, ValidationError, ConflictError)
7. Soft deletes ONLY — never use prisma.delete() — always set deletedAt: new Date()
8. British English: programme (not program), enrolment (not enrollment), organisation (not organization)
9. Commit format: feat(scope): description — all lowercase
10. No console.log — use the winston logger from src/utils/logger.ts
11. No direct prisma imports in services — use repositories only

---

REGISTER ALL ROUTES IN src/index.ts

After building all 6 route files, add them to src/index.ts:
  import personRoutes from './routes/identity/person.routes'
  import studentRoutes from './routes/identity/student.routes'
  import applicantRoutes from './routes/admissions/applicant.routes'
  import applicationRoutes from './routes/admissions/application.routes'
  import enrolmentRoutes from './routes/enrolment/enrolment.routes'
  import moduleRegistrationRoutes from './routes/enrolment/module-registration.routes'

  app.use('/api/v1', personRoutes)
  app.use('/api/v1', studentRoutes)
  app.use('/api/v1', applicantRoutes)
  app.use('/api/v1', applicationRoutes)
  app.use('/api/v1', enrolmentRoutes)
  app.use('/api/v1', moduleRegistrationRoutes)

---

DO NOT
- Do NOT run npx prisma db push — migrations are managed externally
- Do NOT modify any files outside src/routes/ and src/services/ for this batch
- Do NOT create new Prisma models — schema is from Phase 1A
- Do NOT add scope beyond the 6 modules listed
- Do NOT write American English in code, comments, or strings
- Do NOT import from utils/prisma directly in any service file

---

ACCEPTANCE CRITERIA — BATCH 1

AC-B1-01: npx tsc --noEmit returns 0 errors on server
AC-B1-02: All 6 route files exist at the correct paths
AC-B1-03: All 6 modules registered in src/index.ts
AC-B1-04: GET /api/v1/health still returns 200 after route registration
AC-B1-05: Every route handler has authenticateJWT applied
AC-B1-06: Every route handler has requireRole([...]) applied
AC-B1-07: Every POST/PUT has Zod validation applied
AC-B1-08: No direct prisma imports in any service file (grep check)
AC-B1-09: No hard deletes — all delete operations set deletedAt
AC-B1-10: British English throughout (no "enrollment", "program", "organization")
AC-B1-11: No console.log statements in any new file
AC-B1-12: All route files under 300 lines, all service files under 500 lines

When done, output a summary table:
| Module | Route File | Service File | Routes Count | TypeScript Clean |
|--------|-----------|--------------|-------------|-----------------|
```

---

### Step 3 — Commit Protocol

After Claude Code completes Batch 1, run these exact commands:

```bash
# Verify TypeScript before committing
cd server && npx tsc --noEmit && echo "TS CLEAN" || echo "TS ERRORS — DO NOT COMMIT"

# If TS is clean:
git add src/routes/identity/ src/routes/admissions/ src/routes/enrolment/ src/index.ts
git add src/services/identity/ src/services/admissions/ src/services/enrolment/

git commit -m "feat(api): batch 1 — identity, admissions, enrolment domain routes

Modules: person, student, applicant, application, enrolment, module-registration
- 6 route files, all authenticated with Keycloak JWT
- All POSTs/PUTs validated with Zod
- Soft deletes enforced (deletedAt) — no hard deletes
- All modules registered in src/index.ts
- British English throughout
- TypeScript strict: 0 errors

Closes Phase-3-Batch-1"

git push origin phase-3/batch-1-identity-admissions-enrolment
```

---

### Step 4 — Create GitHub PR

Go to https://github.com/RJK134/SJMS-2.5/compare and create a PR with this exact body:

```markdown
## Phase 3 — Batch 1: Identity, Admissions & Enrolment APIs

### Modules Included
- `person.routes.ts` — Person/identity CRUD with effective-dated addresses
- `student.routes.ts` — Student management with fee status audit
- `applicant.routes.ts` — Applicant lifecycle management
- `application.routes.ts` — Application submission and offer workflow
- `enrolment.routes.ts` — Enrolment with status history audit trail
- `module-registration.routes.ts` — Module registration management

### Pre-Production Acceptance
This is a pre-production build. The following are pre-production acceptable:
- Client portal pages not yet wired to these endpoints (Phase 5)
- n8n workflow triggers not yet configured (Phase 6)
- Integration layer (UCAS/SLC) not yet connected (Phase 7)

### Known Issues at Time of PR
<!-- List any AMBER items logged to KNOWN-ISSUES.md -->

### Acceptance Criteria
- [x] AC-B1-01: TypeScript 0 errors
- [x] AC-B1-02: All 6 route files at correct paths
- [x] AC-B1-03: All routes registered in index.ts
- [x] AC-B1-04: Health check still passes
- [x] AC-B1-05 to AC-B1-12: See Claude Code completion summary

### BugBot Review Request
@cursor-bugbot please review this PR focusing on:
1. Authentication middleware applied to all routes
2. Zod validation on all mutating endpoints
3. No direct Prisma imports in service files
4. Soft delete enforcement — no prisma.delete() calls
5. British English compliance
6. TypeScript strict compliance
7. Route file line count (max 300) and service file line count (max 500)
```

**PR Title:** `feat(phase-3): batch 1 — identity, admissions, enrolment API modules`  
**Base branch:** `main`  
**Head branch:** `phase-3/batch-1-identity-admissions-enrolment`

---

### Step 5 — Post-BugBot Merge Gate

After Cursor BugBot reviews the PR, apply this decision logic:

| BugBot Finding | Severity | Action |
|----------------|----------|--------|
| Missing auth middleware on a route | 🔴 RED | Fix before merge |
| Hard delete found (prisma.delete) | 🔴 RED | Fix before merge |
| TypeScript error | 🔴 RED | Fix before merge |
| American English in field/variable name | 🔴 RED | Fix before merge |
| Missing Zod validation on a POST/PUT | 🔴 RED | Fix before merge |
| Route file >300 lines | 🟡 AMBER | Log in KNOWN-ISSUES.md, proceed |
| Missing pagination on a list route | 🟡 AMBER | Log in KNOWN-ISSUES.md, proceed |
| Missing logger.info on a route | 🟡 AMBER | Log in KNOWN-ISSUES.md, proceed |
| Performance concerns | 🟡 AMBER | Log in KNOWN-ISSUES.md, proceed |
| Missing tests | 🟡 AMBER | Phase 9 scope — log only |

**When all RED items are resolved:**
```bash
# Merge via GitHub UI (squash merge preferred) or:
gh pr merge --squash --delete-branch
```

---

---

## BATCH 2 — Modules 7–14: Assessment, Examination & Awards APIs

### Step 1 — Create the Branch

Run **after Batch 1 is merged to main**:

```bash
git checkout main
git pull origin main
git checkout -b phase-3/batch-2-assessment-awards
git push -u origin phase-3/batch-2-assessment-awards
```

---

### Step 2 — BUILD PROMPT (paste into Claude Code)

```
ROLE: LEAD_SYSTEMS_ENGINEER
EFFORT: HIGH

You are continuing the SJMS 2.5 build. Phase 3 Batch 1 (identity/admissions/enrolment) is merged to main.
You are now building Phase 3 Batch 2: Assessment, Examination, and Awards domain modules.

READ CLAUDE.md FIRST. Confirm all conventions before writing code.

---

CONTEXT
- Repo: current working directory (SJMS-2.5)
- Active branch: phase-3/batch-2-assessment-awards
- Stack: Node 20, TypeScript 5 strict, Express 4, Prisma 5, PostgreSQL 16
- All Phase 3 Batch 1 routes are registered in src/index.ts — do not modify those registrations
- Repository pattern applies — no direct prisma imports in services
- British English enforced throughout

---

PHASE 3 BATCH 2 SCOPE — 8 MODULES

MODULE 7: Assessment — src/routes/assessment/assessment.routes.ts
  GET    /api/v1/assessments                    → paginated list (roles: academic-staff, registry-staff, admin)
  GET    /api/v1/assessments/:id                → detail (roles: academic-staff, registry-staff, admin)
  POST   /api/v1/modules/:moduleId/assessments  → create assessment (roles: academic-staff, admin)
  PUT    /api/v1/assessments/:id                → update (roles: academic-staff, admin)

MODULE 8: Assessment Attempt / Marks Entry — src/routes/assessment/attempt.routes.ts
  GET    /api/v1/attempts                       → paginated with filters (roles: marks-entry, academic-staff, admin)
  GET    /api/v1/attempts/:id                   → attempt detail (roles: marks-entry, academic-staff, admin)
  POST   /api/v1/attempts                       → create attempt (roles: marks-entry, admin)
  PUT    /api/v1/attempts/:id/mark              → submit mark — rawMark, moderatedMark, grade, feedback (roles: marks-entry)
  PUT    /api/v1/attempts/:id/moderate          → moderation record (roles: marks-entry, academic-staff)
  GET    /api/v1/enrolments/:id/attempts        → all attempts for a student's enrolment (roles: academic-staff, registry-staff)

MODULE 9: Module Result — src/routes/assessment/module-result.routes.ts
  GET    /api/v1/module-results                 → paginated (roles: marks-entry, academic-staff, admin)
  GET    /api/v1/module-results/:id             → detail (roles: marks-entry, academic-staff, admin, self)
  POST   /api/v1/module-results                 → create provisional result (roles: marks-entry, admin)
  PUT    /api/v1/module-results/:id/confirm     → confirm result — boardId required (roles: exam-board-chair, admin)

MODULE 10: Exam Board — src/routes/assessment/exam-board.routes.ts
  GET    /api/v1/exam-boards                    → paginated list (roles: exam-board-chair, registry-staff, admin)
  GET    /api/v1/exam-boards/:id                → board detail with members (roles: exam-board-chair, registry-staff, admin)
  POST   /api/v1/exam-boards                    → create board (roles: registry-staff, admin)
  PUT    /api/v1/exam-boards/:id                → update board details (roles: registry-staff, admin)
  POST   /api/v1/exam-boards/:id/decisions      → record board decisions (roles: exam-board-chair, admin)
  GET    /api/v1/exam-boards/:id/decisions      → list decisions (roles: exam-board-chair, registry-staff, admin)
  POST   /api/v1/exam-boards/:id/members        → add member (roles: registry-staff, admin)

MODULE 11: Submission — src/routes/assessment/submission.routes.ts
  POST   /api/v1/submissions                    → submit work (multipart/form-data, roles: student, marks-entry)
  GET    /api/v1/submissions/:id                → submission detail (roles: marks-entry, academic-staff, admin, self)
  GET    /api/v1/assessments/:id/submissions    → list submissions for assessment (roles: marks-entry, academic-staff, admin)
  PUT    /api/v1/submissions/:id/turnitin       → record Turnitin score (roles: marks-entry, admin)

MODULE 12: Extenuating Circumstances — src/routes/assessment/ec.routes.ts
  POST   /api/v1/extenuating-circumstances      → submit EC claim (roles: student, registry-staff)
  GET    /api/v1/extenuating-circumstances      → paginated list (roles: registry-staff, academic-staff, admin)
  GET    /api/v1/extenuating-circumstances/:id  → detail (roles: registry-staff, academic-staff, admin, self)
  PUT    /api/v1/extenuating-circumstances/:id/decision → EC committee decision (roles: registry-staff, admin)

MODULE 13: Progression — src/routes/awards/progression.routes.ts
  GET    /api/v1/progression-records            → paginated (roles: registry-staff, academic-staff, admin)
  GET    /api/v1/progression-records/:id        → detail (roles: registry-staff, academic-staff, admin)
  POST   /api/v1/progression-records            → create record (roles: registry-staff, admin)
  PUT    /api/v1/progression-records/:id/decision → set progression decision (roles: exam-board-chair, admin)

MODULE 14: Award — src/routes/awards/award.routes.ts
  GET    /api/v1/awards                         → paginated (roles: registry-staff, admin)
  GET    /api/v1/awards/:id                     → award detail (roles: registry-staff, admin, self)
  POST   /api/v1/awards                         → recommend award (roles: exam-board-chair, admin)
  PUT    /api/v1/awards/:id/approve             → approve award (roles: registry-staff, admin)
  PUT    /api/v1/awards/:id/confer              → confer award (roles: admin)
  GET    /api/v1/students/:id/awards            → all awards for a student (roles: registry-staff, admin, self)

---

CODING STANDARDS — identical to Batch 1 (see CLAUDE.md)

Special attention for Batch 2:
- Assessment domain has complex weighting logic — implement in the service layer, not the route layer
- Exam board decisions must create an audit entry in ExamBoardDecision model
- Marks entry route PUT /attempts/:id/mark must check that attempt status is 'pending' before accepting mark
- Award conferral must verify an ExamBoardDecision exists for this student before setting status to 'conferred'

---

REGISTER ALL ROUTES IN src/index.ts — append to existing registrations

DO NOT modify any Batch 1 route registrations.

---

ACCEPTANCE CRITERIA — BATCH 2

AC-B2-01: npx tsc --noEmit returns 0 errors
AC-B2-02: All 8 route files exist at correct paths
AC-B2-03: All 8 modules appended to src/index.ts without disturbing Batch 1
AC-B2-04: GET /api/v1/health still returns 200
AC-B2-05: Marks entry PUT validates attempt is in 'pending' status before accepting mark
AC-B2-06: Award conferral validates ExamBoardDecision exists
AC-B2-07: All authentication and validation standards from Batch 1 apply
AC-B2-08: No direct prisma imports in any service file
AC-B2-09: Soft deletes only — no hard deletes
AC-B2-10: British English throughout

When done, output the same summary table format as Batch 1.
```

---

### Step 3 — Commit Protocol

```bash
# TypeScript check
cd server && npx tsc --noEmit && echo "TS CLEAN" || echo "TS ERRORS"

# If clean:
git add src/routes/assessment/ src/routes/awards/ src/services/assessment/ src/services/awards/ src/index.ts

git commit -m "feat(api): batch 2 — assessment, examination, awards domain routes

Modules: assessment, attempt/marks-entry, module-result, exam-board,
         submission, extenuating-circumstances, progression, award
- 8 route files, all authenticated with Keycloak JWT
- Marks entry validates attempt status before accepting mark
- Award conferral validates ExamBoardDecision exists
- Soft deletes enforced — no hard deletes
- British English throughout
- TypeScript strict: 0 errors

Closes Phase-3-Batch-2"

git push origin phase-3/batch-2-assessment-awards
```

---

### Step 4 — Create GitHub PR

**PR Title:** `feat(phase-3): batch 2 — assessment, examination, awards API modules`  
**Base:** `main` | **Head:** `phase-3/batch-2-assessment-awards`

Use the same PR body template as Batch 1, updating:
- Module list (8 assessment/awards modules)
- AC references (AC-B2-01 through AC-B2-10)
- BugBot focus items — add: "Business rule enforcement: marks entry status check, award conferral guard"

---

### Step 5 — Post-BugBot Merge Gate

Same decision table as Batch 1, plus these Batch 2-specific RED items:

| BugBot Finding | Severity | Action |
|----------------|----------|--------|
| Marks accepted on non-pending attempt | 🔴 RED | Fix before merge |
| Award conferred without ExamBoardDecision | 🔴 RED | Fix before merge |
| ExamBoard decisions not audit-logged | 🔴 RED | Fix before merge |

---

---

## BATCH 3 — Modules 15–22: Finance, Attendance, UKVI & Curriculum APIs

### Step 1 — Create the Branch

Run **after Batch 2 is merged to main**:

```bash
git checkout main
git pull origin main
git checkout -b phase-3/batch-3-finance-attendance-curriculum
git push -u origin phase-3/batch-3-finance-attendance-curriculum
```

---

### Step 2 — BUILD PROMPT (paste into Claude Code)

```
ROLE: LEAD_SYSTEMS_ENGINEER
EFFORT: HIGH

You are continuing the SJMS 2.5 build. Phase 3 Batches 1 and 2 are merged to main.
You are now building Phase 3 Batch 3: Finance, Attendance, UKVI, and Curriculum domain modules.

READ CLAUDE.md FIRST. Confirm all conventions before writing code.

---

CONTEXT
- Repo: current working directory (SJMS-2.5)
- Active branch: phase-3/batch-3-finance-attendance-curriculum
- Stack: Node 20, TypeScript 5 strict, Express 4, Prisma 5, PostgreSQL 16
- All Batch 1 and Batch 2 routes are registered in src/index.ts — do NOT touch those
- Repository pattern applies — no direct prisma imports in services
- British English enforced throughout

---

PHASE 3 BATCH 3 SCOPE — 8 MODULES

MODULE 15: Student Finance Account — src/routes/finance/account.routes.ts
  GET    /api/v1/finance/accounts                      → paginated list (roles: finance-staff, admin)
  GET    /api/v1/finance/accounts/:studentId            → account detail with balance (roles: finance-staff, admin, self)
  GET    /api/v1/finance/accounts/:studentId/charges    → charge lines paginated (roles: finance-staff, admin, self)
  POST   /api/v1/finance/accounts/:studentId/charges    → add charge (roles: finance-staff, admin)
  GET    /api/v1/finance/accounts/:studentId/invoices   → invoices list (roles: finance-staff, admin, self)

MODULE 16: Invoicing & Payment — src/routes/finance/payment.routes.ts
  POST   /api/v1/finance/invoices                      → generate invoice (roles: finance-staff, admin)
  GET    /api/v1/finance/invoices/:id                   → invoice detail (roles: finance-staff, admin, self)
  POST   /api/v1/finance/payments                       → record payment (roles: finance-staff, admin)
  GET    /api/v1/finance/payments/:id                   → payment detail (roles: finance-staff, admin)
  POST   /api/v1/finance/payments/:id/reverse           → reverse payment with reason (roles: finance-staff, admin)
  GET    /api/v1/finance/accounts/:studentId/balance    → current balance (roles: finance-staff, admin, self)

MODULE 17: Bursaries & Hardship — src/routes/finance/bursary.routes.ts
  GET    /api/v1/finance/bursary-funds                  → list funds (roles: finance-staff, admin)
  POST   /api/v1/finance/bursary-funds                  → create fund (roles: admin)
  POST   /api/v1/finance/bursary-applications           → submit application (roles: student, finance-staff)
  GET    /api/v1/finance/bursary-applications           → paginated list (roles: finance-staff, admin)
  GET    /api/v1/finance/bursary-applications/:id       → detail (roles: finance-staff, admin, self)
  PUT    /api/v1/finance/bursary-applications/:id/decision → approve/reject (roles: finance-staff, admin)

MODULE 18: Attendance — src/routes/attendance/attendance.routes.ts
  POST   /api/v1/attendance/records                     → record attendance (roles: academic-staff, marks-entry)
  GET    /api/v1/attendance/records                     → paginated with date/module filters (roles: academic-staff, registry-staff, admin)
  GET    /api/v1/students/:studentId/attendance         → student attendance summary (roles: academic-staff, registry-staff, admin, self)
  PUT    /api/v1/attendance/records/:id                 → update record (roles: academic-staff, admin)
  POST   /api/v1/attendance/bulk                        → bulk attendance entry (array of records, roles: academic-staff)

MODULE 19: Engagement Monitoring — src/routes/attendance/engagement.routes.ts
  GET    /api/v1/engagement                             → paginated engagement scores (roles: academic-staff, registry-staff, admin)
  GET    /api/v1/students/:studentId/engagement         → student engagement history (roles: academic-staff, registry-staff, admin, self)
  PUT    /api/v1/engagement/:id/risk                    → manually set risk level with reason (roles: academic-staff, admin)
  GET    /api/v1/engagement/alerts                      → students with red/amber risk (roles: academic-staff, registry-staff, admin)

MODULE 20: UKVI Compliance — src/routes/ukvi/ukvi.routes.ts
  GET    /api/v1/ukvi/students                          → international students list with visa status (roles: ukvi-staff, admin)
  GET    /api/v1/ukvi/students/:studentId               → UKVI detail — CAS, visa, MCPs (roles: ukvi-staff, admin)
  POST   /api/v1/ukvi/cas                               → create CAS record (roles: ukvi-staff, admin)
  PUT    /api/v1/ukvi/cas/:id                           → update CAS (roles: ukvi-staff, admin)
  POST   /api/v1/ukvi/missed-contact-points             → record MCP (roles: ukvi-staff, registry-staff)
  GET    /api/v1/ukvi/alerts                            → visa expiry alerts (90/60/30 day threshold, roles: ukvi-staff, admin)

MODULE 21: Programme Management — src/routes/curriculum/programme.routes.ts
  GET    /api/v1/programmes                             → paginated list (roles: academic-staff, registry-staff, admin, student)
  GET    /api/v1/programmes/:id                         → detail with modules (roles: academic-staff, registry-staff, admin, student)
  POST   /api/v1/programmes                             → create programme (roles: academic-admin, admin)
  PUT    /api/v1/programmes/:id                         → update programme (roles: academic-admin, admin)
  GET    /api/v1/programmes/:id/specification           → programme specification doc (roles: academic-staff, registry-staff, admin)

MODULE 22: Module Management — src/routes/curriculum/module.routes.ts
  GET    /api/v1/modules                                → paginated list (roles: academic-staff, registry-staff, admin, student)
  GET    /api/v1/modules/:id                            → module detail (roles: academic-staff, registry-staff, admin, student)
  POST   /api/v1/modules                                → create module (roles: academic-admin, admin)
  PUT    /api/v1/modules/:id                            → update module (roles: academic-admin, admin)
  GET    /api/v1/programmes/:id/modules                 → modules on a programme (roles: academic-staff, registry-staff, admin, student)

---

CODING STANDARDS — identical to Batches 1 and 2 (see CLAUDE.md)

Special attention for Batch 3:
- Finance routes: balance calculation must be SUM(credits) - SUM(debits) from ledger entries — do NOT store balance as a field
- UKVI alerts route must query visa expiry <= NOW() + 90 days and return tier bucketed by 30/60/90 days
- Attendance bulk endpoint: process as an array, return a result summary {accepted: N, rejected: N, errors: [...]}
- Programme and module routes exposed to student role are READ-ONLY — enforce this at the route level

---

REGISTER ALL ROUTES IN src/index.ts — append only, do not touch Batches 1 and 2

---

ACCEPTANCE CRITERIA — BATCH 3

AC-B3-01: npx tsc --noEmit returns 0 errors
AC-B3-02: All 8 route files exist at correct paths
AC-B3-03: All 8 modules appended to src/index.ts
AC-B3-04: GET /api/v1/health returns 200
AC-B3-05: Finance balance computed from ledger (no stored balance field queried directly)
AC-B3-06: UKVI alerts returns students with visa expiry in next 90 days, bucketed by threshold
AC-B3-07: Attendance bulk endpoint returns structured result summary
AC-B3-08: Programme/module routes for student role are GET only — POST/PUT return 403 for student role
AC-B3-09: All authentication and validation standards apply
AC-B3-10: No direct prisma imports in services
AC-B3-11: Soft deletes only
AC-B3-12: British English throughout

When done, output summary table.
```

---

### Step 3 — Commit Protocol

```bash
cd server && npx tsc --noEmit && echo "TS CLEAN" || echo "TS ERRORS"

git add src/routes/finance/ src/routes/attendance/ src/routes/ukvi/ src/routes/curriculum/
git add src/services/finance/ src/services/attendance/ src/services/ukvi/ src/services/curriculum/
git add src/index.ts

git commit -m "feat(api): batch 3 — finance, attendance, ukvi, curriculum domain routes

Modules: student-account, invoicing/payment, bursary, attendance,
         engagement-monitoring, ukvi-compliance, programme, module
- Finance balance computed from ledger SUM — no stored balance field
- UKVI alerts bucketed at 30/60/90 day thresholds
- Attendance bulk endpoint with structured result summary
- Programme/module student role restricted to GET
- 8 route files registered in index.ts
- TypeScript strict: 0 errors

Closes Phase-3-Batch-3"

git push origin phase-3/batch-3-finance-attendance-curriculum
```

---

### Step 4 — Create GitHub PR

**PR Title:** `feat(phase-3): batch 3 — finance, attendance, UKVI, curriculum API modules`  
**Base:** `main` | **Head:** `phase-3/batch-3-finance-attendance-curriculum`

Same PR template as previous batches. BugBot focus additions:
- "Finance: verify balance is computed from ledger, not a stored field"
- "UKVI: verify 90/60/30 day alert bucketing"
- "Curriculum: verify student role cannot POST/PUT to programme or module endpoints"

---

### Step 5 — Post-BugBot Merge Gate

Batch 3-specific RED items in addition to the standard table:

| BugBot Finding | Severity | Action |
|----------------|----------|--------|
| Finance balance queried from stored field instead of ledger | 🔴 RED | Fix before merge |
| Student can POST/PUT to programme or module | 🔴 RED | Fix before merge |
| UKVI alerts missing threshold bucketing | 🔴 RED | Fix before merge |
| Attendance bulk endpoint no error summary | 🟡 AMBER | Log in KNOWN-ISSUES.md |

---

---

## PHASE 3 CLOSE-OUT — After All 3 Batches Merged

After all three batch PRs are merged to main, run this final close-out sequence:

### Step 1 — Phase Completion Verification

```bash
git checkout main
git pull origin main

# Final TypeScript check across entire project
cd server && npx tsc --noEmit && echo "SERVER TS CLEAN"
cd ../client && npx tsc --noEmit && echo "CLIENT TS CLEAN"

# Verify all 22+ routes are in index.ts
grep -c "app.use(" server/src/index.ts

# Confirm no hard deletes anywhere in routes or services
grep -rn "prisma\.[a-zA-Z]*\.delete(" server/src/routes/ server/src/services/ | grep -v "deleteMany\|deletedAt"

# Confirm no direct prisma imports in services
grep -rn "from.*utils/prisma" server/src/services/ || echo "CLEAN — no direct prisma imports in services"

# British English check
grep -rn "\benrollment\b\|\bprogram\b\|\borganization\b\|\bauthorize\b" server/src/ client/src/ || echo "BRITISH ENGLISH CLEAN"
```

### Step 2 — KNOWN-ISSUES.md Update

Create or update `docs/KNOWN-ISSUES.md`:

```markdown
# SJMS 2.5 — Known Issues Register

**Phase:** 3 (API Decomposition)
**Last Updated:** [date]
**Pre-Production Classification:** Issues listed here are accepted for pre-production.
They MUST be resolved before Phase 9 (QA / Production).

## AMBER Items — Phase 3

| ID | Module | Issue | Logged | Target Phase |
|----|--------|-------|--------|-------------|
| KI-001 | [module] | [description] | [date] | Phase 9 |

## RED Items (must be empty before Phase 4 begins)
None.
```

### Step 3 — Phase 3 Close-Out Commit

```bash
git add docs/KNOWN-ISSUES.md
git commit -m "chore(phase-3): close-out — KNOWN-ISSUES.md updated, all 22 API modules verified

Phase 3 complete:
- 22 domain API modules deployed across 3 batches
- TypeScript strict: 0 errors server + client
- No hard deletes in any module
- No direct prisma imports in services
- British English verified clean
- KNOWN-ISSUES.md updated with all AMBER deferred items

Ready for Phase 4: RED Workstream Data Model Enhancements"

git push origin main
```

### Step 4 — Session Context Summary Update

Update your Claude Code session context summary file:

```markdown
# SJMS 2.5 — Session Context Summary

## Current State
- Phase 3: COMPLETED
- Phase 4: PENDING (RED Workstream — Data Model Enhancements)

## TODO
- [x] Phase 0: Infrastructure — COMPLETED
- [x] Phase 1A: Prisma Schema (180+ models) — COMPLETED
- [x] Phase 1B: Seed Data / Repository Layer — COMPLETED
- [x] Phase 2: Authentication / Keycloak — COMPLETED
- [x] Phase 2.5: Architecture Remediation — COMPLETED
- [x] Phase 3: API Decomposition (37 modules) — COMPLETED
- [ ] Phase 4: RED Workstream Data Model Enhancements — PENDING
- [ ] Phase 5: Frontend Portal (136 pages) — PENDING
- [ ] Phase 6: n8n Workflow Automation — PENDING
- [ ] Phase 7: Integration Layer — PENDING
- [ ] Phase 8: AMBER/GREEN Workstreams — PENDING
- [ ] Phase 9: QA / Production — PENDING

## Key Details
- Repo: RJK134/SJMS-2.5
- Branch strategy: phase-N/description → PR to main → squash merge
- PostgreSQL: localhost:5432/sjms
- Keycloak: localhost:8080, realm: sjms
- API: localhost:3001
- Client: localhost:5173

## KNOWN-ISSUES.md
See docs/KNOWN-ISSUES.md for all AMBER deferred items.

## Pre-Production Threshold
AMBER items are accepted and logged — not chased.
RED items must be resolved before any phase advances.
```

---

## Quick Reference — Git Branch Naming Convention

| Phase Batch | Branch Name |
|-------------|-------------|
| Phase 3 Batch 1 | `phase-3/batch-1-identity-admissions-enrolment` |
| Phase 3 Batch 2 | `phase-3/batch-2-assessment-awards` |
| Phase 3 Batch 3 | `phase-3/batch-3-finance-attendance-curriculum` |
| Phase 4 | `phase-4/red-workstream-enhancements` |
| Phase 5 | `phase-5/frontend-portal` |

## Quick Reference — Commit Message Format

```
feat(scope): short description

Body: what was built, key technical decisions.
Closes Phase-X-BatchY
```

Valid scopes: `api`, `schema`, `auth`, `frontend`, `docker`, `n8n`, `integration`, `phase-N`

## Quick Reference — PR BugBot Trigger

Always include this line in your PR body to trigger Cursor BugBot:
```
@cursor-bugbot please review this PR focusing on: [specific checks]
```

