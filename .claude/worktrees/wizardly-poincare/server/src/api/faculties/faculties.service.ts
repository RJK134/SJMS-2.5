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
    
    ...(search ? { OR: [{ title: { contains: search, mode: 'insensitive' as const } }, { code: { contains: search, mode: 'insensitive' as const } }] } : {}),
    
  };
  const [data, total] = await Promise.all([
    prisma.faculty.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any }),
    prisma.faculty.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

export async function getById(id: string) {
  const result = await prisma.faculty.findUnique({ where: { id }, include: { schools: true } });
  if (!result) throw new NotFoundError('Faculty', id);
  return result;
}

export async function create(data: any, userId: string, req: Request) {
  const result = await prisma.faculty.create({ data });
  await logAudit('Faculty', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('faculties.created', { id: result.id });
  return result;
}

export async function update(id: string, data: any, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await prisma.faculty.update({ where: { id }, data });
  await logAudit('Faculty', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('faculties.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await prisma.faculty.delete({ where: { id } });
  await logAudit('Faculty', id, 'DELETE', userId, previous, null, req);
  await emitEvent('faculties.deleted', { id });
}
