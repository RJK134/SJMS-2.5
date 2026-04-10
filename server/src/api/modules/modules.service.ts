import prisma from '../../utils/prisma';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';
import { buildPaginatedResponse } from '../../utils/pagination';
import type { Request } from 'express';

export async function list(query: Record<string, any>) {
  const { page, limit, sort, order, search, ...filters } = query;
  const skip = (page - 1) * limit;
  const where: Record<string, any> = {
    deletedAt: null,
    
    ...(search ? { OR: [{ title: { contains: search, mode: 'insensitive' as const } }, { moduleCode: { contains: search, mode: 'insensitive' as const } }] } : {}),
    ...(filters.status ? { status: filters.status as any } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.module.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any }),
    prisma.module.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

export async function getById(id: string) {
  const result = await prisma.module.findFirst({ where: { id, deletedAt: null }, include: { department: true, programmeModules: { include: { programme: true } } } });
  if (!result) throw new NotFoundError('Module', id);
  return result;
}

export async function create(data: any, userId: string, req: Request) {
  const result = await prisma.module.create({ data });
  await logAudit('Module', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('modules.created', { id: result.id });
  return result;
}

export async function update(id: string, data: any, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await prisma.module.update({ where: { id }, data });
  await logAudit('Module', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('modules.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await prisma.module.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit('Module', id, 'DELETE', userId, previous, null, req);
  await emitEvent('modules.deleted', { id });
}
