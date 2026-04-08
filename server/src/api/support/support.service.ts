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
    ...(filters.studentId ? { studentId: filters.studentId as any } : {}),
      ...(filters.priority ? { priority: filters.priority as any } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.supportTicket.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any }),
    prisma.supportTicket.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

export async function getById(id: string) {
  const result = await prisma.supportTicket.findUnique({ where: { id }, include: { student: { include: { person: true } }, interactions: { orderBy: { createdAt: 'asc' } } } });
  if (!result) throw new NotFoundError('SupportTicket', id);
  return result;
}

export async function create(data: any, userId: string, req: Request) {
  const result = await prisma.supportTicket.create({ data });
  await logAudit('SupportTicket', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('support.created', { id: result.id });
  return result;
}

export async function update(id: string, data: any, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await prisma.supportTicket.update({ where: { id }, data });
  await logAudit('SupportTicket', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('support.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await prisma.supportTicket.delete({ where: { id } });
  await logAudit('SupportTicket', id, 'DELETE', userId, previous, null, req);
  await emitEvent('support.deleted', { id });
}
