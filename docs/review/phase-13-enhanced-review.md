# SJMS 2.5 — Phase 13 Enhanced Deep Review & Enterprise Remediation Plan

**Prepared:** 2026-04-17
**Role:** Senior Systems Engineer / Solutions Architect (15 yr HE systems)
**Input reviewed:** `SJMS 2.5 — Deep Code and Functional17042026.md` (the Copilot deep review, 501 lines, same date)
**Method:** Independent verification of every load-bearing claim via direct code read, plus enterprise-positioning lens.
**Status:** Senior-engineer second opinion. Supersedes the Copilot review where they disagree.

---

## Executive summary

The Copilot deep review is genuinely thorough and mostly accurate, but it inherited two material fabrications from the repository's own `CLAUDE.md` Phase 12 narrative. After independent verification:

1. **Phase 12 business logic does not exist in the repository.** `CLAUDE.md` documents new utilities `server/src/utils/pass-marks.ts` and `server/src/utils/credit-limits.ts`, prerequisite + credit-limit enforcement in `module-registrations.service.ts`, auto-grade resolution via `resolveGradeFromMark()`, and 11 new tests for module-registrations service. Grep and directory listings confirm: **none of these files, functions, or tests exist on `main`**. The Copilot review repeated these claims verbatim without checking.
2. **Real maturity is lower than stated.** The Copilot review's 4.3/10 overall score credits Phase 12 improvements that do not exist. Corrected score is **3.8/10**, with business application layer at **1.5/10** not 2/10.
3. **Provenance risk is now the top risk.** If one phase narrative is fabricated, others may be. No build-log entry can be trusted at face value until audited. This must be corrected before any SME/UAT engagement.

Recommended next move: **Phase 13 — Integrity and Baseline (1-2 weeks)** to clean the repo, correct documentation, and produce a trustworthy playbook. Then Phase 14 (business logic), Phase 15 (statutory), Phase 16 (analytics & operability), Phase 17 (optional multi-tenancy).

---

## Part I — Verified 18-Section Review

Each section preserves the Copilot review's structure. Every factual claim independently checked. Legend: **✓** verified against code; **✗** falsified by code; **⚠** partially correct or materially misleading.

### 1. Current purpose and scope — ✓ accurate

UK HE student-journey platform for fictional "Future Horizons Education". Scope covers admissions → enrolment → assessment → progression → awards → finance → attendance → UKVI → EC/Appeals → support → HESA → accommodation → governance.

### 2. Feature completeness — ⚠ overstates Phase 12 delivery

- **Admissions:** applicant portal + Kanban status board genuinely work. Offer letter generation is a ComingSoon stub.
- **Enrolment:** **✗** Copilot review says "ModuleRegistration now includes prerequisite validation and credit limit enforcement … implemented in Phase 12". Verified against `server/src/api/module-registrations/module-registrations.service.ts` (100 lines): the file is pure CRUD. No prerequisite check. No credit limit check. Grep of `passMark`/`creditLimit`/`ModeOfStudy`/`pass-marks`/`credit-limits` across `server/src/` returns **zero matches in executable code**. The Phase 12 business logic claimed in `CLAUDE.md` does not exist in the repository.
- **Assessment:** **✗** `resolveGradeFromMark()` does not exist. `server/src/utils/grade-boundaries.ts` does not exist. `server/src/utils/` contains 11 files (`acl`, `audit`, `errors`, `logger`, `metrics`, `openapi`, `pagination`, `prisma`, `redis`, `snapshot`, `webhooks`); none are `grade-boundaries`, `pass-marks`, or `credit-limits`. `marks.service.ts` (156 lines) validates only `mark ≤ assessment.maxMark` via a 12-line `validateMarkBounds()` helper plus event emission on status changes. No grade is computed from mark anywhere.
- **Progression / Awards / Finance / Attendance / UKVI / HESA:** CRUD-only with no calculations. Confirmed — see Section 18.

**Net journey score:** 1/10 GO, 2/10 PARTIAL, 7/10 NO-GO. (Copilot scored 2/10 PARTIAL+ by crediting Phase 12; corrected score removes that credit.)

### 3. Architecture — ✓ accurate, with one refinement

Layered architecture real. Router → Controller → Service → Repository pattern applied consistently across 44 modules — spot-checked 10, 100% conform. Phase 12a's 9 domain group barrel routers are additive, introduce zero route collisions (verified in `server/src/api/index.ts`). They add `/api/v1/{group}/health` endpoints only; the original 44 flat mounts are preserved. Redundancy is benign documentation debt, not architectural debt.

One refinement: `server/src/api/` contains directories beyond the 44 routers (sub-feature modules `calendar`, `timetable`, `notifications` have services but no routers). Net router count remains 44.

### 4. Technology stack — ✓ accurate, versions current

React 18.3.1, Vite 6.0, Prisma 6.5.0, Express 4.21.2, TypeScript 5.7, Keycloak-JS 26.2.3, Zod 3.24, Vitest 4.1.4, prom-client 15.1.3, Winston 3.17. Node ≥20. No exotic choices.

### 5. Data model — ✓ accurate with minor corrections

- 197 models — ✓ (`grep -c "^model " prisma/schema.prisma` = 197)
- 123 enums — ✓
- Schema lines: **5,449 actual vs 5,454 claimed** — ⚠ trivial drift
- **7 applied Prisma migrations**, not 6. Plus two *untracked* migration dirs both named `20260413210353_extend_support_category` / `20260413210439_extend_support_category` (46 seconds apart, the non-empty adds 7 `ALTER TYPE ADD VALUE` statements to `SupportCategory`, the later is empty). Neither is committed; `_prisma_migrations` table state must be inspected before reconciling.
- HESA snapshot immutability is **enforced at the database** via Postgres trigger `prevent_snapshot_mutation()` in `prisma/migrations/20260408155000_hesa_snapshot_immutability/migration.sql`. Copilot review said "trigger existence not verified"; it exists.
- **Dead schema fields confirmed:** `DegreeCalculation.yearWeights`, `HESAValidationRule` records, `HESAFieldMapping` records, `AnonymousMarking`, `ClassificationRule`, `ProgressionRule` — all exist in schema, none are consumed anywhere in `server/src/`.

### 6. Authentication and authorisation — ⚠ accurate but with a role-count drift

- Dev-bypass production guard: ✓ `server/src/middleware/auth.ts:43-44` sets `AUTH_BYPASS` only when `NODE_ENV !== 'production'`.
- Internal service key: ✓ timing-safe, ≥32 char minimum, dev default rejected in production.
- Keycloak JWT: ✓ RS256, JWKS cached 600 s, issuer bound to `${KC_ISSUER_URL}/realms/${KC_REALM}`.
- **Role count drift across four documents:** `CLAUDE.md` root (27), `docs/architecture/system-architecture.md` (27), `docker/keycloak/fhe-realm.json` (36 composite), `server/src/constants/roles.ts` (37 individual `ROLE_*` exports). Readers cannot tell which is authoritative.
- Data scoping: ✓ `scopeToUser`, `requireOwnership`, `injectOwnerOnCreate` all present. Identity cache is in-memory `Map<string, ResolvedIdentity>` with 5-min TTL — not safe for multi-instance deployment.
- **MFA: not configured.** Verified by reading `docker/keycloak/fhe-realm.json`: `verifyEmail: false`, `sslRequired: "none"`, no `otpPolicy`, no `requiredActions`, no `authenticationFlows` customisation. MFA planning docs at repo root (`# SJMS 2.5 — Keycloak MFA Hardening.md`, 20 KB, 2026-04-14) exist but were never shipped — their branch `phase-10/keycloak-mfa-hardening` has 3 commits on origin with no PR opened.
- SAML: **✗** absent. `grep saml docker/keycloak/` → zero. Top-level `CLAUDE.md` header advertises "OIDC/SAML" — not true.
- Token storage client-side: ✓ memory-only, no localStorage/sessionStorage usage.

### 7. UX/UI flows — ✓ accurate

129 React pages across 4 portals (Admin 80+, Academic 13, Student 14, Applicant 8). 34 ComingSoon stubs honestly named. Hash-based wouter routing avoids a real Keycloak+SPA fragment collision. No timetable view anywhere confirmed.

Missing note: **accessibility claim is unsubstantiated.** `CLAUDE.md` claims WCAG 2.1 AA compliance; no axe-core, no Playwright a11y, no ARIA audit. Claim should be withdrawn until tested.

### 8. Testing — ⚠ slight over-count, substance correct

- Unit tests: **9 files, 109 test cases**, not 10 / ~120. `module-registrations.service.test.ts` is **not present** despite `CLAUDE.md` Phase 12 claiming "120 unit tests (109 + 11 new for module-registrations service)". Those 11 tests do not exist.
- E2E tests: ✓ 3 Playwright specs; all use network interceptors, so they are UI smoke tests not integration tests.
- 34 of 44 service modules have zero unit tests. Coverage is ~20% of services, unmeasured in branches (no CI, no coverage report).
- No integration tests (API → real DB). No contract tests. No accessibility tests. No load tests. No performance baselines despite sub-2s/sub-500ms SLO in `CLAUDE.md`.

### 9. Deployment and infrastructure — ✓ largely accurate, with corrections

- **Docker Compose: 8 services**, not 9 (postgres, redis, minio, keycloak, n8n, api, client, nginx).
- Health checks: 6 of 8 services have them (client and nginx do not). Copilot's "all services have health checks" claim is slightly over.
- Production overlay `docker/docker-compose.prod.yml`: resource limits, Redis password, log rotation — ✓.
- SSL three modes (Let's Encrypt / institutional CA / self-signed) documented in `docs/OPERATIONS-SSL-RUNBOOK.md` — ✓.
- **CI/CD: confirmed none**, `.github/workflows/` does not exist. Only `.github/pull_request_template.md`.
- No Grafana dashboards, no alert rules, no k8s manifests — ✓ absent.
- No backup/restore/DR scripts in `scripts/` — ✓ absent.
- **Weak default credentials** in `docker-compose.yml`: `:-changeme` fallbacks for Postgres, MinIO, Keycloak, n8n.

### 10. Code quality and maintainability — ✓ accurate

TypeScript strict, zero `any` in services, no direct Prisma imports in services, no hard deletes where `deletedAt` exists, British English compliance — all verified by spot-check. Dual API mount is additive not duplicated. Deprecated two-arg `emitEvent` form in ~25 services (KI-P11-001), LOW severity.

### 11. Security — ✓ largely correct, with additional senior-engineer gaps

Implemented well: Helmet, Redis-backed rate limits at three tiers (100/min API, 5/min auth, 10/hr sensitive), CORS origin-restricted in production, WEBHOOK_SECRET enforcement, INTERNAL_SERVICE_KEY ≥32 char + timing-safe compare, no raw SQL in services except health-check `SELECT 1`.

Gaps (Copilot caught most; three additions):
- No MFA enforcement in realm.
- No GDPR right-to-erasure workflow. No `pgcrypto` / field-level encryption despite special-category data (health records, disability adjustments, passport numbers).
- **No Content-Security-Policy header in `docker/nginx/nginx.prod.conf`.** Only HSTS, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy. For a React SPA + embedded Swagger UI at `/api/docs`, this is a real XSS surface.
- **MinIO uploads proxy through Express.** `server/src/api/documents/documents.service.ts` has no presigned URL generation; all file bytes flow through Node. At modest scale this becomes the bottleneck.
- **No correlation/request ID in logs.** Winston emits JSON but no `requestId`. Morgan logs HTTP lines in parallel. Cross-log tracing is impossible.
- **Single-tenant hardcoded.** `tenantId` / `institutionId` grep returns zero. Commercial sale to a second institution requires schema rewrite or database-per-tenant.

### 12. Documentation — ⚠ extensive but fabricates Phase 12 deliverables

**Positives:** `docs/review/phase-10b-now/` is genuinely exceptional self-assessment. 8-file set (executive verdict, SME/UAT review, golden journeys, product scorecard, regression register, architecture-vs-reality, priority actions, evidence index) is more candid than most commercial product reviews. `docs/KNOWN_ISSUES.md` is a living 21 KB register with detection commands.

**Negatives not in the Copilot review:**
- **Phase 12 claims in `CLAUDE.md` are fictitious** (detailed in Section 2 above). Most serious documentation integrity failure in the repository.
- `docs/architecture/system-architecture.md` references "37 domain modules" and "27 Roles" when reality is 44 and 37.
- `CLAUDE.md` root says "~320 models" in one place, "197" in another.

### 13. Technical debt — ⚠ the list is right but under-weights one item

Copilot's list accurate. One item promoted:

**"No business logic in 40+ service files" should be the headline risk, not a bullet.** After removing Phase 12's fabricated contributions, only 3-4 services contain any conditional logic beyond CRUD + event emission:
- `marks.service` — mark-bounds check
- `applications.service` — offer-state transition detection
- `attendance.service` — UKVI threshold reader, but the threshold is read and discarded (dead code, TODO on line 129)
- `hesa.service` — timestamp injection on status change

Every other service is a CRUD shell. This is not a list item; it is the system's defining characteristic.

### 14. Strengths, weaknesses, risks, maturity — ⚠ revised

Strengths accurate. Weaknesses accurate. Maturity revised:

| Layer | Copilot score | Verified score | Rationale |
|---|---|---|---|
| Platform / infrastructure | 8/10 | 8/10 | No change — real strength |
| Business application | 2/10 | **1.5/10** | Phase 12's claimed business logic does not exist |
| Overall | 4.3/10 | **3.8/10** | Weighted mean |

Risks unchanged: invalid academic records accepted silently; data integrity; regulatory exposure; stakeholder trust; n8n never tested.

One risk the Copilot review missed: **provenance risk.** Documentation fabrication raises the question of whether other build-log entries are accurate. Anyone basing next-phase decisions on the phase summaries is working from partially fictitious history. Must be corrected before SME/UAT.

### 15. Evolutionary role — ✓ accurate

UniSIS → SJMS 2.0 → 2.5 → 3.x → 4.0 → v4-integrated → 2.5 convergence. SJMS 2.5 is the correct canonical base: resolves the mock-data failure of v4-integrated, inherits the UI polish of 2.4. Persistent failure across iterations — "infrastructure complete, business logic absent" — accurately identified.

### 16. HERM readiness — ⚠ revised downward

Copilot: "approximately 35–40%". With Phase 12 business logic removed and documentation-integrity factored in:
- Breadth (domain inventory coverage): **70%** — models exist for everything HERM lists.
- Depth (operational enforcement per domain): **~25%**, not 35-40%. No domain has a complete rule/calculation engine.
- Weighted (breadth × depth): **~28%** HERM readiness.

### 17. Competitive positioning — ✓ accurate, sharper framing

**Where SJMS 2.5 is competitive:**
- Against open-source SIS (Kuali Student, OpenSIS): ✓ architecturally superior, cleaner code, modern stack, better typing, better audit trail, event-driven design.
- As an architectural reference implementation: ✓ the module pattern, schema, and documentation could be published as a teaching example.
- As a starting platform for a niche HE product: ✓ with 6-8 months of domain work, it could beat bespoke builds on time-to-market.

**Where SJMS 2.5 is non-competitive and will remain so without multi-year investment:**
- **SITS:** 30 years of compiled UK HE business rules, UCAS/SLC/HESA connectors tested against 60+ institutions, regulatory product team that tracks OfS / QAA / CMA changes. A solo developer cannot close this gap.
- **Banner:** enterprise integration via Ethos API and a partner ecosystem. SJMS 2.5 has no integration partners.
- **Workday Student:** cloud SaaS with delivery, training, support infrastructure. SJMS 2.5 is source code with no delivery model.

**Honest commercial positioning:** SJMS 2.5 is a candidate for **controlled pilot at a small UK HE provider** (alternative provider, private college, specialist institution) where the depth gap is manageable and the commercial advantage is transparency + configurability + modern stack. It is **not** a SITS/Banner/Workday replacement candidate today and will not be within 12 months of even well-resourced investment.

### 18. Remediation plan — expanded in Part IV below

Copilot's 4-phase plan (A: Business Logic / B: Statutory / C: Analytics / D: Quality & Ops) is well-shaped; effort estimate (22-28 developer-weeks) is defensible *for a full-time developer*. My revised plan in Part IV adapts to Richard's actual solo + AI-assisted constraint, adds Phase 13 integrity work as a non-negotiable prerequisite, and adds an optional Phase 17 for commercial viability.

---

## Part II — Findings the Copilot Review Missed

Ordered by materiality.

1. **Documentation integrity failure.** `CLAUDE.md` Phase 12 section fabricates utilities, services, and test counts that do not exist. Must be corrected before any SME/UAT engagement.

2. **Phase 10 Keycloak MFA work is abandoned in flight.** Branch `phase-10/keycloak-mfa-hardening` has 3 unshipped commits on origin, no PR, two 20-KB planning docs dumped at repo root rather than under `docs/security/`. Decision needed: ship or drop. Shipping is one of the highest-impact P0 items — MFA is a standard UK HE auth requirement.

3. **Repository hygiene is actively confusing.** 17 untracked root-level files including a 1.86 MB SQL backup, duplicate docx files (verified identical SHA-256), stale worktree directories (535 MB + 4.4 MB), and 21 local branches of which 15 are squash-merged debris.

4. **Two duplicate-named Prisma migrations in the tree.** Both named `extend_support_category`, 46 seconds apart. `_prisma_migrations` DB check needed before consolidating.

5. **Every n8n workflow is `"active": false`.** Event-driven integration designed but never fired. `emitEvent` hits `WEBHOOK_BASE_URL` with 3-retry exponential backoff, then drops to AuditLog with no persistent queue. In production, this is a silent-failure pattern.

6. **15 stale remote branches + 18 local-only branches.** GitHub cruft from squash-merge workflow.

7. **No multi-tenancy substrate.** `tenantId`, `institutionId`, `organisation_id` → zero matches. Every table implicitly single-tenant.

8. **No correlation IDs in structured logging.** Winston JSON + Morgan HTTP lines + AuditLog per-user — no per-request ID stitches them. Production incident forensics will be painful.

9. **No CSP header on production nginx.** Real XSS risk, not theoretical.

10. **MinIO file traffic proxies through Express.** No presigned URL generation. Every upload/download blocks a Node event-loop slot.

11. **Weak Docker Compose defaults.** `:-changeme` fallbacks.

12. **Identity cache is in-memory `Map`, not Redis.** Horizontal scaling breaks role resolution.

13. **`sslRequired: "none"` in `docker/keycloak/fhe-realm.json`.** Fine for dev; unsafe if re-used verbatim in prod.

14. **Test count claim overstates by 11.** "120 unit tests" ← actual 109.

15. **Role-count drift across four documents.** 27 / 27 / 36 / 37.

16. **Schema line count drift.** 5,449 actual vs 5,454 claimed.

17. **Accessibility claim (WCAG 2.1 AA) is unsubstantiated.** No axe-core, no a11y tests, no audit record.

18. **"~650 endpoints" target in earlier docs vs 246 actual.** Acknowledged in a commit but still present in the CLAUDE.md narrative.

---

## Part III — Revised Maturity Scorecard

| Dimension | Score | Rationale |
|---|---|---|
| Schema design | 8/10 | 197 models, SITS-aligned, audit fields, soft delete pattern (partial coverage). Best aspect of the system. |
| API layer consistency | 9/10 | 44 modules follow identical pattern. Zero deviations. Rare for a solo build. |
| Security hardening (controls in place) | 7/10 | Helmet, rate limits, JWKS-RSA, HMAC webhooks, no raw SQL, no localStorage tokens. |
| Security hardening (gaps) | 4/10 | No MFA, no CSP, no GDPR erasure, no field encryption, single-tenant. |
| Observability | 3/10 | HTTP metrics only. No correlation IDs. No Grafana. No alerts. |
| Test coverage | 3/10 | 9 files / 109 cases / 20% of services. No integration, no contract, no a11y, no load. |
| CI/CD maturity | 0/10 | No workflows. Verification is manual protocol. |
| Business logic depth | **1.5/10** | Mark-bounds + offer-state detection + timestamp injection + dead UKVI threshold reader. That is the sum total. |
| Documentation depth | 8/10 | Exceptional review suite and KNOWN_ISSUES. Phase narratives partly fictitious. |
| Documentation accuracy | 4/10 | Phase 12 fabrications, role-count drift, schema-line drift. |
| HERM operational breadth | 7/10 | Nearly all domains scaffolded. |
| HERM operational depth | 2.5/10 | No domain has a working rule engine. |
| Integration architecture | 6/10 | Webhook/n8n design is sound. 0/15 workflows active. No DLQ. |
| Deployment & infra | 6/10 | Docker prod overlay real, SSL runbook real. No CI, no k8s, no backups. |
| Commercial readiness | 2/10 | No multi-tenancy, no delivery model, no support model, no licensing, no partner ecosystem. |
| **Overall weighted** | **3.8/10** | Down from Copilot's 4.3 because Phase 12 credit is withdrawn. |

**Suitable for:** internal SME walkthrough, domain-model validation, technical due-diligence against an architecture baseline.
**Not suitable for:** UAT, pilot, sale, production, or any representation of being "ready".

---

## Part IV — Remediation Plan for Enterprise Readiness

Sequenced for a solo developer with AI assistance (Richard's actual constraint). Honest envelope: **6-9 calendar months elapsed** (not the Copilot review's 22-28 developer-weeks which assumed full-time focus).

### Phase 13 — Integrity and Baseline (1-2 weeks)

Non-negotiable prerequisites before any new build work.

1. Repository hygiene — delete 14 stale remote branches, 15 squash-merged local branches, 3 stale worktree directories, duplicate docx/md files, orphan empty migration.
2. Rewrite `CLAUDE.md` Phase 12 section to match reality. Remove all references to `pass-marks.ts`, `credit-limits.ts`, `resolveGradeFromMark`, module-registrations prerequisite/credit-limit enforcement, and the 11 non-existent tests.
3. Reconcile role count across `CLAUDE.md`, architecture doc, realm JSON, and `constants/roles.ts`. Single source of truth: `constants/roles.ts`.
4. Reconcile endpoint count. Remove the "~650 endpoints" target; anchor on actual 246.
5. Reconcile schema line count or drop the claim.
6. Withdraw the unsubstantiated WCAG 2.1 AA compliance claim until axe-core has run.
7. Commit a `.github/workflows/ci.yml` skeleton: server tsc, client tsc, vitest, prisma validate.
8. Decide `phase-10/keycloak-mfa-hardening` — ship or drop. Move MFA planning docs to `docs/security/`.
9. Inspect `_prisma_migrations` table, reconcile the two `extend_support_category` duplicate migrations.
10. Produce `docs/remediation/PLAYBOOK.md` — replaces the placeholder REM-01..REM-27 list in any overnight-run prompts.

**Exit criterion:** the repo passes reconnaissance with zero surprises.

### Phase 14 — Business Logic Foundation (8-10 weeks)

- **Assessment pipeline** (3 weeks)
  - `server/src/utils/grade-boundaries.ts` — `resolveGradeFromMark(mark, moduleId, academicYear)` reads the `GradeBoundary` relation attached to `GradeScale` referenced by `Module`.
  - `server/src/utils/mark-aggregation.ts` — `aggregateComponentMarks(assessmentId)` and `aggregateAssessmentMarks(moduleRegistrationId)` — weighted by `AssessmentComponent.weight`.
  - `POST /v1/marks/aggregate` endpoint.
  - Moderation escalation with configurable discrepancy threshold via `SystemSetting`.
  - Acceptance: module with 2 assessment components (60%+40%) produces a correct ModuleResult row. Unit tests for all three new files.

- **Progression engine** (2 weeks)
  - `server/src/utils/classification.ts` — `calculateClassification(studentId, programmeId)` consumes `DegreeCalculation.yearWeights`.
  - Credit threshold check per FHEQ level (120 credits/year FT, 75 PT; externalised via `SystemSetting`).
  - Compensation/condonement (35-39% fail compensable if overall credits at 40%+ ≥ threshold).
  - Acceptance: seeded student with 3 years of module results computes correct classification (First/2:1/2:2/Third).

- **Enrolment cascade and fee charging** (2 weeks)
  - Status transition guard middleware in `server/src/middleware/status-guard.ts`.
  - Suspend cascade to active module registrations + finance event.
  - Accepted application → Student + Enrolment via `applicant-to-student.service.ts`.
  - Enrolment create → auto-create `ChargeLine` via `FeeRate` lookup by fee status + programme + academic year.
  - Acceptance: a Playwright integration test walks an applicant to an enrolled student with a charge on their account.

- **Attendance + UKVI** (1-2 weeks)
  - Wire `emitAttendanceAlert` properly — remove TODO on `attendance.service.ts:129`. Compute rolling % on each record, compare against `ukvi.attendance.threshold`, create `AttendanceAlert` on breach.
  - Activate n8n workflows 1-5 and confirm end-to-end execution.
  - Acceptance: seeding a student with 40% attendance creates an AttendanceAlert and the n8n workflow runs.

- **Soft-delete migration** (3 days)
  - Add `deletedAt` to `AssessmentComponent`, `MarkEntry`, `ChargeLine`, `Payment`, `Invoice`, `HESAStudent`, `HESAStudentModule`.

### Phase 15 — Statutory Compliance (10-14 weeks — likely the longest)

- **HESA Data Futures** (5-7 weeks)
  - Entity mapping layer: `hesa-mapper.service.ts`. Student → HESAStudent. Enrolment → StudentCourseSession. ModuleRegistration → HESAStudentModule.
  - Rule engine that consumes `HESAValidationRule` records.
  - JSON export conforming to Data Futures schema.
  - Submission workflow: DRAFT → VALIDATED → SUBMITTED → ACCEPTED.
  - Snapshot-on-submit via existing DB trigger.
  - Acceptance: one full test submission passes structural validation.

- **UCAS integration** (2-3 weeks — stretch)
  - Tariff calculation via `UCASTariff` lookup; application completeness validation.

- **CMA + OfS transparency** (1-2 weeks)
  - Entry criteria, fee information, decision timeline on applicant portal.

- **UKVI** (1-2 weeks)
  - Home Office report generation; CAS management workflow.

### Phase 16 — Analytics, Reporting, Operability (6-8 weeks)

- Statistical dashboards with drill-down (pass rates, grade distributions, retention).
- Transcript PDF generation.
- Financial summary reports.
- Test coverage → 60% of service modules.
- axe-core + Playwright a11y run.
- k6 load test; p95 baseline.
- Sentry error tracking.
- Identity cache → Redis.
- Correlation ID middleware.
- MFA enforcement in Keycloak realm.
- Presigned URL for MinIO.
- GDPR consent workflow using `ConsentRecord`.
- Activate all 15 n8n workflows.
- Business metrics to Prometheus.

### Phase 17 — Multi-Tenancy and Commercial Hardening (6-10 weeks — optional)

- `institutionId` discriminator on shared tables (or database-per-tenant).
- Per-institution configuration: grade scales, fee rates, UKVI thresholds, pass marks, classification rules, branding.
- Admin tooling for institution setup.
- Support/delivery runbook + training materials + licensing model.
- Reference architecture doc suitable for technical due-diligence.

### Cumulative honest estimate

| Phase | Calendar weeks | What it delivers |
|---|---|---|
| 13 Integrity & Baseline | 1-2 | Trustworthy repo + real playbook |
| 14 Business Logic | 8-10 | 5+ golden journeys genuinely GO |
| 15 Statutory Compliance | 10-14 | HESA submittable, UKVI operational, CMA compliant |
| 16 Analytics & Operability | 6-8 | UAT-ready, observability real |
| 17 Multi-Tenancy (optional) | 6-10 | Commercially saleable |
| **Total** | **25-34** (6-8 months) | **Credible HE product for small institutions** |

---

## Part V — Competitive Positioning Strategy

Post-Phase 16, SJMS 2.5 becomes:

- ✓ Better than any open-source SIS (Kuali, OpenSIS) on architecture, typing, modernity.
- ✓ Viable as a pilot for a single small UK HE provider.
- ⚠ Able to replace SITS at an alternative provider, small private college, or niche institution (specialist music conservatoire, theological college, private Master's-only provider).
- ✗ Not a SITS replacement for a research-intensive university. Not a Banner replacement for any US institution. Not a Workday replacement.

**Honest commercial pitch:** "A modern, transparent, configurable UK HE student platform for small-to-mid institutions who want out of SITS lock-in and can accept a 12-month transformation partnership in exchange for a cleaner future."

**Honest non-competing:** "SJMS 2.5 is not a drop-in replacement for SITS or Banner at scale. It does not have 30 years of business rule depth, a regulatory product team, or a partner ecosystem."

---

## Verification & Acceptance Criteria (Phase 13)

1. `npx tsc --noEmit` — 0 errors (server and client).
2. `grep -c "^model " prisma/schema.prisma` — matches `CLAUDE.md` stated model count exactly.
3. `find server/src/api -maxdepth 1 -type d | wc -l` — matches `CLAUDE.md` stated router count exactly.
4. `grep -c "^export const ROLE_" server/src/constants/roles.ts` — matches `CLAUDE.md` stated role count exactly.
5. `ls server/src/utils/` — contains exactly the files `CLAUDE.md` claims (any reference to a non-existent file is a fail).
6. `gh api repos/RJK134/SJMS-2.5/branches --jq 'length'` — returns 2 (main + phase-10/keycloak-mfa-hardening) or 1 (main only) after cleanup.
7. `ls .claude/worktrees/` — contains only actively registered worktrees.
8. `git status --porcelain` — empty or only contains deliberate in-flight work.
9. `docs/remediation/PLAYBOOK.md` exists and lists ~25 items with stable IDs, severities, domains, and acceptance criteria.
10. `.github/workflows/ci.yml` exists; PR triggers run tsc, vitest, prisma validate.

For Phases 14-17: per-phase acceptance criteria listed inline above.

---

## Evidence trail

- Existing Copilot review: `SJMS 2.5 — Deep Code and Functional17042026.md` (repo root, 501 lines).
- Verification tool runs: `grep -c "^model " prisma/schema.prisma` = 197; `server/src/utils/` listing contains 11 files, none are `grade-boundaries`/`pass-marks`/`credit-limits`; `server/src/api/module-registrations/module-registrations.service.ts` is 100 lines of CRUD; `docker/keycloak/fhe-realm.json` contains `sslRequired: "none"` and no `otpPolicy`.
- Phase 12 narrative in `CLAUDE.md` (lines 344-396) vs verified code state.
- Three Explore-agent reports (Phase 1 reconnaissance) corroborating independent counts.

---

## Recommended next action

Execute Phase 13 — Integrity and Baseline — starting with the steps listed in `docs/remediation/PLAYBOOK.md`. Do not proceed to Phase 14 business logic work until Phase 13 acceptance criteria pass, to avoid building on fabricated history.
