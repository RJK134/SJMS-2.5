import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/moduleResult.repository';
import * as attemptRepo from '../../repositories/assessmentAttempt.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError, ValidationError } from '../../utils/errors';

// ── Lifecycle state machine (Phase 17B) ───────────────────────────────────
//
// Canonical transition graph for ModuleResult.status. Mirrors the Phase
// 17A pattern in marks.service.ts and the Phase 13b pattern in appeals.
// Schema enum (prisma/schema.prisma:310): PROVISIONAL | CONFIRMED |
// REFERRED | DEFERRED.
//
// CONFIRMED is a TERMINAL state — same rule as AssessmentAttempt in 17A.
// Once a module result is ratified by the exam board, the row is
// immutable in lifecycle terms; any post-ratification correction must
// be expressed as a fresh ModuleResult row, not by mutating the
// existing one. This protects the "ratified module results are
// immutable" guarantee that progression and award decisions rely on.
//
// PROVISIONAL → CONFIRMED is gated by a cross-entity check: every
// AssessmentAttempt under the same moduleRegistrationId must already be
// CONFIRMED. The check is enforced in update() before repo.update fires.
type ModuleResultStatusName = 'PROVISIONAL' | 'CONFIRMED' | 'REFERRED' | 'DEFERRED';

const VALID_MODULE_RESULT_TRANSITIONS: Record<ModuleResultStatusName, readonly ModuleResultStatusName[]> = {
  PROVISIONAL: ['CONFIRMED', 'REFERRED', 'DEFERRED'],
  CONFIRMED: [], // terminal — no outgoing transitions
  REFERRED: ['PROVISIONAL'],
  DEFERRED: ['PROVISIONAL'],
};

function assertValidModuleResultTransition(from: ModuleResultStatusName, to: ModuleResultStatusName): void {
  const allowed = VALID_MODULE_RESULT_TRANSITIONS[from];
  if (!allowed || !allowed.includes(to)) {
    throw new ValidationError(`Invalid module result status transition: ${from} → ${to}`);
  }
}

/**
 * Pulls the destination status off a Prisma update payload, handling both
 * the bare-value form `{status: 'CONFIRMED'}` and the wrapped form
 * `{status: {set: 'CONFIRMED'}}`. Returns undefined if status is absent.
 */
function extractIncomingStatus(field: Prisma.ModuleResultUpdateInput['status']): string | undefined {
  if (field === undefined) return undefined;
  if (typeof field === 'string') return field;
  if (typeof field === 'object' && field !== null && 'set' in field) {
    const set = (field as { set?: string }).set;
    return typeof set === 'string' ? set : undefined;
  }
  return undefined;
}

/**
 * Phase 17B cross-entity guard. Refuses to ratify (CONFIRMED) a module
 * result while any AssessmentAttempt under the same moduleRegistration
 * is still in a non-CONFIRMED state.
 */
async function assertAllAttemptsConfirmed(moduleRegistrationId: string): Promise<void> {
  const open = await attemptRepo.countNonConfirmedByModuleRegistration(moduleRegistrationId);
  if (open > 0) {
    throw new ValidationError(
      `Cannot transition ModuleResult to CONFIRMED: ${open} non-CONFIRMED AssessmentAttempt row(s) remain for moduleRegistrationId ${moduleRegistrationId}`,
    );
  }
}

export interface ModuleResultListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  moduleId?: string;
  moduleRegistrationId?: string;
  academicYear?: string;
  outcome?: string;
}

export async function list(query: ModuleResultListQuery) {
  const { cursor, limit, sort, order, moduleId, moduleRegistrationId, academicYear, outcome } = query;
  return repo.list(
    { moduleId, moduleRegistrationId, academicYear, outcome },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('ModuleResult', id);
  return result;
}

export async function create(data: Prisma.ModuleResultUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('ModuleResult', result.id, 'CREATE', userId, null, result, req);
  emitEvent({
    event: 'module_results.created',
    entityType: 'ModuleResult',
    entityId: result.id,
    actorId: userId,
    data: {
      moduleId: result.moduleId,
      moduleRegistrationId: result.moduleRegistrationId,
      academicYear: result.academicYear,
      aggregateMark: result.aggregateMark != null ? Number(result.aggregateMark) : null,
      grade: result.grade,
      status: result.status,
    },
  });
  return result;
}

export async function update(id: string, data: Prisma.ModuleResultUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);

  // Phase 17B — enforce the canonical ModuleResult transition graph and the
  // attempts-must-be-confirmed cross-entity rule.
  const incomingStatus = extractIncomingStatus(data.status);
  const transitioning = incomingStatus !== undefined && incomingStatus !== previous.status;
  if (transitioning) {
    assertValidModuleResultTransition(
      previous.status as ModuleResultStatusName,
      incomingStatus as ModuleResultStatusName,
    );
    if (incomingStatus === 'CONFIRMED') {
      await assertAllAttemptsConfirmed(previous.moduleRegistrationId);
    }
  }

  const result = await repo.update(id, data);
  await logAudit('ModuleResult', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'module_results.updated',
    entityType: 'ModuleResult',
    entityId: id,
    actorId: userId,
    data: {
      moduleId: result.moduleId,
      moduleRegistrationId: result.moduleRegistrationId,
      status: result.status,
      grade: result.grade,
      aggregateMark: result.aggregateMark != null ? Number(result.aggregateMark) : null,
    },
  });
  if (result.status !== previous.status) {
    const transitionPayload = {
      moduleId: result.moduleId,
      moduleRegistrationId: result.moduleRegistrationId,
      previousStatus: previous.status,
      newStatus: result.status,
      aggregateMark: result.aggregateMark != null ? Number(result.aggregateMark) : null,
      grade: result.grade,
    };
    emitEvent({
      event: 'module_results.status_changed',
      entityType: 'ModuleResult',
      entityId: id,
      actorId: userId,
      data: transitionPayload,
    });
    // Phase 17B — additive ratified event on PROVISIONAL → CONFIRMED so n8n
    // workflows can subscribe to the canonical "module is now ratified"
    // moment without parsing previousStatus/newStatus tuples.
    if (previous.status === 'PROVISIONAL' && result.status === 'CONFIRMED') {
      emitEvent({
        event: 'module_results.ratified',
        entityType: 'ModuleResult',
        entityId: id,
        actorId: userId,
        data: transitionPayload,
      });
    }
  }
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('ModuleResult', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'module_results.deleted',
    entityType: 'ModuleResult',
    entityId: id,
    actorId: userId,
    data: { moduleId: previous.moduleId, moduleRegistrationId: previous.moduleRegistrationId },
  });
}
