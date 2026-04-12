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
    
    
    ...(filters.studentId ? { studentId: filters.studentId as any } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.awardRecord.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any }),
    prisma.awardRecord.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

export async function getById(id: string) {
  const result = await prisma.awardRecord.findUnique({ where: { id }, include: { student: { include: { person: true } }, programme: true, enrolment: true, degreeCalculation: true } });
  if (!result) throw new NotFoundError('AwardRecord', id);
  return result;
}

export async function create(data: any, userId: string, req: Request) {
  const result = await prisma.awardRecord.create({ data });
  await logAudit('AwardRecord', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('awards.created', { id: result.id });
  return result;
}

export async function update(id: string, data: any, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await prisma.awardRecord.update({ where: { id }, data });
  await logAudit('AwardRecord', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('awards.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await prisma.awardRecord.delete({ where: { id } });
  await logAudit('AwardRecord', id, 'DELETE', userId, previous, null, req);
  await emitEvent('awards.deleted', { id });
}
