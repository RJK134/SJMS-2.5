# SJMS 2.5 API Patterns

## Module Structure

Every domain module lives in `server/src/api/{domain}/` with four files:

```
server/src/api/students/
├── students.router.ts    ← Express routes + middleware
├── students.controller.ts ← Thin request handlers
├── students.service.ts    ← Business logic + Prisma queries
└── students.schema.ts     ← Zod validation schemas
```

---

## Router Pattern

```typescript
import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { scopeToUser } from '../../middleware/data-scope';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './students.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './students.schema';

export const studentsRouter = Router();

// Sub-routes BEFORE parameterised routes (Express matches first)
studentsRouter.get('/alerts', validateQuery(alertsSchema), requireRole(...ROLE_GROUPS.ADMIN_STAFF), ctrl.listAlerts);

// Standard CRUD
studentsRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), scopeToUser('studentId'), ctrl.list);
studentsRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), ctrl.getById);
studentsRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.REGISTRY), ctrl.create);
studentsRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.REGISTRY), ctrl.update);
studentsRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
```

**Key rules:**
- Sub-routes (`/alerts`, `/contact-points`) go BEFORE `/:id` to avoid being swallowed.
- Student-accessible list endpoints use `scopeToUser()` after `requireRole(...ALL_AUTHENTICATED)`.
- Write operations require domain-specific roles (REGISTRY, FINANCE, TEACHING).
- Delete always requires SUPER_ADMIN.

---

## Controller Pattern

Controllers are thin — no business logic, just request → service → response:

```typescript
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.list(req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.create(req.body, req.user?.sub ?? 'system', req);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}
```

---

## Service Pattern

Services contain business logic, Prisma queries, audit logging, and webhook events:

```typescript
export async function list(query: Record<string, any>) {
  const { page, limit, sort, order, search, ...filters } = query;
  const skip = (page - 1) * limit;
  const where: Record<string, any> = {
    deletedAt: null,
    ...(search ? { OR: [...] } : {}),
    ...(filters.status ? { status: filters.status } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.student.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any }),
    prisma.student.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

export async function create(data: any, userId: string, req: Request) {
  const result = await prisma.student.create({ data });
  await logAudit('Student', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('students.created', { id: result.id });
  return result;
}
```

**Rules:**
- Every mutation calls `logAudit()` with before/after snapshots.
- Every mutation calls `emitEvent()` for n8n webhook.
- Soft delete: `update({ data: { deletedAt: new Date() } })`, not `delete()`.
- List queries always filter `deletedAt: null`.

---

## Schema (Zod) Pattern

```typescript
export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  // domain-specific filters:
  status: z.string().optional(),
  academicYear: z.string().optional(),
});

export const createSchema = z.object({
  // required fields with validation
  feeStatus: z.enum(['HOME', 'OVERSEAS', 'EU_TRANSITIONAL']),
  originalEntryDate: z.coerce.date(),
  personId: z.string().min(1),
});

export const updateSchema = createSchema.partial();
```

---

## Response Format

All endpoints return:

```json
// List
{ "success": true, "data": [...], "pagination": { "page": 1, "limit": 25, "total": 150, "totalPages": 6, "hasNext": true, "hasPrev": false } }

// Detail
{ "success": true, "data": { ... } }

// Error
{ "status": "error", "code": "VALIDATION_ERROR", "message": "...", "errors": { "field": ["message"] } }
```

---

## Middleware Stack (request order)

```
Request → helmet → CORS → JSON parser → morgan logger → rate limiter →
authenticateJWT → validateQuery/Params/Body → requireRole → scopeToUser →
controller → service → response
                                                          ↓ (on error)
                                                    errorHandler
```

---

## Role Groups

| Group | Use Case |
|-------|----------|
| `SUPER_ADMIN` | Delete operations only |
| `ADMIN_STAFF` | All admin portal list/detail endpoints |
| `REGISTRY` | Student/enrolment create/update |
| `ADMISSIONS` | Application processing |
| `FINANCE` | Financial operations |
| `TEACHING` | Attendance, marks, modules |
| `COMPLIANCE` | UKVI operations |
| `SUPPORT` | Student support tickets |
| `ALL_AUTHENTICATED` | List endpoints with scopeToUser() |

---

## Adding a New Endpoint

1. Create 4 files in `server/src/api/{domain}/`
2. Add Zod schemas (query + params + create + update)
3. Service: Prisma query + `logAudit()` + `emitEvent()`
4. Router: middleware chain with correct role group
5. Import and mount in `server/src/api/index.ts`
6. Sub-routes go BEFORE `/:id`
