import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/assessmentAttempt.repository';
import * as assessmentRepo from '../../repositories/assessment.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError, ValidationError } from '../../utils/errors';
import { resolveGradeFromMark } from '../../utils/grade-boundaries';

// ── Lifecycle state machine (Phase 17A) ───────────────────────────────────
//
// Canonical transition graph for AssessmentAttempt.status. Mirrors the
// Phase 13b pattern in appeals.service.ts and the Phase 16A pattern in
// applications.service.ts. The schema enum (prisma/schema.prisma:290)
// is the source of truth: PENDING | SUBMITTED | MARKED | MODERATED |
// CONFIRMED | REFERRED | DEFERRED.
//
// CONFIRMED is a TERMINAL state. Once an attempt is confirmed by an exam
// board, the row is immutable in lifecycle terms — any post-confirmation
// correction (plagiarism finding, missed mark, board decision overturned)
// must be expressed as a fresh AssessmentAttempt row, not by re-marking
// the existing one. This protects the "confirmed marks are immutable"
// guarantee that auditors and exam-board minutes assume.
//
// REFERRED and DEFERRED are explicit cycle states. Both flow back to
// SUBMITTED on resit / late submission, then progress through the graph
// again as a separate attempt instance.
type AttemptStatusName =
  | 'PENDING'
  | 'SUBMITTED'
  | 'MARKED'
  | 'MODERATED'
  | 'CONFIRMED'
  | 'REFERRED'
  | 'DEFERRED';

const VALID_ATTEMPT_TRANSITIONS: Record<AttemptStatusName, readonly AttemptStatusName[]> = {
  PENDING: ['SUBMITTED', 'DEFERRED'],
  SUBMITTED: ['MARKED', 'DEFERRED'],
  MARKED: ['MODERATED', 'DEFERRED'],
  MODERATED: ['CONFIRMED', 'REFERRED', 'DEFERRED'],
  CONFIRMED: [], // terminal — no outgoing transitions
  REFERRED: ['SUBMITTED'],
  DEFERRED: ['SUBMITTED'],
};

function assertValidAttemptTransition(from: AttemptStatusName, to: AttemptStatusName): void {
  const allowed = VALID_ATTEMPT_TRANSITIONS[from];
  if (!allowed || !allowed.includes(to)) {
    throw new ValidationError(`Invalid attempt status transition: ${from} → ${to}`);
  }
}

/**
 * Pulls the destination status off a Prisma update payload, handling both
 * the bare-value form `{status: 'MARKED'}` and the wrapped form
 * `{status: {set: 'MARKED'}}`. Returns undefined if status is absent.
 */
function extractIncomingStatus(field: Prisma.AssessmentAttemptUpdateInput['status']): string | undefined {
  if (field === undefined) return undefined;
  if (typeof field === 'string') return field;
  if (typeof field === 'object' && field !== null && 'set' in field) {
    const set = (field as { set?: string }).set;
    return typeof set === 'string' ? set : undefined;
  }
  return undefined;
}

/** Validate that rawMark and finalMark do not exceed the assessment's maxMark. */
async function validateMarkBounds(assessmentId: string, rawMark?: number | null, finalMark?: number | null): Promise<void> {
  if (rawMark == null && finalMark == null) return;
  const assessment = await assessmentRepo.getById(assessmentId);
  if (!assessment) throw new NotFoundError('Assessment', assessmentId);
  const max = assessment.maxMark != null ? Number(assessment.maxMark) : null;
  if (max == null) return;
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

  if (data.finalMark != null && !data.grade && data.assessmentId) {
    const autoGrade = await resolveGradeFromMark(data.assessmentId, Number(data.finalMark));
    if (autoGrade) {
      data.grade = autoGrade;
    }
  }

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

  // Phase 17A — enforce the canonical attempt status transition graph.
  // Only runs when the caller actually supplies a status field and the
  // value differs from the existing record. No-op on every other path,
  // so unrelated update calls (e.g. mark adjustments without status
  // change) are unaffected.
  const incomingStatus = extractIncomingStatus(data.status);
  if (incomingStatus !== undefined && incomingStatus !== previous.status) {
    assertValidAttemptTransition(
      previous.status as AttemptStatusName,
      incomingStatus as AttemptStatusName,
    );
  }

  const reassignedId = data.assessment && typeof data.assessment === 'object' && 'connect' in data.assessment
    ? (data.assessment as { connect: { id: string } }).connect.id
    : undefined;
  const effectiveAssessmentId = reassignedId ?? previous.assessmentId;
  await validateMarkBounds(effectiveAssessmentId, data.rawMark as number | undefined, data.finalMark as number | undefined);

  if (data.finalMark != null && !data.grade && effectiveAssessmentId) {
    const autoGrade = await resolveGradeFromMark(
      effectiveAssessmentId,
      typeof data.finalMark === 'object' && 'set' in data.finalMark
        ? Number(data.finalMark.set)
        : Number(data.finalMark),
    );
    if (autoGrade) {
      data.grade = autoGrade;
    }
  }

  const result = await repo.update(id, data);
  await logAudit('AssessmentAttempt', id, 'UPDATE', userId, previous, result, req);

  // Map AttemptStatus transitions to domain-specific marks events,
  // plus an additive marks.status_changed event on every valid transition
  // (Phase 17A — gives n8n a single subscription point for any transition).
  if (result.status !== previous.status) {
    const statusEventMap: Record<string, string> = {
      SUBMITTED: 'marks.submitted',
      MODERATED: 'marks.moderated',
      CONFIRMED: 'marks.ratified',
    };
    const specificEvent = statusEventMap[result.status];
    const transitionPayload = {
      assessmentId: result.assessmentId,
      moduleRegistrationId: result.moduleRegistrationId,
      attemptNumber: result.attemptNumber,
      rawMark: result.rawMark != null ? Number(result.rawMark) : null,
      moderatedMark: result.moderatedMark != null ? Number(result.moderatedMark) : null,
      finalMark: result.finalMark != null ? Number(result.finalMark) : null,
      grade: result.grade,
      previousStatus: previous.status,
      newStatus: result.status,
    };
    if (specificEvent) {
      emitEvent({
        event: specificEvent,
        entityType: 'AssessmentAttempt',
        entityId: id,
        actorId: userId,
        data: transitionPayload,
      });
    }
    emitEvent({
      event: 'marks.status_changed',
      entityType: 'AssessmentAttempt',
      entityId: id,
      actorId: userId,
      data: transitionPayload,
    });
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
