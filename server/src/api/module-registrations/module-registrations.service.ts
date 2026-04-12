import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/moduleRegistration.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

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

export async function create(data: Prisma.ModuleRegistrationUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('ModuleRegistration', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('module_registrations.created', { id: result.id });
  return result;
}

export async function update(id: string, data: Prisma.ModuleRegistrationUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('ModuleRegistration', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('module_registrations.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('ModuleRegistration', id, 'DELETE', userId, previous, null, req);
  await emitEvent('module_registrations.deleted', { id });
}
