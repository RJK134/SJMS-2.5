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

### KI-001: 23 pre-existing TypeScript errors in server

**Status:** Open — deferred to a dedicated cleanup branch  
**Category:** Type safety / tech debt  
**Scope:** `server/` only; client is clean  
**Detection:** `cd server && npx tsc --noEmit`  
**First observed:** 2026-04-10 (during PR #11 remediation sweep)  
**Confirmed unchanged across:** main@d256e1a, main@f1eac35, main@ea741ca

All 23 errors are in files that have **not** been touched by the pre-Phase 2
remediation work (PR #11) or this branch. Error count is stable before and after
both PRs; no regressions have been introduced. These errors surface because
`tsx` (dev) and `tsc --build` (production build) are not invoked with
`--noEmit` strict checking in the current CI/dev flow, so the type drift has
accumulated silently.

Grouped by root cause below. Fix in a single dedicated branch
(`chore/tsc-cleanup`) to keep the diff focused and reviewable.

#### Category A — Express `req.query` type coercion (7 errors)

`req.query` is typed as `ParsedQs` where individual keys are
`string | string[] | ParsedQs | ParsedQs[] | undefined`. Several controllers
pass these straight into functions that expect `string`, causing
`TS2345: Argument of type 'string | string[]' is not assignable to parameter
of type 'string'`.

| File | Line | Context |
|---|---|---|
| `server/src/api/dashboard/dashboard.controller.ts` | 14, 22, 45 | `req.query.timeframe` etc. passed to service |
| `server/src/api/finance/finance.controller.ts` | 44 | `req.query.studentAccountId` |
| `server/src/api/notifications/notifications.controller.ts` | 13, 27 | `req.query.isRead`, `req.query.limit` |
| `server/src/api/timetable/timetable.controller.ts` | 13 | `req.query.date` |

**Fix:** Coerce each use with `String(req.query.xxx)` (or `req.query.xxx as string`
if already validated by Zod). The cleanest path is to add a per-route Zod
schema that parses/coerces query params into concrete types, matching the
pattern used by the 44 services that already have `.schema.ts` files for
params and body.

**Effort:** ~30 minutes. Each fix is a one-line edit plus a Zod schema
addition where needed.

#### Category B — Stale code in `dashboard.service.ts` (10 errors)

`dashboard.service.ts` references fields that do not exist on the current
Prisma-generated types. The code looks like it was written against an older
(or hypothetical future) schema and never updated when the actual schema
evolved.

| Line | Issue |
|---|---|
| 76 | `studentAccount.totalCharges` — field does not exist on `StudentAccount` |
| 77 | `studentAccount.totalPayments` — field does not exist on `StudentAccount` |
| 84 | `ApplicationWhereInput.personId` — should be `studentId` or a join |
| 86 | `ApplicationInclude.offers` — not in Prisma schema |
| 92, 93 | `application.programme` — should be `.programmeId` or include the relation |
| 95 | `application.entryRoute` — field does not exist on `Application` |
| 97 | `application.submittedDate` — field does not exist |
| 99 | `application.offers` — same as line 86; also `parameter 'o' implicitly has an 'any' type` |

**Fix:** Rewrite the two affected functions (`getFinanceSummary`,
`getAdmissionsSummary` — likely names) to match the current schema. Decide
per-field whether:
- The field is missing from the schema and needs to be added (schema change +
  migration)
- The field exists under a different name (rename reference)
- The field is implicit in a relation and needs an `include` clause

Most likely the correct action is: add computed `totalCharges` / `totalPayments`
sums via Prisma aggregations, drop `entryRoute`/`submittedDate` or join through
`Offer`, and fix the `programme` accesses to use the `programmeId` FK or
`include: { programme: true }`.

**Effort:** ~1–2 hours. Needs schema inspection to decide per-field fix.

**Note:** This service is what `/api/v1/dashboard/stats` calls internally. The
endpoint currently works *at runtime* because `tsx` strips TypeScript types —
the Prisma query is sent to the database and fails silently if it references
non-existent fields (or succeeds if the fields happen to exist at runtime due
to column name coincidence). This is a latent production bug, not just a type
complaint. Priority: **medium-high**, should land before Phase 2 goes live.

#### Category C — `data-scope.ts` relation name (2 errors)

| File | Line | Issue |
|---|---|---|
| `server/src/middleware/data-scope.ts` | 44 | `{ students: ... }` in Prisma include — should be `{ student: ... }` (singular, Person → Student is 1:1) |
| `server/src/middleware/data-scope.ts` | 50 | `person.students` property access — should be `person.student` |

**Fix:** Two single-character edits (remove the trailing `s`). Sanity-check
the relation cardinality in `prisma/schema.prisma` first — if Person → Student
is actually 1:many, the correct fix is different (use `.student[0]` or
restructure the query).

**Effort:** ~5 minutes.

**Priority:** **high** — this is in the data-scoping middleware which is the
foundation for Phase 2 row-level authorisation. Should be fixed before Task C
of Phase 2 (Frontend Auth Wiring) begins, otherwise the middleware will fail
at runtime when `AUTH_BYPASS` is disabled.

#### Category D — `express-rate-limit` + `rate-limit-redis` version mismatch (4 errors)

| File | Line | Issue |
|---|---|---|
| `server/src/middleware/rate-limit.ts` | 9 | `Class 'RedisStore' incorrectly implements interface 'Store'. Property 'prefix' is private in type 'RedisStore' but not in type 'Store'.` |
| `server/src/middleware/rate-limit.ts` | 68, 85, 101 | `Type 'RedisStore' is not assignable to type 'Store \| LegacyStore \| undefined'` (cascade of line 9) |

**Root cause:** The installed version of `rate-limit-redis` exposes `prefix` as
a private property, but the installed version of `express-rate-limit`'s `Store`
interface declares `prefix` as public. The two packages are at incompatible
versions.

**Fix options:**
- **Option A:** Upgrade both packages to matching latest versions
  (`npm i express-rate-limit@latest rate-limit-redis@latest` in `server/`).
  Risk: breaking changes in public API.
- **Option B:** Downgrade to a known-compatible pair (check
  `rate-limit-redis` CHANGELOG for the version that matches the installed
  `express-rate-limit`).
- **Option C:** Add a single `@ts-expect-error` with a comment linking this
  document, accepting the type mismatch until a dependency update is planned.

**Effort:** ~30 minutes for A or B with a smoke test (hit a rate-limited
endpoint with Redis available and with Redis stopped). ~2 minutes for C.

**Priority:** **low** — the rate limiter is working at runtime (tsx strips
types); this is purely a type-check complaint.

---

### KI-002: Repository layer unused (enterprise review §3)

**Status:** Open — not in scope for Phase 2; booked for a later architecture
pass  
**Detection:** `grep -rl "from.*repositories" server/src/api/` → zero results  
**Reference:** `docs/review-findings/enterprise-review-2026-04-10.md` §3
"Critical: Repository Layer Disconnect"

11 repository files exist under `server/src/repositories/` with correct
transaction logic, typed `Prisma.*WhereInput` parameters, and the
`changeStatus()` pattern with audit history — but **no service imports them**.
All 44 service files call `prisma` directly via `../../utils/prisma`, bypassing
the documented Router → Controller → Service → **Repository** layer pattern.

**Fix:** Wire the 44 service files to their corresponding repository functions,
starting with the 11 domains that already have repositories: enrolment,
student, finance, admissions, assessment, attendance, document, compliance,
governance, programme, support. Each service becomes a thin call-through with
audit and event emission; transaction logic stays in the repository.

**Blocked on:** Category B (`dashboard.service.ts` cleanup) — dashboard service
has none of the patterns the repository layer enforces, so it needs to be
rewritten first.

**Estimated effort:** ~1 day for the 11 service-to-repository rewires plus
tests.

---

### KI-003: `data: any` pervasive in services (enterprise review §3)

**Status:** Open — booked with KI-002  
**Reference:** enterprise review §3 "Serious: `data: any` Throughout Services"

Every `service.ts` file uses `data: any` as the parameter type for `create()`
and `update()`, and `query: Record<string, any>` for `list()`. Zod validation
at the route level is the only current safety net.

**Fix:** Replace `data: any` with `Prisma.<Model>UncheckedCreateInput` / 
`Prisma.<Model>UncheckedUpdateInput`. The repository layer already uses these
types correctly — this is the natural follow-up to wiring services through
repositories (KI-002).

---

## Closed issues

*(None yet — this document was created in commit
`docs: add KNOWN_ISSUES.md for 23 pre-existing tsc errors` in the
`feature/phase2-prep` branch.)*

---

## How to add to this document

1. Only add items with a clear deferral reason.
2. Categorise by root cause, not by symptom — if 10 errors have the same
   cause, list the cause once and link the files.
3. Include detection command so the reader can verify the issue is still open.
4. Include priority (low / medium / high) and rough effort estimate.
5. When closing an item, move it to the "Closed issues" section with the
   closing commit hash and date. Do not delete.
