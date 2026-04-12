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
    ...(search ? { OR: [{ firstName: { contains: search, mode: 'insensitive' as const } }, { lastName: { contains: search, mode: 'insensitive' as const } }] } : {}),
    
  };
  const [data, total] = await Promise.all([
    prisma.person.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any }),
    prisma.person.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

export async function getById(id: string) {
  const result = await prisma.person.findUnique({ where: { id }, include: { contacts: true, addresses: true, identifiers: true, demographic: true } });
  if (!result) throw new NotFoundError('Person', id);
  return result;
}

export async function create(data: any, userId: string, req: Request) {
  const result = await prisma.person.create({ data });
  await logAudit('Person', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('persons.created', { id: result.id });
  return result;
}

export async function update(id: string, data: any, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await prisma.person.update({ where: { id }, data });
  await logAudit('Person', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('persons.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await prisma.person.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit('Person', id, 'DELETE', userId, previous, null, req);
  await emitEvent('persons.deleted', { id });
}
