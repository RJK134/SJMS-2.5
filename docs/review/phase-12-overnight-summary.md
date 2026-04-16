# Phase 12 — Overnight Remediation Build — Handover Summary

> **Date:** 2026-04-16
> **Operator:** Claude (autonomous, Opus 4.7)
> **Base commit at start:** 422aa46 (Phase 11 merged)
> **Final commit on main:** aa00ccf (Phase 12a merged)

## Outcome

Three PRs merged, two PRs pending review:

| PR | Branch | Status | What it delivers |
|----|--------|--------|------------------|
| #41 | `claude/sjms-phase-9-handover-1DJj6` | **MERGED** at 21:09 UTC | 3 BugBot findings fixed + P0 review docs + maxMark validation merge |
| #42 | `phase-12a/api-group-decomposition` | **MERGED** at 21:14 UTC | 9 API group barrels (44 modules grouped) |
| #43 | `phase-12b/frontend-api-services` | **OPEN** — awaiting BugBot/merge | 9 typed client-side domain service modules |
| #44 | `phase-12c/p0-priority-remediation` | **OPEN** — awaiting BugBot/merge | P0 action audit + CLAUDE.md Phase 12 summary |

## Commits on merged PRs (squashed)

- `0ba8ad5` — Phase 12: PR #41 remediation — BugBot fixes, review docs, P0 data integrity (#41)
- `aa00ccf` — Phase 12a: API module decomposition — 44 routers → 9 grouped domain barrels (#42)

## BugBot findings resolved on PR #41

| # | Severity | Finding | Fix |
|---|----------|---------|-----|
| 1 | HIGH | Prerequisite check ignores pass/fail | Dual check: `aggregateMark >= passMark` OR `grade IN passingGrades`, pass mark from SystemSetting keyed on RQF level |
| 2 | MEDIUM | Hardcoded 120 credit cap | Mode-aware cap via `ModeOfStudy` enum + SystemSetting override |
| 3 | LOW | Dead `calculateWeightedMark` | Removed; TODO reference to P1 aggregation endpoint |
| 4 | MEDIUM | Auto-grade missing on create() | Mirrored `resolveGradeFromMark` block from update() to create() |
| 5 | LOW | Enrolment cascade bypasses repo | Logged as KI-P12-001 (non-blocking) |

## New utilities

- `server/src/utils/pass-marks.ts` — `getPassMark(programmeLevel)` + `PASSING_GRADES` set
- `server/src/utils/credit-limits.ts` — `getMaxCreditsForMode(mode)` keyed on ModeOfStudy

## New SystemSetting seeds (11 total)

- `assessment.pass_mark.level_3` through `level_8` (40 UG, 50 PG)
- `enrolment.max_credits.full_time`, `part_time`, `sandwich`, `distance`, `block_release`

## New API surface (Phase 12a)

9 domain groups under `/api/v1/{group}` each exposing a `/health` endpoint:

| Group | Modules |
|-------|---------|
| identity | 3 |
| admissions | 6 |
| enrolment | 3 |
| curriculum | 9 |
| assessment | 4 |
| progression | 3 |
| student-support | 6 |
| compliance | 4 |
| platform | 6 |

**Flat routes preserved**. Grouped routes are additive and route to the same controllers.

## New client service layer (Phase 12b, pending)

- `client/src/services/types.ts` — ListParams, ListResponse, HealthResponse
- `client/src/services/_factory.ts` — `crud<T>(entity)` + `groupHealth(group)`
- 9 domain service files matching the 9 server groups
- `client/src/services/index.ts` — namespaced re-exports
- 44 entity CRUD sets + 9 health checks, zero `any` types

## Verification

All gates pass on `main @ aa00ccf`:

- `npx tsc --noEmit` (server) → 0 errors
- `npx tsc --noEmit` (client) → 0 errors
- `npx vitest run` → 120/120 tests pass
- No hard deletes introduced
- No new direct `prisma` imports in services (2 pre-existing exceptions unchanged)
- British English throughout
- GitGuardian: no secrets detected on any PR

## P0 priority action audit (from docs/review/phase-10b-now/07-priority-actions.md)

| # | Action | Status |
|---|--------|--------|
| 1-3 | Academic portal wiring (MyMarksEntry, MyModeration, MyExamBoards) | CLOSED Phase 10b |
| 4 | rawMark <= maxMark validation | CLOSED PR #41 (validateMarkBounds) |
| 5 | Keycloak schema bootstrap | VERIFIED existing `docker/postgres/01-create-schemas.sql` |
| 6-8 | Student portal wiring (RaiseTicket, MyTickets, StudentProfile) | CLOSED Phase 10b |
| 9 | Finance sub-pages honesty | VERIFIED Sponsors/Refunds are ComingSoon; Invoicing live |
| 10 | Document upload no-op | VERIFIED informative email fallback present |
| 11 | Update CLAUDE.md | DONE in PR #44 |

## Known Issues added

- **KI-P12-001** (LOW, OPEN) — Enrolment cascade bypasses module registration repository. Flagged by BugBot as non-blocking. Resolution: Phase 13 repository-layer cleanup.

## What is NEXT

P1 items from `docs/review/phase-10b-now/07-priority-actions.md`:

1. Wire remaining academic pages (MyTimetable, MyAttendance, MyTutees, MyProfile) — 4h
2. Build student MyECClaims basic submission form — 3h (note: some wiring done in Phase 11)
3. Trigger one n8n workflow end-to-end and verify execution — 2h
4. Add integration tests for marks pipeline (create → mark → moderate → ratify) — 4h
5. Implement `POST /v1/marks/aggregate` endpoint (TODO in grade-boundaries.ts)
6. Complete MFA rollout (Batches A2-A5) — 6h

## STOP CONDITIONS hit

None. Run completed autonomously. Two conflict-resolution moments during rebase of PR #41 onto main were resolved conservatively (main-favoured for CLAUDE.md content; union for marks.service.ts and its test).

## Timing

| Phase | Estimated | Actual |
|-------|-----------|--------|
| 0 — setup | 15 min | ~25 min (rebase conflict resolution) |
| 1 — HIGH fix | 2 h | ~20 min |
| 2 — MEDIUM fix | 1.5 h | ~15 min |
| 3 — LOW fix | 15 min | ~10 min |
| 4 — verify/push #41 | 45 min | ~15 min |
| 5 — merge #41 | 15 min | ~10 min (plus extra MEDIUM BugBot fix) |
| 6 — Phase 12a | 3 h | ~30 min |
| 7 — Phase 12b | 4 h | ~25 min |
| 8 — Phase 12c | 4 h | ~15 min (most items already closed) |
| 9 — handover | 30 min | ~10 min |

Total wall-clock: ~2 h 35 min.

## Files Changed Summary

### PR #41 (merged)
- 8 files changed in P0 commits
- 4 new files in remediation commits: pass-marks.ts, credit-limits.ts, module-registrations.service.test.ts, KI-P12-001 entry
- 3 existing files modified: module-registrations.service.ts, marks.service.ts, grade-boundaries.ts

### PR #42 (merged)
- 9 new `group-index.ts` files
- 1 modified: `server/src/api/index.ts` (additive mounts only)
- 1 new: `docs/api-groups.md`

### PR #43 (open)
- 12 new files under `client/src/services/` (types, factory, 9 services, index)

### PR #44 (open)
- 1 modified: `CLAUDE.md` (Phase 12 section)
