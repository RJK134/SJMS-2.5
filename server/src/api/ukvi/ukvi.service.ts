import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/compliance.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface UkviListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  studentId?: string;
  complianceStatus?: string;
  tier4Status?: string;
}

export interface ContactPointListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  contactType?: string;
  status?: string;
  studentId?: string;
  fromDate?: string;
  toDate?: string;
}

export async function list(query: UkviListQuery) {
  const { cursor, limit, sort, order, search, studentId, complianceStatus, tier4Status } = query;
  return repo.list(
    { search, studentId, complianceStatus, tier4Status },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('UKVIRecord', id);
  return result;
}

export async function create(data: Prisma.UKVIRecordUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('UKVIRecord', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('ukvi.created', { id: result.id });
  return result;
}

export async function update(id: string, data: Prisma.UKVIRecordUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('UKVIRecord', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('ukvi.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('UKVIRecord', id, 'DELETE', userId, previous, null, req);
  await emitEvent('ukvi.deleted', { id });
}

// ── UKVI Contact Points ─────────────────────────────────────────────────

export async function listContactPoints(query: ContactPointListQuery) {
  const { cursor, limit, sort, order, contactType, status, studentId, fromDate, toDate } = query;
  return repo.listContactPoints(
    { contactType, status, studentId, fromDate, toDate },
    { cursor, limit, sort, order },
  );
}
