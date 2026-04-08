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
    
    ...(search ? { OR: [{ subject: { contains: search, mode: 'insensitive' as const } }] } : {}),
    ...(filters.applicationId ? { applicationId: filters.applicationId as any } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.applicationQualification.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any }),
    prisma.applicationQualification.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

export async function getById(id: string) {
  const result = await prisma.applicationQualification.findUnique({ where: { id }, include: { application: true } });
  if (!result) throw new NotFoundError('ApplicationQualification', id);
  return result;
}

export async function create(data: any, userId: string, req: Request) {
  const result = await prisma.applicationQualification.create({ data });
  await logAudit('ApplicationQualification', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('qualifications.created', { id: result.id });
  return result;
}

export async function update(id: string, data: any, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await prisma.applicationQualification.update({ where: { id }, data });
  await logAudit('ApplicationQualification', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('qualifications.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await prisma.applicationQualification.delete({ where: { id } });
  await logAudit('ApplicationQualification', id, 'DELETE', userId, previous, null, req);
  await emitEvent('qualifications.deleted', { id });
}
