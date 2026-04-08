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
    ...(search ? { OR: [{ studentNumber: { contains: search, mode: 'insensitive' as const } }, { person: { firstName: { contains: search, mode: 'insensitive' as const } } }, { person: { lastName: { contains: search, mode: 'insensitive' as const } } }] } : {}),
    ...(filters.feeStatus ? { feeStatus: filters.feeStatus as any } : {}),
      ...(filters.entryRoute ? { entryRoute: filters.entryRoute as any } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.student.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any }),
    prisma.student.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

export async function getById(id: string) {
  const result = await prisma.student.findUnique({ where: { id }, include: { person: { include: { contacts: true, addresses: true, identifiers: true, demographic: true } }, enrolments: { where: { deletedAt: null }, take: 5, orderBy: { createdAt: 'desc' } } } });
  if (!result) throw new NotFoundError('Student', id);
  return result;
}

export async function create(data: any, userId: string, req: Request) {
  const result = await prisma.student.create({ data });
  await logAudit('Student', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('students.created', { id: result.id });
  return result;
}

export async function update(id: string, data: any, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await prisma.student.update({ where: { id }, data });
  await logAudit('Student', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('students.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await prisma.student.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit('Student', id, 'DELETE', userId, previous, null, req);
  await emitEvent('students.deleted', { id });
}
