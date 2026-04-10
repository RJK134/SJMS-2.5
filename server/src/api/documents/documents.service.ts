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
    
    ...(search ? { OR: [{ title: { contains: search, mode: 'insensitive' as const } }] } : {}),
    ...(filters.studentId ? { studentId: filters.studentId as any } : {}),
      ...(filters.verificationStatus ? { verificationStatus: filters.verificationStatus as any } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.document.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any }),
    prisma.document.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

export async function getById(id: string) {
  const result = await prisma.document.findFirst({ where: { id, deletedAt: null }, include: { student: { include: { person: true } }, verifications: true } });
  if (!result) throw new NotFoundError('Document', id);
  return result;
}

export async function create(data: any, userId: string, req: Request) {
  const result = await prisma.document.create({ data });
  await logAudit('Document', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('documents.created', { id: result.id });
  return result;
}

export async function update(id: string, data: any, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await prisma.document.update({ where: { id }, data });
  await logAudit('Document', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('documents.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await prisma.document.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit('Document', id, 'DELETE', userId, previous, null, req);
  await emitEvent('documents.deleted', { id });
}
