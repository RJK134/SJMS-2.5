import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/admissions.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface ApplicationListQuery {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  status?: string;
  academicYear?: string;
  programmeId?: string;
  applicantId?: string;
  // personId is injected by scopeToUser('personId') middleware on the
  // applicant portal list route. The repository resolves it via the
  // applicant relation (Application has no direct personId column).
  personId?: string;
}

export async function list(query: ApplicationListQuery) {
  const { page, limit, sort, order, search, status, academicYear, programmeId, applicantId, personId } = query;
  return repo.list(
    { search, status, academicYear, programmeId, applicantId, personId },
    { page, limit, skip: (page - 1) * limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('Application', id);
  return result;
}

export async function create(data: Prisma.ApplicationUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.createApplication(data);
  await logAudit('Application', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('applications.created', { id: result.id });
  return result;
}

export async function update(id: string, data: Prisma.ApplicationUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('Application', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('applications.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('Application', id, 'DELETE', userId, previous, null, req);
  await emitEvent('applications.deleted', { id });
}
