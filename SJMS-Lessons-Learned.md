# SJMS Lessons Learned
## Student Journey Management System — Build Process Retrospective

**Author:** Interim Academic Registrar (15+ years HE systems experience: Tribal SITS, Ellucian Banner)  
**Scope:** UCMS/2.4 prototype → SJMS 4.0 Claude Code build → SJMS 2.5 planned rebuild  
**Role:** Solo developer using AI coding assistants (Claude Code, Perplexity Computer)  
**Date:** April 2026  

---

> This document captures distilled, practitioner-level lessons from the full SJMS build arc. It is written for a senior technical audience with working knowledge of the UK Higher Education sector. Every lesson here was learned the hard way.

---

## Table of Contents

1. [Session & Context Management](#1-session--context-management)
2. [Architecture Decisions](#2-architecture-decisions)
3. [University Systems Domain Knowledge](#3-university-systems-domain-knowledge)
4. [Docker & Infrastructure](#4-docker--infrastructure)
5. [Security](#5-security)
6. [Code Quality](#6-code-quality)
7. [AI-Assisted Development Patterns](#7-ai-assisted-development-patterns)
8. [Project Management Patterns](#8-project-management-patterns)
9. [What 2.4 Did Well](#9-what-24-did-well-preserve-in-25)
10. [What 4.0 Did Well](#10-what-40-did-well-adopt-in-25)
11. [What Failed or Should Not Be Repeated](#11-what-failed-or-should-not-be-repeated)
12. [Summary Reference Table](#12-summary-reference-table)

---

## 1. Session & Context Management

### 1.1 Context Degradation is Real and Predictable

Both Claude Code and Perplexity Computer sessions degrade in quality as context grows. This is not a metaphor — it is a practically observable phenomenon that affects every long-running AI-assisted build. As the session accumulates tokens, the agent's effective attention narrows. The earliest instructions, architectural decisions, and naming conventions become progressively less influential relative to the most recent exchanges.

The symptom pattern is consistent:

1. Early phases produce clean, coherent code aligned to the agreed conventions.
2. Mid-session phases begin to introduce subtle divergences — wrong naming patterns, extra files that weren't requested, abbreviated implementations.
3. Late-session phases exhibit circular fix loops: the agent fixes the error introduced in the previous exchange, introducing a new error in doing so. This is sometimes called the BugBot spiral — Claude Code or a BugBot fix one thing and break another, and the developer finds themselves patching patches rather than building features.

The empirical threshold observed in this project is approximately **16–18 phases** within a single session before quality drop becomes significant enough to require a context reset. This is not a hard limit — it depends on phase complexity — but it serves as a practical planning heuristic.

**What to do:**
- Plan context resets proactively, not reactively. After ~16 phases, start a new session.
- Always carry a compact context summary into the new session (see §1.3).
- Never assume that session memory will faithfully recall a decision made 30 exchanges ago.

### 1.2 CLAUDE.md / AGENTS.md — The Agent's Constitution

Without an orientation file at the repository root, AI coding agents lose their bearings. They begin making divergent assumptions about the tech stack, naming conventions, file layout, and intended behaviour. On a solo-developer project this is recoverable; on a codebase with dozens of modules, divergent assumptions compound into genuine architectural fragmentation.

The `CLAUDE.md` (or `AGENTS.md`, depending on the toolchain) file at the repository root is not optional scaffolding. It is the agent's constitution. Every session must begin with the agent reading this file. Every update that changes a fundamental convention must update this file.

**Minimum content for a `CLAUDE.md` on a project of this scale:**

```markdown
# CLAUDE.md — Agent Orientation

## Stack
- Runtime: Node 20, TypeScript 5 strict
- Framework: Express 4
- ORM: Prisma 5 + PostgreSQL 16
- Client: React 18 + Vite + Tailwind + shadcn/ui
- Auth: Keycloak 24 (OIDC)
- Storage: MinIO
- Queues/Automation: Redis + n8n
- Container: Docker Compose 8-service

## Naming Conventions
- British English throughout (programme not program, colour not color,
  organisation not organization, authorise not authorize)
- Route files: `src/routes/<domain>/<entity>.routes.ts`
- Service files: `src/services/<domain>/<entity>.service.ts`
- Prisma model names: PascalCase, SITS-aligned where applicable
- Enum values: SCREAMING_SNAKE_CASE

## Commit Format
feat(<scope>): <description>
fix(<scope>): <description>
chore(<scope>): <description>

## What NOT to Do
- Do NOT use `db push` — always `prisma migrate dev`
- Do NOT add anonymous Docker volumes
- Do NOT hardcode port numbers in nginx.conf
- Do NOT commit .env files
- Do NOT write American English in UI strings, comments, or variable names
- Do NOT expand scope beyond the current phase acceptance criteria

## Known Pitfalls
- [List of accumulated pitfalls from prior phases]
```

This file is read at the start of every Claude Code session. It constrains the agent's behaviour and substantially reduces divergence across context resets.

### 1.3 Context Summary Format

The context summary format developed over the course of this project proved highly effective for continuity across sessions. The structure is:

```
## Context Summary — Session N

### Current TODO List
[ ] Phase X — <description> — PENDING
[x] Phase Y — <description> — COMPLETED
[~] Phase Z — <description> — IN PROGRESS

### Shared Assets
| Asset | File Path | Asset ID |
|-------|-----------|----------|
| Build Plan DOCX | /docs/SJMS-Build-Plan.docx | asset_abc123 |

### User Instructions (Standing Orders)
- Always write British English
- Phase gate: wait for GO before proceeding to Phase N+1
- Verification is done by Perplexity Computer, not Claude Code

### Session History
- Session 1: Phases 0–4 complete. Phase 4 (Auth) had JWT claims issue — fixed.
- Session 2: Phases 5–10 complete. Phase 8 (Finance) flagged for ledger review.
- Session 3: [current]

### Key Details
- Repo path: /home/user/sjms
- PostgreSQL: localhost:5432 / sjms_db
- Keycloak realm: sjms
```

The **session history** section is the single most valuable continuity mechanism. Without it, each new session treats prior work as a black box. With it, the agent understands what decisions were made, what was deferred, and what known issues exist.

### 1.4 Splitting Verification from Building

One of the most consequential structural decisions in this project was assigning **Perplexity Computer as verifier** and **Claude Code as builder**, and keeping those roles separated.

An agent cannot effectively audit its own output. When Claude Code writes a route handler and then reviews it, it will consistently miss issues that an independent reviewer would catch — not from bad faith, but because the same reasoning that produced the code will tend to validate the same code. The builder's mental model has already committed to the solution.

Perplexity Computer, operating in an independent session without knowledge of the build session's exchanges, can assess the output against the acceptance criteria as a genuine external reviewer. Issues caught this way in SJMS included:

- Missing `express-rate-limit` middleware (the API was rate-limited at nginx but not directly accessible).
- `mc ready` health check in MinIO (which fails when the `mc` binary is not in the health check context).
- Phase 0 port mismatch — nginx routing to `client:5173` when the container was listening on `:80`.
- British English violations in UI strings and database enum comments.

The practice: **write the verification prompt before the build prompt**. Knowing in advance what will be checked shapes what gets built.

### 1.5 Phase Gate Discipline

Compound errors are the primary failure mode of multi-phase builds. An uncorrected error in Phase 3 can invalidate assumptions in Phases 4, 5, 6, and 7 before anyone notices. By Phase 10, fixing the original error requires reworking half the subsequent phases.

The phase gate pattern prevents this:

1. Build Phase N using the build prompt.
2. Share the output with Perplexity Computer for independent verification.
3. Perplexity returns a **GO / NO-GO** verdict with a defect list.
4. If NO-GO: fix all listed defects before proceeding.
5. If GO: proceed to Phase N+1.

This is not bureaucracy. It is the minimum viable quality control mechanism for a solo developer who cannot rely on a team code review process.

**A NO-GO verdict must result in fixes before Phase N+1 begins, not "we'll fix it later."** Deferred fixes accumulate into a technical debt pile that eventually forces a rebuild. This is how the 4.0 build arrived at 13,887-line `storage.ts` — deferred fixes and deferred refactors, phase after phase.

---

## 2. Architecture Decisions

### 2.1 In-Memory Storage — The False Economy

`MemStorage` is seductive for early prototypes. It requires no infrastructure, no migrations, no Docker Compose, and no Prisma schema. A developer can wire up a route and see data flowing within minutes.

The problem is that `MemStorage` creates a hard architectural wall. When the time comes to migrate to PostgreSQL, the migration is not an upgrade — it is a complete rewrite of:

- The storage layer (every read/write operation)
- The data model (in-memory objects do not map cleanly to relational schemas with foreign keys and constraints)
- Any code that relied on JavaScript object reference equality or mutation semantics
- The query patterns (array `.filter()` does not translate to SQL `WHERE` without thought)

In the SJMS context, the in-memory prototype (2.4) was useful for demonstrating the user experience and validating the domain model. It was not useful as a foundation for production code. The correct lesson is: **use `MemStorage` only when you are certain you will throw the code away.** If there is any chance the prototype will evolve into production code — and there always is — start with Prisma from day one.

**The cost of setting up PostgreSQL + Docker Compose at the start of a project is a few hours. The cost of migrating from `MemStorage` to PostgreSQL mid-project is weeks of rewriting, re-testing, and re-validating.**

### 2.2 Database from Day One

```bash
# The correct starting point for any non-trivial HE SIS:
docker compose up -d postgres redis
npx prisma init
# Define your core schema immediately
npx prisma migrate dev --name init
```

Even if only five models are defined in the first session, using Prisma migrations from the beginning establishes:

- A migration history that documents every schema change.
- The discipline of thinking relationally before writing application code.
- The ability to roll back schema changes if a decision proves wrong.
- A deployment pathway that works the same in development and production.

Prisma also offers an important ergonomic benefit: the generated TypeScript client provides compile-time type safety across all database operations. Combined with TypeScript strict mode, this eliminates an entire class of runtime errors where the application assumes a field exists that the database does not provide.

### 2.3 Monolithic Files — The Maintenance Ceiling

The 4.0 build arrived at:

- `routes.ts` — 7,965 lines
- `storage.ts` — 13,887 lines

These files are not maintainable. No human can hold 14,000 lines of interrelated logic in working memory. No AI agent can reliably modify a 14,000-line file without introducing regressions. Grep-driven navigation is not architecture.

The correct pattern is **domain-modular API architecture** from the start:

```
src/
  routes/
    academic/
      programme.routes.ts
      module.routes.ts
      enrolment.routes.ts
    assessment/
      mark.routes.ts
      examboard.routes.ts
    finance/
      ledger.routes.ts
      payment.routes.ts
    student/
      profile.routes.ts
      attendance.routes.ts
    auth/
      keycloak.routes.ts
  services/
    academic/
    assessment/
    finance/
    student/
  middleware/
    auth.middleware.ts
    rateLimit.middleware.ts
    validate.middleware.ts
    errorHandler.middleware.ts
```

37 separate route modules, each under ~300 lines, are far more maintainable than one 8,000-line file. Each module can be understood in isolation. AI agents can be given a single module to modify without risk of cascading side effects.

The entry point (`index.ts`) becomes a clean registry:

```typescript
import programmeRoutes from './routes/academic/programme.routes';
import moduleRoutes from './routes/academic/module.routes';
// ... etc

app.use('/api/v1/programmes', programmeRoutes);
app.use('/api/v1/modules', moduleRoutes);
```

### 2.4 Bounded Contexts

Without domain boundaries, models collide. The clearest example from SJMS was the **flat Mark model** in the assessment domain. A single `Mark` model with overloaded fields was used for:

- Coursework submissions
- Exam marks
- Resit marks
- Agreed marks post-exam board
- Capped marks (for resits under regulations)
- Honours classification inputs

This created a model where every field was conditionally null, business logic was expressed through nullable flags rather than types, and every query required careful null-guarding. The correct model is explicit bounded types:

```prisma
model AssessmentAttempt {
  id              String         @id @default(cuid())
  enrolmentId     String
  assessmentId    String
  attemptNumber   Int
  attemptType     AttemptType    // FIRST_SIT | RESIT | DEFERRAL
  rawMark         Decimal?
  agreedMark      Decimal?
  cappedMark      Decimal?
  grade           String?
  outcome         AttemptOutcome // PASS | FAIL | DEFER | ABSENT | VOID
  boardedAt       DateTime?
  // ...
}
```

Bounded contexts at the code level enforce this separation. A service in the `assessment` domain should not directly mutate student finance records — it raises an event and the finance domain subscribes. This makes each domain independently testable, independently deployable, and independently comprehensible.

### 2.5 Effective-Dated Records and HESA Compliance

HESA Data Futures (now submitted via the Jisc TDP) uses a **continuous entity-relational model**. Unlike the old HESA record-based batch submissions, Data Futures expects each entity (student, enrolment, instance) to carry its own temporal validity — when it was true, when it changed, what it changed to.

This means the database must support **effective-dated records** natively. Soft deletes (`deletedAt: DateTime?`) are insufficient. The correct pattern uses immutable snapshots with database-enforced triggers:

```prisma
model StudentEnrolment {
  id            String    @id @default(cuid())
  studentId     String
  programmeId   String
  status        EnrolmentStatus
  effectiveFrom DateTime
  effectiveTo   DateTime? // null = currently active
  createdAt     DateTime  @default(now())
  createdBy     String
  // No updatedAt — records are immutable; create a new version instead
}
```

Paired with a database trigger that prevents direct UPDATE on `effectiveTo` (forcing a new record creation), this produces an audit trail that satisfies both internal governance requirements and HESA reporting obligations.

**Retrofitting effective-dating onto a schema that was not designed for it is destructive.** Every table must be revised, every query must be updated, and every API response must be reconsidered. Design for it from day one.

### 2.6 Double-Entry Financial Ledger

The SJMS finance domain manages tuition fee invoicing, SLC (Student Loans Company) funding, accommodation charges, scholarship credits, and refunds. A simple payments table (`amount`, `paidAt`, `studentId`) cannot correctly represent this domain.

A double-entry ledger is the correct data model for any system that handles financial transactions that must reconcile:

```prisma
model LedgerEntry {
  id              String          @id @default(cuid())
  transactionRef  String          // Groups debit/credit pair
  accountCode     String
  studentId       String?
  debitAmount     Decimal         @default(0)
  creditAmount    Decimal         @default(0)
  narrative       String
  postedAt        DateTime        @default(now())
  periodId        String          // Financial period
  source          LedgerSource    // INVOICE | PAYMENT | SCHOLARSHIP | REFUND | ADJUSTMENT
}
```

Every financial event produces two ledger entries (debit one account, credit another). The student's account balance is always `SUM(credits) - SUM(debits)` — computable, auditable, and correct.

**Retrofitting ledger semantics onto a simple payments table is destructive.** The schema changes fundamentally, the query logic changes fundamentally, and any existing financial data must be re-imported as opening balance entries. Do it right from the start.

### 2.7 Prisma Schema Scale Management

298 Prisma models with 46 enums is achievable in a production HE SIS. However, managing this at scale requires discipline:

- **Phase decomposition**: define 15–20 models per phase, migrate, verify, then proceed.
- **Schema splitting**: use `prisma-import` or manual file composition to split the schema across domain files.
- **Migration timeouts**: a single migration that adds 50 models and 10 enums to an existing database will timeout. Use `--create-only` to generate the migration SQL, review it, then apply it manually if needed.
- **Never use `db push` in production or on a shared database** — it bypasses migration history and makes rollback impossible.

```bash
# Correct workflow
npx prisma migrate dev --name add_assessment_domain
# Review the generated SQL in prisma/migrations/
# Apply to staging: npx prisma migrate deploy
# Apply to production: npx prisma migrate deploy
```

---

## 3. University Systems Domain Knowledge

### 3.1 SITS Entity Model as Reference Architecture

The Tribal SITS entity model is the de facto reference architecture for UK HE student information systems. Any new SIS built for a UK institution must align to these core entities:

| SITS Entity | Full Name | SJMS Equivalent |
|-------------|-----------|-----------------|
| STU | Student | `Student` |
| CAPS | Course Attempt Programme Status | `ProgrammeEnrolment` |
| ACD | Award | `Award` |
| SCJ | Student Course Join | `ProgrammeInstance` |
| SCE | Student Course Enrolment | `ModuleEnrolment` |
| SPR | Student Programme Route | `ProgrammeRoute` |
| SMO | Student Module Occurrence | `ModuleOccurrence` |
| SMR | Student Module Result | `AssessmentAttempt` |
| SQA | Student Qualification Award | `QualificationAward` |

Mapping to these entities is not merely an academic exercise. It ensures:

- Staff who move from a SITS institution to an SJMS institution recognise the data model.
- Reporting requirements designed around SITS semantics can be served by SJMS without translation.
- Integration with SITS-adjacent tools (timetabling systems, VLEs, library systems) is straightforward because the entity identifiers are familiar.

Any SIS that does not align to this model will require bespoke translation mappings at every integration point — a significant ongoing maintenance burden.

### 3.2 HESA Data Futures / Jisc TDP

The Jisc Transparent Data Pipeline (TDP) replaced the traditional HESA annual batch submission model. The new model is:

- **Continuous submission**: data is submitted throughout the year, not in an annual batch.
- **Entity-relational**: each entity carries its own identity and temporal attributes.
- **Validation in-pipeline**: the TDP validates data on ingestion and returns structured errors.

This has direct implications for schema design. The old approach of maintaining a separate "HESA extract" table that was populated once per year is no longer adequate. Instead, the core operational schema must be designed such that HESA-reportable data is always in a valid state.

Key HESA-required fields that must be present at the student entity level from day one:

- `hesaStudentId` — HESA's persistent student identifier
- `feeStatus` — Home / EU / Overseas (affects funding band)
- `domicile` — Country of permanent address (used for HESA nationality reporting)
- `qualificationOnEntry` — Highest prior qualification at entry
- `entryRoute` — UCAS / Direct / AP / RPL
- `polar4Quintile` — POLAR4 participation measure (OfS WP reporting)
- `imdDecile` — Index of Multiple Deprivation (OfS B3)

### 3.3 UKVI Compliance

For institutions with a Student Sponsor Licence, UKVI compliance is a regulatory hard requirement. The consequences of non-compliance include suspension of the sponsor licence, which prevents the institution from recruiting international students. This is an existential risk for most UK HEIs.

SJMS must track:

- **CAS (Confirmation of Acceptance for Studies)** numbers — assigned per student per course.
- **Visa expiry dates** — with automated alerts at 90, 60, and 30 days.
- **Missed contact points** — every attendance register absence that triggers an MCP must be recorded and the immigration compliance team notified.
- **Engagement monitoring** — weekly check for students who have not engaged with any teaching activity.
- **Course changes** — any material change to programme, mode, or location may require a new CAS.

None of these can be treated as optional features to be added later. A UK HEI cannot use a student records system that does not support UKVI compliance workflows from day one of live operation.

### 3.4 Fee Status Calculation

Fee status (Home / EU / Overseas) determines:

- The tuition fee cap under Office for Students regulations.
- Eligibility for Student Loans Company funding.
- HESA funding band classification.
- Income recognition category in the institution's statutory accounts.

Fee status is **not** the same as nationality, domicile, or visa status — though all three are inputs. The calculation follows UKCISA guidance and considers:

- Ordinary residence in the UK/EU prior to the start of the course.
- Immigration status on the first day of the first year.
- Settled or pre-settled status (for EU nationals post-Brexit transition).
- Specific exemptions (refugees, children of UK armed forces personnel, etc.).

This calculation must be implemented in code, not left to manual assessment. A miscalculated fee status results in either under-charging a student (revenue loss) or over-charging them (regulatory breach and reputational damage).

### 3.5 POLAR/IMD/WP Data

The Office for Students B3 (continuation, completion, and progression) metrics require the institution to demonstrate outcomes for students from disadvantaged backgrounds. The metrics are broken down by:

- **POLAR4 quintile** — participation in HE by geographic area (Quintile 1 = least represented).
- **IMD decile** — Index of Multiple Deprivation (Decile 1 = most deprived).
- **Ethnicity** — HESA ethnicity codes.
- **Disability** — HESA disability codes.

These data points must be captured at the **student entity level** at the point of enrolment. They cannot be retrospectively applied because the underlying geographic indices are updated periodically and the cohort's values must reflect the index at the time of enrolment.

### 3.6 The Enrolment Chain

The core reporting requirement of any SIS is the ability to trace the complete student journey:

```
Faculty
  └── School
        └── Programme
              └── Programme Instance (academic year)
                    └── Student Enrolment
                          └── Module Enrolments
                                └── Assessment Attempts
                                      └── Exam Board Decisions
                                            └── Award
```

Every link in this chain must be intact for statutory reporting to function. A student enrolment without a linked programme instance is unreportable to HESA. An assessment attempt without a linked module enrolment cannot be included in a transcript. An award without a linked exam board decision has no audit trail.

**Enforce referential integrity at the database level, not just the application level.** Foreign key constraints are the minimum. Database-level CHECK constraints for status transitions (a student cannot be awarded a degree without a confirmed enrolment) add a further safety layer.

### 3.7 Password Security and RBAC

Under UK GDPR, students have a right to access their own data and a right to privacy of that data from other students. This is not aspirational — it is a legal obligation.

A SIS that allows one student to view another student's marks, personal details, or financial information constitutes a data protection breach. The consequences include ICO investigation, reputational damage, and potential fines.

Role-based access control must be implemented at:

1. **The Keycloak realm level** — coarse-grained role assignment (Student, Academic Staff, Registry Staff, Finance Staff, Admin).
2. **The API middleware level** — route-level role guards that reject requests from unpermitted roles.
3. **The data access level** — service functions that scope queries to the authenticated user's permitted data (a student's profile service always filters by the authenticated student's ID).

These three levels must all be present. An API that relies only on the client to hide navigation options is not secure — it is obscured.

### 3.8 British English — Non-Negotiable

UK Higher Education has a legislative and regulatory context expressed entirely in British English. HESA field documentation, OfS conditions of registration, UKVI guidance, UCAS forms — all are in British English. An SIS whose codebase uses American spellings creates a permanent cognitive friction for every HE professional who reads the code, queries the database, or reads the API documentation.

British English must be enforced from the first line of code:

| American (reject) | British (use) |
|-------------------|---------------|
| `program` | `programme` |
| `color` | `colour` |
| `organization` | `organisation` |
| `authorize` | `authorise` |
| `recognize` | `recognise` |
| `enrollment` | `enrolment` |
| `behavior` | `behaviour` |
| `honor` | `honour` |
| `center` | `centre` |
| `catalog` | `catalogue` |

This applies to: Prisma model field names, TypeScript variable names, API route paths, UI string literals, code comments, commit messages, and documentation. A linter rule enforcing spelling (e.g., `cspell` with a UK English dictionary) should be part of the pre-commit hook.

---

## 4. Docker & Infrastructure

### 4.1 The Eight-Service Minimum

A production-grade HE SIS cannot be run as a single Docker container. The minimum viable architecture for SJMS is:

```yaml
services:
  postgres:    # Primary data store
  redis:       # Session state, rate limit counters, job queues
  minio:       # Document storage (student files, transcripts, correspondence)
  keycloak:    # Identity and access management (OIDC/OAuth2)
  n8n:         # Workflow automation (notifications, escalations, integrations)
  api:         # Express/Node backend
  client:      # React/Vite frontend
  nginx:       # Reverse proxy, SSL termination, rate limiting
```

Each service has a distinct responsibility. Collapsing them — for example, handling file storage in the API service's local filesystem — creates fragility that manifests at the worst possible moments (database volume fill, service restart losing file state).

### 4.2 Internal Docker Network Routing

A common failure mode: nginx configured to proxy to `client:5173` when the client container is actually listening on `:80`.

In development, Vite's dev server runs on `:5173`. In production (or a Docker build), the Vite build is served by an nginx container or a static file server that typically listens on `:80`. If the container image was changed from a Vite dev server to an nginx-served static build but the proxy configuration was not updated, nginx will forward requests to a port that nothing is listening on and return a 502.

The fix is simple: **externalise all port references as environment variables in nginx.conf.**

```nginx
# Wrong — hardcoded
upstream client {
    server client:5173;
}

# Correct — use the Docker Compose service name and the port the container actually exposes
upstream client {
    server client:${CLIENT_PORT};
}
```

Set `CLIENT_PORT=80` in production and `CLIENT_PORT=5173` in development. Use `envsubst` in the nginx container entrypoint to substitute the variable before nginx starts.

### 4.3 MinIO Health Check

The `mc ready` command is not reliably available in the health check context of a MinIO container image. The correct health check uses the MinIO HTTP health endpoint:

```yaml
# Wrong
healthcheck:
  test: ["CMD", "mc", "ready", "local"]

# Correct
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/ready"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 30s
```

This endpoint is always available when the MinIO server is running and does not require any additional binaries.

### 4.4 Keycloak Health Check

Setting `KC_HEALTH_ENABLED: "true"` in the Keycloak container's environment variables is a necessary but **not sufficient** condition for Docker health checking. The environment variable enables the health endpoint; it does not configure Docker Compose to use it.

```yaml
# Wrong — environment variable alone is not a health check
keycloak:
  image: quay.io/keycloak/keycloak:24.0
  environment:
    KC_HEALTH_ENABLED: "true"
  # Missing: healthcheck directive

# Correct
keycloak:
  image: quay.io/keycloak/keycloak:24.0
  environment:
    KC_HEALTH_ENABLED: "true"
  healthcheck:
    test: ["CMD-SHELL", "curl -f http://localhost:8080/health/ready || exit 1"]
    interval: 30s
    timeout: 10s
    retries: 5
    start_period: 90s
```

The `start_period` must be long enough for Keycloak to complete its startup. 90 seconds is a reasonable minimum; on slower infrastructure, 120 seconds may be required.

### 4.5 Named Volumes

Anonymous Docker volumes (declared inline under a service without a named volume entry) are recreated as new volumes whenever the container is recreated. Any data stored in them is lost.

```yaml
# Wrong — anonymous volume; data lost on container recreation
services:
  postgres:
    volumes:
      - /var/lib/postgresql/data

# Correct — named volume; persisted across container recreation
services:
  postgres:
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
  redisdata:
  miniodata:
  n8ndata:
  keycloakdata:
```

For an HE SIS holding live student data, losing a database volume due to a `docker compose down && docker compose up` is not a recoverable error during term time. Named volumes are mandatory.

### 4.6 Redis — Not Optional

Redis is required for:

- **Session state**: Express sessions that persist across API restarts.
- **Rate limit counters**: `express-rate-limit` with a Redis store ensures rate limits are shared across multiple API instances and survive process restarts.
- **Job queues**: BullMQ or similar for background processing (email dispatch, HESA validation jobs, n8n webhook triggers).

Treating Redis as optional infrastructure and substituting in-memory stores for development leads to behaviour differences between development and production that are difficult to diagnose. Include Redis in `docker-compose.yml` from day one.

---

## 5. Security

### 5.1 Rate Limiting — Both Layers Required

Rate limiting must exist at two independent layers:

**Layer 1 — nginx (production reverse proxy):**
```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=30r/m;
limit_req zone=api_limit burst=10 nodelay;
```

**Layer 2 — Express middleware:**
```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from './lib/redis';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
});

app.use('/api/', limiter);
```

The reason both layers are required: **nginx only protects traffic that flows through nginx**. Any direct access to the API port (e.g. `localhost:3001` in a development environment left exposed, or a misconfigured firewall) bypasses nginx entirely. The Express-level rate limiter is the last line of defence.

`express-rate-limit` must be installed as a production dependency and mounted in `index.ts` — not deferred to a future security hardening phase.

### 5.2 CORS in Production

```typescript
// Wrong — development only; accepts requests from any origin
app.use(cors({ origin: true }));

// Correct — production
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',') ?? [];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not permitted`));
    }
  },
  credentials: true,
}));
```

`CORS_ALLOWED_ORIGINS` in `.env.production` should be the explicit list of permitted origins (the client application URL, any admin interfaces).

### 5.3 Environment Variables and Secrets

```bash
# .gitignore — required entries
.env
.env.local
.env.*.local
.env.production
.env.staging
```

Every environment variable must be documented in `.env.example` with a description and a safe default or placeholder:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sjms_db

# Keycloak
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=sjms
KEYCLOAK_CLIENT_ID=sjms-api
KEYCLOAK_CLIENT_SECRET=<generate-with-openssl-rand-hex-32>

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://sjms.example.ac.uk
```

Committed `.env` files are a data protection risk. Student and staff personal data is stored in the database behind those credentials. A leaked `.env` is a GDPR breach.

### 5.4 Keycloak JWT Claims

Keycloak 24 issues JWT tokens with roles in two locations:

```json
{
  "realm_access": {
    "roles": ["student", "offline_access", "default-roles-sjms"]
  },
  "resource_access": {
    "sjms-api": {
      "roles": ["marks-entry", "exam-board-chair"]
    }
  }
}
```

- `realm_access.roles` — roles assigned at the realm level (coarse-grained: Student, Staff, Admin).
- `resource_access[clientId].roles` — roles assigned at the client level (fine-grained: marks-entry, exam-board-chair, finance-manager).

Both must be read in the token verification middleware. Checking only `realm_access` means client-level roles are invisible to the API.

```typescript
function extractRoles(token: KeycloakJwt): string[] {
  const realmRoles = token.realm_access?.roles ?? [];
  const clientRoles = token.resource_access?.[process.env.KEYCLOAK_CLIENT_ID!]?.roles ?? [];
  return [...realmRoles, ...clientRoles];
}
```

### 5.5 Error Handling and Stack Trace Sanitisation

```typescript
// Central error handler — index.ts
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  // Handle Prisma known errors before falling through to generic 500
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'A record with this value already exists.' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Record not found.' });
    }
  }

  // Log full error internally
  logger.error({ err, path: req.path, method: req.method });

  // Return sanitised message to client
  const message = process.env.NODE_ENV === 'development'
    ? err.message
    : 'An unexpected error occurred. Please contact support.';

  return res.status(500).json({ error: message });
});
```

Prisma error codes `P2002` (unique constraint violation) and `P2025` (record not found) are the two most common database errors in a CRUD API. Handling them explicitly returns informative HTTP status codes (409 and 404 respectively) rather than an opaque 500.

In production, `err.message` must not be sent to the client. Stack traces are even worse — they expose internal file paths, library versions, and code structure that can assist an attacker.

---

## 6. Code Quality

### 6.1 TypeScript Strict Mode

TypeScript strict mode must be enabled in all three `tsconfig.json` files — root, server, and client — from day one.

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true
  }
}
```

Retrofitting strict mode onto a large existing codebase is extremely painful. Every `any` type, every implicit `null`, every unchecked array access surfaces as a type error. In a codebase of 40+ route modules and 300 Prisma models, this can produce hundreds of errors that must be triaged and fixed before the project can build again.

Starting with strict mode means these issues are caught as they are introduced — a far lower remediation cost.

### 6.2 Zod Validation at Route Level

Every route must validate its inputs at three levels: body, path parameters, and query string.

```typescript
import { z } from 'zod';
import { validateRequest } from '../middleware/validate.middleware';

const createEnrolmentSchema = z.object({
  body: z.object({
    studentId: z.string().cuid(),
    programmeId: z.string().cuid(),
    academicYearId: z.string().cuid(),
    feeStatus: z.enum(['HOME', 'EU', 'OVERSEAS']),
    modeOfStudy: z.enum(['FULL_TIME', 'PART_TIME', 'DISTANCE_LEARNING']),
  }),
  params: z.object({}),
  query: z.object({}),
});

router.post(
  '/enrolments',
  authenticate,
  authorise(['registry-staff', 'admin']),
  validateRequest(createEnrolmentSchema),
  enrolmentController.create,
);
```

Zod validation prevents entire classes of runtime errors: incorrect types, missing required fields, out-of-range values, and malformed identifiers. It also produces informative error messages that the client can use to correct its request, reducing support overhead.

### 6.3 Structured Logging

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: process.env.NODE_ENV === 'production'
    ? winston.format.json()
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.simple(),
      ),
  transports: [
    new winston.transports.Console(),
    ...(process.env.NODE_ENV === 'production'
      ? [new winston.transports.File({ filename: 'logs/error.log', level: 'error' })]
      : []),
  ],
});
```

JSON logging in production enables ingestion by log aggregation systems (ELK stack, CloudWatch, Datadog). Human-readable logging in development reduces cognitive overhead. The same logger instance should be used throughout — not `console.log` in some places and `winston` in others.

### 6.4 Prisma Singleton

In development with hot-reload (tsx --watch or nodemon), each file change triggers a module reload. Without the `globalThis` guard, each reload creates a new Prisma client instance with its own connection pool. Over time, this exhausts available PostgreSQL connections.

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

This is idiomatic Prisma in a Next.js or Express hot-reload environment and must be used from day one.

### 6.5 Async Error Handling in Express

Express 4 does not automatically propagate errors thrown in async route handlers to the error middleware. An unhandled promise rejection in a route handler silently hangs the request — no response, no error log, no indication that anything went wrong.

Two correct approaches:

**Option 1 — `express-async-errors` package (simplest):**
```typescript
import 'express-async-errors'; // Must be imported before Express
import express from 'express';
// Now async errors in routes are automatically forwarded to error middleware
```

**Option 2 — Explicit wrapper:**
```typescript
const asyncHandler = (fn: RequestHandler): RequestHandler =>
  (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/students/:id', asyncHandler(async (req, res) => {
  const student = await studentService.findById(req.params.id);
  res.json(student);
}));
```

Either approach is acceptable. The worst approach is neither — leaving async errors unhandled.

### 6.6 Test Identifiers

Playwright end-to-end tests are vastly more stable when they target `data-testid` attributes rather than CSS classes, text content, or DOM structure. CSS classes change with design updates. Text content changes with copy edits. DOM structure changes with refactors.

`data-testid` attributes are explicit contracts between the developer and the test suite:

```tsx
// Adding data-testid from day one
<Button
  data-testid="enrolment-submit-btn"
  onClick={handleSubmit}
>
  Submit Enrolment
</Button>

// In Playwright
await page.getByTestId('enrolment-submit-btn').click();
```

Retrofitting `data-testid` onto a large component library — finding every interactive element and adding the attribute without breaking anything — is a significant, error-prone task. Adding them from day one costs nothing.

---

## 7. AI-Assisted Development Patterns

### 7.1 Builder/Verifier Separation — The Most Important Practice

The single most impactful structural decision in AI-assisted development is maintaining a strict separation between the **builder** (Claude Code) and the **verifier** (Perplexity Computer).

A builder cannot reliably self-audit. The reasoning process that produced the code tends to validate the same code when reviewing it — the mental model has already committed to the implementation. Independent verification, using a different AI system operating from the acceptance criteria rather than the build session, catches issues that the builder will consistently miss.

In SJMS, the builder/verifier split caught:
- Missing rate limiting middleware (a security defect with regulatory implications).
- MinIO health check failure (would have caused service startup order failures in production).
- Port mismatch in nginx.conf (would have caused 502 errors on every client request).
- British English violations in API field names (technical debt requiring a schema migration to fix).

The discipline: **write the verification prompt before the build prompt.** The verification prompt forces you to articulate the acceptance criteria in advance. Knowing what will be checked shapes what gets built. This is the AI-assisted equivalent of test-driven development.

### 7.2 Self-Contained Prompts

AI agents do not have reliable long-term memory. A decision made in session 1 is not guaranteed to be applied correctly in session 5. Every Claude Code prompt must be self-contained:

```
## Context
- Repo: /home/user/sjms
- Stack: Node 20, Express 4, TypeScript 5 strict, Prisma 5, PostgreSQL 16
- Architecture: domain-modular routes (src/routes/<domain>/<entity>.routes.ts)
- Conventions: British English, cuid() IDs, Zod validation at route level

## Phase 8 — Assessment Domain

### Acceptance Criteria
1. Create AssessmentAttempt, AssessmentComponent, and ExamBoard Prisma models
2. Migrate with: npx prisma migrate dev --name add_assessment_domain
3. Create route file: src/routes/assessment/attempt.routes.ts
4. All routes authenticated (Keycloak JWT) and role-guarded
5. POST /api/v1/assessment/attempts — create attempt (role: marks-entry)
6. PUT /api/v1/assessment/attempts/:id/mark — submit mark (role: marks-entry)
7. POST /api/v1/exam-boards — create exam board (role: exam-board-chair)
8. British English throughout — enrolment not enrollment, programme not program

### Do NOT
- Modify any files outside src/routes/assessment/ and prisma/schema.prisma
- Use db push — use migrate dev
- Add any unscoped features
```

The verbosity of this prompt is intentional. Every piece of context included is a reduction in the probability of divergent output. Every piece omitted is an opportunity for the agent to make an assumption that may not align with the project's conventions.

### 7.3 CLAUDE.md as Agent Constitution

As covered in §1.2, `CLAUDE.md` is the agent's constitution. It must be maintained with the same care as the codebase. When a new convention is established, update `CLAUDE.md`. When a known pitfall is identified, add it to the "What NOT to Do" section. When the stack changes, update the stack section.

At the start of every Claude Code session, the first instruction must be: **"Read CLAUDE.md and confirm you understand the conventions."** An agent that has read and acknowledged the constitution is substantially less likely to introduce divergent code.

### 7.4 Circular Fix Loops — Architectural Signal

A circular fix loop occurs when fixing one defect introduces another defect in a related area, and the subsequent fix reintroduces the original defect or a variant of it. This pattern — observed in both Claude Code and BugBot workflows — is not a symptom of a high defect count. It is a symptom of **architectural debt**.

When a circular fix loop is detected:

1. **Stop fixing symptoms.** Each fix is making the code more complex and less coherent.
2. **Identify the domain with the loop.** Circular loops in assessment usually indicate a flat model that cannot correctly represent the business rules.
3. **Redesign the domain, not the code.** A domain with architectural debt needs a bounded context redesign, not more patches.
4. **Write the redesign as a phase** with full acceptance criteria and a GO/NO-GO gate before merging.

The SJMS flat Mark model is the canonical example: rather than continuing to patch conditions and nullable flags, the correct resolution was to redesign the domain with explicit `AssessmentAttempt`, `AssessmentComponent`, and `ExamBoardDecision` models.

### 7.5 Scoped Tasks Outperform Open-Ended Tasks

AI agents perform significantly better on well-scoped, discrete tasks with clear acceptance criteria than on open-ended "build everything" prompts. The quality gap is not marginal — it is the difference between production-ready output and output that requires substantial rework.

A prompt like "Build the full assessment domain including marks entry, exam boards, and transcripts" will produce:
- Inconsistent naming conventions across the files.
- Missing validation on some routes but not others.
- Incomplete acceptance criteria coverage.
- Features that conflict with each other because the scope was too large to hold coherently.

Breaking this into three separate phases — each with its own acceptance criteria, build prompt, and verification prompt — produces consistently higher quality output per phase and significantly less total rework.

---

## 8. Project Management Patterns

### 8.1 TODO List as Shared State

The TODO list is the primary continuity mechanism across sessions and across builder/verifier handoffs. It must use an explicit status taxonomy:

```
[x] Phase 0 — Infrastructure (Docker Compose 8-service) — COMPLETED ✓
[x] Phase 1 — Database schema core — COMPLETED ✓
[~] Phase 2 — Authentication (Keycloak integration) — IN PROGRESS
[ ] Phase 3 — Student domain API — PENDING
[ ] Phase 4 — Programme domain API — PENDING
```

The TODO list is included in every context summary. It ensures that both the human developer and the AI agent share the same understanding of what has been done, what is being done, and what remains.

### 8.2 Shared Assets List

When documents, diagrams, and data files are created and shared across sessions, they must be tracked in a shared assets list:

| Asset | File Path | Description | Session Created |
|-------|-----------|-------------|-----------------|
| Build Plan | `/docs/SJMS-Build-Plan.docx` | 61-page phased build plan | Session 1 |
| Prompts Package | `/docs/SJMS-Prompts.docx` | 64-page executable prompt library | Session 1 |
| CLAUDE.md | `/CLAUDE.md` | Agent orientation file | Session 1 |
| Lessons Learned | `/docs/SJMS-Lessons-Learned.md` | This document | Session N |

Without this list, documents get re-created unnecessarily, file paths get lost, and agents waste context length searching for files that already exist.

### 8.3 Session History as Continuity

The session history section of the context summary is the single most valuable continuity mechanism. It encodes:

- What was built in each prior session.
- What issues were found and how they were resolved.
- What was deferred and why.
- What standing decisions were made (and must not be reversed without explicit instruction).

A 10-line session history can save 30 minutes of re-orienting a new session. It is worth maintaining meticulously.

### 8.4 Strategy vs Execution Documents

The correct separation for a build of this complexity is:

| Document | Format | Content |
|----------|--------|---------|
| Build Plan | DOCX (61 pages) | Architecture rationale, domain model, phase structure, risk register, acceptance criteria summary |
| Prompts Package | DOCX (64 pages) | Executable build prompts for each phase, ready to copy-paste into Claude Code |
| CLAUDE.md | Markdown | Agent orientation — conventions, anti-patterns, stack overview |
| Lessons Learned | Markdown | This document |
| Context Summary | Markdown | Session-by-session state for handoff |

The Build Plan answers "why are we building it this way?" The Prompts Package answers "exactly what should the agent do in Phase N?" Keeping them separate prevents the prompts from becoming cluttered with architectural justification that the agent doesn't need, and prevents the Build Plan from becoming a manual of implementation details that the architect doesn't need.

### 8.5 Risk Register

Predictable risks should be documented before they become incidents. The SJMS project produced the following risk register entries, both of which materialised:

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Port mismatch in nginx.conf | Medium | High (502 on all client requests) | Verify all port references against docker-compose.yml before Phase 0 GO |
| Missing Express rate limiter | Medium | High (security gap) | Include rate limiting as explicit acceptance criterion in Phase 0 |
| `db push` used instead of migrations | High | High (lost migration history) | Add to CLAUDE.md "What NOT to Do"; verify in Phase 1 acceptance criteria |
| British English not enforced | High | Medium (technical debt) | Add cspell to pre-commit hooks in Phase 0 |
| Context degradation after Phase 16 | Certain | Medium (quality drop) | Plan context reset after Phase 16; use context summary format |

### 8.6 Version Numbering

Version numbers communicate the nature of a change. The progression from 2.4 to 2.5 (not 3.0 or 5.0) correctly signals **evolutionary improvement within the same architectural generation** — carrying forward the proven UI layer, domain knowledge, and operational concepts from 2.4, while adopting the proven infrastructure and data model advances from 4.0.

A version bump to 3.0 would imply a breaking change to external interfaces. A bump to 5.0 would imply a generational leap. Neither is accurate for the 2.5 rebuild, which is a disciplined consolidation of lessons from two parallel build lines.

---

## 9. What 2.4 Did Well — Preserve in 2.5

### 9.1 Domain Breadth

The 2.4 build achieved **81 pages of functional coverage** across all major HE operational domains:

- Student admissions and enrolment
- Programme and module management
- Timetabling and room booking
- Assessment, marks entry, and exam boards
- Attendance monitoring and UKVI contact points
- Finance and fee management
- Accommodation
- Library integration
- Pastoral support and personal tutoring
- Reporting and dashboard views

This breadth is the most important characteristic of the prototype — it demonstrated that the full student journey could be supported within a single, coherent system. 2.5 must preserve this breadth while adding the structural rigour that 2.4 lacked.

### 9.2 UI Layer

The React 18 + Vite + Tailwind + shadcn/ui stack is correct. It is:

- **Fast**: Vite's HMR makes development productive; the production build is optimised.
- **Accessible**: shadcn/ui components are built on Radix UI primitives with full keyboard navigation and ARIA support.
- **Composable**: Tailwind utility classes and shadcn/ui component variants allow consistent styling without fighting a CSS framework.
- **Modern**: React 18 concurrent features (Suspense, transitions) allow responsive UX even with complex data loading patterns.

This stack must be carried forward unchanged into 2.5.

### 9.3 Role-Card Login UX Pattern

The role-card login pattern — where the user selects their role (Student, Academic Staff, Registry Staff) before entering credentials — provides several benefits:

- **Onboarding clarity**: new users understand the system's role structure from their first interaction.
- **Demo utility**: the pattern makes demonstrating the system to different stakeholder groups straightforward.
- **Context pre-loading**: selecting a role before login allows the client to pre-load role-appropriate UI configuration.

In 2.5, this pattern must be **extended with real password authentication** (Keycloak OIDC), not replaced. The role-card display persists; it now routes to a Keycloak-backed authentication flow.

### 9.4 Assessment UX

The module marks entry interface in 2.4 demonstrated:

- Tabular marks entry with per-student rows and per-component columns.
- Weighted calculation of module marks from component marks, computed in real time.
- Colour-coded fail flagging (students below the pass mark highlighted in amber/red).
- Bulk mark entry with keyboard navigation (Tab to move between cells).

This UX pattern is correct for HE marks entry workflows and must be preserved in 2.5. The underlying data model will change (flat Mark → AssessmentAttempt), but the UX should feel identical to the academic user.

### 9.5 FHE Branding

The FHE brand identity established in 2.4:

- **Primary**: Deep navy `#1e3a5f`
- **Accent**: Amber `#f59e0b`
- **Background**: Light grey `#f8fafc`
- **Typography**: Inter (headings), system-ui (body)

This is carried forward unchanged into 2.5.

---

## 10. What 4.0 Did Well — Adopt in 2.5

### 10.1 Prisma Schema Breadth and SITS Alignment

The 4.0 build produced **298 Prisma models across 23 SITS-aligned domains** — the most complete open-source approximation of a SITS-equivalent schema outside of Tribal's own codebase. This represents months of domain modelling work and must not be discarded.

The 23 domains map to SITS functional areas:

| # | Domain | SITS Equivalent |
|---|--------|-----------------|
| 1 | Student | STU |
| 2 | Programme | MAV/CAM |
| 3 | Module | MOD |
| 4 | Enrolment | SCJ/SCE |
| 5 | Assessment | SMR/AEA |
| 6 | Exam Board | MAB |
| 7 | Award | ACD/SQA |
| 8 | Finance | DEB/PAY |
| 9 | Admissions | ADM |
| 10 | UKVI/Immigration | — |
| 11 | Attendance | ATT |
| 12 | Timetable | TIM |
| 13 | Accommodation | ACC |
| 14 | Personal Tutoring | — |
| 15 | Library | — |
| 16 | Graduation | — |
| 17 | Reporting | — |
| 18 | Notification | — |
| 19 | Workflow | — |
| 20 | Document | — |
| 21 | Audit | — |
| 22 | Configuration | — |
| 23 | Identity/RBAC | — |

### 10.2 Keycloak Realm Configuration

The 4.0 Keycloak realm configuration established:

- **27+ roles** spanning all operational domains.
- **OIDC client** (`sjms-api`) with correct token claims configuration.
- **Realm-level roles** (Student, Staff, Admin) and **client-level roles** (marks-entry, exam-board-chair, finance-manager).
- **Protocol mappers** for custom claims (institution ID, department, programme).

This configuration, exported as `keycloak-realm-export.json`, must be imported into the 2.5 Keycloak instance as the starting point — not rebuilt from scratch.

### 10.3 Docker Compose 8-Service Architecture

As documented in §4.1, the 8-service Docker Compose configuration from 4.0 is the correct production-grade infrastructure baseline. The specific lessons around health checks, named volumes, and port routing must be applied — but the service topology itself is sound.

### 10.4 n8n Workflow Automation

The 44 n8n workflows developed in 4.0 cover:

- Student welcome email sequences.
- Attendance alert notifications.
- UKVI missed contact point escalations.
- Exam board reminder sequences.
- Fee reminder and arrears escalation.
- SLC payment confirmation processing.

These workflows represent significant automation development effort. The 4.0 n8n instance data should be exported (`n8ndata` volume) and imported into the 2.5 instance. Each workflow should be reviewed against the 2.5 schema — some may require minor updates to match renamed models or fields.

### 10.5 MinIO Document Storage

MinIO provides S3-compatible object storage for:

- Student documents (passport scans, CAS supporting documents).
- Uploaded assignment submissions.
- Generated transcripts (PDF).
- Correspondence archive.
- Financial statements.

The 4.0 MinIO bucket configuration (bucket names, access policies, lifecycle rules) should be preserved in 2.5. The SharePoint Sites.Selected integration (for SharePoint-hosted document libraries) was proven working in 4.0 and must be retained.

### 10.6 Double-Entry Financial Ledger

As discussed in §2.6, the 4.0 double-entry ledger is architecturally correct. The model, the service layer, and the account code structure should be migrated into 2.5 unchanged — this is an area where 4.0 got it right and 2.4 did not, and there is no need to rebuild it.

### 10.7 HESA Data Futures Entity Model

The 4.0 schema was designed for continuous HESA Data Futures submission, incorporating:

- Persistent HESA student identifiers (`hesaStudentId`).
- Effective-dated enrolment records.
- Instance-level fee status records.
- Qualification aim and mode of study tracking.
- POLAR4 and IMD captures at enrolment.

This schema design is correct and must be preserved in 2.5.

---

## 11. What Failed or Should Not Be Repeated

### 11.1 In-Memory Storage as Long-Term Architecture

`MemStorage` was the foundation of the 2.4 prototype. When the decision was made to develop 2.4 into a production-grade system, the in-memory storage could not be upgraded — it had to be abandoned entirely. Every route, every data access pattern, and every test had to be rewritten against a relational schema.

**Never use `MemStorage` as the foundation for anything intended to persist beyond a throw-away prototype.**

### 11.2 Monolithic Route and Storage Files

`routes.ts` at 7,965 lines and `storage.ts` at 13,887 lines were the defining architectural failure of the 4.0 build. These files:

- Cannot be meaningfully code-reviewed.
- Cannot be reliably modified by an AI agent without risking regressions.
- Create merge conflict risks that make collaborative development impossible.
- Have no clear domain boundaries — any domain can call any other domain's logic directly, creating hidden coupling.

The lesson: **set a line count ceiling of 300 lines per route file and 500 lines per service file.** When a file approaches these limits, split it.

### 11.3 Flat Mark Model

The flat `Mark` model — a single table used for coursework marks, exam marks, resit marks, agreed marks, and capped marks — was an oversimplification that became a maintenance burden. Business rules expressed through nullable flags and conditional logic are brittle and hard to reason about.

The correct model has separate entities for separate concepts: `AssessmentComponent`, `AssessmentAttempt`, `ExamBoardDecision`. The added schema complexity pays for itself immediately in clarity and correctness.

### 11.4 `db push` Instead of Migrations

`prisma db push` synchronises the database schema with the Prisma schema file without creating a migration. This is useful for rapid prototyping where schema history does not matter. It is **destructive** in any other context:

- It provides no rollback capability.
- It leaves no audit trail of schema changes.
- It cannot be reliably reproduced across environments (dev/staging/production).
- It can silently drop data if a column is removed and re-added with a different type.

**`db push` must never be used on a shared database, a staging environment, or a production database.** Use `prisma migrate dev` in development and `prisma migrate deploy` in staging and production. Both are checked into the `CLAUDE.md` "What NOT to Do" section.

### 11.5 Hardcoded Port References in nginx.conf

As documented in §4.2, hardcoded port references in nginx.conf caused a Phase 0 NO-GO verdict in the 4.0 verification. The correct pattern is environment variable substitution. Every port reference in nginx.conf must be an environment variable resolved at container startup via `envsubst`.

### 11.6 Missing Health Check Probes

Setting an environment variable to enable health check endpoints is not the same as configuring Docker Compose to use those endpoints. Both steps are required for every service. Missing health checks means:

- Services start without confirming dependencies are healthy.
- Startup order is undefined — the API may start before PostgreSQL is ready to accept connections.
- `docker compose ps` shows all containers as "running" even if some are in a broken state.

Every service in `docker-compose.yml` must have an explicit `healthcheck:` block with a `test:`, `interval:`, `timeout:`, `retries:`, and `start_period:`.

### 11.7 Building Phases Without Verification

Phases built without an independent verification step create compounding risk. By Phase 8 or 10, an unverified issue from Phase 3 may have been built upon by five subsequent phases. Fixing it at that point requires reworking all five subsequent phases.

The phase gate (§1.5) is not optional. It is the primary mechanism for preventing this failure mode.

### 11.8 Starting Phase N+1 Before Phase N is Resolved

Related to the above: a NO-GO verdict that is acknowledged but deferred ("we'll come back to it") is equivalent to building Phase N+1 on a broken foundation. The deferred issue does not disappear — it becomes a hidden assumption in every subsequent phase.

The rule is absolute: **no Phase N+1 before Phase N is at GO status.**

### 11.9 British English Not Enforced from the Start

When British English is not enforced from the beginning, violations accumulate across hundreds of variable names, API route paths, database field names, and UI strings. Correcting these retroactively requires:

- Schema migrations to rename database columns.
- API path changes that break existing client code.
- Find-and-replace operations across the entire codebase.
- Review of all user-facing strings.

The cost of adding `cspell` with a UK English dictionary to the pre-commit hook at the start of Phase 0 is approximately 15 minutes. The cost of retroactively enforcing British English on a 40-module codebase is days.

---

## 12. Summary Reference Table

| Area | Key Decision | Rationale | Anti-Pattern |
|------|-------------|-----------|--------------|
| **Context** | Reset after ~16 phases | Quality degrades predictably | Running indefinitely until quality is visibly broken |
| **Context** | CLAUDE.md at repo root | Agent orientation; prevents divergence | Relying on session memory |
| **Context** | Builder (Claude Code) + Verifier (Perplexity) | Builders cannot self-audit reliably | Single agent building and reviewing |
| **Context** | Phase gate (GO/NO-GO) | Prevents compound errors | Deferring fixes to later phases |
| **Architecture** | Prisma + PostgreSQL from day one | Migration from MemStorage is a full rewrite | MemStorage for anything not throw-away |
| **Architecture** | Domain-modular routes (<300 lines each) | Maintainable, AI-modifiable, reviewable | Monolithic routes.ts > 3,000 lines |
| **Architecture** | Bounded contexts per domain | Prevents model collision and hidden coupling | Flat Mark model, single-table overload |
| **Architecture** | Effective-dated records | HESA Data Futures compliance | Soft deletes, point-in-time snapshots |
| **Architecture** | Double-entry financial ledger | Auditability, reconciliation correctness | Simple payments table |
| **Architecture** | `prisma migrate dev` / `migrate deploy` | Migration history, rollback capability | `db push` in any shared environment |
| **HE Domain** | SITS entity alignment (STU/CAPS/ACD/SCJ/SCE) | Staff familiarity, integration compatibility | Novel entity model requiring translation |
| **HE Domain** | HESA Data Futures continuous model | Regulatory compliance, year-round submission | Annual batch extract model |
| **HE Domain** | UKVI compliance built in | Sponsor licence obligation | Optional "future feature" |
| **HE Domain** | Fee status calculation in code | Statutory correctness | Manual fee status assessment |
| **HE Domain** | British English enforced via cspell | UK HE sector alignment, no technical debt | American English defaults |
| **Infrastructure** | 8-service Docker Compose | Production-grade separation of concerns | Single container or missing services |
| **Infrastructure** | Named Docker volumes | Data persistence across container recreation | Anonymous volumes |
| **Infrastructure** | Health checks on every service | Correct startup order, failure visibility | Environment variable alone |
| **Infrastructure** | Redis for sessions and rate limits | Shared state across instances | In-memory session/rate limit state |
| **Security** | Rate limiting at nginx AND Express | Defence in depth; Express catches direct API access | nginx only |
| **Security** | CORS explicit origins in production | Prevent cross-origin requests | `origin: true` in production |
| **Security** | Both JWT claims paths read (realm + resource) | Fine-grained role enforcement | Realm roles only |
| **Security** | Error sanitisation in production | Prevent stack trace exposure | Sending `err.stack` to clients |
| **Code Quality** | TypeScript strict from day one | Compile-time safety across all operations | Retrofitting strict onto existing codebase |
| **Code Quality** | Zod on body + params + query | Prevents runtime type errors, improves DX | Validation on body only |
| **Code Quality** | `express-async-errors` or wrapper | Prevents silent request hang | Unhandled async errors in routes |
| **Code Quality** | `data-testid` on all interactive elements | Stable Playwright selectors | CSS class or text-content selectors |
| **AI Patterns** | Self-contained prompts with full context | Reduces divergence from convention | Relying on session memory for context |
| **AI Patterns** | Write verification prompt before build prompt | Shapes what gets built | Verifying after the fact only |
| **AI Patterns** | Circular loop = architectural signal, not bug count | Redesign the domain | Continuing to patch the symptoms |
| **AI Patterns** | Scoped discrete tasks outperform open-ended prompts | Quality and coherence | "Build the whole assessment domain" |
| **PM Patterns** | TODO list with explicit status taxonomy | Shared state across sessions | Informal tracking |
| **PM Patterns** | Session history section in context summaries | Continuity across context resets | Starting each session fresh |
| **PM Patterns** | Build Plan (DOCX) separate from Prompts Package (DOCX) | Strategy vs execution clarity | Everything in one document |
| **PM Patterns** | Risk register maintained throughout | Predictable risks caught before they materialise | Reactive issue management |
| **2.4 Preserve** | React 18 + Vite + Tailwind + shadcn/ui | Modern, fast, accessible, proven | Switching UI stacks for 2.5 |
| **2.4 Preserve** | Role-card login UX pattern | Clarity, demo utility, context pre-loading | Replacing with generic login form |
| **2.4 Preserve** | FHE branding (navy #1e3a5f, amber #f59e0b) | Established identity, stakeholder recognition | Restyling without stakeholder approval |
| **4.0 Adopt** | 298 Prisma models across 23 SITS-aligned domains | Months of domain modelling; correct structure | Rebuilding schema from scratch |
| **4.0 Adopt** | Keycloak 24 realm (27+ roles, OIDC client) | Proven configuration; correct claims structure | Rebuilding realm from scratch |
| **4.0 Adopt** | Double-entry financial ledger | Architecturally correct; auditable | Reverting to simple payments table |
| **4.0 Adopt** | HESA Data Futures entity model | Regulatory compliance; continuous submission | Annual batch model |

---

*Document version 1.0 — April 2026. Maintained by Interim Academic Registrar.*  
*Next review: at the start of SJMS 2.5 Phase 0.*
