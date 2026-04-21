# SJMS 2.5 — Remediation Playbook

**Source:** `docs/review/phase-13-enhanced-review.md` + `docs/review/phase-10b-now/07-priority-actions.md` (P1/P2) + open KIs in `docs/KNOWN_ISSUES.md`
**Replaces:** the placeholder REM-01..REM-27 list referenced in draft overnight prompts.
**Last updated:** 2026-04-17

## How to use this file

- Items have stable IDs `SJMS-P13-NN` (Phase 13 Integrity) and `SJMS-P14-NN` (Phase 14 Business Logic Foundation).
- **Severity** uses CLAUDE.md definitions: **BLOCKER** (ships broken / regulatory risk / data integrity), **HIGH** (blocks SME walkthrough), **MEDIUM** (needed for UAT), **LOW** (housekeeping).
- **Domain** indicates which expert persona skill to load when working on the item.
- **Dep** lists other IDs that must be complete first.
- Autonomous overnight runs should pick items in ID order unless a dependency forces a re-order.
- Each item has an **Acceptance** block with a command or observable outcome. The item is not complete until its acceptance passes.

---

# Phase 13 — Integrity and Baseline

Goal: make the repository trustworthy. Docs match code, hygiene is clean, CI exists, MFA decision is made, real playbook (this file) is committed. **No business logic work until Phase 13 is complete.**

## SJMS-P13-01 — Repository hygiene sweep

**Severity:** HIGH
**Domain:** devex / repo-hygiene
**Dep:** —

Delete the debris accumulated over Phases 0-12:
- 14 stale remote branches on `origin` (everything except `main` and `phase-10/keycloak-mfa-hardening`).
- 15 squash-merged local branches with 0 unique commits.
- 3 stale worktree directories under `.claude/worktrees/` (`goofy-snyder`, `wizardly-poincare`, `gallant-poincare`).
- Duplicate docx files (`SJMS-2.5-Build-and-Verify-Prompts (1).docx` is byte-identical to the non-`(1)` version).
- Duplicate Keycloak MFA docs (`.md` is byte-identical to `.txt`).
- The orphan empty Prisma migration `prisma/migrations/20260413210439_extend_support_category/` (after SJMS-P13-09 completes).
- The 1.86 MB `backup-pre-migration-20260414.sql` at repo root — move out of the repo and add `*.sql` to `.gitignore`.

**Acceptance:**
- `git branch -a | wc -l` returns ≤ 5 (main, phase-10 if retained, current working branches).
- `git worktree list` and `ls .claude/worktrees/` agree exactly.
- `git status --porcelain` in main repo is empty.
- Zero `*.docx` or `*.sql` in repo root.

## SJMS-P13-02 — Fix CLAUDE.md Phase 12 fabrications

**Severity:** BLOCKER
**Domain:** docs
**Dep:** —

Rewrite the Phase 12 section in `CLAUDE.md` and `.claude/CLAUDE.md` to match the code. Remove references to:
- `server/src/utils/pass-marks.ts` (does not exist)
- `server/src/utils/credit-limits.ts` (does not exist)
- `resolveGradeFromMark()` (does not exist)
- Prerequisite + credit-limit enforcement in `module-registrations.service.ts` (does not exist; file is CRUD)
- "120 unit tests (109 + 11 new for module-registrations service)" — the 11 new tests do not exist
- Any claim that marks auto-grade resolution applies on create/update

Replace with an honest Phase 12 summary: "Phase 12 merged API module decomposition (44 routers into 9 group barrels, additive) and a frontend API service layer (9 typed domain services). No business logic was added."

**Acceptance:**
- `grep -i 'pass-marks\|credit-limits\|resolveGradeFromMark' CLAUDE.md .claude/CLAUDE.md` returns zero.
- `grep "120 unit tests" CLAUDE.md .claude/CLAUDE.md` returns zero.
- Section for Phase 12 accurately describes what PR #41/#42/#43/#44 delivered.

## SJMS-P13-03 — Reconcile role count across docs

**Severity:** HIGH
**Domain:** docs / auth
**Dep:** —

Single source of truth: `server/src/constants/roles.ts`. Update every document referencing role count:
- `CLAUDE.md` root (currently "27 roles")
- `.claude/CLAUDE.md`
- `docs/architecture/system-architecture.md` (currently "27 Roles")
- Top-level CLAUDE.md header ("OIDC/SAML" is also wrong — it's OIDC only)

**Acceptance:**
- `N=$(grep -c "^export const ROLE_" server/src/constants/roles.ts); grep -R "$N roles\|$N Roles" CLAUDE.md .claude/CLAUDE.md docs/architecture/` returns at least one match per file.
- No document mentions "27 roles" or "36 roles" with a different value from roles.ts.
- No document mentions SAML.

## SJMS-P13-04 — Reconcile endpoint + model + schema counts

**Severity:** MEDIUM
**Domain:** docs
**Dep:** —

- Endpoint count: anchor on 246 (44 routers). Remove any "~650 endpoints" or "~320 models" target-era language from CLAUDE.md.
- Model count: 197. Remove "~320".
- Schema line count: either drop the claim or update to actual (`wc -l prisma/schema.prisma`).

**Acceptance:**
- `grep -E '~650|~320' CLAUDE.md .claude/CLAUDE.md` returns zero.
- Documents state "197 models, 246 API endpoints (44 routers)" consistently.

## SJMS-P13-05 — Withdraw unsubstantiated WCAG claim

**Severity:** MEDIUM
**Domain:** docs / a11y
**Dep:** —

`CLAUDE.md` claims "WCAG 2.1 AA" compliance; no axe-core run, no Playwright a11y check, no audit record. Change to "WCAG 2.1 AA target (not yet verified — see Phase 16)".

**Acceptance:** `grep -n "WCAG" CLAUDE.md` shows only the target-language phrasing, never a completion claim.

## SJMS-P13-06 — CI workflow skeleton

**Severity:** HIGH
**Domain:** devops / ci-cd
**Dep:** SJMS-P13-02 (docs must be right before CI locks them)

Create `.github/workflows/ci.yml` with a single job that runs on every PR to `main`:
- `npm ci --prefix server && npm ci --prefix client`
- `npx prisma validate --schema server/prisma/schema.prisma`
- `cd server && npx tsc --noEmit`
- `cd client && npx tsc --noEmit`
- `cd server && npm test`

Cache node_modules for speed.

**Acceptance:**
- File exists and YAML validates (`yamllint .github/workflows/ci.yml`).
- Opening a PR triggers the workflow; it passes on the current tree.
- At least one required status check enforced on `main` branch protection.

## SJMS-P13-07 — Phase 10 MFA decision

**Severity:** HIGH
**Domain:** auth / keycloak
**Dep:** —

Decide the fate of `phase-10/keycloak-mfa-hardening` (3 unshipped commits on origin, no PR):
- **Option A (recommended):** open a PR, run BugBot, merge into main. Move MFA planning docs to `docs/security/`. MFA is a standard UK HE requirement; abandoning it costs later.
- **Option B:** close the branch, delete the docs, log as deferred to Phase 16.

**Acceptance (Option A):** PR opened, BugBot HIGH findings resolved, merged to main. Realm JSON has `otpPolicy` + `requiredActions: ["CONFIGURE_TOTP"]` (dev) or equivalent. MFA docs live under `docs/security/`.
**Acceptance (Option B):** branch deleted; root-level `# SJMS 2.5 — Keycloak MFA *` files removed; KI-P13-007 logged with deferred-to-Phase-16 note.

## SJMS-P13-08 — Root-level file classification

**Severity:** MEDIUM
**Domain:** devex / docs
**Dep:** SJMS-P13-07

Classify the 17 untracked root-level files. Move keepers to `docs/` subfolders; delete throwaways:
- `SJMS Readiness as at 15042026.md` → `docs/review/readiness/`
- `SJMS-Comprehensive-Analysis.md`, `SJMS_Build_Journey_Synthesis.docx`, `DOCUMENT 3 Thread Links and Referen.md` → `docs/context/`
- `Student_Finance_Systems_Management_UK_HE.pdf` → `docs/context/`
- `antrhopic how to get claude code to write directly.md` → delete
- `Claudes SJMS 2.5 Final Big Build Pl.md` → delete (course-scraping doc, unrelated)
- `SJMS 2.5 — Phase 10b Review Remedia.txt` → delete (superseded)
- `server/package-lock.json` — commit if tracked by npm, else gitignore.

**Acceptance:** `ls *.md *.docx *.txt *.pdf 2>/dev/null` in repo root returns only files that are tracked and belong there (CLAUDE.md, README.md, one `SJMS-2.5-Build-Plan.docx` if retained).

## SJMS-P13-09 — Prisma migration reconciliation

**Severity:** BLOCKER
**Domain:** prisma / migrations
**Dep:** —

Two untracked migration dirs both named `extend_support_category` (46 s apart). Non-empty migration adds 7 `ALTER TYPE "SupportCategory" ADD VALUE` statements. Must inspect `_prisma_migrations` table before committing.

Steps:
1. Query `SELECT migration_name, applied_steps_count, finished_at, logs FROM _prisma_migrations WHERE migration_name LIKE '%extend_support_category%';`
2. If non-empty was applied: delete empty dir, commit non-empty dir.
3. If empty was applied and non-empty was not: rare, but means enum additions never landed — need to re-run `prisma migrate dev`.
4. If neither applied: run `prisma migrate dev` with a clean name.

**Acceptance:**
- `ls prisma/migrations/ | grep extend_support_category` returns exactly one directory.
- `SELECT COUNT(*) FROM _prisma_migrations WHERE migration_name LIKE '%extend_support_category%'` returns 1.
- Schema still compiles: `npx prisma validate`.

## SJMS-P13-10 — Commit this PLAYBOOK + enhanced review

**Severity:** HIGH
**Domain:** docs
**Dep:** SJMS-P13-02, SJMS-P13-08

Land both deliverables on `main`:
- `docs/review/phase-13-enhanced-review.md` (this review)
- `docs/remediation/PLAYBOOK.md` (this file)

Update `docs/KNOWN_ISSUES.md` with five new AMBER items:
- KI-P13-001: Phase 12 documentation fabrications (CLOSED once SJMS-P13-02 lands)
- KI-P13-002: MFA not shipped (status depends on SJMS-P13-07)
- KI-P13-003: Multi-tenancy structural gap (deferred to Phase 17)
- KI-P13-004: No correlation IDs in logs (deferred to Phase 16)
- KI-P13-005: No CSP header on nginx (deferred to Phase 16)

**Acceptance:** PR merged to `main`; KIs visible in the register; next overnight run can load this file as its backlog.

---

# Phase 14 — Business Logic Foundation

Goal: deliver the domain calculations and rule enforcement that transform a CRUD wrapper into an operational SIS. **Depends on Phase 13 being complete.**

## SJMS-P14-01 — `grade-boundaries.ts` utility

**Severity:** BLOCKER
**Domain:** assessment
**Dep:** SJMS-P13-10

Create `server/src/utils/grade-boundaries.ts` with `resolveGradeFromMark(mark, gradeScaleId)`. Reads the `GradeBoundary` relation attached to `GradeScale`. Returns a grade letter. Defaults to module's grade scale; falls back to programme default.

**Acceptance:**
- Unit tests: mark 72 on UK-BA-Hons scale returns "First"; mark 58 returns "2:2"; mark 38 returns "Fail".
- Function handles null/undefined mark gracefully.

## SJMS-P14-02 — Mark aggregation utility

**Severity:** BLOCKER
**Domain:** assessment
**Dep:** SJMS-P14-01

Create `server/src/utils/mark-aggregation.ts`:
- `aggregateComponentMarks(assessmentId)` — weighted sum of `AssessmentComponent.weight × AssessmentAttempt.finalMark`.
- `aggregateModuleMark(moduleRegistrationId)` — weighted sum of Assessment marks → ModuleResult.aggregateMark.
- Applies `resolveGradeFromMark` to populate `ModuleResult.grade`.

**Acceptance:**
- Seeded module with 2 components (60% + 40%), marks 70 and 60 → aggregate 66, grade "2:1".
- Unit tests for edge cases: missing marks, 100% single component, zero weight.

## SJMS-P14-03 — Mark aggregation endpoint

**Severity:** HIGH
**Domain:** assessment
**Dep:** SJMS-P14-02

Wire `POST /v1/marks/aggregate?moduleRegistrationId=...` into `marks.router.ts`. Returns updated `ModuleResult`. Emits `module_result.aggregated` event.

**Acceptance:** curl/Playwright test: POST returns 200 with aggregate+grade; AuditLog row present; n8n webhook receives the event.

## SJMS-P14-04 — Moderation escalation

**Severity:** HIGH
**Domain:** assessment
**Dep:** SJMS-P14-01

In `marks.service.ts`, when a second mark is recorded:
- Read `SystemSetting['assessment.moderation.discrepancy_threshold']` (default 10).
- If `|secondMark − firstMark| ≥ threshold`: create `ModerationRecord` with status `ESCALATED`, emit `marks.moderation_escalated`.

**Acceptance:** given firstMark=65, secondMark=78, threshold=10, a `ModerationRecord` row is created with status `ESCALATED` and an event fires.

## SJMS-P14-05 — Degree classification engine

**Severity:** BLOCKER
**Domain:** progression
**Dep:** SJMS-P14-02

Create `server/src/utils/classification.ts` with `calculateClassification(studentId, programmeId)`. Consumes `DegreeCalculation.yearWeights` (e.g. `{"Y1":0, "Y2":40, "Y3":60}`). Returns First / 2:1 / 2:2 / Third / Fail using standard UK HE bands (70/60/50/40).

**Acceptance:** seeded 3-year student with Y2 average 65, Y3 average 68 (0/40/60 weights) computes to 66.8 → "2:1". Unit tests for all band boundaries and edge cases (borderline, Year-0 Foundation).

## SJMS-P14-06 — Credit threshold + compensation

**Severity:** HIGH
**Domain:** progression
**Dep:** SJMS-P14-05

- Credit threshold check per FHEQ level (120/year FT, 75/year PT), externalised via `SystemSetting['progression.credits.fulltime']` etc.
- Compensation: student may pass at 35-39% if overall credits at 40%+ ≥ compensation threshold (typically 90-100 of 120).
- Applied on progression decision creation.

**Acceptance:** seeded edge case (student with 105 credits at 40%+ and one 37% module) computes to "PASS with compensation"; student with 80 credits at 40%+ and a 37% fail computes to "REFER".

## SJMS-P14-07 — Status transition guard middleware

**Severity:** BLOCKER
**Domain:** platform / middleware
**Dep:** SJMS-P13-10

Create `server/src/middleware/status-guard.ts`. Reusable for Application, Enrolment, ModuleRegistration, AssessmentAttempt. Reads a per-entity transition map (declared in each service's schema file). Rejects illegal transitions with 422.

**Acceptance:**
- POST PATCH to Application with status `WITHDRAWN` → `SUBMITTED` returns 422.
- POST PATCH to Enrolment with status `ACTIVE` → `WITHDRAWN` is allowed.
- Unit tests for all 4 entity types.

## SJMS-P14-08 — Enrolment cascade on suspend/withdraw

**Severity:** HIGH
**Domain:** enrolment
**Dep:** SJMS-P14-07

When `enrolment.status` changes to `SUSPENDED` or `WITHDRAWN`:
- Cascade to active `ModuleRegistration` rows (status → `SUSPENDED`/`WITHDRAWN`).
- Emit `finance.enrolment_status_changed` event so finance workflow can reassess charges.
- Write a cascade record to AuditLog.

**Acceptance:** suspending an enrolment with 3 active module registrations results in all 3 being suspended in a single transaction; AuditLog has a cascade row; event fires.

## SJMS-P14-09 — Applicant-to-student conversion

**Severity:** HIGH
**Domain:** admissions / enrolment
**Dep:** SJMS-P14-07

Create `server/src/api/admissions/applicant-to-student.service.ts`:
- Triggered when `Application.status` becomes `ACCEPTED`.
- Creates `Student` + `Enrolment` (status `REGISTERED`).
- Copies `PersonName` / `PersonAddress` / `PersonContact`.
- Emits `student.created` and `enrolment.created`.

**Acceptance:** Playwright test walks an application from submission → accept → student created; Student and Enrolment both visible in Academic portal.

## SJMS-P14-10 — Auto fee charging on enrolment

**Severity:** HIGH
**Domain:** finance / enrolment
**Dep:** SJMS-P14-09

On Enrolment create:
- Lookup `FeeRate` by `(feeStatus, programmeId, academicYear)`.
- Create `ChargeLine` on `StudentAccount`.
- Emit `finance.charge_line_created`.

**Acceptance:** new home-status UG enrolment on programme X creates a £9,535 ChargeLine (or whatever the fee rate dictates). Admin portal shows the charge; Student portal shows the outstanding balance.

## SJMS-P14-11 — Attendance threshold wiring + UKVI alert

**Severity:** BLOCKER
**Domain:** attendance / ukvi
**Dep:** SJMS-P14-07

- Remove the TODO on `attendance.service.ts:129`.
- After each attendance record, compute rolling percentage for the student in the current module / academic year.
- Compare against `SystemSetting['ukvi.attendance.threshold']` (default 70%).
- On breach: create `AttendanceAlert`, create/update `UKVIRecord`, emit `ukvi.compliance_changed`.
- Activate n8n workflows 01 through 05 (`01-student-enrolment-notification`, `02-engagement-alert`, `03-ec-claim-workflow`, `04-marks-release`, `05-ukvi-attendance-breach`) and confirm end-to-end execution.

**Acceptance:** seeding a student with 40% rolling attendance on a module creates an `AttendanceAlert` row, a `UKVIRecord` update, and fires the n8n UKVI workflow. n8n shows an execution row in its DB.

## SJMS-P14-12 — Soft-delete migration for child entities

**Severity:** HIGH
**Domain:** prisma / migrations
**Dep:** SJMS-P13-10

Add `deletedAt DateTime?` to: `AssessmentComponent`, `MarkEntry`, `ChargeLine`, `Payment`, `Invoice`, `HESAStudent`, `HESAStudentModule`. Single migration. Update repositories to filter `deletedAt IS NULL` in list() / getById().

**Acceptance:**
- Prisma migration applies cleanly.
- `DELETE /v1/marks/:id` now soft-deletes (verify in DB: row present with `deletedAt` set).
- `GET /v1/marks?id=X` returns 404 after soft-delete.

## SJMS-P14-13 — Expand service unit tests

**Severity:** MEDIUM
**Domain:** testing
**Dep:** SJMS-P14-01..11

Raise service unit-test coverage from 9 → 20 files. Priority: the 5 new utilities above + `module-registrations.service`, `progressions.service`, `awards.service`, `hesa.service` with real mapping logic, `documents.service`, `communications.service`.

**Acceptance:** `npm test` in server reports ≥ 200 tests passing. Coverage report for `server/src/utils/` and `server/src/api/{assessment, progression, enrolment, ukvi, finance}` ≥ 70% statements.

## SJMS-P14-14 — KI-P10b-001..003 closeout

**Severity:** MEDIUM
**Domain:** various
**Dep:** SJMS-P14-11 (UKVI wiring), SJMS-P14-10 (finance)

Close the three open P10b KIs:
- KI-P10b-001: Finance sub-domain APIs (Sponsors, Bursaries, Refunds) — decide: implement basic CRUD or keep as ComingSoon with documented deferred status.
- KI-P10b-002: MinIO binary file upload not wired — implement presigned URL generation in `documents.service.ts`.
- KI-P10b-003: Academic portal module scoping — scope `/v1/modules?scopeToTeacher=true` so academics only see their assigned modules.

**Acceptance:** `grep -c "OPEN" docs/KNOWN_ISSUES.md` for P10b items = 0; all three now `CLOSED` with commit hashes.

## SJMS-P14-15 — Phase 14 exit review

**Severity:** HIGH
**Domain:** review / docs
**Dep:** all prior P14 items

- Run Cursor BugBot review on the aggregated Phase 14 PR.
- Update `docs/review/` with a new Phase 14 scorecard against the golden journeys (`docs/review/phase-10b-now/03-golden-journeys.md`).
- Minimum exit bar: 5 of 10 golden journeys score GO, not PARTIAL.
- Update maturity scorecard in `docs/review/phase-13-enhanced-review.md`: business application layer should rise from 1.5/10 to ≥ 5/10.

**Acceptance:**
- At least 5 golden journeys marked GO with evidence.
- BugBot HIGH count = 0 on Phase 14 PR.
- `docs/review/phase-14-exit-scorecard.md` committed.

---

# Out of scope for this playbook

- **Phase 15 — Statutory Compliance** (HESA Data Futures, UCAS, CMA, UKVI reports). Separate playbook once Phase 14 is complete.
- **Phase 16 — Analytics, Reporting, Operability.** Includes MFA enforcement, correlation IDs, presigned URLs, GDPR erasure, Sentry, Redis identity cache, n8n full activation, business metrics.
- **Phase 17 — Multi-Tenancy and Commercial Hardening.** Only if commercial path is chosen.

See `docs/review/phase-13-enhanced-review.md` Part IV for the full roadmap.

---

# Tracking

| ID | Status | Commit | Notes |
|---|---|---|---|
| SJMS-P13-01 | OPEN | — | — |
| SJMS-P13-02 | OPEN | — | BLOCKER on any SME engagement |
| SJMS-P13-03 | OPEN | — | — |
| SJMS-P13-04 | OPEN | — | — |
| SJMS-P13-05 | OPEN | — | — |
| SJMS-P13-06 | OPEN | — | — |
| SJMS-P13-07 | OPEN | — | Decision needed from Richard |
| SJMS-P13-08 | OPEN | — | — |
| SJMS-P13-09 | OPEN | — | DB inspection required |
| SJMS-P13-10 | OPEN | — | — |
| SJMS-P14-01 | OPEN | — | — |
| SJMS-P14-02 | OPEN | — | — |
| SJMS-P14-03 | OPEN | — | — |
| SJMS-P14-04 | OPEN | — | — |
| SJMS-P14-05 | OPEN | — | — |
| SJMS-P14-06 | OPEN | — | — |
| SJMS-P14-07 | OPEN | — | — |
| SJMS-P14-08 | OPEN | — | — |
| SJMS-P14-09 | OPEN | — | — |
| SJMS-P14-10 | OPEN | — | — |
| SJMS-P14-11 | OPEN | — | — |
| SJMS-P14-12 | OPEN | — | — |
| SJMS-P14-13 | OPEN | — | — |
| SJMS-P14-14 | OPEN | — | — |
| SJMS-P14-15 | OPEN | — | — |

On close, update the row with the commit hash and a one-line note. Append `**CLOSED:** YYYY-MM-DD — <hash> — <note>` to the item body itself.
