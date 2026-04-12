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
    
    ...(search ? { OR: [{ fileName: { contains: search, mode: 'insensitive' as const } }] } : {}),
    ...(filters.assessmentId ? { assessmentId: filters.assessmentId as any } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.submission.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any }),
    prisma.submission.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

export async function getById(id: string) {
  const result = await prisma.submission.findUnique({ where: { id }, include: { assessment: true, moduleRegistration: true } });
  if (!result) throw new NotFoundError('Submission', id);
  return result;
}

export async function create(data: any, userId: string, req: Request) {
  const result = await prisma.submission.create({ data });
  await logAudit('Submission', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('submissions.created', { id: result.id });
  return result;
}

export async function update(id: string, data: any, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await prisma.submission.update({ where: { id }, data });
  await logAudit('Submission', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('submissions.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await prisma.submission.delete({ where: { id } });
  await logAudit('Submission', id, 'DELETE', userId, previous, null, req);
  await emitEvent('submissions.deleted', { id });
}
