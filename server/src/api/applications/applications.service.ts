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
    
    ...(filters.status ? { status: filters.status as any } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.application.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any }),
    prisma.application.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

export async function getById(id: string) {
  const result = await prisma.application.findUnique({ where: { id }, include: { applicant: { include: { person: true } }, programme: true, qualifications: true, references: true, conditions: true } });
  if (!result) throw new NotFoundError('Application', id);
  return result;
}

export async function create(data: any, userId: string, req: Request) {
  const result = await prisma.application.create({ data });
  await logAudit('Application', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('applications.created', { id: result.id });
  return result;
}

export async function update(id: string, data: any, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await prisma.application.update({ where: { id }, data });
  await logAudit('Application', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('applications.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await prisma.application.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit('Application', id, 'DELETE', userId, previous, null, req);
  await emitEvent('applications.deleted', { id });
}
