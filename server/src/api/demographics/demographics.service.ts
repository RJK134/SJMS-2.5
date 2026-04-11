import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/personDemographic.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface DemographicListQuery {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  personId?: string;
}

export async function list(query: DemographicListQuery) {
  const { page, limit, sort, order, personId } = query;
  return repo.list(
    { personId },
    { page, limit, skip: (page - 1) * limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('PersonDemographic', id);
  return result;
}

export async function create(data: Prisma.PersonDemographicUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('PersonDemographic', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('demographics.created', { id: result.id });
  return result;
}

export async function update(id: string, data: Prisma.PersonDemographicUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('PersonDemographic', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('demographics.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('PersonDemographic', id, 'DELETE', userId, previous, null, req);
  await emitEvent('demographics.deleted', { id });
}
