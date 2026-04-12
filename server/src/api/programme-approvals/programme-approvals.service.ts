import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/programmeApproval.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface ProgrammeApprovalListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  programmeId?: string;
  status?: string;
  approvalType?: string;
}

export async function list(query: ProgrammeApprovalListQuery) {
  const { cursor, limit, sort, order, programmeId, status, approvalType } = query;
  return repo.list(
    { programmeId, status, approvalType },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('ProgrammeApproval', id);
  return result;
}

export async function create(data: Prisma.ProgrammeApprovalUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('ProgrammeApproval', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('programme_approvals.created', { id: result.id });
  return result;
}

export async function update(id: string, data: Prisma.ProgrammeApprovalUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('ProgrammeApproval', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('programme_approvals.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('ProgrammeApproval', id, 'DELETE', userId, previous, null, req);
  await emitEvent('programme_approvals.deleted', { id });
}
