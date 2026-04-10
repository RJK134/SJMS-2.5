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
    
    ...(search ? { OR: [{ title: { contains: search, mode: 'insensitive' as const } }, { code: { contains: search, mode: 'insensitive' as const } }] } : {}),
    ...(filters.facultyId ? { facultyId: filters.facultyId as any } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.school.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any }),
    prisma.school.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

export async function getById(id: string) {
  const result = await prisma.school.findFirst({ where: { id, deletedAt: null }, include: { faculty: true, departments: true } });
  if (!result) throw new NotFoundError('School', id);
  return result;
}

export async function create(data: any, userId: string, req: Request) {
  const result = await prisma.school.create({ data });
  await logAudit('School', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('schools.created', { id: result.id });
  return result;
}

export async function update(id: string, data: any, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await prisma.school.update({ where: { id }, data });
  await logAudit('School', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('schools.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await prisma.school.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit('School', id, 'DELETE', userId, previous, null, req);
  await emitEvent('schools.deleted', { id });
}
