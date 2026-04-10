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
    
    
    ...(filters.moduleId ? { moduleId: filters.moduleId as any } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.moduleResult.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any }),
    prisma.moduleResult.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

export async function getById(id: string) {
  const result = await prisma.moduleResult.findFirst({ where: { id, deletedAt: null }, include: { moduleRegistration: { include: { enrolment: { include: { student: { include: { person: true } } } } } }, module: true } });
  if (!result) throw new NotFoundError('ModuleResult', id);
  return result;
}

export async function create(data: any, userId: string, req: Request) {
  const result = await prisma.moduleResult.create({ data });
  await logAudit('ModuleResult', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('module_results.created', { id: result.id });
  return result;
}

export async function update(id: string, data: any, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await prisma.moduleResult.update({ where: { id }, data });
  await logAudit('ModuleResult', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('module_results.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await prisma.moduleResult.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit('ModuleResult', id, 'DELETE', userId, previous, null, req);
  await emitEvent('module_results.deleted', { id });
}
