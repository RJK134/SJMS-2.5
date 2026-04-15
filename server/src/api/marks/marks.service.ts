import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/assessmentAttempt.repository';
import * as assessmentRepo from '../../repositories/assessment.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError, ValidationError } from '../../utils/errors';

/** Validate that rawMark and finalMark do not exceed the assessment's maxMark. */
async function validateMarkBounds(assessmentId: string, rawMark?: number | null, finalMark?: number | null): Promise<void> {
  if (rawMark == null && finalMark == null) return;
  const assessment = await assessmentRepo.getById(assessmentId);
  if (!assessment) throw new NotFoundError('Assessment', assessmentId);
  const max = assessment.maxMark != null ? Number(assessment.maxMark) : null;
  if (max == null) return; // no maxMark defined on assessment — skip validation
  if (rawMark != null && Number(rawMark) > max) {
    throw new ValidationError(`rawMark (${rawMark}) exceeds assessment maximum of ${max}`);
  }
  if (finalMark != null && Number(finalMark) > max) {
    throw new ValidationError(`finalMark (${finalMark}) exceeds assessment maximum of ${max}`);
  }
}

export interface MarkListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  studentId?: string;
  assessmentId?: string;
  moduleRegistrationId?: string;
  attemptNumber?: number;
  status?: string;
}

export async function list(query: MarkListQuery) {
  const { cursor, limit, sort, order, studentId, assessmentId, moduleRegistrationId, attemptNumber, status } = query;
  return repo.list(
    { studentId, assessmentId, moduleRegistrationId, attemptNumber, status },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('AssessmentAttempt', id);
  return result;
}

export async function create(data: Prisma.AssessmentAttemptUncheckedCreateInput, userId: string, req: Request) {
  await validateMarkBounds(data.assessmentId, data.rawMark as number | undefined, data.finalMark as number | undefined);
  const result = await repo.create(data);
  await logAudit('AssessmentAttempt', result.id, 'CREATE', userId, null, result, req);
  const createEventMap: Record<string, string> = {
    SUBMITTED: 'marks.submitted',
    PENDING: 'marks.created',
    GRADED: 'marks.graded',
    RATIFIED: 'marks.ratified',
  };
  const createEvent = createEventMap[result.status] ?? 'marks.created';
  emitEvent({
    event: createEvent,
    entityType: 'AssessmentAttempt',
    entityId: result.id,
    actorId: userId,
    data: {
      assessmentId: result.assessmentId,
      moduleRegistrationId: result.moduleRegistrationId,
      attemptNumber: result.attemptNumber,
      status: result.status,
    },
  });
  return result;
}

export async function update(id: string, data: Prisma.AssessmentAttemptUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  await validateMarkBounds(previous.assessmentId, data.rawMark as number | undefined, data.finalMark as number | undefined);
  const result = await repo.update(id, data);
  await logAudit('AssessmentAttempt', id, 'UPDATE', userId, previous, result, req);

  // Map AttemptStatus transitions to domain-specific marks events
  if (result.status !== previous.status) {
    const statusEventMap: Record<string, string> = {
      SUBMITTED: 'marks.submitted',
      MODERATED: 'marks.moderated',
      CONFIRMED: 'marks.ratified',
    };
    const specificEvent = statusEventMap[result.status];
    if (specificEvent) {
      emitEvent({
        event: specificEvent,
        entityType: 'AssessmentAttempt',
        entityId: id,
        actorId: userId,
        data: {
          assessmentId: result.assessmentId,
          moduleRegistrationId: result.moduleRegistrationId,
          attemptNumber: result.attemptNumber,
          rawMark: result.rawMark != null ? Number(result.rawMark) : null,
          moderatedMark: result.moderatedMark != null ? Number(result.moderatedMark) : null,
          finalMark: result.finalMark != null ? Number(result.finalMark) : null,
          grade: result.grade,
          previousStatus: previous.status,
          newStatus: result.status,
        },
      });
    }
  }

  // marks.released: finalMark and grade populated for the first time
  // (typically after exam board ratification confirms the result)
  if (
    result.finalMark != null &&
    result.grade != null &&
    (previous.finalMark == null || previous.grade == null)
  ) {
    emitEvent({
      event: 'marks.released',
      entityType: 'AssessmentAttempt',
      entityId: id,
      actorId: userId,
      data: {
        assessmentId: result.assessmentId,
        moduleRegistrationId: result.moduleRegistrationId,
        finalMark: Number(result.finalMark),
        grade: result.grade,
        outcome: result.status,
      },
    });
  }

  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('AssessmentAttempt', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'marks.deleted',
    entityType: 'AssessmentAttempt',
    entityId: id,
    actorId: userId,
    data: {
      assessmentId: previous.assessmentId,
      moduleRegistrationId: previous.moduleRegistrationId,
      status: 'DELETED',
    },
  });
}
