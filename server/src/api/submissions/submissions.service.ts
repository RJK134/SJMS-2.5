import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/submission.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface SubmissionListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  assessmentId?: string;
  moduleRegistrationId?: string;
  status?: string;
}

export async function list(query: SubmissionListQuery) {
  const { cursor, limit, sort, order, search, assessmentId, moduleRegistrationId, status } = query;
  return repo.list(
    { search, assessmentId, moduleRegistrationId, status },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('Submission', id);
  return result;
}

export async function create(data: Prisma.SubmissionUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('Submission', result.id, 'CREATE', userId, null, result, req);
  emitEvent({
    event: 'submissions.created',
    entityType: 'Submission',
    entityId: result.id,
    actorId: userId,
    data: {
      assessmentId: (result as { assessmentId?: string }).assessmentId ?? null,
      moduleRegistrationId: (result as { moduleRegistrationId?: string }).moduleRegistrationId ?? null,
      status: (result as { status?: string }).status ?? null,
    },
  });
  return result;
}

export async function update(id: string, data: Prisma.SubmissionUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('Submission', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'submissions.updated',
    entityType: 'Submission',
    entityId: id,
    actorId: userId,
    data: {
      assessmentId: (result as { assessmentId?: string }).assessmentId ?? null,
      moduleRegistrationId: (result as { moduleRegistrationId?: string }).moduleRegistrationId ?? null,
      status: (result as { status?: string }).status ?? null,
    },
  });
  const prevStatus = (previous as { status?: string }).status;
  const newStatus = (result as { status?: string }).status;
  if (prevStatus !== newStatus) {
    emitEvent({
      event: 'submissions.status_changed',
      entityType: 'Submission',
      entityId: id,
      actorId: userId,
      data: {
        assessmentId: (result as { assessmentId?: string }).assessmentId ?? null,
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
  await logAudit('Submission', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'submissions.deleted',
    entityType: 'Submission',
    entityId: id,
    actorId: userId,
    data: {
      assessmentId: (previous as { assessmentId?: string }).assessmentId ?? null,
      moduleRegistrationId: (previous as { moduleRegistrationId?: string }).moduleRegistrationId ?? null,
    },
  });
}
