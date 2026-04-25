import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/clearanceCheck.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface ClearanceCheckListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  applicationId?: string;
  status?: string;
  checkType?: string;
}

export async function list(query: ClearanceCheckListQuery) {
  const { cursor, limit, sort, order, applicationId, status, checkType } = query;
  return repo.list(
    { applicationId, status, checkType },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('ClearanceCheck', id);
  return result;
}

export async function create(data: Prisma.ClearanceCheckUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('ClearanceCheck', result.id, 'CREATE', userId, null, result, req);
  emitEvent({
    event: 'clearance_checks.created',
    entityType: 'ClearanceCheck',
    entityId: result.id,
    actorId: userId,
    data: {
      applicationId: result.applicationId,
      checkType: (result as { checkType?: string }).checkType ?? null,
      status: (result as { status?: string }).status ?? null,
    },
  });
  return result;
}

export async function update(id: string, data: Prisma.ClearanceCheckUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('ClearanceCheck', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'clearance_checks.updated',
    entityType: 'ClearanceCheck',
    entityId: id,
    actorId: userId,
    data: {
      applicationId: result.applicationId,
      checkType: (result as { checkType?: string }).checkType ?? null,
      status: (result as { status?: string }).status ?? null,
    },
  });
  const prevStatus = (previous as { status?: string }).status;
  const newStatus = (result as { status?: string }).status;
  if (prevStatus !== newStatus) {
    emitEvent({
      event: 'clearance_checks.status_changed',
      entityType: 'ClearanceCheck',
      entityId: id,
      actorId: userId,
      data: {
        applicationId: result.applicationId,
        previousStatus: prevStatus,
        newStatus,
      },
    });
  }
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('ClearanceCheck', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'clearance_checks.deleted',
    entityType: 'ClearanceCheck',
    entityId: id,
    actorId: userId,
    data: { applicationId: previous.applicationId },
  });
}
