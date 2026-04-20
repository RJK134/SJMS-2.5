# Phase 13 — Repository Truth Table

> **Purpose:** Stabilise the current on-disk reality of SJMS 2.5 before any
> further planning or remediation work. Every row below is grounded in a
> file, a path, or a counted artefact present in the repository at the time
> of this pass.
>
> **Date of pass:** 2026-04-19
> **Branch:** `claude/phase-13-truth-table-TlbZb`
> **Scope:** read-only inspection of `server/`, `prisma/`, `docs/`

## Truth Table

| Claim | Current status | Evidence |
|-------|----------------|----------|
| `pass-marks.ts` exists | **Present** | File at `server/src/utils/pass-marks.ts` (located via Glob). Imported by `server/src/api/module-registrations/module-registrations.service.ts:8` as `import { getPassMark, PASSING_GRADES } from '../../utils/pass-marks'`. |
| `credit-limits.ts` exists | **Present** | File at `server/src/utils/credit-limits.ts` (located via Glob). Imported by `server/src/api/module-registrations/module-registrations.service.ts:9` as `import { getMaxCreditsForMode } from '../../utils/credit-limits'`. |
| `grade-boundaries.ts` exists | **Present** | File at `server/src/utils/grade-boundaries.ts` (located via Glob). 30 lines. Exports `resolveGradeFromMark(assessmentId, mark)` which queries `prisma.gradeBoundary` ordered by `lowerBound desc` and matches `numericMark` against `[lowerBound, upperBound]`. Contains a `TODO [P1]` comment for a marks aggregation endpoint. |
| `module-registrations.service.ts` contains prerequisite enforcement | **Present** | `server/src/api/module-registrations/module-registrations.service.ts:41-83` defines `validatePrerequisites(moduleId, enrolmentId)`. It fetches mandatory `modulePrerequisite` rows, resolves a pass mark via `getPassMark(enrolment.programme.level)`, and checks `moduleResult` rows for the student using the dual rule `aggregateMark >= passMark` **OR** `aggregateMark IS NULL AND grade IN PASSING_GRADES`. Missing prerequisites throw `ValidationError`. Invoked from `create()` at line 127. |
| `module-registrations.service.ts` contains credit-limit enforcement | **Present** | Same file, `validateCreditLimit(moduleId, enrolmentId, academicYear)` at lines 85-124. Sums credits of existing `REGISTERED`/`COMPLETED` registrations for the enrolment+year, adds the candidate module's credits, and compares against `getMaxCreditsForMode(enrolment.modeOfStudy)`. Throws `ValidationError` if the total exceeds the mode-specific cap. Invoked from `create()` at line 128. Note: **not** invoked from `update()` (line 148-178). |
| `marks.service.ts` resolves grade from mark | **Present** | `server/src/api/marks/marks.service.ts:8` imports `resolveGradeFromMark` from `../../utils/grade-boundaries`. Auto-grade resolution runs on `create()` at line 54-57 (`if (data.finalMark != null && !data.grade && data.assessmentId)`) and on `update()` at line 93-101 (using `effectiveAssessmentId`). |
| `module-registrations.service.test.ts` exists | **Present** | File at `server/src/__tests__/unit/module-registrations.service.test.ts`. Contains 11 `it(...)` / `test(...)` blocks (per Grep of `^\s*(it\|test)\s*\(`). |
| Actual unit test file count | **10** | Directory listing of `server/src/__tests__/unit/` returns 10 files: `admissions.service.test.ts`, `appeals.service.test.ts`, `attendance.service.test.ts`, `communications.service.test.ts`, `ec-claims.service.test.ts`, `enrolments.service.test.ts`, `finance.service.test.ts`, `marks.service.test.ts`, `module-registrations.service.test.ts`, `support.service.test.ts`. Glob of `server/src/**/*.test.ts` returns the same 10 — no other `*.test.ts` files exist under `server/src/`. |
| Actual unit test count | **120 (static `it`/`test` occurrences)** | Grep of `^\s*(it\|test)\s*\(` across `server/src/__tests__/unit/` reports 120 occurrences across 10 files: support (12), marks (16), module-registrations (11), admissions (12), enrolments (10), communications (12), finance (12), appeals (9), ec-claims (10), attendance (16). Not runtime-executed in this pass, so the figure reflects static declarations only. |
| Actual API router count | **44 `*.router.ts` files + 9 `group-index.ts` barrels** | `find server/src/api -maxdepth 2 -name '*.router.ts'` → 44. `find server/src/api -maxdepth 2 -name 'group-index.ts'` → 9 (admissions, assessment, compliance, curriculum, enrolment, identity, platform, progression, student-support). Directory listing of `server/src/api/` shows 51 subdirectories total. |
| Actual Prisma model count | **197** | Grep of `^model ` in `prisma/schema.prisma` returns 197. Listed range spans `Person` (line 1031) through `DataClassification` (line ~5437). Domain coverage includes identity, curriculum, admissions, enrolment, assessment, finance, attendance, timetable, support, UKVI, EC/appeals, disability, graduation, placements, documents, communications, HESA, accommodation, governance, audit, calendar. |
| Actual role count in `server/src/constants/roles.ts` | **36** | Read of `server/src/constants/roles.ts` enumerates 36 `ROLE_*` string constants (SUPER_ADMIN, SYSTEM_ADMIN, REGISTRAR, SENIOR_REGISTRY_OFFICER, REGISTRY_OFFICER, ADMISSIONS_MANAGER, ADMISSIONS_OFFICER, ADMISSIONS_TUTOR, ASSESSMENT_OFFICER, PROGRESSION_OFFICER, GRADUATION_OFFICER, FINANCE_DIRECTOR, FINANCE_MANAGER, FINANCE_OFFICER, QUALITY_DIRECTOR, QUALITY_OFFICER, COMPLIANCE_OFFICER, DEAN, ASSOCIATE_DEAN, HEAD_OF_DEPARTMENT, PROGRAMME_LEADER, MODULE_LEADER, ACADEMIC_STAFF, LECTURER, SENIOR_LECTURER, PROFESSOR, STUDENT_SUPPORT_MANAGER, STUDENT_SUPPORT_OFFICER, PERSONAL_TUTOR, DISABILITY_ADVISOR, WELLBEING_OFFICER, INTERNATIONAL_OFFICER, ACCOMMODATION_OFFICER, STUDENT, APPLICANT, PUBLIC). File header comment self-declares "FHE realm (36 roles)". Note: `ROLE_GROUPS.ALL_AUTHENTICATED` includes only 35 (PUBLIC is excluded). |

## Notes on Evidence

- All file locations are taken from Glob/Read results inside the main working
  tree (`/home/user/SJMS-2.5`). Matches inside `.claude/worktrees/...` are
  ignored — those are scratch worktrees, not the repository's source of truth.
- Test counts are static `it(...)` / `test(...)` occurrences. No test suite
  was executed in this pass; runtime pass/fail status is **UNCLEAR** until a
  later phase runs `npx vitest`.
- Prisma model count comes from a grep of `^model ` at the start of a line.
  Nested type declarations (enums, generators, datasource) are excluded.
