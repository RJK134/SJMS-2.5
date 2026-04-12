import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/offerCondition.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface OfferListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  applicationId?: string;
  status?: string;
}

export async function list(query: OfferListQuery) {
  const { cursor, limit, sort, order, applicationId, status } = query;
  return repo.list(
    { applicationId, status },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('OfferCondition', id);
  return result;
}

export async function create(data: Prisma.OfferConditionUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('OfferCondition', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('offers.created', { id: result.id });
  return result;
}

export async function update(id: string, data: Prisma.OfferConditionUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('OfferCondition', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('offers.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('OfferCondition', id, 'DELETE', userId, previous, null, req);
  await emitEvent('offers.deleted', { id });
}
