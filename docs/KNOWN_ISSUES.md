# SJMS 2.5 — Known Issues

Living document tracking known defects that are **deliberately deferred** rather
than fixed. Each entry describes the issue, its category, why it is deferred,
and who should pick it up.

**Scope rule:** anything listed here must have a clear reason for deferral
(either out-of-scope for the current branch, blocked on another piece of work,
or explicitly accepted as tech debt to be cleared in a dedicated cleanup pass).
Items that should be fixed in the active branch do **not** belong here.

---

## Open issues

*(None.)*

---

## Closed issues

### KI-001: 23 pre-existing TypeScript errors in server — CLOSED 2026-04-11

**Closed by:** Phase 2.5 architecture remediation (commits `bea935d` → `c129137`)
plus the Phase 2 closeout work (`180c72f`, `68ec45c`) and documentation
stabilisation (this commit).
**Verification:** `cd server && npx tsc --noEmit` → 0 errors.
`cd client && npx tsc --noEmit` → 0 errors.

All four categories were resolved as a side-effect of the Phase 2.5 sprint
rather than by a dedicated `chore/tsc-cleanup` branch:

- **Category A — `req.query` type coercion (7 errors).** Fixed by the typed
  `XListQuery` interface pattern introduced in every service during the
  Phase 2.5 repository wiring. Every controller now casts
  `req.query as unknown as service.XListQuery`; runtime shape is enforced
  by `validateQuery` middleware. Current state verified:
  ```
  grep -n "req.query" server/src/api/dashboard/dashboard.controller.ts \
                       server/src/api/finance/finance.controller.ts \
                       server/src/api/notifications/notifications.controller.ts \
                       server/src/api/timetable/timetable.controller.ts
  ```
  All 4 files use the typed cast, no raw `string | string[]` passes.

- **Category B — `dashboard.service.ts` stale field references (10 errors).**
  Fixed by commit `c129137` (refactor(api): wire ops services to new
  repositories). The service was rewritten to call through
  `server/src/repositories/dashboard.repository.ts`, and the stale field
  references (`totalCharges`, `totalPayments`, `entryRoute`, `submittedDate`,
  `application.offers`) were replaced with the current Prisma field names
  (`totalDebits`, `totalCredits`, `applicationRoute`, `decisionDate`,
  `application.conditions`). The `application.programme?.title` access path
  is valid because `getApplicantLatestApplication` in the repository
  includes the `programme` relation via `include: { programme: true }`.

- **Category C — `data-scope.ts` relation name (2 errors).**
  `server/src/middleware/data-scope.ts` now uses `student: { select: { id: true } }`
  (singular) on lines 70-72 and reads `person?.student?.id` on line 77.
  `prisma/schema.prisma:1036` declares `student Student?` (nullable 1:1)
  on the Person model, which matches this access path. Resolved by the
  Phase 2.5 `data-scope.ts` edit in commit `68ec45c`.

- **Category D — `express-rate-limit` + `rate-limit-redis` version mismatch
  (4 errors).** The original analysis was incorrect: the codebase does not
  import `rate-limit-redis` at all. `server/src/middleware/rate-limit.ts:9`
  defines a custom `class RedisStore implements Store` that uses the shared
  `ioredis` client directly. `prefix: string` is public (line 10) and
  `windowMs` is private (line 11), which matches the `Store` interface
  contract. No type mismatch exists. Fixed implicitly by whichever commit
  restructured the rate-limit middleware — currently clean.

---

### KI-002: Repository layer unused — CLOSED 2026-04-11

**Closed by:** Phase 2.5 Task 1 (commits `bea935d` → `c129137`, 7 parts).
**Verification:**
```
grep -r "from.*utils/prisma" server/src/api --include="*.service.ts" | wc -l
→ 0
grep -r "from.*repositories/" server/src/api --include="*.service.ts" | wc -l
→ 44
```

All 44 services now import from their matching repository under
`server/src/repositories/`. Zero services bypass the repository layer.
The 10 pre-existing repositories (student, programme, admissions,
enrolment, assessment, finance, attendance, support, document,
compliance) were extended with `softDelete`, `deletedAt: null` filtering,
and exported filter interfaces. 34 new repositories were created to
cover the remaining domains, following the canonical
`enrolment.repository.ts` pattern.

See `.claude/skills/repository-pattern.md` for the current contract and
`docs/SESSION-HANDOFF-2026-04-11-remediation.md` for the full rollout history.

---

### KI-003: `data: any` pervasive in services — CLOSED 2026-04-11

**Closed by:** Phase 2.5 Task 1 (same commit range as KI-002).
**Verification:**
```
grep -rn "data: any" server/src/api --include="*.service.ts" | wc -l
→ 0
```

Every service `create` and `update` now accepts typed
`Prisma.<Model>UncheckedCreateInput` / `Prisma.<Model>UpdateInput` parameters.
Every service exports a typed `XListQuery` interface that its matching
controller casts `req.query` to at the I/O boundary. Zero `data: any`
remains in any service file.

---

## How to add to this document

1. Only add items with a clear deferral reason.
2. Categorise by root cause, not by symptom — if 10 errors have the same
   cause, list the cause once and link the files.
3. Include detection command so the reader can verify the issue is still open.
4. Include priority (low / medium / high) and rough effort estimate.
5. When closing an item, move it to the "Closed issues" section with the
   closing commit hash and date. Do not delete.
