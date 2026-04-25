import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/appeal.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError, ValidationError } from '../../utils/errors';

// Canonical appeals lifecycle. Any hop not listed below is treated as an
// invalid transition. CLOSED is terminal. Refer to docs/assessment-domain.md
// for the regulatory rationale.
const VALID_APPEAL_TRANSITIONS: Record<string, readonly string[]> = {
  SUBMITTED: ['UNDER_REVIEW', 'CLOSED'],
  UNDER_REVIEW: ['HEARING_SCHEDULED', 'DECIDED', 'CLOSED'],
  HEARING_SCHEDULED: ['HEARD', 'CLOSED'],
  HEARD: ['DECIDED', 'CLOSED'],
  DECIDED: ['CLOSED'],
  CLOSED: [],
};

function assertValidAppealTransition(from: string, to: string): void {
  if (from === to) return;
  const allowed = VALID_APPEAL_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw new ValidationError(
      `Invalid appeal status transition: ${from} → ${to}. Allowed from ${from}: ${
        allowed.length ? allowed.join(', ') : '(terminal)'
      }`,
      { status: [`Cannot move an appeal from ${from} to ${to}`] },
    );
  }
}

export interface AppealListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  studentId?: string;
  status?: string;
  appealType?: string;
}

export async function list(query: AppealListQuery) {
  const { cursor, limit, sort, order, studentId, status, appealType } = query;
  return repo.list(
    { studentId, status, appealType },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('Appeal', id);
  return result;
}

export async function create(data: Prisma.AppealUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('Appeal', result.id, 'CREATE', userId, null, result, req);
  emitEvent({
    event: 'appeals.created',
    entityType: 'Appeal',
    entityId: result.id,
    actorId: userId,
    data: { studentId: result.studentId, appealType: result.appealType, status: result.status },
  });
  return result;
}

export async function update(id: string, data: Prisma.AppealUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);

  const newStatus =
    typeof data.status === 'string'
      ? data.status
      : data.status && typeof data.status === 'object' && 'set' in data.status
        ? (data.status as { set: string }).set
        : undefined;
  if (newStatus && newStatus !== previous.status) {
    assertValidAppealTransition(previous.status, newStatus);
  }

  const result = await repo.update(id, data);
  await logAudit('Appeal', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'appeals.updated',
    entityType: 'Appeal',
    entityId: id,
    actorId: userId,
    data: { studentId: result.studentId, appealType: result.appealType, status: result.status },
  });
  if (result.status !== previous.status) {
    emitEvent({
      event: 'appeals.status_changed',
      entityType: 'Appeal',
      entityId: id,
      actorId: userId,
      data: {
        studentId: result.studentId,
        appealType: result.appealType,
        previousStatus: previous.status,
        newStatus: result.status,
        outcome: result.outcome,
      },
    });
  }
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('Appeal', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'appeals.deleted',
    entityType: 'Appeal',
    entityId: id,
    actorId: userId,
    data: { studentId: previous.studentId, status: 'DELETED' },
  });
}
