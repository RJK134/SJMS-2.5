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
    
    
    ...(filters.studentId ? { studentId: filters.studentId as any } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.studentProgrammeRoute.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any }),
    prisma.studentProgrammeRoute.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

export async function getById(id: string) {
  const result = await prisma.studentProgrammeRoute.findFirst({ where: { id, deletedAt: null }, include: { student: { include: { person: true } }, programme: true } });
  if (!result) throw new NotFoundError('StudentProgrammeRoute', id);
  return result;
}

export async function create(data: any, userId: string, req: Request) {
  const result = await prisma.studentProgrammeRoute.create({ data });
  await logAudit('StudentProgrammeRoute', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('programme_routes.created', { id: result.id });
  return result;
}

export async function update(id: string, data: any, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await prisma.studentProgrammeRoute.update({ where: { id }, data });
  await logAudit('StudentProgrammeRoute', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('programme_routes.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await prisma.studentProgrammeRoute.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit('StudentProgrammeRoute', id, 'DELETE', userId, previous, null, req);
  await emitEvent('programme_routes.deleted', { id });
}
