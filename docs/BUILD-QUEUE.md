# SJMS 2.5 — Build Queue

> **Current Phase:** 14 — Governance, Truth Baseline, and Release Discipline
> **Planned branch:** `phase-14/governance-baseline`
> **Base:** `main` (post-Phase 13b remediation baseline)
> **Started:** 2026-04-21
> **Programme reference:** `docs/delivery-plan/enterprise-readiness-plan.md`

---

## Enterprise-delivery operating model (applies to every phase)

1. Read the delivery control set before work starts: `CLAUDE.md`, `docs/BUILD-QUEUE.md`, `docs/VERIFICATION-PROTOCOL.md`, `docs/KNOWN_ISSUES.md`, and any phase-specific remediation or review documents.
2. Work from one active phase branch at a time from `main`.
3. Break each phase into 3–8 reviewable batches.
4. Call `report_progress` before the first edit and after every meaningful batch.
5. Run the verification protocol after each batch, plus the existing unit and E2E suites when the touched scope warrants them.
6. Push changes through `report_progress`, open or update the PR, request BugBot review, fix HIGH findings, then re-run validation.
7. Do not begin the next phase until the current phase is merged and the control set is updated.

## Validation baseline at Phase 14 start

| Check | Result | Notes |
|---|---|---|
| `cd server && npx tsc --noEmit` | ✅ pass | 0 errors |
| `cd client && npx tsc --noEmit` | ✅ pass | 0 errors |
| `DATABASE_URL=... npx prisma validate --schema=prisma/schema.prisma` | ✅ pass | Schema valid |
| `npx prisma generate --schema=prisma/schema.prisma` | ✅ pass | Client generated |
| `npm run test --workspace=server` | ✅ pass | 136 tests passing |
| `npm run lint` | ⚠️ blocked | `eslint` command missing — tracked as KI-P14-001 |

---

## Phase 14 — Governance, Truth Baseline, and Release Discipline

**Objective:** Establish a trustworthy delivery baseline before any new product expansion.

### Batch 14A — Delivery control set refresh
**Status:** CURRENT
**Scope:**
- Reconcile `CLAUDE.md`, `.claude/CLAUDE.md`, `docs/BUILD-QUEUE.md`, and `docs/KNOWN_ISSUES.md` with the post-Phase 13b reality.
- Replace stale phase summaries with the enterprise-readiness roadmap.
- Record the current verification baseline and known control gaps.

### Batch 14B — Enterprise-readiness plan publication
**Status:** CURRENT
**Scope:**
- Publish the phase-by-phase plan for Claude Code delivery.
- Define the operating model, phase gates, BugBot loop, branch naming, and PR conventions.
- Sequence open backlog items to the target phase where they should be addressed.

### Batch 14C — CI gate uplift
**Status:** CURRENT
**Scope:**
- Keep PR gating mandatory on `main`.
- Extend CI beyond the existing typecheck/test baseline with server coverage publication and clearer quality-job structure.
- Log the lint-tooling gap explicitly rather than pretending lint is enforced.

### Batch 14D — PR/review automation hygiene
**Status:** PENDING
**Scope:**
- Update the PR template to the current phase-based delivery model.
- Standardise reviewer instructions around HIGH/MEDIUM/LOW BugBot handling.
- Ensure every phase PR carries batches completed, gates, and deferred KIs.

### Batch 14E — Low-effort follow-on cleanup
**Status:** PENDING
**Scope:**
- Close doc/process drift identified in the Phase 13 comparative review.
- Triage KI-P12-001 and any documentation-only inaccuracies safe to resolve without widening scope.
- Either implement or formally defer the lint-tooling bootstrap tracked under KI-P14-001.

### Batch 14F — Phase closeout
**Status:** PENDING
**Acceptance:**
- Control docs internally consistent.
- CI workflow updated and green.
- BugBot HIGH findings resolved.
- Remaining AMBER/LOW items logged in `docs/KNOWN_ISSUES.md`.
- Next phase branch ready: `phase-15/security-hardening`.

---

## Forward phase roadmap

### Phase 15 — Security and platform hardening blockers
**Planned branch:** `phase-15/security-hardening`
**HERM uplift:** Identity & Access Management, operational control
**Priority outcomes:** MFA enforcement, Redis-backed identity cache, auth fallback review, CSP/CORS/Swagger tightening, dependency/security scanning, finance retention safeguards.
**Candidate batches:**
- 15A MFA and realm policy hardening
- 15B Identity cache migration to Redis
- 15C Auth fallback and environment guard review
- 15D Security scanning and finance retention safeguards
- 15E Phase closeout and review findings remediation

### Phase 16 — Golden Journey 1: Admissions to Enrolment
**Planned branch:** `phase-16/admissions-to-enrolment`
**HERM uplift:** Learner Recruitment & Admissions, Enrolment & Registration
**Priority outcomes:** application lifecycle, offer condition logic, route handling, enrolment progression rules, finance handoff hooks, applicant/admin portal completion for the journey.
**Candidate batches:**
- 16A Application and offer lifecycle rules
- 16B Enrolment progression and conversion orchestration
- 16C Module-registration edge cases and fee-status hooks
- 16D Applicant/admin portal completion
- 16E Tests, walkthrough evidence, and closeout

### Phase 17 — Golden Journey 2: Assessment to Progression to Award
**Planned branch:** `phase-17/assessment-to-award`
**HERM uplift:** Assessment, Moderation, Progression, Awards
**Priority outcomes:** marks pipeline rules, moderation/ratification states, module result generation, progression decisioning, award/classification logic, transcript-ready outputs.
**Candidate batches:**
- 17A Marks aggregation and grade-boundary application
- 17B Moderation and ratification state machine
- 17C Progression and classification engine
- 17D Award/transcript outputs and portal wiring
- 17E Tests, BugBot remediation, and closeout

### Phase 18 — Golden Journey 3: Fees, invoicing, payments, and finance controls
**Planned branch:** `phase-18/finance-readiness`
**HERM uplift:** Finance & Fees Management
**Priority outcomes:** fee calculation engine, automated invoices/charges, payment allocation, account balances, finance auditability, staged finance sub-domains.
**Candidate batches:**
- 18A Fee assessment and invoice generation
- 18B Payment allocation and account balance rules
- 18C Finance UI completion and event emissions
- 18D Sponsors/Bursaries/Refunds decision batch
- 18E Reconciliation evidence and closeout

### Phase 19 — Statutory and regulatory execution
**Planned branch:** `phase-19/statutory-compliance`
**HERM uplift:** Compliance, reporting, regulatory operations
**Priority outcomes:** HESA mapping and validation, UKVI escalation workflows, EC/appeals downstream actions, regulatory audit outputs.
**Candidate batches:**
- 19A HESA mapping layer
- 19B HESA validation and export preparation
- 19C UKVI monitoring and escalation automation
- 19D EC/appeals downstream actioning and dashboards
- 19E Compliance sign-off and closeout

### Phase 20 — Integration activation and workflow orchestration
**Planned branch:** `phase-20/integration-activation`
**HERM uplift:** External Integration, Student Communications
**Priority outcomes:** activate the 15 n8n workflows, improve provisioning/promotion, deliver the first live external connectors (UCAS and SLC first), and add monitoring/replay discipline.
**Candidate batches:**
- 20A Workflow activation and observability
- 20B Provisioning/promotion hardening
- 20C UCAS integration slice
- 20D SLC integration slice
- 20E Failure handling, replay, and closeout

### Phase 21 — Portal completion, academic scoping, and UX/accessibility
**Planned branch:** `phase-21/portal-completion`
**HERM uplift:** Student Self-Service, Teaching support, accessibility
**Priority outcomes:** remove priority `ComingSoon` pages, add teaching-assignment scoping, implement presigned uploads, improve communications UX, evidence WCAG 2.1 AA.
**Candidate batches:**
- 21A Academic scoping model and guards
- 21B Document upload completion (MinIO presigned uploads)
- 21C Priority portal page completion
- 21D Accessibility remediation and evidence
- 21E Closeout and deferred-item review

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
