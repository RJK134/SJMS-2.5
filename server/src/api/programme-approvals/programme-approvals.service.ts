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
  emitEvent({
    event: 'programme_approval.submitted',
    entityType: 'ProgrammeApproval',
    entityId: result.id,
    actorId: userId,
    data: {
      programmeId: result.programmeId,
      stage: result.stage,
      status: result.status,
    },
  });
  return result;
}

export async function update(id: string, data: Prisma.ProgrammeApprovalUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('ProgrammeApproval', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'programme_approval.updated',
    entityType: 'ProgrammeApproval',
    entityId: id,
    actorId: userId,
    data: {
      programmeId: result.programmeId,
      stage: result.stage,
      status: result.status,
    },
  });
  if (result.status !== previous.status) {
    emitEvent({
      event: 'programme_approval.decision_made',
      entityType: 'ProgrammeApproval',
      entityId: id,
      actorId: userId,
      data: {
        programmeId: result.programmeId,
        stage: result.stage,
        previousStatus: previous.status,
        newStatus: result.status,
        comments: result.comments,
      },
    });
  }
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('ProgrammeApproval', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'programme_approval.deleted',
    entityType: 'ProgrammeApproval',
    entityId: id,
    actorId: userId,
    data: {
      programmeId: previous.programmeId,
      stage: previous.stage,
    },
  });
}
