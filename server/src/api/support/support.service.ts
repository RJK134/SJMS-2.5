import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/support.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface SupportListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  studentId?: string;
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: string;
}

export async function list(query: SupportListQuery) {
  const { cursor, limit, sort, order, search, studentId, status, priority, category, assignedTo } = query;
  return repo.list(
    { search, studentId, status, priority, category, assignedTo },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('SupportTicket', id);
  return result;
}

export async function create(data: Prisma.SupportTicketUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('SupportTicket', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('support.created', { id: result.id });
  return result;
}

export async function update(id: string, data: Prisma.SupportTicketUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('SupportTicket', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('support.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('SupportTicket', id, 'DELETE', userId, previous, null, req);
  await emitEvent('support.deleted', { id });
}
