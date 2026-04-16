import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/moduleRegistration.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError, ValidationError } from '../../utils/errors';
import prisma from '../../utils/prisma';

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
  const prerequisites = await prisma.modulePrerequisite.findMany({
    where: { moduleId, isMandatory: true },
    include: { prerequisiteModule: { select: { id: true, title: true, moduleCode: true } } },
  });

  if (prerequisites.length === 0) return;

  const enrolment = await prisma.enrolment.findUnique({
    where: { id: enrolmentId },
    select: { studentId: true },
  });
  if (!enrolment) return;

  const passedResults = await prisma.moduleResult.findMany({
    where: {
      moduleRegistration: { enrolment: { studentId: enrolment.studentId } },
      moduleId: { in: prerequisites.map((p) => p.prerequisiteModuleId) },
      status: { in: ['CONFIRMED', 'PROVISIONAL'] },
    },
    select: { moduleId: true },
  });

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
  const targetModule = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { credits: true },
  });
  if (!targetModule) return;

  const existingRegistrations = await prisma.moduleRegistration.findMany({
    where: {
      enrolmentId,
      academicYear,
      status: { in: ['REGISTERED', 'COMPLETED'] },
      deletedAt: null,
    },
    select: { moduleId: true },
  });

  const moduleIds = existingRegistrations.map((r) => r.moduleId);
  const modules = await prisma.module.findMany({
    where: { id: { in: moduleIds } },
    select: { id: true, credits: true },
  });
  const creditMap = new Map(modules.map((m) => [m.id, m.credits]));

  const currentCredits = existingRegistrations.reduce((sum, r) => sum + (creditMap.get(r.moduleId) ?? 0), 0);
  const maxCredits = 120;

  if (currentCredits + targetModule.credits > maxCredits) {
    throw new ValidationError(
      `Registration would exceed credit limit: ${currentCredits} current + ${targetModule.credits} new = ${currentCredits + targetModule.credits} (max ${maxCredits})`,
      { credits: [`Exceeds ${maxCredits} credit limit for academic year`] },
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
