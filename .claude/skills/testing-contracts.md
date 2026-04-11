# Testing Contracts — SJMS 2.5

> Invariants that every commit must honour. Each bullet is a greppable
> or runnable check. If any of these fail, the commit does not land.

## Pre-commit checklist

Run these **in order** before every commit. Stop on the first failure.

```bash
# 1. TypeScript strict compile — both workspaces, zero errors.
cd server && npx tsc --noEmit
cd ../client && npx tsc --noEmit

# 2. Prisma schema is internally valid.
npx prisma validate --schema=prisma/schema.prisma

# 3. No service imports prisma directly (must be 0).
grep -r "from.*utils/prisma" server/src/api --include="*.service.ts" | wc -l

# 4. No untyped data parameters in services (must be 0).
grep -rn "data: any" server/src/api --include="*.service.ts" | wc -l

# 5. No hard deletes in services (must be 0).
#    remove() functions must use prisma.X.update({data:{deletedAt:new Date()}})
grep -rnE "prisma\.\w+\.delete\b" server/src/api --include="*.service.ts" | wc -l

# 6. Every POST/PUT/PATCH route has validate() middleware (must be 0).
grep -rnE "\.(post|put|patch)\(" server/src/api --include="*.router.ts" \
  | grep -v "validate(" | wc -l

# 7. Every route has requireRole() (must be 0).
grep -rnE "\.(get|post|put|patch|delete)\(" server/src/api --include="*.router.ts" \
  | grep -v "requireRole" | wc -l

# 8. British English — catches the big five (must be 0 results).
grep -rn "enrollment\|program[^m]\|color[^:]\|analyze\|organization" \
  server/src/ client/src/
```

All eight must pass. The first four are established contracts from Phase
2.5 (architecture remediation); breaking any of them is a regression.

## Service contract

| Rule | Check | Rationale |
|---|---|---|
| No direct `prisma` imports | `grep -r "from.*utils/prisma" server/src/api --include="*.service.ts"` → 0 | Repository layer is the only legitimate data-access path |
| Typed `create` / `update` params | `grep -rn "data: any" server/src/api --include="*.service.ts"` → 0 | Use `Prisma.XUncheckedCreateInput` / `Prisma.XUpdateInput` |
| `logAudit` on every mutation | Inspect each `create` / `update` / `remove` function | Audit trail is non-negotiable for registry compliance |
| `emitEvent` on every mutation | Inspect each `create` / `update` / `remove` function | n8n workflows depend on these events |
| No hard deletes | `grep -rnE "prisma\.\w+\.delete\b" server/src/api` → 0 | All deletes are soft; call `repo.softDelete(id)` |
| `NotFoundError` on missing records | Inspect `getById` implementations | Services throw, controllers let the error middleware shape the response |

### Exceptions

Read-only services (`audit-logs`, `calendar`, `dashboard`,
`statutory-returns`, `reports`, `timetable`) do not have mutations so
`logAudit` / `emitEvent` do not apply. `audit-logs` is append-only and
intentionally has no mutation helpers at all.

## Repository contract

| Rule | Check | Rationale |
|---|---|---|
| Every service has a matching repo | `ls server/src/repositories/*.repository.ts` vs `ls server/src/api/*/*.service.ts` | 1:1 pairing enforced |
| Typed inputs | `grep -rn "data: any\|: any\b" server/src/repositories` → review | Use `Prisma.X*Input` types throughout |
| `softDelete(id)` exported | Every repo for a model with `deletedAt` must export `softDelete` | Services call it — it's the public contract |
| `list` applies `deletedAt: null` | Inspect the `where` builder | Offsets by default hide soft-deleted rows |
| `getById` filters `deletedAt` | Use `findFirst({ where: { id, deletedAt: null } })` not `findUnique` | Tombstones must not leak |
| Transactions on multi-table writes | Inspect each write helper | `prisma.$transaction(async tx => { ... })` |

### Enforcement

The repository contract is verified by reading the file — no grep fully
covers it. Code review must check each new repository against the
canonical shape in `.claude/skills/repository-pattern.md`.

## Router contract

| Rule | Check | Rationale |
|---|---|---|
| POST / PUT / PATCH use `validate()` | `grep -rnE "\.(post\|put\|patch)\(" server/src/api --include="*.router.ts" \| grep -v "validate("` → 0 | Zod at the I/O boundary |
| GET `/:id` uses `validateParams()` | Inspect `.get('/:id'` lines | Shape the id param |
| GET list uses `validateQuery()` | Inspect `.get('/', '` lines | Coerce pagination and filters |
| Every route uses `requireRole()` | `grep -rnE "\.(get\|post\|put\|patch\|delete)\(" --include="*.router.ts" \| grep -v "requireRole"` → 0 | No public routes |
| DELETE routes are `SUPER_ADMIN` only | Review each `.delete('/:id'` line | Soft delete is a privileged op |
| Student-accessible list routes have `scopeToUser(...)` | Review routes with `ROLE_GROUPS.ALL_AUTHENTICATED` | Row-level security |
| Student-accessible detail routes have `requireOwnership(ownerLookup.X)` | Review detail routes with `ROLE_GROUPS.ALL_AUTHENTICATED` | Cross-student leak prevention (see Phase 2 closeout) |

## Schema contract

| Rule | Check | Rationale |
|---|---|---|
| `paramsSchema` shapes the id | `z.object({ id: z.string().min(1) })` | Consistent id handling |
| `querySchema` coerces pagination | `z.coerce.number()` for `page` / `limit` | HTTP query strings are strings |
| `limit` capped at 100 | `.max(100)` | No unbounded list queries |
| Booleans use `.transform(v => v === 'true')` | For `isRead`, `isActive`, etc. | HTTP query string booleans — fixed in `4f24e20` |
| `updateSchema = createSchema.partial()` | Standard PATCH pattern | Avoid drift between create and update validation |

## Prisma schema contract

See `.claude/skills/prisma-patterns.md` for the full set. Pre-commit:

```bash
# Schema is internally consistent
npx prisma validate --schema=prisma/schema.prisma

# Generated client is in sync
npm run prisma:generate
```

## Frontend contract (client/)

| Rule | Check | Rationale |
|---|---|---|
| No tokens in localStorage / sessionStorage | `grep -rn "localStorage\|sessionStorage" client/src/lib/auth.ts` → 0 | Security rule — tokens are memory-only |
| `useAuth()` only via the provider | `grep -rn "useAuth" client/src` → all call sites inside `AuthProvider` | React context invariant |
| Portal role guards on all four portals | Read `AdminRouter.tsx` / `AcademicPortal.tsx` / `StudentPortal.tsx` / `ApplicantPortal.tsx` | Phase 2 closeout — see Commit 1 in `180c72f` |
| Dev persona headers injected by axios | `grep -n "X-Dev-Persona" client/src/lib/api.ts` → 1 hit | Phase 2 closeout — see `68ec45c` |

## Commit-message contract

- Conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`, `perf:`.
- British English in message body.
- Subject ≤ 72 chars; body wraps at 72.
- Reference the commit that introduced the regression when fixing one.
- No mention of Claude authorship unless the commit is entirely
  Claude-authored; otherwise omit.

## Docker / dev-environment contract

- All 5 infra services must be running for a full server test:
  `docker ps` must show `sjms-postgres`, `sjms-redis`, `sjms-minio`,
  `sjms-keycloak`, `sjms-n8n` — all healthy.
- `server/.env` must exist with `AUTH_BYPASS=true` for dev mode.
- Root `.env` must exist (Vite reads it via `envDir: ".."`).
- `VITE_AUTH_MODE=dev` is the default when unset (set in Phase 2 closeout).

## Process rule: 15-minute rule

From `CLAUDE.md`: if any single issue takes more than 15 minutes of
investigation, document what you found in `docs/KNOWN_ISSUES.md` and
move on. Do not sink a session into a single stubborn bug without
flagging it upstream.

## References

- Source of these contracts: `docs/standards/quality-gates.md`,
  `docs/standards/coding-standards.md`
- Enforcement commits:
  - `bea935d` → `c129137` (Phase 2.5 service + repository rewire)
  - `180c72f` (Commit 1 — portal guards + hash-safe logout)
  - `68ec45c` (Commit 2 — dev personas + ownership)
- Phase 3 readiness audit: `docs/PHASE-3-READINESS-REPORT.md`
