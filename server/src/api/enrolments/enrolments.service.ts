import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/enrolment.repository';
import * as moduleRegRepo from '../../repositories/moduleRegistration.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface EnrolmentListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  studentId?: string;
  programmeId?: string;
  academicYear?: string;
  status?: string;
}

export async function list(query: EnrolmentListQuery) {
  const { cursor, limit, sort, order, studentId, programmeId, academicYear, status } = query;
  return repo.list(
    { studentId, programmeId, academicYear, status },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('Enrolment', id);
  return result;
}

export async function create(data: Prisma.EnrolmentUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create({ ...data, createdBy: userId });
  await logAudit('Enrolment', result.id, 'CREATE', userId, null, result, req);
  emitEvent({
    event: 'enrolment.created',
    entityType: 'Enrolment',
    entityId: result.id,
    actorId: userId,
    data: {
      studentId: result.studentId,
      programmeId: result.programmeId,
      academicYear: result.academicYear,
      status: result.status,
    },
  });
  return result;
}

export async function update(id: string, data: Prisma.EnrolmentUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('Enrolment', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'enrolment.updated',
    entityType: 'Enrolment',
    entityId: id,
    actorId: userId,
    data: {
      studentId: result.studentId,
      programmeId: result.programmeId,
    },
  });
  // Emit domain-specific event when enrolment status changes
  if (result.status !== previous.status) {
    emitEvent({
      event: 'enrolment.status_changed',
      entityType: 'Enrolment',
      entityId: id,
      actorId: userId,
      data: {
        studentId: result.studentId,
        programmeId: result.programmeId,
        previousStatus: previous.status,
        newStatus: result.status,
      },
    });

    const NON_ACTIVE_STATUSES = ['INTERRUPTED', 'SUSPENDED', 'WITHDRAWN'];
    if (NON_ACTIVE_STATUSES.includes(result.status)) {
      const regStatus: 'WITHDRAWN' | 'DEFERRED' =
        result.status === 'WITHDRAWN' ? 'WITHDRAWN' : 'DEFERRED';
      // Repository-mediated cascade — the previous implementation called
      // `prisma.moduleRegistration.*` directly from this service and
      // bypassed the repository layer (KI-P12-001). The two calls below
      // route the same writes through `moduleRegistration.repository`
      // so the repository remains the single source of truth for
      // ModuleRegistration persistence.
      const activeRegs = await moduleRegRepo.findActiveByEnrolment(id);

      for (const reg of activeRegs) {
        await moduleRegRepo.cascadeStatusForEnrolment(reg.id, regStatus, userId);
        await logAudit('ModuleRegistration', reg.id, 'UPDATE', userId,
          { status: 'REGISTERED' }, { status: regStatus }, req);
        emitEvent({
          event: 'module_registration.status_changed',
          entityType: 'ModuleRegistration',
          entityId: reg.id,
          actorId: userId,
          data: {
            enrolmentId: id,
            moduleId: reg.moduleId,
            previousStatus: 'REGISTERED',
            newStatus: regStatus,
            reason: `Enrolment ${result.status.toLowerCase()}`,
          },
        });
      }
    }
  }
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('Enrolment', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'enrolment.withdrawn',
    entityType: 'Enrolment',
    entityId: id,
    actorId: userId,
    data: {
      studentId: previous.studentId,
      programmeId: previous.programmeId,
    },
  });
}
