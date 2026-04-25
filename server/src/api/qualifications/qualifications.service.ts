import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/applicationQualification.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface QualificationListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  applicationId?: string;
}

export async function list(query: QualificationListQuery) {
  const { cursor, limit, sort, order, search, applicationId } = query;
  return repo.list(
    { search, applicationId },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('ApplicationQualification', id);
  return result;
}

export async function create(data: Prisma.ApplicationQualificationUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('ApplicationQualification', result.id, 'CREATE', userId, null, result, req);
  emitEvent({
    event: 'qualifications.created',
    entityType: 'ApplicationQualification',
    entityId: result.id,
    actorId: userId,
    data: { applicationId: result.applicationId },
  });
  return result;
}

export async function update(id: string, data: Prisma.ApplicationQualificationUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('ApplicationQualification', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'qualifications.updated',
    entityType: 'ApplicationQualification',
    entityId: id,
    actorId: userId,
    data: { applicationId: result.applicationId },
  });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('ApplicationQualification', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'qualifications.deleted',
    entityType: 'ApplicationQualification',
    entityId: id,
    actorId: userId,
    data: { applicationId: previous.applicationId },
  });
}
