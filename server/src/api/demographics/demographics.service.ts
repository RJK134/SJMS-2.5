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
    
    
    ...(filters.personId ? { personId: filters.personId as any } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.personDemographic.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any }),
    prisma.personDemographic.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

export async function getById(id: string) {
  const result = await prisma.personDemographic.findFirst({ where: { id, deletedAt: null }, include: { person: true } });
  if (!result) throw new NotFoundError('PersonDemographic', id);
  return result;
}

export async function create(data: any, userId: string, req: Request) {
  const result = await prisma.personDemographic.create({ data });
  await logAudit('PersonDemographic', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('demographics.created', { id: result.id });
  return result;
}

export async function update(id: string, data: any, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await prisma.personDemographic.update({ where: { id }, data });
  await logAudit('PersonDemographic', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('demographics.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await prisma.personDemographic.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit('PersonDemographic', id, 'DELETE', userId, previous, null, req);
  await emitEvent('demographics.deleted', { id });
}
