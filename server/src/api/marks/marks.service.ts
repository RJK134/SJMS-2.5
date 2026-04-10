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
    
    
    ...(filters.assessmentId ? { assessmentId: filters.assessmentId as any } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.assessmentAttempt.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any }),
    prisma.assessmentAttempt.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

export async function getById(id: string) {
  const result = await prisma.assessmentAttempt.findFirst({ where: { id, deletedAt: null }, include: { assessment: { include: { module: true } }, moduleRegistration: { include: { enrolment: { include: { student: { include: { person: true } } } } } } } });
  if (!result) throw new NotFoundError('AssessmentAttempt', id);
  return result;
}

export async function create(data: any, userId: string, req: Request) {
  const result = await prisma.assessmentAttempt.create({ data });
  await logAudit('AssessmentAttempt', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('marks.created', { id: result.id });
  return result;
}

export async function update(id: string, data: any, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await prisma.assessmentAttempt.update({ where: { id }, data });
  await logAudit('AssessmentAttempt', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('marks.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await prisma.assessmentAttempt.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit('AssessmentAttempt', id, 'DELETE', userId, previous, null, req);
  await emitEvent('marks.deleted', { id });
}
