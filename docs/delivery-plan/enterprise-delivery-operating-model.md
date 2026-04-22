# SJMS 2.5 — Enterprise Delivery Operating Model

> **Status:** Canonical, effective 2026-04-22.
> **Applies to:** every phase from Phase 16 onward.
> **Owner:** Richard Knapp — Future Horizons Education.
> **Companion documents:** `docs/delivery-plan/enterprise-readiness-plan.md`, `docs/BUILD-QUEUE.md`, `docs/VERIFICATION-PROTOCOL.md`, `docs/KNOWN_ISSUES.md`, `CLAUDE.md`, `.claude/CLAUDE.md`.

---

## 1. Purpose

Treat the remaining work to pilot readiness as a formal enterprise-delivery programme, not ad hoc remediation. Every phase from Phase 16 through Phase 23 runs on the same batching, validation, review, and merge discipline defined here.

This document is the contract. Where it conflicts with any earlier informal practice, this document wins.

## 2. Non-negotiable programme principles

1. **Freeze horizontal sprawl.** No new broad domain expansion until the core vertical golden journeys (admissions-to-enrolment, assessment-to-award, finance, statutory compliance, integration activation) are rule-complete and evidenced.
2. **One active phase branch at a time from `main`.** Do not begin the next phase until the current phase is merged and the delivery control set is updated.
3. **Batch for reviewability.** Each phase is delivered as 3–8 cohesive batches. A batch is one domain slice, testable in isolation, reviewable by BugBot without a huge diff.
4. **Use the delivery control set as the source of truth.** `CLAUDE.md`, `docs/BUILD-QUEUE.md`, `docs/VERIFICATION-PROTOCOL.md`, `docs/KNOWN_ISSUES.md`, and `docs/delivery-plan/enterprise-readiness-plan.md` must be kept current and internally consistent. They must be updated together at every phase closeout.
5. **Automate quality discipline.** Validation, PR updates, BugBot review, and KI logging are not optional — they are part of the default delivery loop.
6. **Prefer evidence over claims.** Any statement about readiness, scale, coverage, workflows, tests, or roles must be grep-verifiable or command-verifiable against the tree.
7. **Business outcome in PR titles.** PR titles should describe the business outcome of the phase, not just the technical action.

## 3. Default phase delivery loop

For every phase, Claude Code must:

1. Read `docs/BUILD-QUEUE.md`, `docs/VERIFICATION-PROTOCOL.md`, `docs/KNOWN_ISSUES.md`, and the relevant review/remediation documents.
2. Create the phase branch from `main` using the phase naming convention in §6.
3. Break the phase into the batches listed for that phase in `docs/delivery-plan/enterprise-readiness-plan.md`.
4. Call `report_progress` before the first edit and after every meaningful batch.
5. Run the repository verification gates after each batch.
6. Open a PR when the phase is complete.
7. Trigger BugBot review on the PR.
8. Fix all HIGH findings before merge. Fix MEDIUM findings in the same PR when the work is under ~15 minutes; otherwise log them in `docs/KNOWN_ISSUES.md` with a target phase. Log LOW findings in `docs/KNOWN_ISSUES.md`.
9. Merge only when gates are green, BugBot HIGH is zero, and all deferred items are documented.
10. Update `docs/BUILD-QUEUE.md`, `CLAUDE.md`, and `docs/KNOWN_ISSUES.md` before declaring the phase complete.

## 4. Per-batch iteration loop

Within a phase, every batch follows the same rhythm:

1. **Plan the batch** — one cohesive domain slice.
2. **Call `report_progress`** with the checklist for that batch.
3. **Implement** in small, reviewable commits.
4. **Validate** with:
   - `cd server && npx tsc --noEmit`
   - `cd client && npx tsc --noEmit`
   - `npx prisma validate` and `npx prisma generate`
   - existing Vitest suite for the touched area
   - existing Playwright suite when the phase touches a live user journey
   - the grep-based policy gates in `docs/VERIFICATION-PROTOCOL.md`
5. **Push** via `report_progress`.
6. **Open or update the PR** with the current batch status.
7. **Request BugBot review** on the PR.
8. **Fix findings** per the BugBot triage policy in §7.
9. **Re-run validation** on the fixes.
10. **Merge** when all gates are green and BugBot HIGH is zero.
11. **Update** `docs/BUILD-QUEUE.md` and `docs/KNOWN_ISSUES.md`.

### Preferred order inside a batch

1. Domain rule implementation
2. Unit / integration tests for the new rules
3. API and UI wiring
4. Documentation, queue, and known-issue updates
5. Validation gate run
6. PR update and BugBot request

## 5. Phase gates (definition of done)

A phase is not complete until every one of the following is true:

- All scoped batches are complete.
- `docs/VERIFICATION-PROTOCOL.md` gates pass.
- `cd server && npx tsc --noEmit` passes.
- `cd client && npx tsc --noEmit` passes.
- `npx prisma validate` and `npx prisma generate` pass.
- Vitest passes for every touched area.
- Playwright passes for every live user journey touched.
- BugBot HIGH findings are zero.
- Deferred MEDIUM/LOW findings are logged in `docs/KNOWN_ISSUES.md` with a target phase.
- `CLAUDE.md`, `.claude/CLAUDE.md`, `docs/BUILD-QUEUE.md`, and `docs/KNOWN_ISSUES.md` reflect the new truth.
- The PR body uses the template in §8 and all checklist items are ticked or explicitly deferred.

## 6. Branch and PR conventions

### Branch naming

- `phase-16/admissions-to-enrolment`
- `phase-17/assessment-to-award`
- `phase-18/finance-readiness`
- `phase-19/statutory-compliance`
- `phase-20/integration-activation`
- `phase-21/portal-completion`
- `phase-22/analytics-operability`
- `phase-23/pilot-readiness`
- `fix/<ki-id>-<short-description>` for targeted KI work
- `chore/<short-description>` for tooling / hygiene-only work

### PR title discipline

PR titles describe the business outcome, not the technical action. Examples:

- ✅ `Phase 16: make admissions-to-enrolment operational with rule enforcement`
- ❌ `Phase 16: add validation to module-registrations.service.ts`

## 7. BugBot triage policy

| Severity | Response |
|---|---|
| HIGH | Fix before merge. Re-run validation. Re-request review. No exceptions. |
| MEDIUM | Fix in the same PR when under ~15 minutes. Otherwise log to `docs/KNOWN_ISSUES.md` with a target phase. |
| LOW | Log to `docs/KNOWN_ISSUES.md`. Do not block merge. |
| False positive | Record the rationale in the PR thread and proceed. |

If BugBot has not responded within 5 minutes of the review request, proceed with merge and note "BugBot review pending at merge time" in the PR.

## 8. PR body template

Every phase PR body must be a checklist in this shape:

```
## Phase objective
<one paragraph — the business outcome this phase delivers>

## Batches completed
- Batch NA — description (commits: <short-sha>, <short-sha>)
- Batch NB — description (commits: <short-sha>)
- …

## Acceptance gates
- [ ] `cd server && npx tsc --noEmit` → 0 errors
- [ ] `cd client && npx tsc --noEmit` → 0 errors
- [ ] `npx prisma validate` passes
- [ ] `npx prisma generate` passes
- [ ] Vitest passes for touched areas
- [ ] Playwright passes for touched journeys (or N/A)
- [ ] `docs/VERIFICATION-PROTOCOL.md` gates pass
- [ ] British English throughout
- [ ] No direct Prisma imports in services
- [ ] No hard deletes in student-facing services
- [ ] BugBot HIGH findings: 0 open
- [ ] GitGuardian: no secrets detected
- [ ] Control set updated (`CLAUDE.md`, `docs/BUILD-QUEUE.md`, `docs/KNOWN_ISSUES.md`)

## Known issues resolved
- KI-XXX-XXX — description

## Known issues deferred
- KI-XXX-XXX — description — deferral reason — target phase
```

## 9. HERM and competitor alignment rule

The target is **not** feature-for-feature parity with SITS, Banner, or Workday Student. The target is:

- **HERM-aligned completeness** in the core UK HE operational domains.
- **Competitive adequacy** in the domains institutions expect from an enterprise SIS:
  - recruitment and enrolment
  - assessment, progression, and awards
  - finance and fee control
  - statutory compliance
  - identity and security
  - integration and workflow orchestration
  - reporting and operational assurance

The strongest strategic rule:

> **No new horizontal domain expansion until the core vertical journeys are rule-complete and proven.**

## 10. Phase inventory and canonical batch breakdowns

### Phase 16 — Golden Journey 1: Admissions to Enrolment
**Branch:** `phase-16/admissions-to-enrolment`
**Objective:** make learner recruitment and enrolment operational, not just CRUD.
**HERM uplift:** Learner Recruitment & Admissions, Enrolment & Registration.

**Batches:**
- **16A** application lifecycle and state enforcement
- **16B** offer condition evaluation and admissions route handling
- **16C** applicant-to-student conversion and enrolment orchestration
- **16D** module-registration edge cases and finance handoff hooks
- **16E** applicant/admin portal completion for this journey
- **16F** evidence, tests, and closeout

**Exit criteria:**
- a registrar can move an applicant to active enrolment with rule enforcement
- no manual database work is needed for the core path

### Phase 17 — Golden Journey 2: Assessment to Progression to Award
**Branch:** `phase-17/assessment-to-award`
**Objective:** implement the academic rules engine.
**HERM uplift:** Assessment, Moderation, Progression, Awards.

**Batches:**
- **17A** marks aggregation and grade-boundary application
- **17B** moderation and ratification state machine
- **17C** module result generation
- **17D** progression decisioning and classification
- **17E** award/transcript outputs and portal reflection
- **17F** evidence, tests, and closeout

**Exit criteria:**
- upstream mark entry drives correct downstream module, progression, and award outcomes
- academic leads can complete the marks-to-board journey without workarounds

### Phase 18 — Golden Journey 3: Fees, Invoicing, Payments, and Finance Controls
**Branch:** `phase-18/finance-readiness`
**Objective:** turn finance into a controlled operational domain.
**HERM uplift:** Finance & Fees Management.

**Batches:**
- **18A** fee calculation engine
- **18B** invoice and charge generation on enrolment states
- **18C** payment allocation and account-balance logic
- **18D** payment plans and finance auditability improvements
- **18E** Sponsors / Bursaries / Refunds decision batch (or Phase 18a sub-phase cut-out)
- **18F** evidence and closeout

**Exit criteria:**
- a student can become financially active without manual ledger construction
- finance staff can manage balances and payments from the system of record

### Phase 19 — Statutory and Regulatory Execution
**Branch:** `phase-19/statutory-compliance`
**Objective:** make compliance domains operational, not nominal.
**HERM uplift:** Compliance, reporting, regulatory operations.

**Batches:**
- **19A** HESA Data Futures mapping layer
- **19B** HESA validation executor and export preparation
- **19C** UKVI attendance / compliance escalation workflow completion
- **19D** EC claims and appeals downstream actions / reporting
- **19E** compliance dashboards, evidence trails, and closeout

**Exit criteria:**
- the system can produce defensible regulatory outputs
- compliance teams can operate from the platform rather than spreadsheets

### Phase 20 — Integration Activation and Workflow Orchestration
**Branch:** `phase-20/integration-activation`
**Objective:** activate the event-driven integration architecture.
**HERM uplift:** External Integration, Student Communications, Compliance interoperability.

**Batches:**
- **20A** activate and observe the 15 n8n workflows
- **20B** harden workflow provisioning and environment promotion
- **20C** UCAS integration slice
- **20D** Student Loans Company integration slice
- **20E** failure handling, replay discipline, and closeout

**Exit criteria:**
- workflows are active, observable, and safe
- at least the core external ecosystem for a UK HE pilot is functioning

### Phase 21 — Portal Completion, Academic Scoping, and UX/Accessibility
**Branch:** `phase-21/portal-completion`
**Objective:** close the highest-value stakeholder-facing gaps.
**HERM uplift:** Student Self-Service, Teaching support, accessibility.

**Batches:**
- **21A** teaching-assignment model and academic scoping (KI-P10b-003)
- **21B** MinIO presigned upload flow and document completion (KI-P10b-002)
- **21C** replace high-value `ComingSoon` pages
- **21D** applicant / student / staff notification surface improvements
- **21E** WCAG 2.1 AA remediation and evidence
- **21F** closeout

**Exit criteria:**
- no high-priority portal journeys remain stubbed
- academic staff see only authorised scope
- document upload is real end-to-end

### Phase 22 — Analytics, Reporting, BI, and Operational Observability
**Branch:** `phase-22/analytics-operability`
**Objective:** add the management, governance, and assurance layer expected of enterprise systems.
**HERM uplift:** Analytics, BI & Reporting.

**Batches:**
- **22A** role-specific dashboard baseline
- **22B** domain reporting slices across admissions, assessment, finance, compliance, support
- **22C** richer operational telemetry, error trends, and alerting
- **22D** data export strategy for institutional BI tools
- **22E** runbooks linked to metrics/logs, and closeout

**Exit criteria:**
- the system supports not just transactions but institutional oversight

### Phase 23 — Pilot Readiness and Controlled Enterprise Deployment
**Branch:** `phase-23/pilot-readiness`
**Objective:** convert the system from engineering candidate to deployable enterprise pilot.
**HERM uplift:** Production readiness and institutional assurance.

**Batches:**
- **23A** backup/restore automation and environment promotion discipline
- **23B** migration rehearsal from source SIS extracts
- **23C** security review and dependency audit
- **23D** support playbooks, training artefacts, and defect triage model
- **23E** pilot go/no-go gate and sign-off pack

**Exit criteria:**
- all critical golden journeys are live and evidenced
- no open HIGH KIs
- security, restore, and operational drills have passed
- human sign-off is obtained for pilot deployment

## 11. Recommended execution order

Phases 16 → 17 → 18 → 19 → 20 → 21 → 22 → 23, strictly sequentially. This order converts SJMS 2.5 from a strong enterprise scaffold into a functioning enterprise product without repeating the historical pattern of broad CRUD expansion before the core business rules are finished.

## 12. Expected programme outcome

If this operating model is followed for every phase, SJMS 2.5 will progress from:

- a structurally strong but rules-light platform

to:

- a pilot-ready, HERM-aligned, enterprise-capable UK HE system for a single institution

with evidence, review history, quality gates, and merge discipline built incrementally at every phase rather than deferred to the end of the programme.
