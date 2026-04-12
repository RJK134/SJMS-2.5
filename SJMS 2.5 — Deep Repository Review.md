SJMS 2.5 — Deep Repository Review
Date: 2026-04-10 | Reviewer: Enterprise Systems Engineering Assessment | Branch: main @ fcc8e17

1. Overall Maturity Assessment
SJMS 2.5 is a well-structured, early-stage enterprise foundation — not a stitched prototype, but nowhere near enterprise-ready. The project is realistically at the end of Phase 1 (schema + API scaffold), with Phase 2 (Keycloak), all integration layers (MinIO, n8n, real Redis usage), and full frontend wiring still ahead.

Signs of architectural discipline:

Consistent four-file module pattern across all 44 API domains (router / controller / service / schema)
Globally applied JWT authentication middleware with a proper requireRole / scopeToUser chain
Zod schemas present on every API module
Prisma migrations (not db push), proper soft-delete pattern on some entities, audit log + webhook emission in every service
React query hooks (useList, useDetail, useCreate) provide clean API coupling
Signs of drift:

The documented Router → Controller → Service → Repository four-layer pattern is aspirational: zero of the 44 service files import from the repositories/ directory. Eleven repository files exist with full transaction logic and typed queries, but the service layer entirely bypasses them and calls Prisma directly via utils/prisma. The documented architecture is not implemented.
Pervasive data: any and Record<string, any> types throughout all 44 service files defeat TypeScript's safety contract.
31 of 44 service remove() functions hard-delete (prisma.<Model>.delete()), directly violating the soft-delete rule.
Docker is documented as broken in the session handoff (API container crash-loops, client container serves stale bundle, nginx cascades to failure). The only working path is local npm run dev.
2. Strengths
Backend Architecture
Module decomposition is complete and consistent. 44 domain modules in server/src/api/, each with four files. File naming is uniform (kebab-case) and the import graph in server/src/api/index.ts shows all 44 modules registered under a single authenticateJWT guard.
Authentication middleware is production-grade in design. server/src/middleware/auth.ts implements RS256 JWT verification via JWKS (Keycloak public key), with a timingSafeEqual comparison for the internal service key, a correct AUTH_BYPASS gate that is doubly-guarded (process.env.NODE_ENV !== 'production'), and a mock user payload with the correct role structure. The bypass comment is explicit and honest.
Zod validation is universally applied. Every module has a .schema.ts file with paramsSchema, querySchema, createSchema, and updateSchema. The validate, validateParams, validateQuery middleware functions in server/src/middleware/validate.ts are correctly wired on all routes checked.
Role groups are well-designed. server/src/constants/roles.ts defines 36 roles in 12 semantic groups (REGISTRY, FINANCE, COMPLIANCE, TEACHING, EXAM_BOARD, etc.). Role enforcement on the students router (ROLE_GROUPS.ADMIN_STAFF for list, ROLE_GROUPS.REGISTRY for create/update) is appropriately granular.
Data scoping middleware is production-quality. server/src/middleware/data-scope.ts resolves Keycloak sub → Person email → studentId/personId with a 5-minute in-memory TTL cache, cleanly separating admin-sees-all from student-sees-own-data logic.
Audit log pattern is applied consistently. All 44 create(), update(), and remove() service functions call logAudit() and emitEvent(). The logAudit() utility writes to AuditLog via Prisma; errors are swallowed without breaking the main operation, which is correct.
Webhook emission with retry logic. server/src/utils/webhooks.ts implements exponential-backoff retry (3 attempts), an event-to-path routing table mapping all major domain events to dedicated n8n webhook paths, and AbortSignal.timeout(5000) to prevent hung requests. The routing table is the right design for n8n's shared-path conflict limitation.
Data Model
All 196 models have standard audit fields. The Python check (createdAt across all models) returned zero gaps. The fields are mapped consistently to snake_case column names (created_at, updated_at, created_by, updated_by, deleted_at).
Schema is genuinely comprehensive. 196 models covering 24 domains including SITS-aligned structures (PersonName with NameType, PersonAddress with AddressType and date ranges), full double-entry finance ledger (StudentAccount, ChargeLine, Invoice, Payment, FinancialTransaction), HESA compliance entities (HESAStudent, HESAModule, HESASnapshot with immutability trigger), and GDPR classification models (DataClassification, ConsentRecord, DataProtectionRequest).
Prisma migrations are properly managed. Four migrations exist, following prisma migrate dev/deploy (not db push). Migration 20260408155000_hesa_snapshot_immutability correctly implements a PostgreSQL trigger to enforce snapshot immutability at the DB layer.
HESA snapshot utility is clean. server/src/utils/snapshot.ts wraps prisma.hESASnapshot.create/findFirst/createMany in a typed utility with proper JSON serialisation of snapshot data.
Frontend
Token storage is correct. keycloak-js manages tokens in memory. No localStorage token storage anywhere in client/src/. The setTokens/clearTokens exports in auth.ts are no-ops (documented). Silent refresh via keycloak.onTokenExpired is wired in AuthContext.
API coupling is clean. client/src/hooks/useApi.ts provides generic useList, useDetail, useCreate, useUpdate, useRemove hooks built on TanStack Query v5. The Axios interceptor in api.ts handles 401 → token-refresh → retry with a proper queue for concurrent in-flight requests, which is sophisticated and correct.
Form validation is correct where applied. Student create, enrolment create, programme create, and ticket raise all use react-hook-form + zodResolver with inline Zod schemas. These forms are well-structured.
Design system adherence is visible. Primary Navy (#1e3a5f), Amber (#d97706), and the white + #e2e8f0 card pattern are applied consistently. tailwind.config.ts maps the design tokens. The shadcn/ui component set is appropriate and consistent.
British English is uniformly correct. No enrollment, program, color, analyze, organization found across the entire client/src/ codebase. enrolment, programme, colour (CSS comments), organisation used correctly throughout.
Routing fix is in place. client/src/App.tsx shows the corrected /admin/*? pattern (not the broken :rest*), addressing the documented wouter v3 / regexparam v3 routing regression.
Documentation
The docs/SESSION-HANDOFF-2026-04-10.md is an unusually honest and actionable engineering document. It flags known issues explicitly (Docker broken, routing bug partial fix, Phase 2 not started), provides exact reproduction steps, and gives concrete next-step priorities. This is excellent practice.
The docs/review-findings/remediation-register.md and docs/review-findings/endpoint-gaps.md are well-structured living documents that accurately track what has and hasn't been done.
The CLAUDE.md master context file is comprehensive and well-maintained.
3. Weaknesses and Gaps
Critical: Repository Layer Disconnect (Architecture)
The stated four-layer pattern (Router → Controller → Service → Repository) is not implemented. Every one of the 44 service files calls prisma directly from ../../utils/prisma. The 11 repository files in server/src/repositories/ (which have correct transaction logic, typed Prisma.*WhereInput parameters, and the changeStatus() with audit history pattern) are orphaned — no service imports them.

This creates a split codebase: the repositories have correctly-implemented complex operations (e.g., enrolment.repository.ts:changeStatus() creates an EnrolmentStatusHistory record transactionally) while the service layer performs the same operations without this logic. The services are functional but they represent the weaker, un-transactioned path.

Evidence: grep -rl "from.*repositories" server/src/api/ → zero results.

Critical: Pervasive Hard Deletes
31 of 44 remove() service functions use prisma.<Model>.delete() (hard delete) in violation of CLAUDE.md Rule: "soft delete via deletedAt IS NULL".

Affected entities include high-risk records: AssessmentAttempt, Assessment, StudentAccount, FinancialTransaction, Document, SupportTicket, ExamBoard, AwardRecord, Transcript, PersonIdentifier, PersonDemographic, AttendanceRecord, Interview, AdmissionsEvent, CommunicationTemplate, ModuleResult, OfferCondition, Submission.

Deleting financial records, marks, or identifiers is a data integrity and audit trail catastrophe in production. Only 6 services (students, enrolments, persons, applications, module-registrations, ec-claims) implement soft delete correctly.

Critical: No Tests
There are zero test files in the repository. No *.test.ts, no *.spec.ts. server/package.json has no test script; client/package.json has no test script. Vitest and Playwright are listed in CLAUDE.md as the test stack but neither is installed or configured.

An enterprise system handling student financial data, UKVI compliance, and HESA statutory returns with zero automated tests is unacceptable before any production deployment.

Serious: data: any Throughout Services
Every service file uses data: any as the parameter type for create() and update(). The list() function takes query: Record<string, any>. This means:

No TypeScript compile-time safety on writes to the database
Zod validation at the route level is the only defence (correct, but the service layer adds no additional safety)
Typos in field names will silently write wrong data (e.g., academicYeer would pass straight to Prisma)
The repository layer (which uses Prisma.EnrolmentUncheckedCreateInput etc.) was the correct fix, but it's not used.

Serious: Docker is Non-Functional
Per docs/SESSION-HANDOFF-2026-04-10.md:

sjms-api container crash-loops (Dockerfile runs node dist/index.js but no build step produces dist/)
sjms-client container serves a stale bundle from an older commit
sjms-nginx crash-loops because depends_on: api: condition: service_healthy never fires
The only working path is local npm run dev on both server and client
The production topology requires Docker (or equivalent). Having the Docker stack non-functional this early in the project means Docker paths have never been integration-tested. The n8n workflows reference http://api:3001 (Docker-internal), which only works when the Docker API container is up.

Serious: Keycloak Not Yet Configured
Phase 2 (Keycloak auth) is "Not started" per the session handoff. Auth bypass (AUTH_BYPASS=true) is the live dev mode. Consequences:

27 Keycloak roles exist only as code constants — the realm hasn't been provisioned
The scripts/keycloak-setup.ts exists but has never run
There's a config inconsistency: auth.ts defaults kcRealm to 'fhe'; .env.example sets KEYCLOAK_REALM=sjms; docker-compose.yml uses KC_DB_SCHEMA: keycloak without specifying the realm name. The realm name used in token issuance must match the validator or every JWT will fail.
SAML integration (mentioned in CLAUDE.md) is entirely absent
Serious: MinIO Not Integrated
docker-compose.yml includes MinIO and the Document model exists, but the documents service (documents.service.ts) stores only metadata in PostgreSQL — there is no MinIO client code anywhere in server/src/. No file upload, download, or signed URL generation. The multer dependency in server/package.json suggests this was intended but never completed.

Moderate: Redis Underutilised
Redis 7 is a declared infrastructure component but is only used for rate limiting. No caching of frequently-read reference data (faculties, schools, departments, programme catalogue), no session data, no pub/sub for real-time notifications. The rate-limiter Redis store has a silent Redis-unavailable fallback that could mask connectivity issues silently in production.

Moderate: 4 Remaining Endpoint Gaps (G-04, G-08, G-09, G-10)
From docs/review-findings/endpoint-gaps.md:

G-04 Announcements: StudentDashboard.tsx shows "No announcements at this time" — no API backing
G-08 Accommodation (3 pages): Blocks.tsx, Rooms.tsx, Bookings.tsx are all pure placeholder text (<p className="text-muted-foreground">Manage accommodation blocks...). No backend modules exist.
G-09 Room Catalogue: RoomManagement.tsx has no backend
G-10 Clash Detection: ClashDetection.tsx is a placeholder
These are documented as "PENDING" in the endpoint gaps register. However, accommodation and room management aren't minor — they're fully listed in AdminRouter.tsx as routed pages suggesting production expectations.

Moderate: Marks Pipeline Not Fully Wired
The remediation register claims B-02 (flat mark model) is RESOLVED with an append-only MarkEntry model and a 7-stage MarkStage enum. The marks.service.ts however creates/updates/deletes assessmentAttempt directly — it doesn't use MarkEntry, the mark pipeline stages, or AssessmentComponent. The MarksEntry.tsx page loads assessmentAttempt records. The migration added the schema but the service layer doesn't implement the pipeline logic.

Moderate: Soft-Delete Inconsistency in Schema vs Code
Some models in the schema have deletedAt but the services hard-delete them (as documented above). Other models in the schema lack deletedAt altogether (Assessment, Module, Programme) which means the dashboard service correctly avoids filtering on deletedAt for these — but deletes to these models are also hard-deletes, which can cascade unexpectedly given Prisma's default onDelete: Cascade on some relations.

Moderate: Client-Side Form Validation Coverage
Only ~5-6 pages use react-hook-form + zodResolver. The majority of forms (e.g., ApplicationDetail.tsx, EnrolmentDetail.tsx, EditApplication.tsx, most detail/edit pages) appear to be read-only views or handle mutations through the generic useUpdate hook without client-side validation. This means form errors are only surfaced server-side (post-submit), which degrades UX significantly for complex forms.

Minor: any in Schema Imports (OpenAPI)
The openapi.ts uses z.ZodObject<any> and a dynamically imported schema object, which means the OpenAPI spec generation is loosely typed and could silently miss schemas if an import is renamed.

4. Serious Concerns / Risks
Security
AUTH_BYPASS=true is the current operational mode. While the bypass is correctly gated on NODE_ENV !== 'production', the current dev database (150 students, 503 enrolments, seed data) is being accessed without real auth. More importantly, the bypass means the RBAC layer has never been exercised end-to-end with real Keycloak tokens. When Phase 2 begins, there will be a discovery phase where role enforcement bugs surface.

Keycloak realm name inconsistency. auth.ts:L97 defaults realm to 'fhe'. .env.example sets KEYCLOAK_REALM=sjms. If the realm is provisioned as sjms (matching .env.example) but the server fallback is 'fhe', every JWT issued against sjms realm will fail issuer validation (iss: http://localhost:8080/realms/sjms vs expected http://localhost:8080/realms/fhe). This will manifest as a hard auth failure the moment AUTH_BYPASS is disabled.

Internal service key hardcoded in docker-compose.yml. Line INTERNAL_SERVICE_KEY: ${INTERNAL_SERVICE_KEY:-sjms-dev-internal-service-key-do-not-use-in-production-min64chars} — the docker-compose default is the dev key. The server correctly rejects this in production (auth.ts:L164), but docker-compose should not have the dev key as its default.

n8n has no HTTPS. n8n is exposed on port 5678 with basic auth only. The docker-compose.yml has no SSL configuration for n8n. Webhook traffic from the API to n8n (http://n8n:5678) is internal-only, which is acceptable. But the n8n UI is accessible over plain HTTP on port 5678 — a security risk if exposed outside the Docker network.

CORS is true in non-production. server/src/index.ts:L17 sets origin: process.env.NODE_ENV === 'production' ? [...]  : true. This means all origins are accepted in development — an acceptable dev shortcut, but needs documentation and a plan for staging environments.

Data Integrity
31 hard deletes across financial, marks, compliance, and audit-adjacent entities. Deleting a StudentAccount record without a soft-delete trail removes the entire financial history. Deleting an AssessmentAttempt removes marks evidence that may be needed for academic appeals.

No transactions wrapping audit + webhook + primary mutation. The audit log and webhook event are emitted after the main Prisma call succeeds, but there is no $transaction wrapper ensuring atomicity. If logAudit() throws (it swallows errors, so this is benign) or if emitEvent() fires before the DB commits (not possible with async/await but architecturally fragile), the audit trail can be incomplete. The repository layer correctly uses $transaction for complex mutations but is bypassed.

createdBy and updatedBy fields are nullable in schema and services pass userId: string | undefined. In practice, req.user?.sub ?? 'system' is used throughout services, so the 'system' fallback masks cases where authentication state was wrong. The audit trail's actor field is not always the actual user.

Marks pipeline bypass. The append-only MarkEntry pipeline (with MarkStage states: DRAFT → FIRST_MARK → SECOND_MARK → AGREED → MODERATED → RATIFIED → PUBLISHED) is in the schema but not implemented in the service layer. The marks.service.ts directly creates/updates assessmentAttempt records and hard-deletes them. This means the marks audit pipeline described in the remediation register exists only in the schema, not in behaviour.

Operational Concerns
Docker is non-functional. The primary containerised deployment path is broken. There is no CI pipeline to catch this. Without a working Docker stack, integration between API, Keycloak, n8n, MinIO, and PostgreSQL has never been validated.

No CI/CD whatsoever. No GitHub Actions workflows, no automated test runs, no lint checks on pull requests, no prisma validate checks, no British English audit automation. The delivery plan documents these safeguards as "automated safeguards" but none are implemented.

keycloak:24.0 runs start-dev in docker-compose. start-dev is not suitable for any environment resembling production — it disables strict checks, allows insecure setups, and stores data in embedded H2 by default (this instance overrides to Postgres, which is correct). But the start-dev flag needs to be start with explicit feature flags for any staging or production use.

Performance baseline not established. Target is sub-2s page loads and sub-500ms API (p95). No benchmarking, no performance tests, no APM integration. The engagement dashboard calls GET /api/v1/attendance/engagement which performs aggregations over all attendance records for all students — potentially expensive without pagination or caching.

Missing observability. Winston logging is set up (utils/logger.ts) and Morgan request logging is wired. However, there is no structured error monitoring (Sentry, etc.), no distributed tracing, no alerting. Redis errors are silently swallowed in the rate limiter store — this could mask Redis connectivity failures with no visible signal.

Schema vs CLAUDE.md target mismatch. CLAUDE.md targets ~320 Prisma models. Current count is 196. The schema header says "183 models". The session handoff says the delivery plan estimates 180+ models. The 320-model target may require significant further schema work (accommodation, timetabling, governance, HESA Data Futures detail, alumni, etc.).

Delivery Risk
The most significant delivery risk is the polished UI over incomplete enterprise behaviour pattern identified in the problem statement. Evidence:

85 admin page components exist, are routed, and render (after the routing fix) — but many show real data only because the simple generic CRUD APIs return whatever's in the DB, not because the business logic is correct.
The marks pipeline is a perfect example: the UI shows marks entry working (data flows from assessmentAttempt in the DB), but the underlying pipeline stages, moderation workflow, and ratification process defined in the schema are absent in the service layer.
Accommodation, room management, and timetable clash detection have placeholder pages in the admin UI but no backend.
The project has an unusually comprehensive schema and an unusually well-structured documentation layer for its current stage of service implementation — the documentation describes a system in advance of what exists.
5. Documentation-to-Code Alignment
Rule	Status	Evidence
No MemStorage / in-memory Maps	✅ Aligned	Zero Map<> stores in server or client; all data via Prisma
British English throughout	✅ Aligned	Zero enrollment, program, color, analyze found in client/src/ or server/src/
Audit fields on all entities	✅ Aligned	All 196 models have createdAt, updatedAt, createdBy, updatedBy, deletedAt
Prisma migrations not db push	✅ Aligned	4 migration directories present; no db push in scripts
Every mutation emits webhook	✅ Aligned in service layer	All 44 create/update/remove service functions call emitEvent()
Every mutation writes AuditLog	✅ Aligned in service layer	All 44 create/update/remove service functions call logAudit()
Zod on all API inputs	✅ Aligned	44 .schema.ts files; all routes use validate/validateParams/validateQuery
No secrets in code	✅ Aligned	All via env vars; .env.example documents required vars; no hardcoded credentials found
No localStorage for tokens	✅ Aligned	keycloak-js memory management; setTokens/clearTokens are no-ops
Responsive at 1024/1440px	⚠️ Partial	Tailwind is used; no explicit responsive breakpoint tests; no Playwright viewport tests
Soft delete via deletedAt	❌ Not Aligned	31/44 services use hard prisma.delete()
Router → Controller → Service → Repository	❌ Not Aligned	Repository layer exists but is unused; all 44 services bypass it
Phase 2 Keycloak live	❌ Not yet	Auth bypass is the current operational mode; realm name inconsistency present
Docker deployable	❌ Not Aligned	API/client/nginx all broken per session handoff
No tests	❌ Not yet	Zero test files, no test framework configured
6. Guidance for Improving Prompts / Workflow
What Perplexity Prompts Should Produce
The strongest context packs from Perplexity should include:

Concrete schema contracts, not model descriptions. Instead of "add a marks pipeline with stages", supply: "The MarkEntry model has fields id, assessmentAttemptId, stage: MarkStage, mark: Decimal, markerUserId, feedback, enteredAt. The MarkStage enum is DRAFT | FIRST_MARK | SECOND_MARK | AGREED | MODERATED | RATIFIED | PUBLISHED. A new entry is appended per stage; the most recent entry for a given (assessmentAttemptId, stage) is the canonical value."

Operation-level behaviour specs. For each service, Perplexity should produce: "When marks.service.create() is called, it must: (a) create a MarkEntry record with stage DRAFT; (b) NOT modify AssessmentAttempt.finalMark; (c) emit marks.entered; (d) write to AuditLog." This prevents Claude from guessing the business logic.

Anti-pattern checklists. Perplexity should include: "This module MUST NOT use prisma.<Model>.delete(). Use prisma.<Model>.update({ data: { deletedAt: new Date() } }). AssessmentAttempt soft-delete must preserve all MarkEntry children."

Cross-cutting constraint snippets. Include in every prompt: a copy of the relevant section of docs/standards/coding-standards.md + the 10 CLAUDE.md rules + the specific ROLE_GROUPS that apply to this module's endpoints.

How to Structure Claude Code Prompts
Current weakness: Prompts are producing correctly-structured but semantically shallow services. The scaffolding is consistent, but business logic is minimal (CRUD with no domain rules).

Recommended structure for build prompts:

Code
[CONTEXT BLOCK — always include]
- Copy of CLAUDE.md rules 1-10
- Current schema excerpt for ALL models this module touches
- Any existing service/repository for related modules as examples

[CONTRACT BLOCK — one service at a time]
Module: marks
Prisma models used: AssessmentAttempt, MarkEntry, Assessment, ModuleRegistration
Allowed operations: create MarkEntry (not update/delete), list, getById
Business rules:
  - create() appends a MarkEntry row; never modifies existing entries
  - list() includes the latest MarkEntry per stage per attempt
  - Hard delete is FORBIDDEN; marks are immutable audit records
  - Required role: module_leader or assessment_officer for entry; super_admin only for correction

[ANTI-PATTERNS — always include]
DO NOT: use prisma.assessmentAttempt.delete()
DO NOT: use data: any — use Prisma.MarkEntryUncheckedCreateInput
DO NOT: bypass the repository layer — call markRepository.appendEntry()

[VERIFICATION BLOCK]
After generating the service, verify:
  - grep 'prisma\.\w\.delete' → 0 results
  - grep 'data: any' → 0 results
  - All mutations call logAudit() and emitEvent()
  - Repository layer is called, not prisma directly
Phased Prompt Strategy
Phase A — Architecture Lock (one-shot, do not skip):

"Produce server/src/repositories/marks.repository.ts following the pattern in enrolment.repository.ts. Include all Prisma types, transaction wrappers, and typed parameters. Do not create any service or router files yet." Then verify the repository compiles (npx tsc --noEmit) before proceeding.

Phase B — Service Wiring:

"Create marks.service.ts that imports ONLY from ../../repositories/marks.repository and ../../utils/{audit,webhooks,errors}. The service MUST NOT import from ../../utils/prisma directly."

Phase C — Contract Verification: Run: grep -r "from '../../utils/prisma'" server/src/api/ --include="*.service.ts" → must be zero results.

Phase D — Router/Controller generation: Provide the exact role groups for each endpoint. Include: "PATCH /marks/:id/advance-stage — requires assessment_officer or module_leader; PATCH /marks/:id/ratify — requires dean or associate_dean only."

Phase E — Anti-regression prompt (run before every PR merge):

"Review the diff for: (1) any prisma.<Model>.delete() call, (2) any data: any parameter, (3) any service that imports from utils/prisma directly, (4) any missing requireRole() on a mutating route, (5) any missing logAudit() or emitEvent() in a service mutation. Flag each violation."

Phase F — Integration wiring prompt:

"Given this service function signature and this API endpoint, write a frontend useApi hook call and a minimal component that: shows a loading skeleton, renders the data, and shows an error AlertCircle on failure. The component MUST NOT hardcode any data."

7. Highest-Value Next Actions
Immediate Remediation (do before any new feature work)
Fix all 31 hard deletes. Mechanically replace prisma.<Model>.delete() with prisma.<Model>.update({ where: { id }, data: { deletedAt: new Date() } }) in every service that hard-deletes a domain entity. For models without deletedAt (like Assessment), decide policy explicitly (retain hard-delete with a SUPER_ADMIN-only guard, or add the field). File evidence: All 44 *.service.ts files. Grep: grep -rn "\.delete(" server/src/api/.

Fix the Keycloak realm name inconsistency. Align auth.ts default (const kcRealm = process.env.KEYCLOAK_REALM || 'fhe') with .env.example (KEYCLOAK_REALM=sjms). Pick one realm name and use it everywhere: auth middleware, .env.example, docker-compose.yml Keycloak environment, client vite.config.ts VITE_KEYCLOAK_REALM. Until this is fixed, disabling AUTH_BYPASS will cause complete auth failure.

Fix the Docker API Dockerfile. Add a multi-stage build: node:20-alpine builder stage runs npm run build; production stage copies dist/ and runs node dist/index.js. This unblocks Docker-based integration testing.

Add a bare /admin redirect. AdminRouter.tsx catch-all renders an inline <h1>Staff Dashboard</h1> stub. Add <Route path="/admin"><Redirect to="/admin/students" /></Route> as the first route (or wire a real dashboard component).

Remove the dev internal service key from docker-compose.yml defaults. Replace INTERNAL_SERVICE_KEY: ${INTERNAL_SERVICE_KEY:-sjms-dev-internal-service-key-...} with INTERNAL_SERVICE_KEY: ${INTERNAL_SERVICE_KEY} and document that this env var must be set before docker-compose up.

Short-Term Architecture Hardening (next 2-4 weeks)
Wire the repository layer. Update the 44 service files to call the appropriate repository function rather than calling Prisma directly. Start with the domains that have repositories: enrolment, student, finance, admissions, assessment, attendance, document, compliance, governance, programme, support. This eliminates the architecture drift and ensures transactions are used for complex mutations.

Replace data: any with typed Prisma input types. Each service's create(data: any) should be typed as create(data: Prisma.<Model>CreateInput). This is a significant quality lift achievable module-by-module.

Implement the marks pipeline service correctly. The MarkEntry append-only pattern is in the schema and migration. Rewrite marks.service.ts to use markEntry operations exclusively for mutations, with AssessmentAttempt as the identity record only. This is the single most important business logic gap.

Implement MinIO file handling. Add minio npm package to the server. Create utils/minio.ts with uploadFile(bucket, key, stream), getSignedUrl(bucket, key). Update documents.service.ts to upload to MinIO and store storagePath in the Document record. Without this, the Document module stores metadata but no actual files.

Add a CI pipeline. A basic GitHub Actions workflow running npx tsc --noEmit (server + client), npx prisma validate, and grep -rn "\.delete(" server/src/api/ --include="*.service.ts" (should be zero) would catch regressions immediately. Takes ~1 hour to set up.

Build Governance and Process Improvements
Establish the Phase 1 Build Gate formally. Per the session handoff, the gate has NOT been passed (blocked on routing fix verification sweep). Run the verification sweep: open all 85 admin routes in a browser with the local dev stack, confirm each renders with data or a correct empty state, log anything that 404s/500s. Only then start Phase 2.

Introduce a service-layer contract test. A simple test that for each service file asserts: (a) it does not import from utils/prisma directly, (b) its remove() function does not contain .delete(, (c) it calls logAudit and emitEvent. This can be implemented as a Node.js script (not a full test framework) and run as part of the Phase gate checklist.

Adopt a module-by-module completion standard. A module is only "done" when: routes are wired, service uses the repository layer, all mutations are soft-delete, role guards are applied to all routes, Zod schemas match the Prisma model fields exactly, at least one happy-path integration test exists, and the corresponding frontend page displays real data end-to-end. The current approach generates skeleton implementations across all 44 modules simultaneously, which produces a wide but shallow result.

Separate the Phase 2 Keycloak provisioning from Phase 2 auth code. Create the Keycloak realm, clients, roles, and groups as a first-step infrastructure task (using scripts/keycloak-setup.ts or Terraform). Run AUTH_BYPASS=false immediately after provisioning to validate the token path before writing any new auth code. The bypass should be removed from the codebase once Keycloak is stable in dev.

Establish a weekly "no mock data" audit. Run grep -rn "mockData\|dummyData\|const.*=.*\[{.*id.*}\]" client/src/ server/src/ as a CI check. The remediation register confirms this was zero at last audit — automate it to stay zero.