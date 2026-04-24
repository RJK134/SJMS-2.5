# SJMS 2.5 — Claude Code Master Context

> **Owner:** Richard Knapp · Future Horizons Education (FHE)
> **Last updated:** 2026-04-24
> **Current delivery state:** Phase 15A merged (PR #55, commit `953ed77`). ESLint toolchain bootstrap (KI-P14-001 closeout) merged (PR #88, commit `67df18f`). Governance batch merged as PR #92 (commit `75e43c6`, 2026-04-22). **Phase 16 — Admissions to Enrolment continues. Batches 16A + 16B merged via PR #96 (commit `cdaea2f`). Fail-soft follow-up for 16B on `fix/p16-offer-promotion-fail-soft` → draft PR #98. Batch 16C (applicant-to-student conversion and enrolment orchestration on FIRM) is in flight on `phase-16/16c-applicant-conversion`.** Phase 15B (auth/MFA/identity-cache/retention) remains deferred behind a STOP-gate and a design doc.
> **Operating model:** `docs/delivery-plan/enterprise-delivery-operating-model.md` — canonical for every phase from 16 onward.

---

## Project position

SJMS 2.5 combines the polished SJMS 2.4 portal experience with the enterprise backend foundations built in SJMS 4.0. The platform baseline is now strong: 197 Prisma models, 44 API routers, 36 roles, 15 version-controlled n8n workflows, Redis-backed infrastructure, Keycloak OIDC, MinIO, and Prometheus metrics.

The remaining gap is **enterprise readiness through business-rule depth and operational discipline**, not broad CRUD expansion.

## Delivery control set

Read these before every phase:

- `/home/runner/work/SJMS-2.5/SJMS-2.5/CLAUDE.md`
- `/home/runner/work/SJMS-2.5/SJMS-2.5/.claude/CLAUDE.md`
- `/home/runner/work/SJMS-2.5/SJMS-2.5/docs/BUILD-QUEUE.md`
- `/home/runner/work/SJMS-2.5/SJMS-2.5/docs/VERIFICATION-PROTOCOL.md`
- `/home/runner/work/SJMS-2.5/SJMS-2.5/docs/KNOWN_ISSUES.md`
- `/home/runner/work/SJMS-2.5/SJMS-2.5/docs/delivery-plan/enterprise-readiness-plan.md`
- `/home/runner/work/SJMS-2.5/SJMS-2.5/docs/delivery-plan/enterprise-delivery-operating-model.md` — canonical operating model for Phases 16–23
- relevant review/remediation docs under `/home/runner/work/SJMS-2.5/SJMS-2.5/docs/review/` and `/home/runner/work/SJMS-2.5/SJMS-2.5/docs/remediation/`

## Non-negotiable delivery rules

1. British English throughout.
2. Prisma-backed persistence only — no MemStorage or in-memory business stores.
3. Audit every mutation.
4. Emit a canonical webhook event for every mutation.
5. Use one active phase branch at a time from `main`.
6. Use `report_progress` before the first edit and after each meaningful batch.
7. Run the verification protocol after each batch.
8. Request BugBot review on every phase PR and fix HIGH findings before merge.
9. Update the control set before declaring a phase complete.
10. Do not expand horizontally into new domains until the core vertical journeys are rule-complete.

## Current roadmap

| Phase | Branch | Focus |
|---|---|---|
| 14 | `phase-14/governance-baseline` | Governance, truth baseline, release discipline |
| 15 | `phase-15/security-hardening` | Security and platform blockers |
| 16 | `phase-16/admissions-to-enrolment` | Admissions to enrolment golden journey |
| 17 | `phase-17/assessment-to-award` | Assessment to progression/award golden journey |
| 18 | `phase-18/finance-readiness` | Fees, invoicing, payments, finance controls |
| 19 | `phase-19/statutory-compliance` | HESA, UKVI, EC/appeals compliance execution |
| 20 | `phase-20/integration-activation` | n8n activation and external connectors |
| 21 | `phase-21/portal-completion` | Portal completion, scoping, accessibility |
| 22 | `phase-22/analytics-operability` | Analytics, BI, observability |
| 23 | `phase-23/pilot-readiness` | Pilot readiness and controlled deployment |

## Immediate open items already sequenced

- MFA enforcement → Phase 15B (STOP-gated)
- Redis-backed identity cache → Phase 15B (STOP-gated)
- ESLint toolchain bootstrap → MERGED (PR #88, commit `67df18f`); KI-P14-001 closed
- ESLint baseline triage and ratchet to blocking → KI-P15-002 (Phase 15B or dedicated `fix/eslint-baseline` branch)
- Server coverage threshold ratchet → Phase 17 (KI-P14-002)
- npm audit baseline triage → Phase 15B or dedicated `fix/` branch (KI-P15-001)
- KI-P12-001 — enrolment cascade repository bypass → Phase 16 (folded into module-registration focus)
- Finance sub-domains (Sponsors, Bursaries, Refunds) → Phase 18
- n8n workflow activation → Phase 20
- MinIO presigned uploads → Phase 21
- Teaching-assignment model → Phase 21
- Multi-tenancy substrate → after Phase 23 unless pulled forward by commercial need

## Reference status

- Server typecheck: passing
- Client typecheck: passing
- Prisma validate/generate: passing
- Server Vitest suite: passing
- Coverage enforcement: 0/0/0 floor (monitor-only) in `server/vitest.config.ts`; ratchet sequenced to Phase 17 (KI-P14-002)
- Linting: ESLint v9 flat config live in both workspaces (PR #88 merged); `Lint (advisory)` CI job runs with `continue-on-error: true`; baseline triage and ratchet-to-blocking tracked as KI-P15-002 (Gate 12 in `docs/VERIFICATION-PROTOCOL.md`)
- Repository hygiene: no gitlinks, no tracked `.claude/worktrees/`, no stray `.claude/*.txt` (Gate 9 in `docs/VERIFICATION-PROTOCOL.md`)
- Security observability: CodeQL, npm audit, Dependabot, SECURITY.md, CODEOWNERS all present (Gate 11); npm audit baseline not yet triaged (KI-P15-001)

## Strategic rule

SJMS 2.5 should aim for **HERM-aligned completeness in a single-institution UK HE deployment**, not literal feature-for-feature parity with SITS, Banner, or Workday. The winning path is vertical completion of golden journeys, not more surface area.
