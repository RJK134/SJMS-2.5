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
    ...(filters.schoolId ? { schoolId: filters.schoolId as any } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.department.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any }),
    prisma.department.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

export async function getById(id: string) {
  const result = await prisma.department.findUnique({ where: { id }, include: { school: { include: { faculty: true } } } });
  if (!result) throw new NotFoundError('Department', id);
  return result;
}

export async function create(data: any, userId: string, req: Request) {
  const result = await prisma.department.create({ data });
  await logAudit('Department', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('departments.created', { id: result.id });
  return result;
}

export async function update(id: string, data: any, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await prisma.department.update({ where: { id }, data });
  await logAudit('Department', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('departments.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await prisma.department.delete({ where: { id } });
  await logAudit('Department', id, 'DELETE', userId, previous, null, req);
  await emitEvent('departments.deleted', { id });
}
