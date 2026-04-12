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
    
    ...(search ? { OR: [{ title: { contains: search, mode: 'insensitive' as const } }, { programmeCode: { contains: search, mode: 'insensitive' as const } }, { ucasCode: { contains: search, mode: 'insensitive' as const } }] } : {}),
    ...(filters.status ? { status: filters.status as any } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.programme.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any }),
    prisma.programme.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

export async function getById(id: string) {
  const result = await prisma.programme.findUnique({ where: { id }, include: { department: { include: { school: { include: { faculty: true } } } }, programmeModules: { include: { module: true } }, specifications: true } });
  if (!result) throw new NotFoundError('Programme', id);
  return result;
}

export async function create(data: any, userId: string, req: Request) {
  const result = await prisma.programme.create({ data });
  await logAudit('Programme', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('programmes.created', { id: result.id });
  return result;
}

export async function update(id: string, data: any, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await prisma.programme.update({ where: { id }, data });
  await logAudit('Programme', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('programmes.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await prisma.programme.delete({ where: { id } });
  await logAudit('Programme', id, 'DELETE', userId, previous, null, req);
  await emitEvent('programmes.deleted', { id });
}
