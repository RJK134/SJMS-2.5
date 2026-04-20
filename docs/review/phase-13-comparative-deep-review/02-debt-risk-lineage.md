# 02 — Debt, Risk and Lineage (Dimensions 13–15)

Companion to `00-executive-summary.md` and `01-system-review.md`. Covers technical debt, strengths/weaknesses/risks/maturity, and the evolutionary lineage from SRS v2 through SJMS 2.5.

## 13. Technical debt

Debt is organised into five categories: architectural, data-model, business-logic, testing/CI, and operational.

**A. Architectural debt**
- **Singular/plural route splits.** `enrolment` vs `enrolments`, `assessment` vs `assessments`, `progression` vs `progressions`, `students` vs `persons`. Historical responsibility splits that no longer correspond to a clean domain boundary. Consolidate to one module per domain.
- **Deprecated `emitEvent()` two-arg form in 25+ services** (KI-P11-001, AMBER). Dual-signature tolerated for migration reasons; should be fully migrated before Phase 14 so that event payload shape is invariant.
- **No internal domain-event bus.** All events go to n8n via HTTP POST. Means every "on enrolment created, also do X" rule either lives in n8n (coupling business logic to workflow engine) or has to be added to the Express service (duplicated event fan-out). A lightweight in-process emitter (Node `EventEmitter`, or `mitt`) would clarify the boundary.
- **No background job scheduler inside the API.** Batch workloads (daily UKVI check, weekly HESA snapshot, nightly fee run) have to be built in n8n cron flows, which is fine for integration but awkward for heavy-state-mutating operations that need DB transactions.

**B. Data-model debt**
- **Finance `onDelete: Cascade`** on `Invoice → StudentAccount` and `ChargeLine → Invoice`. Should be `Restrict`. Audit-integrity hazard.
- **`MarkEntry` lacks `updatedAt` / `updatedBy`**. Documented nowhere. Either add the fields or document the immutability invariant with an explicit DB trigger blocking UPDATE.
- **Soft-delete coverage 21.8% (43 of 197 models)**. Bias toward reference data; defensible but not stated as a rule.
- **Duplicate untracked migrations** (`extend_support_category` × 2). Clean before next `prisma migrate`.
- **Dead fields** (`YearWeights`, `ClassificationRule`) never referenced by code. Prune.
- **No bitemporal effective-dating** outside HESA snapshots. Historical queries on enrolment status / fee bands / programme specifications require joining status-history tables — awkward.

**C. Business-logic debt — the dominant category**
- **Marks pipeline.** Schema supports DRAFT → SUBMITTED → MODERATED → RATIFIED → RELEASED with `ModerationAction` model; service layer just flips booleans on update. No state machine, no transition guards, no side-effects.
- **No mark aggregation.** `AssessmentComponent.rawMark + weight` → `Assessment.aggregateMark` → `ModuleResult.grade` is not computed anywhere.
- **No grade-boundary application.** `GradeScale` + `GradeBoundary` exist; `resolveGradeFromMark()` utility exists with a `TODO [P1]` comment but is not invoked in the marks save path.
- **No classification calculation.** Degree algorithm (e.g. best-N-from-M at L6, weighted by credits) is absent.
- **No fee engine.** `ChargeLine` is a manual insert. No programme-band × fee-status × modulo-period calculation.
- **No HESA mapper or exporter.** Models exist; mapping from SJMS entities to Data Futures entities is not coded, validation rules are not executed, no XML/JSON generator, no submission client.
- **No UKVI alert automation.** Threshold read from SystemSetting, alert records can be inserted, but escalation and notification are TODO.
- **No timetable clash detection.** No pair-wise session overlap scan, no room-capacity check.
- **No accommodation allocation.** No room → student assignment algorithm, no clash detection.
- **No MinIO file pipeline.** Metadata-only. Binary upload, virus scan, signed URLs all absent.
- **Prerequisite / credit-limit checks on `create` only** (not `update`). Bypassable by POST-then-PATCH.

**D. Testing / CI debt**
- **No CI workflow.** `tsc --noEmit`, Vitest, Playwright smoke, Prisma validate, ESLint — none run on PR.
- **34 of 44 services (77%) have zero tests.**
- **No integration tests.** No repo + service + Postgres fixture harness.
- **No contract tests** between backend and the new typed client service layer (Phase 12b).
- **No accessibility, performance, or security tests.**
- **Coverage thresholds not enforced** despite `@vitest/coverage-v8` being installed.

**E. Operational debt**
- **No automated backup / restore.** Critical before any pilot.
- **No CI/CD** (see above).
- **No k8s or blue/green** — single-VM deploy model only.
- **No multi-tenancy.** Realm, schema, and data model all single-tenant.
- **No Dependabot or automated dependency update.**
- **No pre-commit hook** (ESLint, Prettier, secret scan).

**Debt sizing (rough).** Architectural + data-model debt: ~2–3 weeks of focused work. Business-logic debt: **~5–6 months of sustained work with clear domain-rule specification** (this is the dominant investment). Testing + CI + ops debt: ~4–6 weeks to reach a defensible baseline. Total: **~7–9 months** to turn the current scaffold into a genuinely pilotable product.

## 14. Strengths, weaknesses, major risks, maturity level

### Top 10 strengths

1. **Structural discipline.** 44 API domains in identical router → controller → service → repository layering, zero exceptions, zero MemStorage, zero direct Prisma in services. Rare at this scale in a self-built SIS.
2. **HE-literate data model.** 197 models, 23 domains, British English throughout, Tribal-SITS-shaped nomenclature, HESA Data Futures snapshot semantics in-schema.
3. **Keycloak + 36-role RBAC.** Realistic role hierarchy, data-scoping middleware, memory-only client tokens, timing-safe internal-service-key, fail-fast auth-bypass guard.
4. **Security posture above sector median.** Helmet + nginx double-header-setting, 3-tier Redis-backed rate limiting, dual-mode TLS, OCSP stapling, private-IP gates on admin/metrics/n8n/minio.
5. **Audit log at ~90% coverage** with entity, actor, IP, user-agent, before/after payloads.
6. **Operational runbooks.** SSL lifecycle, staging bring-up, known-issue register with detection commands — material operational maturity.
7. **Consistent frontend design system.** 4 portals, shadcn/Radix primitives, FHE palette, British English, hash-routed SPA free of auth-token persistence.
8. **Honest self-review.** Executive verdict, Phase 13 truth table, lessons-learned, KNOWN_ISSUES — the project assesses itself accurately.
9. **n8n workflow versioning.** 15 flows in-repo, idempotent provisioning script, credential store never touches git, HMAC webhook auth.
10. **Low type-escape-hatch rate.** 3 `any`s, 0 `@ts-ignore`, strict mode on.

### Top 10 weaknesses

1. **Business logic almost entirely absent.** Defining characteristic of the build: the system records the student journey but cannot compute any step of it.
2. **No CI.** Merges to `main` are ungated.
3. **77% of services untested.** Vitest coverage is demonstrative, not systematic.
4. **87 `ComingSoon` stubs in the UI.** Large visible completion gap for any stakeholder walkthrough.
5. **No MFA, no SAML** in Keycloak despite documentation claims.
6. **Finance cascade delete** compromises financial-audit retention.
7. **Realm documentation drift** — the codebase is already aligned to Keycloak realm `fhe`, but stale review notes still describe an `sjms`/`fhe` mismatch.
8. **No backup/restore automation.**
9. **HESA unimplementable.** Models exist, logic does not.
10. **Documentation drifts.** CLAUDE.md vs code (Prisma version, endpoint count, test count); harmless until it isn't.

### Major risks (top 5)

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Stale documentation reopens a resolved Keycloak realm issue and prompts unnecessary config churn | Medium | Low | Update review docs to state that `auth.ts`, `.env.example`, client defaults and `docker/keycloak/fhe-realm.json` already use `fhe` |
| R2 | Stakeholder walks through a `ComingSoon` page expecting a live feature and loses confidence | High | High | Replace stubs with **honest** empty-state explanations (Phase 11 already did some of this; finish) |
| R3 | Finance cascade delete triggered by a well-intentioned "clean up test data" script wipes invoice history | Medium | High | Change cascade to `Restrict`; add pre-migration review gate |
| R4 | HESA Data Futures deadline arrives with no mapper/exporter written | High at 12 months | Institution-critical | Start mapper spike in Phase 14; pair with an actual registry user |
| R5 | Further phases add more CRUD domains instead of filling in business rules | High | High (entrenches the 3.8/10 ceiling) | Impose a "no new domains until 3 golden-journey rules are coded" freeze |

### Maturity level

Measured against a five-band scale commonly used for enterprise SIS readiness:

| Band | Label | SJMS 2.5 state |
|---|---|---|
| 1 | **Prototype** — single demo flow, hard-coded data | Past |
| 2 | **Scaffold** — multiple flows, real DB, no rules | **Current (3.8/10 overall)** |
| 3 | **Pilot-ready** — rules wired for core journeys, integration tested, CI in place | **Target after 6–9 months** |
| 4 | **Production-ready** — statutory reporting live, backup/restore drills, MFA, multi-env CI/CD | 12–18 months |
| 5 | **Enterprise-grade** — multi-tenant, HA, disaster recovery, WCAG audited, third-party pen-tested | 24–36 months |

The repo's self-assessment (3.8/10 overall, 8/10 platform, 1.5/10 business logic) sits inside band 2 and is consistent with this reviewer's reading.

## 15. Evolutionary lineage — from SRS v2 to SJMS 2.5

The repository's own `SJMS-Lessons-Learned.md` and `CLAUDE.md` identify at least six prior builds in the SRS / SJMS family. The pattern across versions is consistent and diagnostic.

| # | Build | Period | Primary goal | What worked | What broke | Outcome |
|---|---|---|---|---|---|---|
| 1 | **Student-Record-System-v.2** | early | Single-user CRUD over SQLite | Proved domain vocabulary; informed later schema naming | MemStorage-like patterns, no auth, no normalisation | Archived; used as requirements source |
| 2 | **SRS-Build-Version-3.1** | mid | Multi-user UI, Keycloak first attempt | Introduced role constants, introduced soft-delete idea | Monolithic `routes.ts`; schema drift; no migrations discipline | Deprecated in favour of v4 |
| 3 | **SRS-Build-Version-4** | recent | Full enterprise stack (Prisma + Keycloak + n8n + MinIO) | 298 Prisma models, 27 roles, workflow engine proved integrable | **26 of 57 staff pages served mock data**; 7,965-line `routes.ts`; 56 P-series findings open | Blocking defects; not pilotable |
| 4 | **sjms-v4-integrated** | recent | Attempt to converge v4 with an FHE-specific UI fork | Better UI density; some domain rules prototyped | Merge introduced dual identity models; BugBot HIGH findings accumulated; context-degradation failures during autonomous build | Parked; hybrid state never stabilised |
| 5 | **SJMS 2.4 (Perplexity build)** | recent | Pure UI polish, 81 pages on MemStorage | Clean design system, fast iteration, British English baseline | **No persistence, no auth, no integrations** by design | Kept as UI donor for 2.5 |
| 6 | **SJMS 2.5 (this repo)** | current | Converge 2.4 UI + v4 infra + fix gaps | 197 models, 44 routers, 129 pages, Keycloak, rate-limit, TLS, honest KI register | Business logic almost entirely unwritten; same "platform not product" shape as v4 | Live development; Phase 13 |

### The recurring failure mode

`SJMS-Lessons-Learned.md` names it directly and this review concurs:

> **"Infrastructure complete, business logic absent."**

Every prior build reached an architecturally defensible state before the rules that make a SIS a SIS (mark aggregation, classification, fee calculation, HESA mapping, UKVI alerting) were encoded. Each build then attempted a remediation phase that preserved the infrastructure but never crossed the business-logic threshold before a rebuild was triggered.

SJMS 2.5 is the **sixth iteration of the same pattern**. It is further along than any prior attempt (because it consolidates the best of 2.4's UI and 4.0's infra) but it currently sits in the same local minimum: **structurally defensible, functionally empty**.

### What's genuinely different in 2.5

- **Honest documentation.** Previous builds had marketing-style phase completion notes; 2.5 has grep-verified truth tables and a 3.8/10 self-score. The repo no longer lies to itself.
- **Repository pattern actually enforced.** v4 had services reaching into Prisma directly despite the documented layering; 2.5's architecture agent found **zero** such violations.
- **Role + data-scope middleware is real.** v4 had roles defined but not enforced on every endpoint; 2.5 enforces on 100% of mutating routes sampled.
- **n8n workflows are versioned and idempotently provisioned.** v4 had flows in the n8n UI only.
- **Soft-delete is a schema-level concept**, not an ad hoc filter.

### What's the same

- **Business logic is still missing.** 40+ services are CRUD shells.
- **HESA is still unimplementable.** Schema exists; mapping / execution / export do not.
- **CI is still manual.** v4 had the same gap.
- **No MFA, no SAML, no multi-tenancy.**

### Implication for the remediation plan

The historical evidence is that adding further infrastructure or further domains **does not** move the project out of band 2. The only intervention that has any record of breaking the pattern is a **ruthless focus on wiring business logic for a small number of golden journeys** before any scope expansion. File `03-benchmark-and-remediation.md` operationalises this.
