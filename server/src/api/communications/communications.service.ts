import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/communicationTemplate.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface CommunicationListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  channel?: string;
  isActive?: boolean;
}

export async function list(query: CommunicationListQuery) {
  const { cursor, limit, sort, order, search, channel, isActive } = query;
  return repo.list(
    { search, channel, isActive },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('CommunicationTemplate', id);
  return result;
}

export async function create(data: Prisma.CommunicationTemplateUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('CommunicationTemplate', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('communications.created', { id: result.id });
  return result;
}

export async function update(id: string, data: Prisma.CommunicationTemplateUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('CommunicationTemplate', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('communications.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('CommunicationTemplate', id, 'DELETE', userId, previous, null, req);
  await emitEvent('communications.deleted', { id });
}
