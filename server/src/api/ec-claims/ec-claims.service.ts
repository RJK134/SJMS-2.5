import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/ecClaim.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface ECClaimListQuery {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  studentId?: string;
  status?: string;
  claimType?: string;
}

export async function list(query: ECClaimListQuery) {
  const { page, limit, sort, order, studentId, status, claimType } = query;
  return repo.list(
    { studentId, status, claimType },
    { page, limit, skip: (page - 1) * limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('ECClaim', id);
  return result;
}

export async function create(data: Prisma.ECClaimUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('ECClaim', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('ec_claims.created', { id: result.id });
  return result;
}

export async function update(id: string, data: Prisma.ECClaimUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('ECClaim', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('ec_claims.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('ECClaim', id, 'DELETE', userId, previous, null, req);
  await emitEvent('ec_claims.deleted', { id });
}
