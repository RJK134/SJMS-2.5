# SJMS 2.5 — Build Queue

> **Current Phase:** 16 — Golden Journey 1: Admissions to Enrolment (next active)
> **Planned branch:** `phase-16/admissions-to-enrolment` (branch not yet open; see governance branch note below)
> **Base:** `main` (post-Phase 15A + ESLint toolchain bootstrap)
> **Operating model:** `docs/delivery-plan/enterprise-delivery-operating-model.md` (canonical, effective 2026-04-22)
> **Programme reference:** `docs/delivery-plan/enterprise-readiness-plan.md`
> **Governance batch in flight:** `claude/enterprise-delivery-model-3GtVY` — codifies the operating model and refreshes the control set. Merge before opening `phase-16/admissions-to-enrolment`.

---

## Enterprise-delivery operating model (applies to every phase)

The full operating model is canonical in `docs/delivery-plan/enterprise-delivery-operating-model.md`. The summary below is kept for quick reference only; the doc wins on any conflict.

1. Read the delivery control set before work starts: `CLAUDE.md`, `docs/BUILD-QUEUE.md`, `docs/VERIFICATION-PROTOCOL.md`, `docs/KNOWN_ISSUES.md`, `docs/delivery-plan/enterprise-delivery-operating-model.md`, `docs/delivery-plan/enterprise-readiness-plan.md`, and any phase-specific remediation or review documents.
2. Work from one active phase branch at a time from `main`.
3. Break each phase into 3–8 reviewable batches.
4. Call `report_progress` before the first edit and after every meaningful batch.
5. Run the verification protocol after each batch, plus the existing unit and E2E suites when the touched scope warrants them.
6. Push changes through `report_progress`, open or update the PR, request BugBot review, fix HIGH findings, then re-run validation.
7. Do not begin the next phase until the current phase is merged and the control set is updated.
8. PR titles describe the business outcome, not the technical action.

## Validation baseline at Phase 16 start

| Check | Result | Notes |
|---|---|---|
| `cd server && npx tsc --noEmit` | ✅ pass | 0 errors |
| `cd client && npx tsc --noEmit` | ✅ pass | 0 errors |
| `DATABASE_URL=... npx prisma validate --schema=prisma/schema.prisma` | ✅ pass | Schema valid |
| `npx prisma generate --schema=prisma/schema.prisma` | ✅ pass | Client generated |
| `npm run test --workspace=server` | ✅ pass | Full Vitest suite passing |
| `npm run lint` | ⚠️ advisory | ESLint v9 flat config live in both workspaces (PR #88). CI runs `Lint (advisory)` with `continue-on-error: true`; ratchet to blocking tracked under KI-P15-002. |
| Verification protocol Gates 1–12 | ✅ pass | See `docs/VERIFICATION-PROTOCOL.md` |

---

## Phase 14 — Governance, Truth Baseline, and Release Discipline

**Objective:** Establish a trustworthy delivery baseline before any new product expansion.

### Batch 14A — Delivery control set refresh
**Status:** DONE — PR #53 merged 2026-04-21
**Scope:**
- Reconciled `CLAUDE.md`, `.claude/CLAUDE.md`, `docs/BUILD-QUEUE.md`, and `docs/KNOWN_ISSUES.md` with the post-Phase 13b reality.
- Replaced stale phase summaries with the enterprise-readiness roadmap.
- Recorded the current verification baseline and known control gaps.

### Batch 14B — Enterprise-readiness plan publication
**Status:** DONE — PR #53 merged 2026-04-21
**Scope:**
- Published the phase-by-phase plan for Claude Code delivery.
- Defined the operating model, phase gates, BugBot loop, branch naming, and PR conventions.
- Sequenced open backlog items to the target phase where they should be addressed.

### Batch 14C — CI gate uplift
**Status:** DONE — PR #53 merged 2026-04-21 + Phase 14 follow-on (see Batch 14C.2)
**Scope:**
- Keep PR gating mandatory on `main`.
- Extend CI beyond the existing typecheck/test baseline with server coverage publication and clearer quality-job structure.
- Log the lint-tooling gap explicitly rather than pretending lint is enforced.

### Batch 14C.2 — CI reporting hardening (follow-on)
**Status:** DONE — commit 0d570c0
**Scope:**
- Made the server coverage summary publication step tolerant of a
  missing or malformed `coverage-summary.json`. It now annotates the
  step summary with a reporting-only note instead of failing a valid
  test run.
- Added `if: always()` to the publish and upload steps so evidence is
  produced on both pass and fail paths.
- Softened the coverage artefact upload from `if-no-files-found: error`
  to `warn`; the unit-test step remains the authoritative gate.

### Batch 14D — PR/review automation hygiene
**Status:** DONE — commit in this PR
**Scope:**
- Updated `.github/pull_request_template.md` to remove the placeholder
  `Batch 1/2/3` list in favour of a populated batches/commit-SHA list,
  added a repository-hygiene acceptance gate, and added an explicit
  pointer to the coverage artefact as testing evidence.

### Batch 14E — Low-effort follow-on cleanup
**Status:** DONE — commits 49cd99e, 6853543
**Scope:**
- Removed 891 tracked files under `.claude/worktrees/` plus three
  dangling gitlinks (`gallant-poincare`, `suspicious-beaver`,
  `suspicious-robinson`) and two stray chat transcripts leaked into
  `.claude/`. Extended `.gitignore` with `.claude/worktrees/` and
  `.claude/*.txt` so the situation cannot recur.
- Reconciled coverage policy: vitest thresholds are now authoritative
  in `server/vitest.config.ts`, CI no longer overrides them, and the
  previous aspirational-but-unenforced 60/60/50 numbers have been
  retired. Current enforcement posture is honest (0 everywhere,
  monitor-only) with a clear ratchet point in Phase 17.
- KI-P14-001 (ESLint toolchain bootstrap) intentionally deferred to a
  dedicated `chore/tooling-eslint-bootstrap` branch per its own
  resolution plan; widening scope here would risk destabilising the
  governance baseline PR.
- KI-P12-001 (enrolment cascade repository bypass) left open; its fix
  touches shared infrastructure and belongs inside Phase 16 where the
  module-registration path is already the focus.

### Batch 14F — Phase closeout
**Status:** DONE — PR #54 merged 2026-04-21 as `b9a2a58`
**Acceptance:**
- Control docs internally consistent. ✅
- CI workflow updated and green (reporting steps cannot falsely fail). ✅
- BugBot review returned Medium-Risk advisory; no HIGH findings. ✅
- Remaining AMBER/LOW items logged in `docs/KNOWN_ISSUES.md`. ✅
- Next phase branch: `phase-15/security-observability` (split from the original `phase-15/security-hardening` scope — see Phase 15 section below).

---

## Phase 15 — Security and Platform Hardening Blockers

**Objective:** Close pilot-blocking platform/security gaps incrementally, in reviewable slices, without touching architecturally-significant surface (`auth.ts`, `roles.ts`, established Prisma models) without explicit sign-off.

### Active split

The original Phase 15 plan (MFA, Redis identity cache, CSP/CORS, scanning, finance retention) has been sequenced into two branches so reviewable slices land ahead of the architectural decisions:

- **Phase 15A — Security observability and supply-chain scanning** (this PR, branch `phase-15/security-observability`). Adds static analysis, dependency scanning, disclosure policy, and code ownership. No source code or schema changes.
- **Phase 15B — Auth, MFA, identity cache, and retention** (later PR, branch `phase-15/auth-hardening`). Architecturally significant — will STOP-gate per CLAUDE.md rule 6 until Richard signs off on the approach.

### Batch 15A.1 — CodeQL static security analysis
**Status:** DONE — commit `119e73f`
**Scope:** New `.github/workflows/codeql.yml` runs CodeQL `security-extended` query suite on PR, push to main, and weekly (Mon 03:17 UTC). Scoped away from `node_modules/`, `dist/`, and `prisma/generated/`. Advisory only — findings publish to Security tab.

### Batch 15A.2 — Dependabot config
**Status:** DONE — commit `f70b4d2`
**Scope:** New `.github/dependabot.yml` watches four ecosystems (`npm` at `/`, `/server`, `/client`; `github-actions` at `/`). Weekly cadence Monday 07:00 Europe/London. Minor/patch updates grouped per ecosystem, major bumps individual. Conventional-commit prefixes match existing repo conventions.

### Batch 15A.3 — npm audit supply-chain scanning
**Status:** DONE — commit `953529c`
**Scope:** New `.github/workflows/security-audit.yml` runs `npm audit --omit=dev --json` against root/server/client on PR, push to main, and daily 04:23 UTC. Publishes a severity-count summary table to the Actions step summary and uploads raw JSON as the `security-audit-reports` artefact. Advisory only.

### Batch 15A.4 — SECURITY.md disclosure policy
**Status:** DONE — commit `b20100e`
**Scope:** New `SECURITY.md` publishes coordinated-disclosure policy with GitHub PVR as the preferred channel, 3-day ack, 7-day triage, 90-day disclosure window, safe-harbour wording, explicit in/out-of-scope list, and the current ongoing security posture.

### Batch 15A.5 — CODEOWNERS
**Status:** DONE — commit `e967c2b`
**Scope:** New `.github/CODEOWNERS` names `@RJK134` as owner for governance docs, GitHub automation, auth middleware, roles constant, Prisma schema and migrations, nginx/Docker deployment surface, and the webhook/workflow contract. Enforcement depends on branch protection's "Require review from Code Owners" toggle.

### Batch 15A.6 — Control-doc alignment
**Status:** IN PROGRESS — this PR
**Scope:** Update `docs/BUILD-QUEUE.md`, `docs/KNOWN_ISSUES.md`, `docs/VERIFICATION-PROTOCOL.md`, `CLAUDE.md`, `.claude/CLAUDE.md` to record Phase 15A delivery and the Phase 15B sequencing decision.

### Batch 15A.7 — Phase 15A closeout
**Status:** DONE — PR #55 merged 2026-04-21 as `953ed77`
**Acceptance:**
- BugBot review returned with no HIGH findings. ✅
- GitGuardian clean. ✅
- CodeQL workflow runs against the PR and returns a result (pass or advisory findings) rather than infrastructure failure. ✅
- npm audit workflow runs against the PR and publishes a summary. ✅
- Control docs list Phase 15B as the next phase-15 branch with explicit STOP-gate note. ✅

---

## Chore — ESLint Toolchain Bootstrap (KI-P14-001 closeout) — DONE

**Branch:** `chore/tooling-eslint-bootstrap`
**PR:** #88 — merged 2026-04-21 as `67df18f`
**Outcome:** ESLint v9 flat configs live at `server/eslint.config.mjs` and `client/eslint.config.mjs`. The `Lint (advisory)` CI job runs both workspaces on every PR with `continue-on-error: true` and uploads JSON reports as the `lint-reports` artefact. KI-P14-001 closed (toolchain bootstrap). Ratchet to blocking gate remains open under KI-P15-002.

---

## Governance batch — Enterprise delivery operating model (in flight)

**Branch:** `claude/enterprise-delivery-model-3GtVY`
**Base:** `main @ 0f4eaf0`
**Scope:** codify the canonical operating model for Phases 16–23 and refresh the delivery control set to reflect the merged state of Phase 15A and the ESLint toolchain chore. Docs-only.

**Deliverables:**
- `docs/delivery-plan/enterprise-delivery-operating-model.md` — new canonical operating model.
- `docs/delivery-plan/enterprise-readiness-plan.md` — baseline updated, operating-model pointer added.
- `docs/BUILD-QUEUE.md` — current phase advanced to Phase 16, ESLint chore marked DONE, Phase 16 batch plan aligned to operating-model spec.
- `docs/KNOWN_ISSUES.md` — KI-P14-001 fully closed; remaining items left open with target phases.
- `CLAUDE.md`, `.claude/CLAUDE.md` — state refreshed, pointer to operating model added.

**Acceptance:**
- Verification-protocol Gates 9 and 11 pass (docs-only change must not regress hygiene or security observability).
- No touches to source code, schema, or CI workflows.
- Control set is internally consistent after the merge.

---

## Forward phase roadmap

### Phase 15B — Auth, MFA, identity cache, and retention
**Planned branch:** `phase-15/auth-hardening`
**HERM uplift:** Identity & Access Management, operational control
**Priority outcomes:** MFA enforcement, Redis-backed identity cache, auth fallback review, CSP/CORS/Swagger tightening, finance retention safeguards. Supply-chain scanning and disclosure policy already delivered in Phase 15A.

**STOP-gate note (per CLAUDE.md rule 6):** each of the Phase 15B batches below touches `auth.ts`, `roles.ts`, the Keycloak realm JSON, or established Prisma models. Claude will not open a PR for Phase 15B without explicit approval of the technical approach. The branch will carry a design doc first.

**Candidate batches:**
- 15B.1 MFA enforcement and realm policy hardening
- 15B.2 Identity cache migration to Redis
- 15B.3 Auth fallback and environment guard review
- 15B.4 CSP/CORS/Swagger tightening (bounded review of existing headers, not new architecture)
- 15B.5 Finance retention and cascade safeguard review
- 15B.6 Phase closeout and review findings remediation

### Phase 16 — Golden Journey 1: Admissions to Enrolment
**Planned branch:** `phase-16/admissions-to-enrolment`
**HERM uplift:** Learner Recruitment & Admissions, Enrolment & Registration
**Priority outcomes:** application lifecycle, offer condition logic, route handling, enrolment progression rules, finance handoff hooks, applicant/admin portal completion for the journey.
**Canonical batches (per `docs/delivery-plan/enterprise-delivery-operating-model.md` §10):**
- 16A Application lifecycle and state enforcement
- 16B Offer condition evaluation and admissions route handling
- 16C Applicant-to-student conversion and enrolment orchestration
- 16D Module-registration edge cases and finance handoff hooks (folds in KI-P12-001)
- 16E Applicant/admin portal completion for this journey
- 16F Evidence, tests, and closeout

### Phase 17 — Golden Journey 2: Assessment to Progression to Award
**Planned branch:** `phase-17/assessment-to-award`
**HERM uplift:** Assessment, Moderation, Progression, Awards
**Priority outcomes:** marks pipeline rules, moderation/ratification states, module result generation, progression decisioning, award/classification logic, transcript-ready outputs.
**Canonical batches (per operating model §10):**
- 17A Marks aggregation and grade-boundary application
- 17B Moderation and ratification state machine
- 17C Module result generation
- 17D Progression decisioning and classification
- 17E Award/transcript outputs and portal reflection
- 17F Evidence, tests, and closeout (includes server coverage ratchet — KI-P14-002)

### Phase 18 — Golden Journey 3: Fees, invoicing, payments, and finance controls
**Planned branch:** `phase-18/finance-readiness`
**HERM uplift:** Finance & Fees Management
**Priority outcomes:** fee calculation engine, automated invoices/charges, payment allocation, account balances, finance auditability, staged finance sub-domains.
**Canonical batches (per operating model §10):**
- 18A Fee calculation engine
- 18B Invoice and charge generation on enrolment states
- 18C Payment allocation and account-balance logic
- 18D Payment plans and finance auditability improvements
- 18E Sponsors / Bursaries / Refunds decision batch (or Phase 18a sub-phase cut-out) — closes KI-P10b-001
- 18F Evidence and closeout

### Phase 19 — Statutory and regulatory execution
**Planned branch:** `phase-19/statutory-compliance`
**HERM uplift:** Compliance, reporting, regulatory operations
**Priority outcomes:** HESA mapping and validation, UKVI escalation workflows, EC/appeals downstream actions, regulatory audit outputs.
**Canonical batches (per operating model §10):**
- 19A HESA Data Futures mapping layer
- 19B HESA validation executor and export preparation
- 19C UKVI attendance / compliance escalation workflow completion
- 19D EC claims and appeals downstream actions / reporting
- 19E Compliance dashboards, evidence trails, and closeout

### Phase 20 — Integration activation and workflow orchestration
**Planned branch:** `phase-20/integration-activation`
**HERM uplift:** External Integration, Student Communications
**Priority outcomes:** activate the 15 n8n workflows, improve provisioning/promotion, deliver the first live external connectors (UCAS and SLC first), and add monitoring/replay discipline.
**Canonical batches (per operating model §10):**
- 20A Activate and observe the 15 n8n workflows
- 20B Harden workflow provisioning and environment promotion
- 20C UCAS integration slice
- 20D Student Loans Company integration slice
- 20E Failure handling, replay discipline, and closeout

### Phase 21 — Portal completion, academic scoping, and UX/accessibility
**Planned branch:** `phase-21/portal-completion`
**HERM uplift:** Student Self-Service, Teaching support, accessibility
**Priority outcomes:** remove priority `ComingSoon` pages, add teaching-assignment scoping, implement presigned uploads, improve communications UX, evidence WCAG 2.1 AA.
**Canonical batches (per operating model §10):**
- 21A Teaching-assignment model and academic scoping — closes KI-P10b-003
- 21B MinIO presigned upload flow and document completion — closes KI-P10b-002
- 21C Replace high-value `ComingSoon` pages
- 21D Applicant / student / staff notification surface improvements
- 21E WCAG 2.1 AA remediation and evidence
- 21F Closeout

### Phase 22 — Analytics, reporting, BI, and operational observability
**Planned branch:** `phase-22/analytics-operability`
**HERM uplift:** Analytics, BI & Reporting
**Priority outcomes:** role-specific dashboards, KPI reporting, richer operational telemetry, data export strategy, runbooks tied to metrics and logs.
**Candidate batches:**
- 22A Management dashboard baseline
- 22B Domain reporting slices
- 22C Operational telemetry and alerting
- 22D Data export and BI handoff patterns
- 22E Review and closeout

### Phase 23 — Pilot readiness and controlled enterprise deployment
**Planned branch:** `phase-23/pilot-readiness`
**HERM uplift:** Production readiness and institutional assurance
**Priority outcomes:** backup/restore automation, promotion discipline, migration rehearsal, security review, support playbooks, pilot go/no-go gate.
**Candidate batches:**
- 23A Backup/restore and environment promotion
- 23B Migration rehearsal from source SIS extracts
- 23C Security/dependency review and operational runbooks
- 23D Training artefacts and support playbooks
- 23E Pilot gate and sign-off pack

---

## Sequenced deferred items

| Item | Target phase |
|---|---|
| MFA enforcement in Keycloak | Phase 15 |
| Redis-backed identity cache | Phase 15 |
| KI-P12-001 repository-layer cleanup | Phase 14 |
| KI-P10b-001 finance sub-domains | Phase 18 / 18A |
| n8n workflow activation | Phase 20 |
| KI-P10b-002 MinIO presigned uploads | Phase 21 |
| KI-P10b-003 teaching-assignment model | Phase 21 |
| Multi-tenancy substrate | Post-Phase 23 unless commercially forced earlier |

---

## Completed phases summary

| Phase | Outcome | Status |
|---|---|---|
| Phase 8 | AMBER/GREEN workstreams closeout | Complete |
| Phase 9 | QA and production readiness baseline | Complete |
| Phase 10b | Review remediation | Complete |
| Phase 11 | System remediation | Complete |
| Phase 12 | Overnight remediation build | Complete |
| Phase 13b | Enterprise-readiness remediation pass | Complete |
