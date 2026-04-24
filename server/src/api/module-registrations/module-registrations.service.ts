import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/moduleRegistration.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError, ValidationError } from '../../utils/errors';
import { getPassMark, PASSING_GRADES } from '../../utils/pass-marks';
import { getMaxCreditsForMode } from '../../utils/credit-limits';

export interface ModuleRegistrationListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  enrolmentId?: string;
  moduleId?: string;
  academicYear?: string;
  status?: string;
  // studentId is injected by scopeToUser('studentId') middleware on the
  // student portal list route. The repository resolves it via the
  // enrolment relation (ModuleRegistration has no direct studentId
  // column) so the where clause compiles to `enrolment: { studentId }`.
  studentId?: string;
}

export async function list(query: ModuleRegistrationListQuery) {
  const { cursor, limit, sort, order, enrolmentId, moduleId, academicYear, status, studentId } = query;
  return repo.list(
    { enrolmentId, moduleId, academicYear, status, studentId },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('ModuleRegistration', id);
  return result;
}

async function validatePrerequisites(moduleId: string, enrolmentId: string): Promise<void> {
  const prerequisites = await repo.findMandatoryPrerequisites(moduleId);

  if (prerequisites.length === 0) return;

  const enrolment = await repo.getEnrolmentForRuleChecks(enrolmentId);
  if (!enrolment) return;

  const passMark = await getPassMark(enrolment.programme.level);

  const passedResults = await repo.findPassedPrerequisiteResults(
    enrolment.studentId,
    prerequisites.map((p) => p.prerequisiteModuleId),
    passMark,
    Array.from(PASSING_GRADES),
  );

  const passedModuleIds = new Set(passedResults.map((r) => r.moduleId));
  const missing = prerequisites.filter((p) => !passedModuleIds.has(p.prerequisiteModuleId));

  if (missing.length > 0) {
    const names = missing.map((m) => `${m.prerequisiteModule.moduleCode} (${m.prerequisiteModule.title})`);
    throw new ValidationError(
      `Student has not completed mandatory prerequisites: ${names.join(', ')}`,
      { prerequisites: names },
    );
  }
}

async function validateCreditLimit(moduleId: string, enrolmentId: string, academicYear: string): Promise<void> {
  const [targetModule, enrolment] = await Promise.all([
    repo.getModuleCredits(moduleId),
    repo.getEnrolmentForRuleChecks(enrolmentId),
  ]);
  if (!targetModule || !enrolment) return;

  const existingRegistrations = await repo.findActiveCreditRegistrations(enrolmentId, academicYear);

  const moduleIds = existingRegistrations.map((r) => r.moduleId);
  const modules = await repo.findModuleCredits(moduleIds);
  const creditMap = new Map(modules.map((m) => [m.id, m.credits]));

  const currentCredits = existingRegistrations.reduce((sum, r) => sum + (creditMap.get(r.moduleId) ?? 0), 0);
  const maxCredits = await getMaxCreditsForMode(enrolment.modeOfStudy);

  if (currentCredits + targetModule.credits > maxCredits) {
    throw new ValidationError(
      `Registration would exceed credit limit: ${currentCredits} current + ${targetModule.credits} new = ${currentCredits + targetModule.credits} (max ${maxCredits} for ${enrolment.modeOfStudy})`,
      { credits: [`Exceeds ${maxCredits} credit limit (${enrolment.modeOfStudy})`] },
    );
  }
}

export async function create(data: Prisma.ModuleRegistrationUncheckedCreateInput, userId: string, req: Request) {
  await validatePrerequisites(data.moduleId, data.enrolmentId);
  await validateCreditLimit(data.moduleId, data.enrolmentId, data.academicYear);

  const result = await repo.create(data);
  await logAudit('ModuleRegistration', result.id, 'CREATE', userId, null, result, req);
  emitEvent({
    event: 'module_registration.created',
    entityType: 'ModuleRegistration',
    entityId: result.id,
    actorId: userId,
    data: {
      enrolmentId: result.enrolmentId,
      moduleId: result.moduleId,
      academicYear: result.academicYear,
      registrationType: result.registrationType,
      status: result.status,
    },
  });
  return result;
}

export async function update(id: string, data: Prisma.ModuleRegistrationUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);

  // Re-run the same business rules that create() enforces when an update
  // points the registration at a different module or academic year.
  // Without this, a student could bypass prerequisite / credit-limit checks
  // by creating a throwaway registration and then PATCHing it to the real
  // target module.
  const newModuleId =
    data.module && typeof data.module === 'object' && 'connect' in data.module
      ? (data.module as { connect: { id: string } }).connect.id
      : undefined;
  const newAcademicYear =
    typeof data.academicYear === 'string'
      ? data.academicYear
      : data.academicYear && typeof data.academicYear === 'object' && 'set' in data.academicYear
        ? (data.academicYear as { set: string }).set
        : undefined;

  const effectiveModuleId = newModuleId ?? previous.moduleId;
  const effectiveAcademicYear = newAcademicYear ?? previous.academicYear;

  if (newModuleId && newModuleId !== previous.moduleId) {
    await validatePrerequisites(effectiveModuleId, previous.enrolmentId);
  }
  if (
    (newModuleId && newModuleId !== previous.moduleId) ||
    (newAcademicYear && newAcademicYear !== previous.academicYear)
  ) {
    await validateCreditLimit(effectiveModuleId, previous.enrolmentId, effectiveAcademicYear);
  }

  const result = await repo.update(id, data);
  await logAudit('ModuleRegistration', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'module_registration.updated',
    entityType: 'ModuleRegistration',
    entityId: id,
    actorId: userId,
    data: {
      enrolmentId: result.enrolmentId,
      moduleId: result.moduleId,
      status: result.status,
    },
  });
  if (result.status !== previous.status) {
    emitEvent({
      event: 'module_registration.status_changed',
      entityType: 'ModuleRegistration',
      entityId: id,
      actorId: userId,
      data: {
        enrolmentId: result.enrolmentId,
        moduleId: result.moduleId,
        previousStatus: previous.status,
        newStatus: result.status,
      },
    });
  }
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('ModuleRegistration', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'module_registration.deleted',
    entityType: 'ModuleRegistration',
    entityId: id,
    actorId: userId,
    data: {
      enrolmentId: previous.enrolmentId,
      moduleId: previous.moduleId,
    },
  });
}
