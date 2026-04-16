# SJMS 2.5 — PR #41 Remediation & Issues #28/#30 Build Plan

> **Date:** 2026-04-16
> **Scope:** 3 BugBot findings on PR #41 + requirements for Issues #28 (Phase 3 API decomposition) and #30 (Phase 4 frontend services)
> **Goal:** Non-breaking fixes that preserve everything currently working; additive expansions for Phase 3/4

---

## Part A — PR #41 BugBot Findings (3 issues)

### Summary of findings

| # | Severity | Finding | Location |
|---|----------|---------|----------|
| 1 | **HIGH** | Prerequisite validation ignores pass/fail outcome (CONFIRMED status ≠ passed) | `server/src/api/module-registrations/module-registrations.service.ts:52-60` |
| 2 | **MEDIUM** | Hardcoded 120 credit limit ignores mode of study (part-time = 60-75) | `server/src/api/module-registrations/module-registrations.service.ts:98-99` |
| 3 | **LOW** | `calculateWeightedMark` exported but never called (dead code) | `server/src/utils/grade-boundaries.ts:25-62` |

---

### A1. Fix HIGH — Prerequisite pass/fail check

**Root cause:** `ModuleResult.status` indicates whether the result has been *ratified* (PROVISIONAL / CONFIRMED / REFERRED / DEFERRED), NOT whether the student *passed*. A student could have a CONFIRMED result with `aggregateMark = 20` and a failing grade, and the current query would treat that as "prerequisite satisfied."

**Data model facts:**
- `Module` has no `passMark` field — pass marks are on `Assessment` (assessment-level) or need to be derived
- `ModuleResult` has `aggregateMark: Decimal?` and `grade: String?`
- `Programme` has `level: ProgrammeLevel` enum
- `SystemSetting` is already used for externalising thresholds (UKVI precedent, KI-P6-003)

**Recommended fix — dual-check (mark AND grade):**

A module is "passed" when EITHER:
- `aggregateMark >= passMark` (where passMark depends on programme level), OR
- `grade` is in a set of passing grades (A, B, C, D, E — UK HE convention)

Pass marks lookup via SystemSetting (extensible, institution-configurable):
- `assessment.pass_mark.undergraduate` → default 40
- `assessment.pass_mark.masters` → default 50
- `assessment.pass_mark.doctorate` → default 50
- `assessment.pass_mark.default` → fallback 40

**Implementation sketch:**
```typescript
// New utility: server/src/utils/pass-marks.ts
export async function getPassMark(programmeLevel: string): Promise<number> {
  const key = `assessment.pass_mark.${programmeLevel.toLowerCase()}`;
  const setting = await prisma.systemSetting.findUnique({ where: { settingKey: key } });
  if (setting) {
    const val = parseFloat(setting.settingValue);
    if (!isNaN(val) && val >= 0 && val <= 100) return val;
  }
  // Sensible UK HE defaults
  const isPG = ['MASTERS', 'DOCTORATE', 'PGCE', 'POSTGRADUATE'].includes(programmeLevel.toUpperCase());
  return isPG ? 50 : 40;
}

export const PASSING_GRADES = new Set(['A', 'B', 'C', 'D', 'E', 'PASS', 'DISTINCTION', 'MERIT']);
export const FAILING_GRADES = new Set(['F', 'FAIL', 'NS', 'AB']); // AB = absent
```

**Update `validatePrerequisites`:**
```typescript
const enrolment = await prisma.enrolment.findUnique({
  where: { id: enrolmentId },
  select: { studentId: true, programme: { select: { level: true } } },
});
if (!enrolment) return;
const passMark = await getPassMark(enrolment.programme.level);

const passedResults = await prisma.moduleResult.findMany({
  where: {
    moduleRegistration: { enrolment: { studentId: enrolment.studentId } },
    moduleId: { in: prerequisites.map((p) => p.prerequisiteModuleId) },
    status: { in: ['CONFIRMED', 'PROVISIONAL'] },
    OR: [
      { aggregateMark: { gte: passMark } },
      { AND: [{ grade: { in: Array.from(PASSING_GRADES) } }, { aggregateMark: null }] },
    ],
  },
  select: { moduleId: true },
});
```

**Why this approach:**
- Handles both quantitative (mark present) and qualitative (grade only) cases
- Respects institutional flexibility via SystemSetting
- Fallback defaults align with common UK HE conventions
- PROVISIONAL results still count (pre-exam-board registrations need to allow Term 2 registrations based on Term 1 marks)

**Seed data addition:** Add 4 default SystemSetting rows in a seed migration or on startup (idempotent upsert).

---

### A2. Fix MEDIUM — Hardcoded credit limit ignores mode of study

**Root cause:** `const maxCredits = 120` is valid for FULL_TIME but wrong for PART_TIME (typically 60-90), SANDWICH (usually full-year = 120 but placement year = 0), DISTANCE (varies), BLOCK_RELEASE (varies).

**Data model facts:**
- `Enrolment.modeOfStudy: ModeOfStudy` — enum: FULL_TIME, PART_TIME, SANDWICH, DISTANCE, BLOCK_RELEASE
- `Programme.creditTotal: Int` — total programme credits (e.g., 360 for 3-yr UG)
- `SystemSetting` — existing externalisation pattern

**Recommended fix — mode-of-study aware with SystemSetting overrides:**
```typescript
// New utility: server/src/utils/credit-limits.ts
export async function getMaxCreditsForMode(mode: ModeOfStudy): Promise<number> {
  const key = `enrolment.max_credits.${mode.toLowerCase()}`;
  const setting = await prisma.systemSetting.findUnique({ where: { settingKey: key } });
  if (setting) {
    const val = parseInt(setting.settingValue, 10);
    if (!isNaN(val) && val > 0 && val <= 240) return val;
  }
  // UK HE conventions (per-year, per-enrolment):
  const defaults: Record<string, number> = {
    FULL_TIME: 120,
    PART_TIME: 75,
    SANDWICH: 120,
    DISTANCE: 120,
    BLOCK_RELEASE: 120,
  };
  return defaults[mode] ?? 120;
}
```

**Update `validateCreditLimit`:**
```typescript
async function validateCreditLimit(moduleId: string, enrolmentId: string, academicYear: string): Promise<void> {
  const [targetModule, enrolment] = await Promise.all([
    prisma.module.findUnique({ where: { id: moduleId }, select: { credits: true } }),
    prisma.enrolment.findUnique({ where: { id: enrolmentId }, select: { modeOfStudy: true } }),
  ]);
  if (!targetModule || !enrolment) return;

  const existingRegistrations = await prisma.moduleRegistration.findMany({
    where: {
      enrolmentId,
      academicYear,
      status: { in: ['REGISTERED', 'COMPLETED'] },
      deletedAt: null,
    },
    select: { moduleId: true },
  });
  const moduleIds = existingRegistrations.map((r) => r.moduleId);
  const modules = await prisma.module.findMany({
    where: { id: { in: moduleIds } },
    select: { id: true, credits: true },
  });
  const creditMap = new Map(modules.map((m) => [m.id, m.credits]));
  const currentCredits = existingRegistrations.reduce((sum, r) => sum + (creditMap.get(r.moduleId) ?? 0), 0);

  const maxCredits = await getMaxCreditsForMode(enrolment.modeOfStudy);

  if (currentCredits + targetModule.credits > maxCredits) {
    throw new ValidationError(
      `Registration exceeds ${enrolment.modeOfStudy} credit limit: ${currentCredits} + ${targetModule.credits} > ${maxCredits}`,
      { credits: [`Exceeds ${maxCredits} credit limit (${enrolment.modeOfStudy})`] },
    );
  }
}
```

**Why this approach:**
- Same proven pattern as UKVI threshold externalisation (KI-P6-003 in Phase 8D)
- Institution can override defaults without code changes via SystemSetting UI
- Defaults are sector-realistic UK HE values
- No schema changes required
- One extra DB query (the enrolment lookup) — negligible cost
- Batched in Promise.all with the module lookup

**Seed data addition:** 5 default SystemSetting rows (one per ModeOfStudy).

---

### A3. Fix LOW — Dead code `calculateWeightedMark`

**Root cause:** The utility was written in anticipation of mark aggregation (P1 action item #5 in `docs/review/07-priority-actions.md`) but never wired to a caller. BugBot correctly flags dead code.

**Two viable resolutions:**

**Option A — Remove it (lower risk, honest):** Delete the function, defer proper aggregation to P1 where it can be designed with the full assessment→attempt pipeline.

**Option B — Wire minimal integration (higher value):** Add an explicit endpoint that staff can call to aggregate component marks into an AssessmentAttempt. Does not auto-trigger on every mark change (safer).

**Recommended: Option B with narrow scope:**

1. Add a service function `aggregateComponentMarks` in `marks.service.ts`:
   ```typescript
   export async function aggregateComponentMarks(
     assessmentId: string,
     moduleRegistrationId: string,
     attemptNumber: number,
     userId: string,
     req: Request,
   ) {
     const weightedMark = await calculateWeightedMark(assessmentId, moduleRegistrationId);
     if (weightedMark === null) {
       throw new ValidationError('Cannot aggregate: one or more components lack marks');
     }
     const attempt = await prisma.assessmentAttempt.findFirst({
       where: { assessmentId, moduleRegistrationId, attemptNumber, deletedAt: null },
     });
     if (!attempt) throw new NotFoundError('AssessmentAttempt');
     return update(attempt.id, { rawMark: weightedMark }, userId, req);
   }
   ```

2. Add endpoint in `marks.router.ts`:
   ```typescript
   POST /v1/marks/aggregate
   body: { assessmentId, moduleRegistrationId, attemptNumber? }
   ```

3. No UI wiring needed in this PR — endpoint is available for later UI integration.

**Why Option B:**
- Function becomes live code, BugBot finding resolved
- Staff get a clear "recompute raw mark from components" action
- Does not auto-trigger (no silent data changes)
- Respects the review's principle that business logic should be explicit

**If time-constrained:** Go with Option A (delete) — clearly documented in KI as AMBER for P1.

---

## Part B — Issue #28: Phase 3 API Module Decomposition

### Requirement summary
Group 44 existing domain routers into 9 logical domain barrels. No existing router files modified. Add `GET /{group}/health` endpoints. Update `server/src/api/index.ts` to mount group routers alongside (not replacing) existing flat mounts.

### Current state
- 44 domain modules exist as flat directories under `server/src/api/`
- All mounted at `/v1/{module}` directly (e.g., `/v1/students`, `/v1/applications`)
- Client already consumes these flat paths via `useList('/v1/students', ...)` etc.
- 0 group barrels exist

### Critical constraint: backward compatibility
The issue template's router mount pattern would mount groups at `/v1/{group}/{module}` — **this is an ADDITION, not a replacement**. The existing flat mounts must stay to avoid breaking the Phase 5 frontend wiring (PR #33) that already shipped.

### Implementation plan

**Step 1 — Create 9 group directories and barrel files:**

Each new barrel at `server/src/api/{group}/group-index.ts` follows pattern:
```typescript
import { Router } from 'express';
import { personsRouter } from '../persons/persons.router';
import { identifiersRouter } from '../identifiers/identifiers.router';
import { demographicsRouter } from '../demographics/demographics.router';

const router = Router();
router.use('/persons', personsRouter);
router.use('/identifiers', identifiersRouter);
router.use('/demographics', demographicsRouter);
router.get('/health', (_req, res) => {
  res.json({ group: 'identity', status: 'ok', modules: 3 });
});
export default router;
```

**Adjustment from issue template:** Use named imports from `*.router.ts` files (matching existing codebase convention in `server/src/api/index.ts`), NOT default imports from `index.ts`. The issue template assumed default exports which do not exist.

**Group → modules mapping:**

| Group | Modules | Count |
|---|---|---|
| `identity/` | persons, identifiers, demographics | 3 |
| `admissions/` | applications, offers, interviews, admissions-events, references, qualifications | 6 |
| `enrolment/` | enrolments, students, clearance-checks | 3 |
| `curriculum/` | programmes, programme-modules, programme-routes, programme-approvals, modules, module-registrations, faculties, departments, schools | 9 |
| `assessment/` | assessments, submissions, marks, module-results | 4 |
| `progression/` | progressions, exam-boards, awards | 3 |
| `student-support/` | support, appeals, ec-claims, documents, communications | 5 |
| `compliance/` | ukvi, attendance, audit | 3 |
| `platform/` | finance, reports, transcripts, config, webhooks | 5 |
| **Total** | | **41** |

**Discrepancy to flag:** Issue #28 maps only 41 modules. Missing from groupings: `hesa`, `accommodation`, `governance` (added in Phase 8C). Recommendation:
- Add `hesa` → `compliance/` group (fits: regulatory reporting)
- Add `accommodation` → `student-support/` group (fits: student services)
- Add `governance` → `platform/` group (fits: administrative)

Updated total: 44 modules across 9 groups.

**Step 2 — Update `server/src/api/index.ts` (additive):**
```typescript
// Existing 44 flat mounts remain unchanged
// Add at end:
import identityGroup from './identity/group-index';
import admissionsGroup from './admissions/group-index';
// ... 7 more

apiV1Router.use('/identity', identityGroup);
apiV1Router.use('/admissions', admissionsGroup);
// ... 7 more
```

**Step 3 — Verification:**
- `npx tsc --noEmit` = 0 errors
- `GET /api/v1/identity/health` returns `{ group: 'identity', status: 'ok', modules: 3 }`
- `GET /api/v1/students` still returns data (flat path preserved)
- `GET /api/v1/identity/persons` returns data (grouped path works)
- Existing tests pass

### Risk assessment
**Low risk.** Pure additive. No existing file modified except `server/src/api/index.ts` (additive imports + mounts at end). If group mounts fail to load, existing flat paths still work.

### Effort estimate
3-4 hours:
- 9 new barrel files (10 lines each) — 1 hour
- index.ts updates — 30 min
- Health endpoint tests — 30 min
- Documentation — 30 min
- tsc verification — 30 min

---

## Part C — Issue #30: Phase 4 Frontend API Service Layer

### Requirement summary
Create 9 typed service modules in `client/src/services/` wrapping the Axios instance. No modification to existing client code. No `any` types.

### Current state
- `client/src/services/` does not exist
- Existing client uses `useList/useDetail/useCreate/useUpdate/useRemove` hooks from `client/src/hooks/useApi.ts`
- These hooks take a path string (e.g., `useList('/v1/students', params)`)
- The typed service layer is a parallel/additive system, not a replacement

### Critical consideration: which paths?

Three options:
1. **Flat paths** (existing): `/v1/persons`, `/v1/students`, etc.
2. **Grouped paths** (new per Issue #28): `/v1/identity/persons`, `/v1/enrolment/students`, etc.
3. **Both** via service configuration flags

**Recommendation: Use grouped paths** (option 2). This is the natural pairing with Issue #28 — the services should exercise the new grouped architecture. Existing hooks continue to use flat paths. New code written against services gets the grouped architecture.

### Implementation plan

**Step 1 — Create `client/src/services/` directory with 9 service files + barrel:**

Template for each service (e.g., `identity.service.ts`):
```typescript
import api from '../lib/api';

// Minimal types pending Phase 9 Prisma type generation
export interface Person {
  id: string;
  [key: string]: unknown; // TODO: replace with generated Prisma type in Phase 9
}

export interface ListParams {
  limit?: number;
  cursor?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface ListResponse<T> {
  data: T[];
  nextCursor: string | null;
  total?: number;
}

// ── Persons ──────────────────────────────────────────────────────────────────
export const getPersons = (params?: ListParams) =>
  api.get<ListResponse<Person>>('/v1/identity/persons', { params });

export const getPersonById = (id: string) =>
  api.get<Person>(`/v1/identity/persons/${id}`);

export const createPerson = (data: Partial<Person>) =>
  api.post<Person>('/v1/identity/persons', data);

export const updatePerson = (id: string, data: Partial<Person>) =>
  api.patch<Person>(`/v1/identity/persons/${id}`, data);

export const deletePerson = (id: string) =>
  api.delete<void>(`/v1/identity/persons/${id}`);

// ── Identifiers ─────────────────────────────────────────────────────────────
// ... same pattern

// ── Demographics ────────────────────────────────────────────────────────────
// ... same pattern

// ── Health ───────────────────────────────────────────────────────────────────
export const getIdentityHealth = () =>
  api.get<{ group: string; status: string; modules: number }>('/v1/identity/health');
```

**Barrel file `client/src/services/index.ts`:**
```typescript
export * from './identity.service';
export * from './admissions.service';
export * from './enrolment.service';
export * from './curriculum.service';
export * from './assessment.service';
export * from './progression.service';
export * from './student-support.service';
export * from './compliance.service';
export * from './platform.service';
```

**Naming collision warning:** Some functions will have same names across services (e.g., `createRecord`, `getHealth`). The barrel will expose them under per-domain names — the issue template uses `getIdentityHealth` etc., which avoids collisions. Each service health function must be domain-prefixed.

**Also watch for entity name collisions** — e.g., both identity and enrolment reference `Person` indirectly. Solution: Don't export `Person` from multiple services. Only the "owning" domain exports the type. Others import from the owner's service file.

### Risk assessment
**Very low risk.** Pure additive. No existing file modified. No consumers initially.

### Effort estimate
6-8 hours:
- 9 service files (each covers 3-9 resources × 5 methods) — 5 hours
- Barrel file — 15 min
- Type definitions — 1.5 hours
- tsc verification + adjustments — 45 min
- Documentation — 30 min

---

## Part D — Sequencing & Execution Plan

### Recommended order

**Phase 1 — PR #41 BugBot Fixes (Priority 0, merge blocker)**
1. Fix A1 (HIGH): pass-marks utility + dual-check prerequisite validation
2. Fix A2 (MEDIUM): credit-limits utility + mode-aware validation
3. Fix A3 (LOW): wire `calculateWeightedMark` via new aggregate endpoint
4. Seed SystemSettings (pass marks + credit limits) via idempotent startup upsert
5. Tests: extend module-registrations service tests to cover fail/pass scenarios
6. Tests: extend credit limit tests for each mode of study
7. Re-trigger BugBot, verify 0 findings
8. Merge PR #41

**Phase 2 — Issue #28: Phase 3 API Decomposition (Priority 1)**
New PR from new branch `phase-3/api-decomposition`:
1. Create 9 group-index.ts barrels
2. Update `server/src/api/index.ts` (additive)
3. Verify both flat and grouped paths work
4. Document in new CLAUDE.md section
5. Close Issue #28

**Phase 3 — Issue #30: Phase 4 Frontend Services (Priority 2)**
Depends on Phase 2 complete (grouped paths must exist).
New PR from new branch `phase-4/api-service-layer`:
1. Create 9 service files + barrel
2. Verify tsc clean
3. Close Issue #30

---

## Part E — Risk Assessment Summary

| Item | Type | Risk | Mitigation |
|------|------|------|------------|
| A1: Prerequisite pass/fail | Logic fix | Low | Dual-check (mark OR grade) handles edge cases; default 40/50 align with UK HE conventions |
| A2: Credit limit mode-aware | Logic fix | Low | SystemSetting overrides + safe defaults; matches UKVI threshold pattern |
| A3: `calculateWeightedMark` wire-up | Feature add | Low | New endpoint only — no existing code paths touched |
| Issue #28: Group barrels | Structural | Low | Additive only — flat paths preserved |
| Issue #30: Typed services | Structural | Very Low | No existing consumers; pure additive |

**Nothing in this plan breaks existing functionality.** All changes are additive or targeted logic fixes on validators that were introduced in this same PR.

---

## Part F — Open Questions for Richard

1. **Pass mark defaults (A1):** Is 40 for UG / 50 for PGT correct for FHE? Some institutions use 35/45. Default is changeable via SystemSetting so this is a starting value, not permanent.

2. **Part-time credit limit (A2):** Default 75 credits/year assumed. Actual FHE policy may be 60 or 90. Please confirm — again, changeable via SystemSetting.

3. **Aggregation endpoint (A3):** Accept the new `POST /v1/marks/aggregate` endpoint as a minimal Phase-1 solution, or prefer full Option A (delete dead code, defer to proper P1)?

4. **Issue #28 groupings:** Accept the proposed additions of `hesa`→compliance, `accommodation`→student-support, `governance`→platform? Or leave those 3 ungrouped (still accessible at flat paths)?

5. **Issue #30 path choice:** Use grouped paths (`/v1/identity/persons`) as recommended, or match existing flat paths (`/v1/persons`) for initial compatibility with existing hooks?

6. **Migration strategy:** After Issues #28/#30 ship, should flat routes be deprecated in favour of grouped routes (requires client migration of all 123 pages)? Recommendation: keep flat routes for 2-3 phases, migrate pages opportunistically.

---

## Part G — Out of Scope (Flagged for Later)

- **Full mark aggregation pipeline** — component → assessment → module result → board outcome. This is P1 and needs proper design (exam board triggers, state transitions, event flow).
- **Classification calculation** — degree classification from weighted year averages. P1 action.
- **HESA entity mapping** — statutory compliance layer. P2 action.
- **Progression rule engine** — compensated fails, referred assessments, condonement. P1 action.
- **CI/CD pipeline** — GitHub Actions for tsc/tests/lint on every PR. Infrastructure priority.

These are tracked in `docs/review/07-priority-actions.md`.
