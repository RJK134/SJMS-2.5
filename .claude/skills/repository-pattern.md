# Repository Pattern — SJMS 2.5

> Established in Phase 2.5 (architecture remediation, commits `bea935d`
> through `c129137`). 44 services now flow through 44 repositories; zero
> services import `prisma` directly.

## Location

**All repositories live in `server/src/repositories/`**, one file per domain:

```
server/src/repositories/
├── student.repository.ts
├── enrolment.repository.ts
├── programme.repository.ts
├── attendance.repository.ts
├── ... (44 total)
```

**Services MUST import from their matching repository**, never from
`utils/prisma` directly:

```ts
// ✅ CORRECT — server/src/api/enrolments/enrolments.service.ts
import * as repo from '../../repositories/enrolment.repository';

// ❌ FORBIDDEN — service bypasses the repository layer
import prisma from '../../utils/prisma';
```

### Enforcement grep

```bash
grep -r "from.*utils/prisma" server/src/api --include="*.service.ts" | wc -l
```

Must return **0**. This is a blocking pre-commit check.

## Required exports

Every repository exposes at minimum:

| Function | Signature | Purpose |
|---|---|---|
| `list` | `(filters: XFilters, pagination: PaginationParams) => Promise<PaginatedResponse<X>>` | Filtered, paginated list — applies `deletedAt: null` by default |
| `getById` | `(id: string) => Promise<X \| null>` | Single record with useful includes; filters `deletedAt: null` |
| `create` | `(data: Prisma.XUncheckedCreateInput) => Promise<X>` | Create with `$transaction` if side-effects needed |
| `update` | `(id: string, data: Prisma.XUpdateInput) => Promise<X>` | Simple update; no `deletedAt` filter (repo-level can still target deleted rows if needed) |
| `softDelete` | `(id: string) => Promise<X>` | Sets `deletedAt: new Date()` — never `prisma.X.delete()` |

Models without `deletedAt` (e.g. append-only logs, reference data) export
the same functions but omit `softDelete`.

## Typed inputs

**Never `data: any`.** Use Prisma's generated types:

- `Prisma.<Model>UncheckedCreateInput` — flat foreign-key IDs (preferred for API input, matches JSON request bodies)
- `Prisma.<Model>CreateInput` — nested relation writes (rarely needed for API work)
- `Prisma.<Model>UpdateInput` — partial update
- `Prisma.<Model>WhereInput` — filter object

Define a local filter interface for list queries:

```ts
export interface EnrolmentFilters {
  studentId?: string;
  programmeId?: string;
  academicYear?: string;
  status?: string;
}
```

Export it — the matching service imports it to build its own `XListQuery` interface.

### Enforcement grep

```bash
grep -rn "data: any" server/src/api --include="*.service.ts" | wc -l
```

Must return **0**.

## Soft-delete filtering

Every list query filters out soft-deleted rows by default:

```ts
const where: Prisma.EnrolmentWhereInput = {
  deletedAt: null,
  ...(filters.studentId && { studentId: filters.studentId }),
  // ...
};
```

`getById` uses `findFirst({ where: { id, deletedAt: null } })` rather than
`findUnique({ where: { id } })` — this means a soft-deleted row returns
`null` and the service's `NotFoundError` path fires instead of returning a
tombstone.

## Transactions

Any mutation with a side-effect **must** use `prisma.$transaction`:

```ts
export async function create(data: Prisma.EnrolmentUncheckedCreateInput) {
  return prisma.$transaction(async (tx) => {
    const enrolment = await tx.enrolment.create({ data, include: defaultInclude });
    await tx.enrolmentStatusHistory.create({
      data: {
        enrolmentId: enrolment.id,
        previousStatus: 'ENROLLED',
        newStatus: enrolment.status,
        changeDate: new Date(),
        reason: 'Initial enrolment',
        changedBy: data.createdBy ?? 'system',
      },
    });
    return enrolment;
  });
}
```

Rule: **if the mutation writes to more than one table, it must be in a transaction.**

## Canonical example — `enrolment.repository.ts`

Copy this shape for new repositories:

```ts
import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';
import { type Prisma, type EnrolmentStatus } from '@prisma/client';

export interface EnrolmentFilters {
  studentId?: string;
  programmeId?: string;
  academicYear?: string;
  status?: string;
}

const defaultInclude = {
  student: { include: { person: true } },
  programme: true,
} as const;

export async function list(filters: EnrolmentFilters = {}, pagination: PaginationParams) {
  const where: Prisma.EnrolmentWhereInput = {
    deletedAt: null,
    ...(filters.studentId && { studentId: filters.studentId }),
    ...(filters.programmeId && { programmeId: filters.programmeId }),
    ...(filters.academicYear && { academicYear: filters.academicYear }),
    ...(filters.status && { status: filters.status as any }),
  };

  const [data, total] = await Promise.all([
    prisma.enrolment.findMany({
      where,
      include: defaultInclude,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.enrolment.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
}

export async function getById(id: string) {
  return prisma.enrolment.findFirst({
    where: { id, deletedAt: null },
    include: {
      ...defaultInclude,
      moduleRegistrations: { include: { module: true }, where: { deletedAt: null } },
      statusHistory: { orderBy: { changeDate: 'desc' } },
    },
  });
}

export async function create(data: Prisma.EnrolmentUncheckedCreateInput) {
  return prisma.$transaction(async (tx) => {
    const enrolment = await tx.enrolment.create({ data, include: defaultInclude });
    await tx.enrolmentStatusHistory.create({
      data: {
        enrolmentId: enrolment.id,
        previousStatus: 'ENROLLED',
        newStatus: enrolment.status,
        changeDate: new Date(),
        reason: 'Initial enrolment',
        changedBy: data.createdBy ?? 'system',
      },
    });
    return enrolment;
  });
}

export async function update(id: string, data: Prisma.EnrolmentUpdateInput) {
  return prisma.enrolment.update({ where: { id }, data, include: defaultInclude });
}

export async function softDelete(id: string) {
  return prisma.enrolment.update({ where: { id }, data: { deletedAt: new Date() } });
}
```

Extra domain-specific functions (`changeStatus`, `getModuleRegistrations`,
etc.) belong in the repository — NOT in the service. The service stays a
thin audit + event-emission wrapper; the repository owns all Prisma access.

## Service wrapper shape

The matching service is a thin pass-through:

```ts
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
  // ...
}

export async function list(query: EnrolmentListQuery) {
  const { page, limit, sort, order, studentId /* ... */ } = query;
  return repo.list(
    { studentId /* ... */ },
    { page, limit, skip: (page - 1) * limit, sort, order },
  );
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

// update / remove follow the same shape: call repo, audit, emit event
```

See `.claude/skills/api-module-pattern.md` for the full router +
controller + schema skeleton.

## References

- Canonical example: `server/src/repositories/enrolment.repository.ts`
- Full list: `ls server/src/repositories/*.repository.ts` (44 files)
- Phase 2.5 remediation handoff: `docs/SESSION-HANDOFF-2026-04-11-remediation.md`
- Commit chain that established the pattern: `bea935d` → `c129137`
