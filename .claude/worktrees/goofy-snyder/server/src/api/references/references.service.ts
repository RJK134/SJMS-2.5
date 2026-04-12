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
    
    ...(search ? { OR: [{ refereeName: { contains: search, mode: 'insensitive' as const } }] } : {}),
    ...(filters.applicationId ? { applicationId: filters.applicationId as any } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.applicationReference.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any }),
    prisma.applicationReference.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

export async function getById(id: string) {
  const result = await prisma.applicationReference.findUnique({ where: { id }, include: { application: true } });
  if (!result) throw new NotFoundError('ApplicationReference', id);
  return result;
}

export async function create(data: any, userId: string, req: Request) {
  const result = await prisma.applicationReference.create({ data });
  await logAudit('ApplicationReference', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('references.created', { id: result.id });
  return result;
}

export async function update(id: string, data: any, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await prisma.applicationReference.update({ where: { id }, data });
  await logAudit('ApplicationReference', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('references.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await prisma.applicationReference.delete({ where: { id } });
  await logAudit('ApplicationReference', id, 'DELETE', userId, previous, null, req);
  await emitEvent('references.deleted', { id });
}
