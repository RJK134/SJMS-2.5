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

_To be written._

## 15. Evolutionary lineage — from SRS v2 to SJMS 2.5

_To be written._
