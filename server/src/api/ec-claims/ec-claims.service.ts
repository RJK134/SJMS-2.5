import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/ecClaim.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface ECClaimListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  studentId?: string;
  status?: string;
}

export async function list(query: ECClaimListQuery) {
  const { cursor, limit, sort, order, studentId, status } = query;
  return repo.list(
    { studentId, status },
    { cursor, limit, sort, order },
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
  emitEvent({
    event: 'ec_claim.submitted',
    entityType: 'ECClaim',
    entityId: result.id,
    actorId: userId,
    data: {
      studentId: result.studentId,
      moduleRegistrationId: result.moduleRegistrationId,
      reason: result.reason,
      status: result.status,
    },
  });
  return result;
}

export async function update(id: string, data: Prisma.ECClaimUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('ECClaim', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'ec_claim.updated',
    entityType: 'ECClaim',
    entityId: id,
    actorId: userId,
    data: {
      studentId: result.studentId,
      moduleRegistrationId: result.moduleRegistrationId,
      status: result.status,
    },
  });
  if (result.status !== previous.status) {
    emitEvent({
      event: 'ec_claim.status_changed',
      entityType: 'ECClaim',
      entityId: id,
      actorId: userId,
      data: {
        studentId: result.studentId,
        previousStatus: previous.status,
        newStatus: result.status,
        decision: result.decision,
      },
    });
  }
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('ECClaim', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'ec_claim.deleted',
    entityType: 'ECClaim',
    entityId: id,
    actorId: userId,
    data: {
      studentId: previous.studentId,
      moduleRegistrationId: previous.moduleRegistrationId,
    },
  });
}
