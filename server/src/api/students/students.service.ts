import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/student.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface StudentListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  moduleId?: string;
  feeStatus?: string;
  entryRoute?: string;
}

export async function list(query: StudentListQuery) {
  const { cursor, limit, sort, order, search, moduleId, feeStatus, entryRoute } = query;
  return repo.list(
    { search, moduleId, feeStatus, entryRoute },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('Student', id);
  return result;
}

export async function create(data: Prisma.StudentUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('Student', result.id, 'CREATE', userId, null, result, req);
  emitEvent({
    event: 'students.created',
    entityType: 'Student',
    entityId: result.id,
    actorId: userId,
    data: {
      studentNumber: result.studentNumber,
      feeStatus: result.feeStatus,
      entryRoute: result.entryRoute,
    },
  });
  return result;
}

export async function update(id: string, data: Prisma.StudentUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('Student', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'students.updated',
    entityType: 'Student',
    entityId: id,
    actorId: userId,
    data: {
      studentNumber: result.studentNumber,
      feeStatus: result.feeStatus,
    },
  });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('Student', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'students.deleted',
    entityType: 'Student',
    entityId: id,
    actorId: userId,
    data: { studentNumber: previous.studentNumber },
  });
}
