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
    
    
    ...(filters.enrolmentId ? { enrolmentId: filters.enrolmentId as any } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.progressionRecord.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any }),
    prisma.progressionRecord.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

export async function getById(id: string) {
  const result = await prisma.progressionRecord.findFirst({ where: { id, deletedAt: null }, include: { enrolment: { include: { student: { include: { person: true } }, programme: true } } } });
  if (!result) throw new NotFoundError('ProgressionRecord', id);
  return result;
}

export async function create(data: any, userId: string, req: Request) {
  const result = await prisma.progressionRecord.create({ data });
  await logAudit('ProgressionRecord', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('progressions.created', { id: result.id });
  return result;
}

export async function update(id: string, data: any, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await prisma.progressionRecord.update({ where: { id }, data });
  await logAudit('ProgressionRecord', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('progressions.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await prisma.progressionRecord.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit('ProgressionRecord', id, 'DELETE', userId, previous, null, req);
  await emitEvent('progressions.deleted', { id });
}
