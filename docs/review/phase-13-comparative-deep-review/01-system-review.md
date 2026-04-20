# 01 — System Review (Dimensions 1–12)

Companion to `00-executive-summary.md`. Evidence-based system review of SJMS 2.5 against the 12 foundational dimensions. Each section below will be filled in incrementally on branch `claude/review-sjms-2.5-5B5KA`.

## 1. Purpose and scope

SJMS 2.5 ("Student Journey Management System") is a single-tenant **UK Higher Education student-journey platform** positioned explicitly as the convergence of two prior prototype lines: the polished-UI-but-MemStorage SJMS 2.4 (Perplexity Computer build) and the enterprise-infrastructure-but-mock-served SJMS 4.0 (Claude Code build). It is scoped, per `README.md` and `CLAUDE.md`, to cover the end-to-end student lifecycle for a fictional tenant — Future Horizons Education (FHE) — spanning **admissions → offer → enrolment → module registration → timetable → attendance → assessment → moderation → exam boards → progression → award → graduation → alumni**, plus the surrounding finance, compliance (UKVI, HESA Data Futures), support, documents, accommodation and governance domains.

The scope that is **actually built** — as verified by the earlier multi-agent exploration — is narrower than the scope that is advertised:

- **In-scope and materially present:** Person/demographic model, application/offer CRUD, enrolment/module-registration CRUD, assessment & marks CRUD, EC claims/appeals, support tickets, UKVI record-keeping, HESA snapshot schema, academic calendar, system settings, audit log, accommodation/governance CRUD. Four portals are stood up in the UI layer.
- **In-scope but stub/ComingSoon:** 87 `ComingSoon` placeholders across 129 pages — notably Sponsors/Bursaries/Refunds, Payment Plans frontend, Document binary upload, Personal Tutoring, Wellbeing, Disability, Flag Management, External Examiners, Interventions, Home Office reports, clash detection, letter templates, bulk comms.
- **Out of scope for this phase:** real integrations with UCAS, SLC, SharePoint, Moodle (feasibility doc only under `moodle/`); any production customer data; multi-tenancy.

The **stated intent** (per README and CLAUDE.md) is a reference / pilot implementation that can eventually serve as a SITS replacement proof-of-concept for a small-to-mid-sized UK HE provider. The **delivered reality** (per `docs/review/00-executive-verdict.md` and the Phase 13 truth table) is a structurally complete scaffold whose business rules are almost entirely unwritten. This gap is the single most important framing point for every subsequent dimension in this review.

## 2. Feature completeness

Completeness is measured at three layers: **schema → API → wired UI**. The system thins out at each step.

| Domain | Schema | API (router + service) | UI wired | Business rules |
|---|---|---|---|---|
| Identity & Person | ✅ full (6 models) | ✅ CRUD | ✅ | — (no dedupe/match) |
| Admissions / Applications | ✅ full | ✅ CRUD | ✅ draft→submit→offer | ⚠️ no offer conditions engine |
| Enrolment / Module Reg | ✅ full | ✅ CRUD | ✅ | ⚠️ prerequisite + credit-limit utils exist (`server/src/utils/pass-marks.ts`, `credit-limits.ts`) but only invoked on create, not update |
| Curriculum (Programmes/Modules) | ✅ full | ✅ CRUD | ✅ | — |
| Assessment & Marks | ✅ full (Assessment → Component → MarkEntry → ModuleResult) | ✅ CRUD | ✅ entry + moderation screens | ❌ **no mark aggregation, no grade-boundary application, no moderation state machine, no auto-promotion to ModuleResult** |
| Progression & Awards | ✅ full | ✅ CRUD | partial | ❌ no classification calculator, no degree algorithm |
| Finance | ✅ full (Invoice/ChargeLine/Payment/PaymentPlan/StudentAccount) | ✅ CRUD for accounts/invoices/payments; ❌ Sponsors, Bursaries, Refunds | partial (10 `ComingSoon` pages) | ❌ no fee calculator, no invoice generator, no payment plan engine |
| Attendance & Engagement | ✅ full | ✅ CRUD + alerts | ✅ | ⚠️ UKVI threshold read from SystemSetting but alert escalation un-wired (TODO) |
| Timetable | ✅ full | ✅ CRUD | ✅ view only | ❌ no clash detection, no room allocation |
| Student Support | ✅ full | ✅ CRUD | ✅ tickets; ❌ Tutoring/Wellbeing/Disability/Flags | — |
| EC Claims & Appeals | ✅ full | ✅ CRUD | ✅ | ❌ no evaluation workflow |
| UKVI | ✅ full | ✅ CRUD | partial | ❌ no Home Office report export, no contact-point reminder scheduling |
| HESA Data Futures | ✅ 5 models (Return/Snapshot/Student/Module/ValidationRule) | ✅ CRUD | ✅ report view | ❌ **no entity mapper, no validation executor, no XML/JSON export, no submission client — HESA is unimplementable as-built** |
| Documents | ✅ full | ✅ CRUD (metadata) | ✅ list | ❌ MinIO binary upload not wired (KI-P10b-002) |
| Communications | ✅ full | ✅ CRUD + log | ✅ view | ❌ no template renderer, no bulk send |
| Accommodation | ✅ full (Block/Room/Booking/Application) | ✅ CRUD | ⚠️ 3 pages no backend logic | ❌ no clash detection, no allocation algorithm |
| Graduation | ✅ full (Ceremony/Registration/Certificate) | ⚠️ CRUD only | ⚠️ | ❌ no eligibility engine, no certificate generator |
| Placements | ✅ full | ⚠️ CRUD | ⚠️ | ❌ no provider vetting, no visit scheduling |
| Disability | ✅ full | ✅ CRUD | ❌ ComingSoon | ❌ no adjustment enforcement |
| Governance | ✅ full (Committee/Meeting/Member) | ✅ CRUD | ✅ | — |
| Change of Circumstances | ✅ model | ⚠️ thin | ⚠️ | ❌ no state machine |
| Audit & System | ✅ full | ✅ (log + settings) | ✅ | — |
| Calendar | ✅ full | ✅ CRUD | ✅ | — |

**Net position:** schema coverage is **~95%** of a plausible UK HE SIS; API coverage **~85%** (CRUD-only); UI coverage **~70%** (65 wired, 87 `ComingSoon`); **business logic coverage ~5%**. The product can record the student journey but cannot compute, decide, or automate any material step of it.

## 3. Architecture and project structure

**Topology.** Classic three-tier monolith fronted by nginx, with identity, files, cache and workflow orchestration externalised to purpose-built services. Eight Docker services: `postgres`, `redis`, `minio`, `keycloak`, `n8n`, `api`, `client`, `nginx` (`docker-compose.yml`).

```
┌───────── Browser ─────────┐
│  React 18 + Vite (client) │
└─────────────┬─────────────┘
              │ HTTPS (nginx 443, dual-mode TLS)
┌─────────────▼─────────────┐      ┌──────────┐      ┌──────────┐
│  Express API (:3001)      │─────▶│ Postgres │      │ Keycloak │
│  44 routers · 9 groups    │      │   16     │      │   24     │
│  router→ctrl→svc→repo     │◀─────┤ (pgcrypto)│     │ (OIDC)   │
└──┬────────┬───────┬───────┘      └──────────┘      └──────────┘
   │        │       │                                    ▲
   │        │       └─emitEvent()─▶ n8n webhook ─┐       │
   │        │                       (15 flows)   │       │
   │        └─signed URL / object──▶ MinIO       │       │
   │                                             ▼       │
   └──rate-limit / cache ─────────▶ Redis ──▶ API (via x-internal-key)
```

**Project layout (monorepo, not npm-workspaces):**

```
SJMS-2.5/
├── server/src/
│   ├── api/                 44 domain folders + 9 group barrels
│   │   └── <domain>/
│   │       ├── <domain>.router.ts
│   │       ├── <domain>.controller.ts
│   │       ├── <domain>.service.ts
│   │       └── <domain>.schema.ts           (Zod)
│   ├── repositories/        50 *.repository.ts (data access)
│   ├── middleware/          auth, data-scope, rate-limit, error, validate
│   ├── utils/               prisma singleton, audit, webhooks, pass-marks, credit-limits
│   └── constants/           roles.ts (36 roles in 12 groups)
├── client/src/
│   ├── pages/               129 .tsx across 4 portals
│   ├── components/ui/       shadcn (12 primitives)
│   ├── contexts/            AuthContext (Keycloak PKCE)
│   ├── lib/api.ts           TanStack Query + axios + 401 refresh
│   └── hooks/               useList/useDetail/useCreate/useUpdate/usePortalGuard
├── prisma/                  schema.prisma (197 models) + migrations/
├── n8n-workflows/           15 JSON (version-controlled)
├── docker/                  Dockerfiles, keycloak realm, nginx configs
├── docs/                    architecture, review, delivery-plan, standards, KIs
└── scripts/                 provision-n8n-workflows.ts, seed, migration helpers
```

**Pattern conformance.** The router → controller → service → repository pattern is applied with **100% consistency** across all 44 domains (verified by the architecture agent). No service imports `PrismaClient` directly; all data access routes through repositories and the singleton in `server/src/utils/prisma.ts`. No DI container is used — dependencies are resolved by direct module import; this is adequate at the current scale but will complicate mocking if services ever grow past ~2k lines.

**Domain grouping (Phase 12a).** The 44 flat routers are additionally exposed as 9 barrel groups — Identity, Admissions, Enrolment, Curriculum, Assessment, Progression, Student Support, Compliance, Platform — each with its own `/api/v1/<group>/health` endpoint. Flat routes are preserved for backward compatibility. This is a pragmatic middle step between 44 loose routers and a full modular-monolith / DDD-bounded-context refactor.

**Notable absences.** No formal domain-event bus internal to the API (events are emitted straight to n8n); no CQRS, no read-model projections, no message queue; no background job scheduler inside the API process (daily jobs rely on n8n cron workflows). These are defensible choices for the current scale but will become limits if batch workloads (HESA submission, fee runs, classification) are built in-process rather than in n8n.

## 4. Technology stack

Versions verified against `package.json`, `docker-compose.yml` and the respective Dockerfiles.

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Frontend framework | React | 18.3.1 | Function components + hooks |
| Client build / dev | Vite | 6.0 | Hash-routed SPA (wouter v3 + regexparam v3) |
| Client routing | wouter | 3.x | `useHashLocation()` in `App.tsx` |
| Client data | TanStack Query | v5 | Axios interceptor + 401 refresh (`client/src/lib/api.ts`) |
| UI kit | shadcn/ui + Radix | — | 12 primitives under `components/ui/` |
| Styling | Tailwind CSS | configured in `client/tailwind.config.ts` | Dark-mode class; FHE palette (#1e3a5f navy, #d97706 amber) |
| Backend runtime | Node + Express | Express 4.21.2 | TS-compiled to CJS |
| Language | TypeScript | 5.7.0 | `strict: true` (`server/tsconfig.json:6`), `@/*` path alias |
| ORM | Prisma | 6.5.0 | Singleton in `server/src/utils/prisma.ts` |
| Database | PostgreSQL | 16-alpine | Schema `sjms_app`; pgcrypto available |
| Cache / rate-limit store | Redis | 7-alpine | Password-protected in prod overlay |
| Validation | Zod | 3.24.2 | 49 schema files across API |
| Auth | Keycloak | 24.0 | OIDC PKCE; JWKS with 10 req/min refresh cap |
| File storage | MinIO | latest | S3-compatible; **binary upload not wired (KI-P10b-002)** |
| Workflow engine | n8n | latest | 15 version-controlled JSON workflows |
| Reverse proxy | Nginx | alpine | Dual-mode TLS (Let's Encrypt OR institutional CA) |
| Logging | Winston | 3.17.0 | + morgan for HTTP |
| Security headers | Helmet | 8.0.0 | default CSP |
| CORS | cors | 2.8.5 | Allow-list via `CORS_ORIGIN` in prod |
| Metrics | prom-client | 15.1.3 | `/metrics` endpoint (histogram + counter) |
| Tests (unit) | Vitest | 4.1.4 | + `@vitest/coverage-v8` |
| Tests (E2E) | Playwright | 1.59.1 | Chromium project only |
| CI | — | **none** | `.github/workflows/` is empty |
| Container runtime | Docker / Compose | — | 8-service stack; prod overlay with memory limits |

**Version observations.**
- React 18, Express 4, Prisma 6, Node (inferred LTS 20+). All current-generation, no end-of-life components. No Next.js, no RSC — deliberately kept as a classic SPA.
- TypeScript 5.7 with strict mode is ahead of many HE-sector builds.
- Prisma 6 (the repo advertises Prisma 5 in CLAUDE.md — a small documentation drift, not a functional issue).
- Choosing Keycloak over Auth0 / Okta is appropriate for a UK HE build — Keycloak is free, self-hosted, and SAML/OIDC-capable, which matches Jisc federation expectations.
- Choosing n8n as the workflow engine (rather than Temporal, BullMQ, or in-process cron) is the single biggest architectural bet: it externalises all automation behind webhook boundaries. This is very scalable for integrations but means every non-trivial business process must be authored twice — once in code as an event emitter, once in n8n as a flow.

**Dependency hygiene.** No abandoned or deprecated top-level packages were observed in the agent sweep. ESLint is configured (`npm run lint` targets `src/`) but no `.eslintrc` / `.prettierrc` is in-repo at root — formatting rules rely on editor defaults. Adding a pinned ESLint + Prettier config is a low-cost next step.

## 5. Data model and persistence

**Scale (verified).** `prisma/schema.prisma` declares **197 models** and **123 enums**, spanning 23 HE domains as mapped in CLAUDE.md. Seven applied migrations live under `prisma/migrations/`; two untracked duplicate-named migration directories (`extend_support_category`, 46s apart) remain from a Phase 13 baseline and should be reconciled before the next production migration.

**Canonical identity pattern.** Every model carries: `id String @id @default(cuid())`, `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`, `createdBy String?`, `updatedBy String?`, and — for student-facing entities — `deletedAt DateTime?` for soft delete. 835 audit-field references are present across the schema. One notable exception: **`MarkEntry` has `createdAt` / `createdBy` / `deletedAt` but no `updatedAt` / `updatedBy`** — deliberate immutability by design, but the decision is not documented as an invariant and would confuse an external auditor.

**Soft-delete coverage.** Migration `20260410203303_add_deleted_at_to_31_models` added `deletedAt` to 31 models; the repository layer consistently filters `where: { id, deletedAt: null }` on reads (sampled in `finance.repository.ts`). Per `docs/review/00-executive-verdict.md`, coverage is still partial — **154 of 197 models lack `deletedAt`** (21.8% coverage). The bias is toward academic/reference data, which is defensible, but a documented list of "hard-delete-allowed" entities would make the rule auditable.

**Cascade behaviour (80 `onDelete` clauses).**
- **Marks chain correctly uses `Restrict`** on `AssessmentComponent → Assessment` and `MarkEntry → AssessmentComponent` — academic marks cannot cascade-delete. ✅
- **Person descendants cascade to Person** (PersonName, PersonAddress, PersonContact) — acceptable for supporting data. ✅
- **Finance chain contains `onDelete: Cascade`** on `Invoice → StudentAccount` and `ChargeLine → Invoice`. For a UK HE finance system subject to SOX-equivalent audit retention, these should be `Restrict`. ⚠️ **Primary cascade-hazard finding.**

**Indexing.** 228 `@@index` declarations. Spot-check found no redundant indexes overlapping a `@@unique` prefix — the Phase-0.5 BugBot finding (redundant HESA indexes) has been resolved. Compound indexes on foreign-key columns are strategically placed.

**Raw SQL.** Exactly one raw query in the entire codebase — `prisma.$queryRawUnsafe("SELECT 1")` in the `/api/health` probe (`server/src/index.ts:68`). SQL-injection surface is effectively zero.

**Effective-dating / temporality.** HESA models (`HESASnapshot`, `HESAStudentModule`) embed snapshot semantics correctly: snapshots are immutable once sealed (schema uses a DB trigger per the overnight-build log). Other domains (Enrolment status, Fee bands, Programme specifications) rely on `StatusHistory` tables (e.g., `EnrolmentStatusHistory`) rather than true bitemporal fields — a standard compromise, but it means point-in-time queries ("what was this student's status on 2025-06-30?") require joining through history tables rather than a valid-from/valid-to range scan.

**Domain coverage.** All 23 domains listed in CLAUDE.md are present in-schema. Notably thin areas:
- `ChangeOfCircumstances` — single model, no status machine
- `GraduationRegistration` — no certificate-generation pivot
- `Placement` — no visit-scheduling model
- `AccommodationBooking` — no clash/allocation model

**Seed data.** Phase 1B seed covers reference data (countries, programmes, modules, roles, system settings) and dev personas (admin/academic/student/applicant) aligned with the four portals. No large synthetic student cohort is seeded by default — existing SQL scripts in `scripts/` can be adapted.

**Persistence summary.** The schema is wide, HE-literate and correctly named for a UK context (British English throughout). The two material risks are (a) the finance-chain cascade choice, and (b) the partial soft-delete coverage. Both are fixable with targeted migrations.

## 6. Authentication and authorisation

**Identity provider.** Keycloak 24.0, self-hosted, deployed as a Docker service with realm bootstrapped from `docker/keycloak/fhe-realm.json`. Protocol is **OIDC Authorization Code with PKCE**. The client uses `responseMode: 'query'` to avoid hash-fragment collisions with the wouter hash router. Tokens are held **memory-only** on the client (`client/src/contexts/AuthContext.tsx`) — no localStorage, no sessionStorage. `keycloak.onTokenExpired()` triggers a silent refresh at the 30-second expiry window. SAML is advertised in CLAUDE.md but not configured in the realm import — a documentation drift worth correcting before any Jisc-federated pilot.

**Token verification (server).** `server/src/middleware/auth.ts` verifies RS256 tokens via Keycloak's JWKS endpoint with a 600-second cache and a 10-req/min refresh cap (to prevent JWKS DoS). A static `JWT_SECRET` fallback exists for dev. A dev-bypass shortcut is gated to `NODE_ENV !== 'production'`; the middleware **exits the process** if `AUTH_BYPASS=true` ever leaks into a production env (auth.ts:43). This is the right fail-fast posture.

**Internal service key.** Webhook callbacks from n8n authenticate via `x-internal-key`; comparison is timing-safe (`crypto.timingSafeEqual`), minimum key length 32 chars, dev default explicitly blocked in production (auth.ts:268). The key is injected into n8n via its credential store by `scripts/provision-n8n-workflows.ts` — never committed to workflow JSON.

**Role model.** 36 roles defined in `server/src/constants/roles.ts`, aggregated into 12 role groups: `ADMIN_STAFF` (20 roles), `TEACHING` (9), `FINANCE` (3), `SUPPORT` (5), `EXAM_BOARD` (6), `REGISTRY`, `SUPER_ADMIN`, `ALL_AUTHENTICATED`, plus portal groups (`ACADEMIC`, `STUDENT`, `APPLICANT`). `SUPER_ADMIN` short-circuits role checks at `auth.ts:314` — appropriate for break-glass access and easy to audit.

**RBAC enforcement.** The `requireRole(…)` middleware is applied **pre-controller on every mutating endpoint**, verified by sampling marks / finance / students / webhooks routers. Pattern observed:
- `GET` → `ADMIN_STAFF + TEACHING + scopeToUser` (students see only their records; staff scoped per module assignment resolver)
- `POST / PATCH` → single domain group (e.g. `TEACHING` for marks, `FINANCE` for invoices, `REGISTRY` for enrolments)
- `DELETE` → `SUPER_ADMIN` only

**Data scoping.** `server/src/middleware/data-scope.ts` provides automatic row-level filtering — student-role requests inject `studentId` derived from email → Person → Student chain, with a 5-minute LRU identity cache. Ten resolver helpers (`resolveEnrolmentOwnership`, `resolveModuleRegistrationOwnership`, etc.) prevent cross-student access. A dev fast-path hardcodes seeded persona identities to avoid DB lookups during UI walkthroughs.

**Known gaps.**
- **Realm-name drift (HIGH-risk config):** `auth.ts` default realm is `fhe`; `.env.example` and some docs reference `sjms`. A misconfigured production deploy would silently return 401. Reconciling and documenting the realm name is a 10-minute fix and should precede any external pilot.
- **MFA:** a feature branch for MFA was abandoned; the current realm has no enforced second factor. Acceptable for a dev/pilot build, unacceptable for UKVI-regulated sponsor compliance.
- **SAML:** claimed in CLAUDE.md, not configured.
- **Module-scope leak (KI-P10b-003):** academic staff currently see **all** modules rather than only their taught modules — the underlying resolver exists but is not wired in the academic-portal router guards. Flagged AMBER.

**Audit coverage.** `server/src/utils/audit.ts` records `entityType`, `entityId`, `action` (CREATE/UPDATE/DELETE/VIEW/EXPORT), `userId`, `userRole`, `ipAddress`, `userAgent`, `previousData`, `newData`. Coverage is ~90% across services. The logger is **non-blocking** (try/catch, failures swallowed) — acceptable for throughput, but enterprise auditors typically want the opposite (hard fail on audit-log write failure). Configuration flag to switch mode is a small follow-up.

## 7. UX / UI flows

**Shape.** 129 `.tsx` pages across four portals. Hash-routed SPA via wouter v3 + `useHashLocation()`. Each portal has a top-level router (`AdminRouter.tsx`, `AcademicRouter.tsx`, `StudentRouter.tsx`, `ApplicantRouter.tsx`) and a portal guard (`usePortalGuard`) consolidating race-condition fixes from the earlier four separate implementations.

**Design system.** FHE palette applied through Tailwind tokens (navy #1e3a5f primary, slate #334155 secondary, amber #d97706 accent, #f8fafc background, #e2e8f0 card borders). 12 shadcn/Radix primitives under `client/src/components/ui/` (Button, Card, Input, Select, DataTable, Dialog, Alert, Badge, plus icon helpers). Dark mode supported via `class` strategy but not yet QA'd. British English throughout UI copy, labels, form fields — verified by Comet round-5 audit (0 violations).

**Portal coverage (page counts and wiring state).**

| Portal | Pages | Wired to API | `ComingSoon` | Notable flows |
|---|---|---|---|---|
| Admin | ~80 | ~55 | ~25 | Students, Programmes, Modules, Enrolments, Marks, Exam Boards, EC Claims, Appeals, Finance (core), Attendance, UKVI, HESA reports, Governance, Calendar, Audit Log, System Settings |
| Academic | 14 | 8 | 6 | MyMarksEntry, MyModeration, MyExamBoards, MyModules, MyStudents, MyECClaims, MyProfile, AcademicDashboard — MyTutees/TuteeProfile/MyAttendance/MyTimetable/MyModuleDetail have partial tabs as stubs |
| Student | 16 | 13 | 3 | StudentDashboard, MyModules, MyMarks, MyTimetable, MyAttendance, MyTickets, RaiseTicket, MyECClaims, MakePayment, MyPaymentPlan (partial), MyProgram, MyAccount, MyDocuments (metadata only), StudentProfile |
| Applicant | 9 | 6 | 2 | ApplicantDashboard, CourseSearch, MyApplication, MyOffers, Events, EditApplication, UploadDocuments (metadata only), ContactAdmissions (static) |

**Golden journeys (as delivered today).**

1. **Applicant → Student:** can create an application, edit while `DRAFT`, see offers under `MyOffers` (accept/decline wired), but **offer generation itself has no business logic** and document uploads are metadata-only.
2. **Student everyday:** can see timetable, marks, attendance, tickets and EC claims, with real data fetched via TanStack Query. Payments can be recorded but payment plan generation is absent.
3. **Academic everyday:** can enter marks, submit for moderation, view moderation queue and exam board memberships. But marks are stored as draft/submitted flags — there is **no pipeline state machine** driving DRAFT → SUBMITTED → MODERATED → RATIFIED → RELEASED with side-effects.
4. **Admin:** can do CRUD across every domain, audit log is viewable, system settings editable. HESA return page exists but is view-only.

**What's missing at the UX level (beyond the ComingSoon list).**
- **No progressive disclosure of work-in-progress state** — pages are either "fully wired" or "placeholder", with no partial-feature affordance that communicates what the user can vs cannot do.
- **No unified notifications / inbox** — announcement endpoint stub exists (G-04) but no UI.
- **No bulk-action UX** — lists support pagination + filters but not bulk-select, bulk-edit, or CSV export.
- **No clash detection / room picker** in the timetable or accommodation flows.
- **No WCAG 2.1 AA audit** has been performed; the CLAUDE.md rule is stated but not verified. shadcn/Radix primitives provide strong default accessibility, so the baseline is likely mid-to-high AA, but this cannot be claimed without evidence.
- **Responsive breakpoints** are configured for 1024 / 1440 but mobile (<768) is explicitly out of scope — defensible for a staff-oriented SIS, limiting for the student portal.

Overall the UI is **visually polished and structurally consistent** (one of the stronger dimensions of the build) but **narratively thin** — it shows the student journey rather than driving it.

## 8. Testing strategy and coverage

**Unit tests (Vitest).**
- 10 service-level test files under `server/src/__tests__/unit/`
- 2,786 total lines; 193 `describe`/`it` blocks; 228 `expect()` assertions
- Tested services: `admissions`, `appeals`, `attendance`, `communications`, `ec-claims`, `enrolments`, `finance`, `marks`, `module-registrations`, `support`
- **Coverage: 10 of 44 domain services ≈ 23%**
- Pattern: Vitest with `vi.mock()` for repositories and utilities; fixture-based; `beforeEach` reset hooks — idiomatic and readable
- Coverage tool (`@vitest/coverage-v8`) is installed but no coverage thresholds are enforced and no coverage report is checked in

**E2E tests (Playwright).**
- 3 spec files under `client/e2e/`: `admin-auth.spec.ts`, `assessment-submission.spec.ts`, `student-enrolment.spec.ts`
- 253 total lines; 21 assertions
- Configured against `http://localhost:5173`, Chromium-only, screenshot + trace on failure
- **Coverage: smoke-test level** — authentication path and two thin form submissions. Nothing verifies a real golden journey end-to-end (e.g. application → offer → enrolment → mark → result)

**What is NOT tested.**
- 34 of 44 services (77%) have zero unit-test coverage, including assessment, awards, transcripts, HESA, UKVI, documents, webhooks, governance, accommodation, identity, curriculum.
- No integration tests (service + repo + DB together) — the `PGlite` pattern seen in some UK HE builds is not adopted here.
- No contract tests between API and client service layer.
- No repository-layer tests (Prisma mocked in service tests; the Prisma queries themselves are never exercised under test).
- No frontend component tests (no React Testing Library, no Storybook).
- No accessibility tests (axe / Pa11y / Playwright `@axe-core/playwright`).
- No performance / load tests (k6, artillery).
- No security tests (ZAP baseline, dependency scanning beyond GitGuardian).

**CI.** `.github/workflows/` is empty. No pipeline runs typecheck, tests, lint, Prisma validation or migrations on PR. This is the single biggest quality-gate gap in the repository. The existing `docs/VERIFICATION-PROTOCOL.md` is enforced manually during autonomous build loops, not automated.

**Phase 9 claim vs reality.** `CLAUDE.md` Phase 9 table says "51 unit tests, 11 E2E specs (3 files)"; the live count is 120 unit cases across 10 files and 3 E2E specs. The difference reflects growth through Phases 10b–12, but the gap between CLAUDE.md and repo truth is another example of documentation drift.

**Net position.** Testing is **present but shallow**: the 10 tested services demonstrate that the team knows how to write good Vitest specs; the 34 untested services show the discipline is not yet routine. A CI workflow enforcing `tsc --noEmit`, Vitest, and Playwright smoke on every PR would deliver more quality-insurance per unit of effort than any other single intervention in this repo.

## 9. Deployment and infrastructure readiness

**Compose stack (`docker-compose.yml`).** Eight services, each with `healthcheck` and `depends_on: service_healthy` gates:

| Service | Image | Role | Healthcheck |
|---|---|---|---|
| postgres | `postgres:16-alpine` | Primary store; `sjms_app` schema | ✅ `pg_isready` |
| redis | `redis:7-alpine` | Cache + rate-limit store; password-protected in prod | ✅ `redis-cli ping` |
| minio | `minio/minio` | S3-compatible object storage | ✅ `/minio/health/live` |
| keycloak | `quay.io/keycloak/keycloak:24.0` | OIDC; realm imported from `docker/keycloak/fhe-realm.json` | ✅ `/health/ready` |
| n8n | `n8nio/n8n:latest` | Workflow engine; Postgres-backed | ✅ `/healthz` |
| api | multi-stage Dockerfile | Express API; `unless-stopped`; 30 s start period | ✅ `/api/health` (DB probe) |
| client | multi-stage Dockerfile | React build served behind nginx | ✅ nginx status |
| nginx | `nginx:alpine` | Reverse proxy, TLS termination, rate limiting | depends on api/keycloak healthy |

A **production overlay** (`docker/docker-compose.prod.yml`) adds memory limits (API 512M, Postgres 1G), Redis password + `maxmemory 256mb` + `allkeys-lru`, json-file log rotation (10 MB × 3 files), and `restart: unless-stopped` on every service.

**TLS and ingress.** `docker/nginx/nginx.prod.conf` implements **dual-mode TLS**: Let's Encrypt via certbot webroot, or institutional CA certificates in `/etc/nginx/certs/`. TLSv1.2 + TLSv1.3 only; ECDHE + CHACHA20-POLY1305 cipher suite; session cache 10 MB / 1-day timeout; OCSP stapling enabled; `/health` is HTTP-accessible for load-balancer probes; `/.well-known/acme-challenge/` HTTP-only for cert renewal; everything else forced to HTTPS. Rate-limiting zones: `api` 30 r/s, `auth` 10 r/s. Security headers applied at proxy (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy). Restricted paths (`/admin`, `/metrics`, `/n8n`, `/minio`) allow only private IP ranges (10/8, 172.16/12, 192.168/16, 127/8). `docs/OPERATIONS-SSL-RUNBOOK.md` documents the lifecycle.

**Observability.**
- `/api/health` — DB probe + service metadata (JSON), 200/503
- `/metrics` — Prometheus registry via `prom-client`: HTTP duration histogram + request counter, labelled by method/route/status_code
- Winston structured logs to stdout, collected by Docker json-file driver; 10 MB rotation × 3 files
- No Grafana / Loki / Tempo bundled — metrics/logs are exported but consumer is BYO

**Secrets and config.**
- `.env.example` is complete (DATABASE_URL, REDIS_URL, KEYCLOAK_*, N8N_*, INTERNAL_SERVICE_KEY, TLS_MODE, DOMAIN, CORS_ORIGIN, WEBHOOK_SECRET)
- All secrets use `changeme` / `replace-me-generate-…` placeholders
- `INTERNAL_SERVICE_KEY` min 64 chars; server refuses to start in production without it and blocks dev default (auth.ts:268)
- Cert volumes and MinIO data volumes are gitignored; `.gitkeep` preserves structure

**Runbooks.** `docs/OPERATIONS-SSL-RUNBOOK.md` and `docs/STAGING-RUNBOOK.md` cover cert lifecycle, deployment, rollback and incident triage — unusual maturity for a build at this stage.

**Gaps.**
- **No CI/CD pipeline** (`.github/workflows/` is empty). Builds and deploys are manual.
- **No Kubernetes artefacts** — no Helm chart, no Kustomize, no k3s overlay. Acceptable for a single-VM pilot, a blocker for multi-institution scaling.
- **No automated backup / restore** — Postgres, MinIO and n8n volumes are declared persistent but no `pg_basebackup`/`pg_dump` cron, no WAL archiving, no MinIO replication, no restore drill documented.
- **No tenancy boundary** — single-realm Keycloak, single Postgres schema; a second institution would require fork-and-modify or a new deploy.
- **No blue/green or canary** deploy support; nginx sits directly in front of single-replica containers.
- **`api`, `client`, `nginx` Dockerfiles were flagged as broken** in prior notes — per README the current dev workflow runs the infra in Docker and the app locally. Needs verification before any hosted deploy.

**Net position.** Day-1 infrastructure is **above HE-sector median** for a build of this maturity — dual-mode TLS and Prometheus in particular are nice-to-haves that many production deployments lack. Day-2 operations (CI/CD, backups, failover, multi-tenant scaling) are **materially underdeveloped** and are the realistic blocker to any institutional go-live.

## 10. Code quality and maintainability

_To be written._

## 11. Security considerations

_To be written._

## 12. Documentation quality

_To be written._
