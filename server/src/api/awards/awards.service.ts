import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/awardRecord.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface AwardListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  studentId?: string;
  programmeId?: string;
  classification?: string;
}

export async function list(query: AwardListQuery) {
  const { cursor, limit, sort, order, studentId, programmeId, classification } = query;
  return repo.list(
    { studentId, programmeId, classification },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('AwardRecord', id);
  return result;
}

export async function create(data: Prisma.AwardRecordUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('AwardRecord', result.id, 'CREATE', userId, null, result, req);
  emitEvent({
    event: 'awards.created',
    entityType: 'AwardRecord',
    entityId: result.id,
    actorId: userId,
    data: { studentId: result.studentId, programmeId: result.programmeId, classification: result.classification },
  });
  return result;
}

export async function update(id: string, data: Prisma.AwardRecordUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('AwardRecord', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'awards.updated',
    entityType: 'AwardRecord',
    entityId: id,
    actorId: userId,
    data: { studentId: result.studentId, programmeId: result.programmeId, classification: result.classification },
  });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('AwardRecord', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'awards.deleted',
    entityType: 'AwardRecord',
    entityId: id,
    actorId: userId,
    data: { studentId: previous.studentId, status: 'DELETED' },
  });
}
