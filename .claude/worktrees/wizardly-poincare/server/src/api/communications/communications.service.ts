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
    
    ...(search ? { OR: [{ title: { contains: search, mode: 'insensitive' as const } }, { templateCode: { contains: search, mode: 'insensitive' as const } }] } : {}),
    ...(filters.channel ? { channel: filters.channel as any } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.communicationTemplate.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any }),
    prisma.communicationTemplate.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

export async function getById(id: string) {
  const result = await prisma.communicationTemplate.findUnique({ where: { id } });
  if (!result) throw new NotFoundError('CommunicationTemplate', id);
  return result;
}

export async function create(data: any, userId: string, req: Request) {
  const result = await prisma.communicationTemplate.create({ data });
  await logAudit('CommunicationTemplate', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('communications.created', { id: result.id });
  return result;
}

export async function update(id: string, data: any, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await prisma.communicationTemplate.update({ where: { id }, data });
  await logAudit('CommunicationTemplate', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('communications.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await prisma.communicationTemplate.delete({ where: { id } });
  await logAudit('CommunicationTemplate', id, 'DELETE', userId, previous, null, req);
  await emitEvent('communications.deleted', { id });
}
