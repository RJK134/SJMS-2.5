# AI-Assisted Build Process

> **Role class**: Lead architect + AI orchestration engineer  
> **Toolchain**: Claude Code (builder), Perplexity Computer (verifier), BugBot (continuous audit)  
> **Purpose**: Defines the workflow, discipline, and patterns for building complex enterprise systems using AI coding assistants.

---

## 1. Core Principle: Separation of Builder and Verifier

**Never use a single AI agent as both builder and verifier.**

This is the foundational rule. An agent that builds and then audits its own output has a strong confirmation bias toward declaring its work correct. The architectural mistakes that matter — orphaned FK chains, missing HESA fields, American English variable names, monolithic route files — are precisely the ones a self-auditing builder will miss.

| Role | Tool | Mandate |
|---|---|---|
| **Builder** | Claude Code | Executes the phase. Writes code. Runs migrations. Commits. Pushes. |
| **Verifier** | Perplexity Computer | Audits the output. Clones the repo. Runs checks. Issues GO / NO-GO. |
| **Continuous Auditor** | BugBot | Scans PRs and commits. Flags regressions. Not a replacement for Perplexity. |

The builder and verifier must be **independent**. The verifier never reads the builder's self-assessment. The verifier clones the repo fresh and runs its checks from first principles.

---

## 2. Session Architecture

### 2.1 Live Context Summary Document

Every build project maintains a single, continuously updated context summary document. It is updated at the **end of every session** without exception. An outdated context summary is the primary cause of quality degradation across sessions.

**Required sections:**

```markdown
# Context Summary — [Project Name]
Last updated: [ISO 8601 datetime] by [session initiator]

## Current Status
Phase: [e.g. Phase 3B — Assessment domain routes]
Branch: [git branch name]
Last verified commit: [short SHA]

## TODO List
| # | Task | Status | Phase | Notes |
|---|------|--------|-------|-------|
| 1 | Prisma schema 183 models | DONE | 0 | Commit abc1234 |
| 2 | Seed data 12 domain sets | DONE | 1A | Commit def5678 |
| 3 | Auth middleware | DONE | 2 | Commit ghi9012 |
| 4 | Student routes | IN PROGRESS | 3A | — |
| 5 | Assessment routes | PENDING | 3B | Blocked on 4 |

## Shared Assets
| Asset | Description | File Path / Asset ID |
|-------|-------------|---------------------|
| CLAUDE.md | Agent constitution | /repo/CLAUDE.md |
| Build plan | Phase-by-phase plan | /repo/docs/build-plan.md |
| Prisma schema | Full 183-model schema | /repo/prisma/schema.prisma |
| n8n workflows | Exported JSON | /repo/n8n/workflows/ |

## User Instructions (Persistent)
- Always use British English in variable names, comments, UI strings
- Never use `prisma db push` — always `prisma migrate dev`
- Never commit .env
- Every phase must end with a verified commit pushed to GitHub
- Output must be written to /tmp/output.md at end of each session

## All User Messages (Chronological)
[Full history of user instructions — never summarise, always preserve verbatim]

## Active Task
[Current phase objective, acceptance criteria, files in scope]

## Context & Artifacts
[Relevant decisions made, models agreed, patterns established]

## Session History
| Session | Date | Phases | Outcome | Notes |
|---------|------|--------|---------|-------|
| 1 | 2025-09-01 | 0, 1A | GO | Schema + seed data |
| 2 | 2025-09-03 | 1B, 2 | GO | Auth + RBAC middleware |

## Skills Loaded
- university-sis-architect (loaded Session 1, persistent)
- docker-enterprise-stack (loaded Session 1, persistent)

## Key Details to Preserve
- Fee status snapshot field: feeStatusSnapshot on SCE — must be immutable after enrolment confirmed
- HESA snapshot triggers: defined in migration 0003_hesa_immutability.sql
- Keycloak realm: 'fhe' — do not rename
- MinIO buckets: student-documents, staff-documents, system-exports
```

### 2.2 Session Length Limits

Claude Code sessions degrade after approximately **16–18 major phases**. Degradation symptoms precede the hard limit — watch for them from Phase 14 onwards. When degradation is detected, end the session immediately regardless of phase position.

```
Session lifecycle:
  Phases 1–10:    Peak quality — complex, multi-file phases are safe
  Phases 11–14:   Stable — monitor for early degradation signals
  Phases 15–16:   Caution zone — single-concern phases only
  Phases 17+:     High degradation risk — end session at first signal
```

---

## 3. CLAUDE.md / AGENTS.md — The Agent's Constitution

Every project must have a `CLAUDE.md` (or `AGENTS.md` for multi-agent setups) at the repository root. Claude Code reads this file automatically at session start. It is not a README — it is operational doctrine.

### 3.1 Required Sections

```markdown
# CLAUDE.md — [Project Name] Agent Constitution

## Stack Overview
- Runtime: Node.js 20 LTS
- Framework: Express 4.x
- ORM: Prisma 5.x
- Database: PostgreSQL 16
- Auth: Keycloak 24 (OIDC/PKCE)
- Frontend: React 18 + Vite 5 + TypeScript 5
- Cache: Redis 7
- Object storage: MinIO
- Workflow automation: n8n (self-hosted)
- Containerisation: Docker Compose (8-service stack)
- CI/CD: GitHub Actions → Railway (staging) → Production

## Project Directory Structure
/repo
  /prisma
    schema.prisma          ← Single schema file, 183 models
    /migrations            ← NEVER delete, NEVER edit manually
  /src
    /routes                ← One file per domain (37 files)
    /services              ← Business logic, one file per domain
    /middleware            ← auth.ts, rbac.ts, validation.ts
    /utils                 ← Shared utilities only
    /types                 ← TypeScript type definitions
  /client
    /src
      /components
      /pages
      /hooks
  /docker
    docker-compose.yml
    nginx.conf
    /keycloak
  /docs
    build-plan.md
    context-summary.md     ← Update after every session

## Naming Conventions
Database columns:     snake_case, British English (e.g. programme_code, enrolment_date)
TypeScript:           camelCase, British English (e.g. programmeCode, enrolmentDate)
React components:     PascalCase (e.g. StudentEnrolmentForm)
API routes:           kebab-case (e.g. /api/student-enrolment)
Environment vars:     SCREAMING_SNAKE_CASE (e.g. POSTGRES_PASSWORD)

## Commit Message Format
<type>: Phase <N><sub> — <short description>

Examples:
  feat: Phase 0 — Prisma schema 183 models, 12 domain seed sets
  feat: Phase 1A — Express API scaffold, health endpoint
  fix: Phase 3A — Correct FK on student_module_taking
  refactor: Phase 4B — Extract assessment bounded context
  chore: Phase 5 — Docker Compose health checks all services

Types: feat | fix | refactor | test | chore | docs

## NEVER DO THESE
- NEVER run `prisma db push` — always `prisma migrate dev` (dev) or `prisma migrate deploy` (prod)
- NEVER commit .env — it must not appear in git history
- NEVER create a monolithic routes file — one file per domain
- NEVER use American English in variable names, comments, or UI strings
- NEVER overwrite a migration file — create a new one
- NEVER use soft deletes (deleted_at) on HESA-reportable entities
- NEVER use anonymous Docker volumes — always named volumes
- NEVER return all student records to an academic staff role — scope to their modules

## Known Codebase Pitfalls
- MinIO health check must use `curl`, not `mc ready` (mc not bundled in image)
- nginx upstream for client must use port 80 (internal), not 5173 (host-mapped)
- Keycloak health probe requires KC_HEALTH_ENABLED: "true" in env AND probe in docker-compose
- studentFeeStatusSnapshot on SCE must be set at enrolment confirmation and never updated
- Assessment domain: SMO and SMR are separate models — do not merge them

## Verification Commands
# Run these at the end of every phase before committing
npx tsc --noEmit                          # TypeScript: must exit 0
npx prisma validate                       # Prisma schema: must pass
npx prisma generate                       # Prisma client: must succeed
grep -r "deleted_at" --include="*.prisma" # Should return nothing
grep -r "enrollment" --include="*.ts"     # Should return nothing (British English)
grep -r "db push" --include="*.sh"        # Should return nothing

## Output Persistence
At the end of every session, write a summary to /tmp/output.md including:
- Phase completed
- Files created or modified (with paths)
- Commit hash
- Any issues encountered
- Recommended next phase
```

---

## 4. Build Prompt Anatomy

A self-contained Claude Code build prompt must include all ten elements. Missing any element reduces output quality and increases the chance of regressions.

### 4.1 Complete Prompt Template

```
## Role
You are a senior UK higher education SIS developer. You understand HESA Data Futures,
Tribal SITS entity alignment, and the full SJMS build conventions documented in CLAUDE.md.

## Project
Local path: ~/projects/sjms
GitHub repo: git@github.com:org/sjms.git
Branch: main (currently at commit [SHORT_SHA])

## Stack
- Node.js 20 LTS / Express 4.x / TypeScript 5.x
- Prisma 5.x / PostgreSQL 16
- Keycloak 24 (OIDC/PKCE) / Redis 7 / MinIO / n8n
- Docker Compose 8-service stack

## Phase Objective
Phase 3A — Student domain routes and service layer.
Create the student routes file, service layer, and RBAC middleware integration.
No other domains. No frontend changes. No schema changes.

## Acceptance Criteria
1. /src/routes/student.routes.ts exists and exports a Router
2. /src/services/student.service.ts exists with typed service functions
3. GET /api/students/:id returns 403 for academic staff requesting a student
   not in their modules (RBAC scoping tested with Jest mock)
4. GET /api/students/:id returns 200 for Registrar role
5. GET /api/students/:id returns 200 for Student role requesting own record
6. GET /api/students/:id returns 403 for Student role requesting another student
7. All functions use British English variable names (no "enrollment", "program")
8. tsc --noEmit exits 0
9. Jest test suite for student routes: all tests pass

## Files to Create / Modify
CREATE: /src/routes/student.routes.ts
CREATE: /src/services/student.service.ts
CREATE: /src/services/__tests__/student.service.test.ts
MODIFY: /src/routes/index.ts — register student router

## Do NOT Do
- Do not modify the Prisma schema
- Do not create a new migration
- Do not modify any other domain routes
- Do not use American English (enrollment, program, color, organization)
- Do not use `any` types
- Do not bypass RBAC — all queries must go through scopedStudentQuery()

## Verification Commands (run before committing)
npx tsc --noEmit
npx jest src/services/__tests__/student.service.test.ts
grep -n "enrollment\|program[^m]\|color\|organization" src/routes/student.routes.ts
grep -n "enrollment\|program[^m]\|color\|organization" src/services/student.service.ts

## Output
1. Commit with message: `feat: Phase 3A — Student routes, service layer, RBAC scoping tests`
2. Push to origin/main
3. Write session summary to /tmp/output.md including commit hash and test results
```

### 4.2 Anti-Patterns to Avoid in Build Prompts

| Anti-Pattern | Problem | Fix |
|---|---|---|
| "Build the student module" | Too vague — agent interprets scope incorrectly | Specify exact files, exact endpoints, exact tests |
| Multiple concerns in one phase | Cross-concern pollution — schema change breaks route tests | One phase = one concern |
| No acceptance criteria | Agent declares success based on completion, not correctness | Numbered, testable criteria mandatory |
| No "do not do" list | Agent reverts previously fixed patterns | Always include what to avoid |
| No commit reference | Agent may work from wrong base state | Include previous commit SHA |
| No verification commands | Agent skips TypeScript check | Specify commands to run, expected exit codes |

---

## 5. Verification Prompt Anatomy

A self-contained Perplexity Computer verification prompt for each phase.

### 5.1 Complete Verification Template

```
## Verification Task
Phase 3A of the SJMS university SIS build has been completed by the builder agent.
Your task is to independently verify the output and issue a GO or NO-GO verdict.

## What Was Built
- Student domain routes file: /src/routes/student.routes.ts
- Student service layer: /src/services/student.service.ts
- RBAC scoping tests: /src/services/__tests__/student.service.test.ts
- Commit: [SHORT_SHA] on branch main

## Repository
Clone: git clone git@github.com:org/sjms.git
Checkout: git checkout main && git pull

## Files to Inspect
1. /src/routes/student.routes.ts
   - Must export an Express Router
   - Must import from student.service.ts (not inline logic)
   - All endpoints must pass through auth middleware
   - No American English (check: enrollment, program, color)

2. /src/services/student.service.ts
   - Must use scopedStudentQuery() for all student data access
   - Must have explicit TypeScript return types on all functions
   - No `any` types

3. /src/services/__tests__/student.service.test.ts
   - Must include tests for Student role accessing own record (expect 200)
   - Must include tests for Student role accessing other record (expect 403)
   - Must include tests for Academic staff role (expect 403 if not their module)
   - Must include tests for Registrar role (expect 200)

## Commands to Run
cd /path/to/cloned/repo
npx tsc --noEmit
npx jest src/services/__tests__/student.service.test.ts --verbose
grep -n "enrollment\|program[^m]\|color\|organization" src/routes/student.routes.ts
grep -n "enrollment\|program[^m]\|color\|organization" src/services/student.service.ts
grep -rn "any" src/services/student.service.ts

## Pass/Fail Criteria
| Check | Pass Condition | Severity if Fail |
|-------|---------------|-----------------|
| tsc --noEmit | Exit code 0, zero errors | FAIL |
| Jest tests | All tests pass | FAIL |
| RBAC: student own record | 200 returned | FAIL |
| RBAC: student other record | 403 returned | FAIL |
| RBAC: academic staff scoping | 403 if not their module | FAIL |
| British English | grep returns zero matches | WARN |
| No implicit any | grep returns zero matches | WARN |
| Router exported correctly | Router imported in index.ts | FAIL |

## Issue Reporting Format
SEVERITY | FILE PATH | LINE NUMBER | DESCRIPTION
FAIL     | src/routes/student.routes.ts | 47 | Uses 'enrollment' (American English)
WARN     | src/services/student.service.ts | 23 | Implicit `any` in function parameter

## GO / NO-GO Verdict
GO:    All FAIL criteria pass. WARNs noted and scheduled.
NO-GO: Any single FAIL criterion is not met.

Issue your verdict as the final line: **VERDICT: GO** or **VERDICT: NO-GO**
If NO-GO, list the blocking FAILs and recommended fixes.
```

---

## 6. Phase Gate Discipline

### 6.1 Verdict Outcomes

```
VERDICT: GO
  → Proceed to next phase
  → Log GO in context summary session history
  → WARNs must be added to TODO list with priority MEDIUM

VERDICT: NO-GO
  → STOP. Do not proceed to next phase.
  → Builder agent must fix all blocking FAILs
  → Re-run verification after fixes
  → Second NO-GO on the same phase = architectural review required
  → Log NO-GO in context summary with all blocking issues
```

### 6.2 Severity Levels

| Severity | Definition | Action |
|---|---|---|
| **FAIL** | A criterion that blocks statutory compliance, data integrity, or functional correctness | Blocks phase progression. Must be fixed before proceeding. |
| **WARN** | A criterion that reduces quality, increases debt, or violates conventions | Scheduled for fix in the next available phase. Never ignored. |
| **ADVISORY** | Informational — no immediate action required | Logged in context summary. Reviewed at end of project. |

### 6.3 Phase 0 Special Rules

Phase 0 (foundational schema, Docker stack, base configuration) has stricter rules:

- Two FAILs in Phase 0 = full stop. Fix before Phase 1A regardless of how minor they appear.
- Phase 0 FAILs compound — a wrong FK pattern in Phase 0 becomes a rewrite in Phase 6.
- Typical Phase 0 FAILs to watch for:
  - `prisma validate` fails (schema error)
  - Anonymous Docker volumes (data loss risk)
  - Wrong nginx upstream port (502 at Phase 1A)
  - Missing HESA entity fields on core models
  - `deleted_at` soft delete on HESA entities

---

## 7. Circular Fix Loop Detection and Resolution

### 7.1 Symptom Recognition

A circular fix loop has begun when:

```
Cycle 1: BugBot/Claude fixes issue A → introduces issue B
Cycle 2: Fix issue B → re-introduces issue A (or variant)
Cycle 3: Fix issue A again → issue B or new issue C appears
```

If you observe **3 or more fix cycles on the same logical problem**, stop fixing immediately.

### 7.2 Diagnosis

Circular fix loops are always a symptom of **architectural debt**, not a code bug. Common causes:

| Cause | Presenting Symptom |
|---|---|
| Domain model overloading | Assessment model used for both module marks and progression decisions — changing it for one breaks the other |
| Missing bounded context | Finance and Enrolment share a model — fee status change triggers enrolment event, enrolment event triggers fee recalculation (circular) |
| Implicit coupling | Service A calls Service B which calls Service A through a shared utility |
| Schema ambiguity | A field is used for two different purposes by different domains |

### 7.3 Resolution Protocol

```
1. STOP all fix attempts on the affected component
2. Map the domain model: list every entity, field, and relationship involved
3. Identify the overloaded element: which model/field is doing two jobs?
4. Define the bounded context: what should this domain own exclusively?
5. Design the decomposed model: separate models with explicit interfaces
6. Implement cleanly: new migration, new models, new services
7. Migrate data from old model to new (write a one-time migration script)
8. Remove old model in a subsequent phase (verify no references remain)
9. Re-run Phase 0 verification checks on the redesigned domain
```

### 7.4 Prevention

```typescript
// Bounded context discipline — each domain owns its models
// Assessment domain: owns SMO, SMR, SQA
// Finance domain: owns FeeRecord, Invoice, Payment
// Compliance domain: owns CasRecord, UkviContactPoint

// Cross-domain access is via service interfaces only — never direct Prisma queries
// Assessment service does NOT import from finance.service.ts directly
// Finance service does NOT import from assessment.service.ts directly
// Cross-domain events go through n8n webhooks or an internal event bus

// Example: Assessment Board result triggers bursary review
// WRONG: assessment.service.ts imports finance.service.ts
// RIGHT: assessment.service.ts fires webhook → n8n workflow → finance.service.ts
```

---

## 8. Prompt Quality Patterns

### 8.1 Scoping Rules

| Scope | Output Quality | Use For |
|---|---|---|
| Single file, single concern | Excellent | Any production phase |
| Single domain, multiple files | Good | Complete domain delivery |
| Multiple domains in one prompt | Poor | Never — creates circular debt |
| "Build everything" | Unusable | Never |

**Scoped, discrete tasks produce 10x better output than "build everything" prompts.** This is empirically observed across hundreds of AI build sessions, not a theoretical claim.

### 8.2 The One Phase = One Concern Rule

```
WRONG:
"Build the student API, set up Keycloak realms, create the fee matrix, 
and connect the React frontend components."

RIGHT (4 separate phases):
Phase 3A: Student API routes and service layer (RBAC scoped)
Phase 4: Keycloak realm configuration and client OIDC setup
Phase 5A: Fee matrix schema and population
Phase 6: React student portal — read-only profile view
```

### 8.3 Commit SHA Reference

Always include the previous commit hash in build prompts:

```
Branch: main (currently at commit a3f9c21)
```

This prevents the builder from working from an unexpected base state (e.g. if a previous session's push failed silently or if a hotfix was applied between sessions).

### 8.4 "Do Not Do" List Prevents Regressions

The most valuable lines in a build prompt are the prohibitions. Analysis of build regressions shows:

| Regression | Would have been prevented by |
|---|---|
| `prisma db push` used instead of `prisma migrate dev` | "NEVER use db push" in CLAUDE.md and build prompt |
| American English variables | "No enrollment, program, color" in build prompt |
| Monolithic route file extended | "One file per domain, do not modify routes/index.ts to add logic" |
| Soft delete added to HESA entity | "No deleted_at on HESA entities" |
| Anonymous Docker volume | "Named volumes only — see docker-compose.yml pattern" |

---

## 9. Context Degradation Signals

Monitor for these signals from Phase 14 onwards. Any single signal = end session.

### 9.1 Degradation Indicators

| Signal | What It Looks Like | Severity |
|---|---|---|
| **File recreation** | Agent creates `student.routes.ts` despite it existing since Phase 3A | Critical — end session |
| **CLAUDE.md ignored** | Agent uses `db push` despite explicit prohibition | Critical — end session |
| **American English regression** | New code contains `enrollment`, `color`, `initialize` | High — end session |
| **Pattern reversion** | Soft delete pattern reappears on an entity that was fixed | High — end session |
| **Quality drop** | Phase output is noticeably less complete than previous phases | Medium — monitor |
| **Fabricated references** | Agent refers to files or commits that do not exist | Critical — end session |

### 9.2 Recovery Protocol

```
1. End current session without committing degraded output
2. Note exact degradation signal in context summary
3. Pull clean state: git status (should be clean), git log --oneline -5
4. Update context summary: mark which tasks were completed, which are pending
5. In new session: paste full context summary as first message
6. Restart with a single, tightly scoped phase
7. Run full verification before proceeding
```

---

## 10. Tool Coordination

### 10.1 Full Toolchain Reference

| Tool | Purpose | Pre-conditions | Key Commands |
|---|---|---|---|
| **Docker Desktop** | Container runtime | Must be running before any `docker compose` command | `docker compose up -d`, `docker compose logs` |
| **GitHub gh CLI** | Repo operations | Authenticated with `gh auth login` | `gh pr create`, `gh pr merge`, `gh run list` |
| **Prisma** | ORM, schema, migrations | Docker PostgreSQL must be healthy | `prisma migrate dev`, `prisma migrate deploy`, `prisma generate` |
| **n8n** | Workflow automation | n8n container healthy, port 5678 accessible | Webhook URLs, workflow JSON export/import |
| **Postman** | API contract testing | API container healthy, port 3001 accessible | Collection runner, environment vars |
| **Grafana** | Observability | Phase 7+ only; Prometheus scraping API metrics | Dashboards for response times, error rates |
| **Railway** | Staging deployment | GitHub repo connected; Railway project configured | `railway up`, `railway logs` |
| **BugBot** | Continuous audit | GitHub integration active | Automatic on PR; `@BugBot review` for manual trigger |

### 10.2 Critical Tool Dependencies

```
Before Phase 0:
  ✓ Docker Desktop running
  ✓ gh CLI authenticated
  ✓ Local .env populated from .env.example
  ✓ postgres container healthy (prisma migrate dev will fail otherwise)

Before API tests (Phase 3+):
  ✓ docker compose up -d
  ✓ All 8 containers healthy (verify: docker compose ps)
  ✓ Keycloak realm configured and client created
  ✓ Test user seeded in Keycloak

Before staging deployment:
  ✓ All Phase quality gates passed
  ✓ Railway project connected to GitHub repo
  ✓ Railway env vars set (matching .env.example)
  ✓ PostgreSQL on Railway provisioned and migrated
```

### 10.3 Prisma Discipline

```bash
# Development: generates migration file AND applies it
npx prisma migrate dev --name "phase_3a_student_routes_indexes"

# Production CI/CD: applies pending migrations only
npx prisma migrate deploy

# Verify before every commit
npx prisma validate
npx prisma generate

# NEVER
npx prisma db push   # Bypasses migration history — prohibited
```

### 10.4 n8n Webhook Integration Pattern

```typescript
// Every domain mutation must fire a webhook to n8n
// This enables workflow automation without circular service dependencies

async function fireWorkflowEvent(eventType: string, payload: object): Promise<void> {
  const webhookUrl = process.env.N8N_WEBHOOK_BASE_URL;
  if (!webhookUrl) throw new Error('N8N_WEBHOOK_BASE_URL is not configured');
  
  await fetch(`${webhookUrl}/webhook/${eventType}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timestamp: new Date().toISOString(),
      event: eventType,
      payload
    })
  });
}

// Usage: after student enrolment confirmed
await fireWorkflowEvent('student.enrolled', {
  studentId: enrolment.studentId,
  academicYear: enrolment.academicYear,
  programmeCode: enrolment.programmeCode
});
```

---

## 11. Cost Management

### 11.1 Credit Consumption Profile

| Operation | Relative Cost | Notes |
|---|---|---|
| Claude Code phase (single file) | Low | Most cost-efficient |
| Claude Code phase (domain scaffold) | Medium | 3–5 files, tests |
| Claude Code phase (cross-domain) | High | Often requires rework — avoid |
| Perplexity Computer verification | Low-Medium | Cheaper than Claude Code self-audit |
| Wide-browse / wide-research (20+ entities) | Very High | Always confirm with user before running |
| Context summary re-read per prompt | Low but cumulative | Cache by reference, not by re-pasting |

### 11.2 Cost Reduction Strategies

```
1. Cache frequently-referenced documents
   - Build plan, CLAUDE.md, context summary live in the repo
   - Reference them by path: "Read CLAUDE.md at /repo/CLAUDE.md"
   - Never paste their full contents into every prompt

2. Use Perplexity Computer for verification, not Claude Code
   - Claude Code self-auditing has lower accuracy and higher credit cost
   - Perplexity Computer's browse + shell capabilities are sufficient for phase verification

3. Wide-browse is a credit sink
   - "Research 25 UK universities' HESA compliance approaches" = very high cost
   - Always ask: "Can I answer this from existing documentation first?"
   - Confirm with user before triggering any wide-browse or wide-research operation

4. Tight phase scoping reduces rework cost
   - A well-scoped Phase 3A that passes on first verification costs less than 
     a broad Phase 3 that requires 3 rounds of fixes
   
5. End degraded sessions promptly
   - A degraded session that produces output requiring full rewrite costs 2x
   - Cut losses early when degradation signals appear
```

### 11.3 Session Credit Checkpoint

At the start of each new session, record:
- Estimated credit budget remaining
- Number of phases completed
- Number of phases remaining
- Projected credit requirement for remaining phases

If projected cost exceeds budget: scope reduction discussion with user before proceeding.

---

## 12. Quality Assurance Summary

```
Build Phase Complete?
  ↓
Run verification commands locally (tsc, prisma validate, jest)
  ↓
All pass? → Commit with correct message format → Push to GitHub
  ↓
Issue Perplexity Computer verification prompt
  ↓
VERDICT: GO → Update context summary → Proceed to next phase
VERDICT: NO-GO → Fix FAILs → Re-verify → DO NOT proceed until GO
  ↓
Update context summary at end of session (MANDATORY)
  ↓
Check for context degradation signals before starting next session
```
