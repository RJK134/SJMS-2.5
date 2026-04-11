# API Module Pattern — SJMS 2.5

> Every domain API is a self-contained module under `server/src/api/<domain>/`
> with a matching repository in `server/src/repositories/`. Mounted in
> `server/src/api/index.ts`. 44 modules currently; target ~45 for Phase 3.

## File layout

```
server/src/api/<domain>/
├── <domain>.router.ts       ← Express routes + middleware chain
├── <domain>.controller.ts   ← Request handling, response shaping
├── <domain>.service.ts      ← Business logic, audit + event emission
└── <domain>.schema.ts       ← Zod validation schemas

server/src/repositories/
└── <domain>.repository.ts   ← All Prisma access for this domain
```

Five files total. `repository.ts` is deliberately **not co-located** with
the module — it lives under `server/src/repositories/` so the
`utils/prisma` import is firewalled away from the API layer. See
`.claude/skills/repository-pattern.md`.

## Size budgets

| File | Soft limit | Hard limit |
|---|---|---|
| `router.ts` | 150 lines | 300 lines |
| `controller.ts` | 100 lines | 250 lines |
| `service.ts` | 200 lines | 500 lines |
| `repository.ts` | 200 lines | 500 lines |
| `schema.ts` | 100 lines | 300 lines |

If a file crosses the hard limit, split the module into two along a
natural domain boundary (e.g. `finance` split into `finance` +
`finance-transactions`). Do not concatenate unrelated concerns into a
single large module — the split is cheap, the refactor later is not.

## Router skeleton

```ts
// server/src/api/enrolments/enrolments.router.ts
import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { scopeToUser, requireOwnership, ownerLookup } from '../../middleware/data-scope';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './enrolments.controller';
import {
  createSchema,
  updateSchema,
  querySchema,
  paramsSchema,
} from './enrolments.schema';

export const enrolmentsRouter = Router();

//            path            zod             role                                  data-scope                                 handler
enrolmentsRouter.get(   '/',       validateQuery(querySchema),  requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), scopeToUser('studentId'),                   ctrl.list);
enrolmentsRouter.get(   '/:id',    validateParams(paramsSchema),requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), requireOwnership(ownerLookup.enrolment),    ctrl.getById);
enrolmentsRouter.post(  '/',       validate(createSchema),      requireRole(...ROLE_GROUPS.REGISTRY),                                                      ctrl.create);
enrolmentsRouter.patch( '/:id',    validateParams(paramsSchema),validate(updateSchema), requireRole(...ROLE_GROUPS.REGISTRY),                              ctrl.update);
enrolmentsRouter.delete('/:id',    validateParams(paramsSchema),requireRole(...ROLE_GROUPS.SUPER_ADMIN),                                                   ctrl.remove);
```

### Rules

1. **Every route ends with `ctrl.<handlerName>`.** No inline handlers.
2. **Every mutating route (POST/PUT/PATCH) uses `validate(<schema>)`** before the role guard. Zod validates the body; the parsed object replaces `req.body`.
3. **Every `/:id` route uses `validateParams(paramsSchema)`** to enforce the id shape.
4. **Every list route uses `validateQuery(<querySchema>)`** — this turns `req.query` into a typed parsed object the service can destructure.
5. **Every route has `requireRole(...ROLE_GROUPS.<GROUP>)`.** No public routes. See `.claude/skills/keycloak-roles.md` for the group → module matrix.
6. **Student-accessible list routes add `scopeToUser('studentId')` or `scopeToUser('personId')`** after `requireRole`. This injects a `studentId` / `personId` filter for non-admin, non-teaching users.
7. **Student-accessible detail routes add `requireOwnership(ownerLookup.<model>)`** after `requireRole`. This enforces that the authenticated student owns the record being fetched.
8. **DELETE routes are always `requireRole(...ROLE_GROUPS.SUPER_ADMIN)`.** Soft deletes are a privileged operation even though they are reversible.

## Controller skeleton

```ts
// server/src/api/enrolments/enrolments.controller.ts
import type { Request, Response, NextFunction } from 'express';
import * as service from './enrolments.service';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.list(req.query as unknown as service.EnrolmentListQuery);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const data = await service.getById(id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.create(req.body, req.user?.sub ?? 'system', req);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}

// update → 200 with data, remove → 204 no content
```

Controllers are deliberately boring. They:
1. Extract params / body / query.
2. Cast `req.query` to the typed `XListQuery` interface exported by the service (runtime type is already enforced by `validateQuery`).
3. Call the service function, passing `req.user?.sub` as the `userId` and `req` for audit context.
4. Shape the response — `{ success: true, data }` for reads, `{ success: true, data }` with a `201` for creates, `204` for deletes.
5. Forward errors to Express's error handler with `next(err)`.

**Controllers must not contain business logic.** Any conditional beyond "status code" belongs in the service.

## Service skeleton

```ts
// server/src/api/enrolments/enrolments.service.ts
import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/enrolment.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface EnrolmentListQuery {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  studentId?: string;
  programmeId?: string;
  academicYear?: string;
  status?: string;
}

export async function list(query: EnrolmentListQuery) {
  const { page, limit, sort, order, studentId, programmeId, academicYear, status } = query;
  return repo.list(
    { studentId, programmeId, academicYear, status },
    { page, limit, skip: (page - 1) * limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('Enrolment', id);
  return result;
}

export async function create(
  data: Prisma.EnrolmentUncheckedCreateInput,
  userId: string,
  req: Request,
) {
  const result = await repo.create({ ...data, createdBy: userId });
  await logAudit('Enrolment', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('enrolments.created', { id: result.id });
  return result;
}

export async function update(
  id: string,
  data: Prisma.EnrolmentUpdateInput,
  userId: string,
  req: Request,
) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('Enrolment', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('enrolments.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('Enrolment', id, 'DELETE', userId, previous, null, req);
  await emitEvent('enrolments.deleted', { id });
}
```

### Rules

1. **Every mutation calls `logAudit(entityType, entityId, action, userId, previous, next, req)`** — CREATE, UPDATE, DELETE, and any custom mutation (e.g. `changeStatus`, `submitMark`). Read-only operations do not audit unless explicitly requested.
2. **Every mutation calls `emitEvent('<module>.<action>', payload)`** — CREATE, UPDATE, DELETE. Event names are snake_case + dot-separated, e.g. `enrolments.created`, `marks.confirmed`, `ec_claims.approved`. These are consumed by n8n webhooks.
3. **Services never import `prisma` directly.** All data access goes through the repository.
4. **Every service exports a typed `XListQuery` interface.** Controllers cast `req.query` to it at the I/O boundary.
5. **`getById` throws `NotFoundError`** if the record is missing. Never return `null` from the service — that's a repository responsibility.

## Schema skeleton

```ts
// server/src/api/enrolments/enrolments.schema.ts
import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  studentId: z.string().optional(),
  programmeId: z.string().optional(),
  academicYear: z.string().optional(),
  status: z.string().optional(),
});

export const createSchema = z.object({
  studentId: z.string().min(1),
  programmeId: z.string().min(1),
  academicYear: z.string().regex(/^\d{4}\/\d{2}$/),
  yearOfStudy: z.number().int().min(1).max(6),
  modeOfStudy: z.enum(['FULL_TIME', 'PART_TIME', 'SANDWICH', 'DISTANCE', 'BLOCK_RELEASE']),
  startDate: z.coerce.date(),
  feeStatus: z.enum(['HOME', 'OVERSEAS', 'EU_TRANSITIONAL', 'ISLANDS', 'CHANNEL_ISLANDS']),
});

export const updateSchema = createSchema.partial();
```

### Rules

1. **Query schemas coerce numeric params.** `z.coerce.number()` on `page` / `limit`, `z.enum(['asc', 'desc'])` on `order`, etc.
2. **`limit` is capped at 100.** Never allow a client to request more in a single page.
3. **Boolean query params use `.transform(v => v === 'true')`** — `z.enum(['true', 'false']).optional().transform(...)` — because HTTP query strings deliver booleans as strings. This was a real regression fix in commit `4f24e20` (notifications isRead).
4. **`updateSchema = createSchema.partial()`** — standard pattern for PATCH.
5. **Enums match the Prisma enum exactly.** Do not invent intermediate API enums.

## Registration

Add the router to `server/src/api/index.ts`:

```ts
import { enrolmentsRouter } from './enrolments/enrolments.router';
// ...
apiV1Router.use('/enrolments', enrolmentsRouter);
```

And to the OpenAPI spec at `server/src/utils/openapi.ts` (add an entry to
the `modules` array with `path`, `tag`, `description`, `createSchema`,
`hasDelete`).

## Pre-commit verification

```bash
# No raw prisma in services
grep -rn "from.*utils/prisma" server/src/api --include="*.service.ts"
# → expect zero

# No untyped data in services
grep -rn "data: any" server/src/api --include="*.service.ts"
# → expect zero

# Every POST/PUT/PATCH has validate()
grep -rnE "\.(post|put|patch)\(" server/src/api --include="*.router.ts" | grep -v "validate("
# → expect zero

# Every route has requireRole
grep -rnE "\.(get|post|put|patch|delete)\(" server/src/api --include="*.router.ts" | grep -v "requireRole"
# → expect zero

# Type check
cd server && npx tsc --noEmit
# → expect zero errors
```

## References

- Canonical example: `server/src/api/enrolments/` (4 files) +
  `server/src/repositories/enrolment.repository.ts` (1 file)
- Middleware: `server/src/middleware/validate.ts`,
  `server/src/middleware/auth.ts`,
  `server/src/middleware/data-scope.ts`
- Mounting: `server/src/api/index.ts`
- Role group definitions: `server/src/constants/roles.ts`
- OpenAPI registration: `server/src/utils/openapi.ts`
