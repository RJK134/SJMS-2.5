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
    
    ...(search ? { OR: [{ title: { contains: search, mode: 'insensitive' as const } }] } : {}),
    ...(filters.moduleId ? { moduleId: filters.moduleId as any } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.assessment.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any }),
    prisma.assessment.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

export async function getById(id: string) {
  const result = await prisma.assessment.findUnique({ where: { id }, include: { module: true, criteria: true, attempts: { take: 50 } } });
  if (!result) throw new NotFoundError('Assessment', id);
  return result;
}

export async function create(data: any, userId: string, req: Request) {
  const result = await prisma.assessment.create({ data });
  await logAudit('Assessment', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('assessments.created', { id: result.id });
  return result;
}

export async function update(id: string, data: any, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await prisma.assessment.update({ where: { id }, data });
  await logAudit('Assessment', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('assessments.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await prisma.assessment.delete({ where: { id } });
  await logAudit('Assessment', id, 'DELETE', userId, previous, null, req);
  await emitEvent('assessments.deleted', { id });
}
