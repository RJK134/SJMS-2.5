import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/applicationReference.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface ReferenceListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  applicationId?: string;
}

export async function list(query: ReferenceListQuery) {
  const { cursor, limit, sort, order, search, applicationId } = query;
  return repo.list(
    { search, applicationId },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('ApplicationReference', id);
  return result;
}

export async function create(data: Prisma.ApplicationReferenceUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('ApplicationReference', result.id, 'CREATE', userId, null, result, req);
  emitEvent({
    event: 'references.created',
    entityType: 'ApplicationReference',
    entityId: result.id,
    actorId: userId,
    data: { applicationId: result.applicationId },
  });
  return result;
}

export async function update(id: string, data: Prisma.ApplicationReferenceUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('ApplicationReference', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'references.updated',
    entityType: 'ApplicationReference',
    entityId: id,
    actorId: userId,
    data: { applicationId: result.applicationId },
  });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('ApplicationReference', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'references.deleted',
    entityType: 'ApplicationReference',
    entityId: id,
    actorId: userId,
    data: { applicationId: previous.applicationId },
  });
}
