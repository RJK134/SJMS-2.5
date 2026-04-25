import type { Request } from 'express';
import * as repo from '../../repositories/systemSetting.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';
import type { Prisma } from '@prisma/client';

export interface ConfigListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  category?: string;
}

export async function list(query: ConfigListQuery) {
  const { cursor, limit, sort, order, ...filters } = query;
  return repo.list(filters, { cursor, limit, sort, order });
}

export async function getById(id: string) {
  const record = await repo.getById(id);
  if (!record) throw new NotFoundError('SystemSetting', id);
  return record;
}

export async function getByKey(settingKey: string) {
  const record = await repo.getByKey(settingKey);
  if (!record) throw new NotFoundError('SystemSetting', settingKey);
  return record;
}

export async function create(data: Prisma.SystemSettingCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('SystemSetting', result.id, 'CREATE', userId, null, result, req);
  emitEvent({
    event: 'config.created',
    entityType: 'SystemSetting',
    entityId: result.id,
    actorId: userId,
    data: { settingKey: result.settingKey, category: result.category },
  });
  return result;
}

export async function update(id: string, data: Prisma.SystemSettingUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('SystemSetting', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'config.updated',
    entityType: 'SystemSetting',
    entityId: id,
    actorId: userId,
    data: { settingKey: result.settingKey, category: result.category },
  });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('SystemSetting', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'config.deleted',
    entityType: 'SystemSetting',
    entityId: id,
    actorId: userId,
    data: { settingKey: previous.settingKey },
  });
}
