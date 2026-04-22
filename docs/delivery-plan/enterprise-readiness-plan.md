# SJMS 2.5 — Enterprise Readiness Plan

> **Purpose:** Direct Claude Code through the next delivery programme in controlled phases.
> **Baseline:** Post-Phase 15A on `main`.
> **Programme goal:** Move SJMS 2.5 from a strong enterprise scaffold to a pilot-ready UK HE student records system aligned with HERM and credible against the core operating expectations set by SITS, Banner, and Workday Student.
> **Operating model:** Canonical rules for how every phase is delivered live in `docs/delivery-plan/enterprise-delivery-operating-model.md`. This plan names the work; the operating model governs how the work is executed.

---

## 1. Programme principles

1. **Freeze horizontal sprawl.** No new broad domain expansion until the core vertical journeys are rule-complete and evidenced.
2. **Deliver one active phase at a time.** Each phase must be merged before the next begins.
3. **Batch for reviewability.** Each phase is delivered as 3–8 cohesive batches with clear acceptance checks.
4. **Use the delivery control set.** `CLAUDE.md`, `docs/BUILD-QUEUE.md`, `docs/KNOWN_ISSUES.md`, and `docs/VERIFICATION-PROTOCOL.md` are the canonical control documents.
5. **Automate quality discipline.** Validation, PR updates, BugBot review, and KI logging are part of the default delivery loop.
6. **Prefer evidence over claims.** Any statement about readiness, scale, coverage, workflows, tests, or roles must be grep- or command-verifiable.

## 2. Default phase delivery loop

Claude Code should use the same loop for every phase and every batch:

1. Read the delivery control set plus any phase-specific review/remediation docs.
2. Confirm the active phase branch naming and base branch.
3. Create a batch checklist and call `report_progress` before the first edit.
4. Implement the smallest reviewable slice of work.
5. Run the verification protocol and any affected domain tests.
6. Call `report_progress` to commit and push the batch.
7. Update the PR description with completed and pending checklist items.
8. Request BugBot review.
9. Fix HIGH findings immediately; fix MEDIUM findings in the same PR when quick, otherwise log them in `docs/KNOWN_ISSUES.md`; log LOW findings when not worth same-batch interruption.
10. Re-run validation and only then mark the batch complete.
11. At phase end, update the control docs, leave the branch merge-ready, and wait for the repository merge step.

## 3. Phase gates

A phase is not complete until all of the following are true:

- All scoped batches are complete.
- `docs/VERIFICATION-PROTOCOL.md` gates pass.
- `cd server && npx tsc --noEmit` passes.
- `cd client && npx tsc --noEmit` passes.
- `DATABASE_URL=... npx prisma validate --schema=prisma/schema.prisma` passes.
- `npx prisma generate --schema=prisma/schema.prisma` passes.
- Existing Vitest suites pass for touched areas.
- Existing Playwright suites pass when the phase changes live user journeys.
- BugBot HIGH findings are zero.
- Deferred MEDIUM/LOW findings are logged.
- `CLAUDE.md`, `docs/BUILD-QUEUE.md`, and `docs/KNOWN_ISSUES.md` reflect the new truth.

## 4. Branch and PR conventions

### Branch naming

- `phase-14/governance-baseline`
- `phase-15/security-hardening`
- `phase-16/admissions-to-enrolment`
- `phase-17/assessment-to-award`
- `phase-18/finance-readiness`
- `phase-19/statutory-compliance`
- `phase-20/integration-activation`
- `phase-21/portal-completion`
- `phase-22/analytics-operability`
- `phase-23/pilot-readiness`
- `fix/<ki-id>-<short-description>` for targeted KI work inside an active phase

### PR expectations

Every PR should include:

- phase objective
- batches completed
- acceptance gates
- known issues resolved
- known issues deferred
- BugBot review request and resolution notes

### BugBot triage policy

| Severity | Response |
|---|---|
| HIGH | Fix before merge. Re-run validation and re-request review. |
| MEDIUM | Fix in the same PR if quick; otherwise log to `docs/KNOWN_ISSUES.md` with a target phase. |
| LOW | Note in the PR or log to `docs/KNOWN_ISSUES.md`; do not block merge by default. |
| False positive | Record the rationale in the PR and proceed. |

## 5. HERM and competitor alignment rule

The target is not feature-for-feature parity with SITS, Banner, or Workday Student. The target is:

- **HERM-aligned completeness** in the core UK HE operational domains.
- **Competitive adequacy** in the domains institutions expect from an enterprise SIS:
  - recruitment and enrolment
  - assessment, progression, and awards
  - finance and fee control
  - statutory compliance
  - identity and security
  - integration and workflow orchestration
  - reporting and operational assurance

## 6. Phased roadmap

### Phase 14 — Governance, Truth Baseline, and Release Discipline
**Objective:** establish a trustworthy operating baseline.

**Batches:**
- 14A Delivery control set refresh
- 14B Enterprise-readiness plan publication
- 14C CI gate uplift
- 14D PR/review automation hygiene
- 14E Low-effort follow-on cleanup
- 14F Closeout

**Key deliverables:**
- current-state build queue aligned to post-Phase 13b reality
- explicit phase checklist template for Claude Code
- documented BugBot review protocol
- CI workflow that publishes clearer quality evidence
- formal sequencing for open deferred items

**Exit criteria:**
- no HIGH documentation/release-process drift remains
- control docs are internally consistent
- `main` keeps a mandatory CI gate

### Phase 15 — Security and Platform Hardening Blockers
**Objective:** close pilot-blocking platform/security gaps.

**Batches:**
- 15A MFA enforcement and realm policy hardening
- 15B Redis-backed identity cache
- 15C Auth fallback and environment guard review
- 15D CSP/CORS/Swagger tightening plus dependency/security scanning
- 15E Finance retention and cascade safeguard review
- 15F Closeout

**Exit criteria:**
- no open HIGH security issues
- no single-instance-only identity assumptions remain
- finance retention model is safe for live institutional data

### Phase 16 — Golden Journey 1: Admissions to Enrolment
**Objective:** make learner recruitment and enrolment operational, not just CRUD.

**Batches:**
- 16A application lifecycle and state enforcement
- 16B offer condition evaluation and admissions route handling
- 16C applicant-to-student conversion and enrolment orchestration
- 16D module-registration edge cases and finance handoff hooks
- 16E applicant/admin portal completion for this journey
- 16F evidence, tests, and closeout

**Exit criteria:**
- a registrar can move an applicant to active enrolment with rule enforcement
- no manual database work is needed for the core path

### Phase 17 — Golden Journey 2: Assessment to Progression to Award
**Objective:** implement the academic rules engine.

**Batches:**
- 17A marks aggregation and grade-boundary application
- 17B moderation and ratification state machine
- 17C module result generation
- 17D progression decisioning and classification
- 17E award/transcript outputs and portal reflection
- 17F evidence, tests, and closeout

**Exit criteria:**
- upstream mark entry drives correct downstream module, progression, and award outcomes
- academic leads can complete the marks-to-board journey without workarounds

### Phase 18 — Golden Journey 3: Fees, Invoicing, Payments, and Finance Controls
**Objective:** turn finance into a controlled operational domain.

**Batches:**
- 18A fee calculation engine
- 18B invoice and charge generation on enrolment states
- 18C payment allocation and account-balance logic
- 18D payment plans and finance auditability improvements
- 18E Sponsors/Bursaries/Refunds decision batch or Phase 18a cut-out
- 18F evidence and closeout

**Exit criteria:**
- a student can become financially active without manual ledger construction
- finance staff can manage balances and payments from the system of record

### Phase 19 — Statutory and Regulatory Execution
**Objective:** make compliance domains operational.

**Batches:**
- 19A HESA Data Futures mapping layer
- 19B HESA validation executor and export preparation
- 19C UKVI attendance/compliance escalation workflow completion
- 19D EC claims and appeals downstream actions/reporting
- 19E compliance dashboards, evidence trails, and closeout

**Exit criteria:**
- the system can produce defensible regulatory outputs
- compliance teams can operate from the platform rather than spreadsheets

### Phase 20 — Integration Activation and Workflow Orchestration
**Objective:** activate the event-driven integration architecture.

**Batches:**
- 20A activate and observe the 15 n8n workflows
- 20B harden workflow provisioning and environment promotion
- 20C UCAS integration slice
- 20D Student Loans Company integration slice
- 20E failure handling, replay discipline, and closeout

**Exit criteria:**
- workflows are active, observable, and safe
- at least the core external ecosystem for a pilot is functioning

### Phase 21 — Portal Completion, Academic Scoping, and UX/Accessibility
**Objective:** close the highest-value stakeholder-facing gaps.

**Batches:**
- 21A teaching-assignment model and academic scoping
- 21B MinIO presigned upload flow and document completion
- 21C replace high-value `ComingSoon` pages
- 21D communications UX improvements
- 21E WCAG 2.1 AA remediation and evidence
- 21F closeout

**Exit criteria:**
- no high-priority portal journeys remain stubbed
- academic staff see only authorised scope
- document upload is real end-to-end

### Phase 22 — Analytics, Reporting, BI, and Operational Observability
**Objective:** add management and assurance capability.

**Batches:**
- 22A role-specific dashboard baseline
- 22B domain reporting slices
- 22C richer telemetry, error trends, and alerting
- 22D data export strategy for institutional BI
- 22E runbooks linked to metrics/logs and closeout

**Exit criteria:**
- the system supports institutional oversight, not only transactions

### Phase 23 — Pilot Readiness and Controlled Enterprise Deployment
**Objective:** make the system deployable for a controlled institutional pilot.

**Batches:**
- 23A backup/restore automation and promotion discipline
- 23B migration rehearsal from source SIS extracts
- 23C security review and dependency audit
- 23D support playbooks and training artefacts
- 23E pilot go/no-go gate and sign-off pack

**Exit criteria:**
- all critical golden journeys are live and evidenced
- no open HIGH KIs remain
- security, restore, and operational drills pass
- human sign-off is obtained for the pilot

## 7. Sequenced deferred items

| Item | Delivery target |
|---|---|
| MFA enforcement | Phase 15 |
| Redis-backed identity cache | Phase 15 |
| Finance sub-domains (Sponsors, Bursaries, Refunds) | Phase 18 / 18A |
| n8n workflow activation | Phase 20 |
| MinIO presigned uploads | Phase 21 |
| Teaching-assignment model | Phase 21 |
| Multi-tenancy substrate | After Phase 23 unless a commercial requirement pulls it forward |

## 8. Expected outcome

If this roadmap is followed in order, SJMS 2.5 should move from a strong but rules-light platform to a pilot-ready, HERM-aligned, enterprise-capable UK HE system for a single institution, with evidence built incrementally through CI, tests, PR history, and BugBot-reviewed batch delivery.
