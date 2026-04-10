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
    prisma.eCClaim.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any }),
    prisma.eCClaim.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

export async function getById(id: string) {
  const result = await prisma.eCClaim.findFirst({ where: { id, deletedAt: null }, include: { student: { include: { person: true } }, moduleRegistration: { include: { module: true } } } });
  if (!result) throw new NotFoundError('ECClaim', id);
  return result;
}

export async function create(data: any, userId: string, req: Request) {
  const result = await prisma.eCClaim.create({ data });
  await logAudit('ECClaim', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('ec_claims.created', { id: result.id });
  return result;
}

export async function update(id: string, data: any, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await prisma.eCClaim.update({ where: { id }, data });
  await logAudit('ECClaim', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('ec_claims.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await prisma.eCClaim.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit('ECClaim', id, 'DELETE', userId, previous, null, req);
  await emitEvent('ec_claims.deleted', { id });
}
