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
    
    
    ...(filters.applicationId ? { applicationId: filters.applicationId as any } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.interview.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any }),
    prisma.interview.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

export async function getById(id: string) {
  const result = await prisma.interview.findUnique({ where: { id }, include: { application: { include: { applicant: { include: { person: true } } } } } });
  if (!result) throw new NotFoundError('Interview', id);
  return result;
}

export async function create(data: any, userId: string, req: Request) {
  const result = await prisma.interview.create({ data });
  await logAudit('Interview', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('interviews.created', { id: result.id });
  return result;
}

export async function update(id: string, data: any, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await prisma.interview.update({ where: { id }, data });
  await logAudit('Interview', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('interviews.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await prisma.interview.delete({ where: { id } });
  await logAudit('Interview', id, 'DELETE', userId, previous, null, req);
  await emitEvent('interviews.deleted', { id });
}
