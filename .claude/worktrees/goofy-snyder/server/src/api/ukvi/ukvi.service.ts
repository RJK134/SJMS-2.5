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
    ...(search ? { OR: [{ casNumber: { contains: search, mode: 'insensitive' as const } }] } : {}),
    ...(filters.studentId ? { studentId: filters.studentId as any } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.uKVIRecord.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any }),
    prisma.uKVIRecord.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

export async function getById(id: string) {
  const result = await prisma.uKVIRecord.findUnique({ where: { id }, include: { student: { include: { person: true } }, contactPoints: true, reports: true } });
  if (!result) throw new NotFoundError('UKVIRecord', id);
  return result;
}

export async function create(data: any, userId: string, req: Request) {
  const result = await prisma.uKVIRecord.create({ data });
  await logAudit('UKVIRecord', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('ukvi.created', { id: result.id });
  return result;
}

export async function update(id: string, data: any, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await prisma.uKVIRecord.update({ where: { id }, data });
  await logAudit('UKVIRecord', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('ukvi.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await prisma.uKVIRecord.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit('UKVIRecord', id, 'DELETE', userId, previous, null, req);
  await emitEvent('ukvi.deleted', { id });
}

// ── UKVI Contact Points ─────────────────────────────────────────────────

export async function listContactPoints(query: Record<string, any>) {
  const { page, limit, sort, order, ...filters } = query;
  const skip = (page - 1) * limit;
  const where: Record<string, any> = {
    ...(filters.contactType ? { contactType: filters.contactType } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.studentId ? { ukviRecord: { studentId: filters.studentId } } : {}),
    ...(filters.fromDate || filters.toDate ? {
      contactDate: {
        ...(filters.fromDate ? { gte: new Date(filters.fromDate) } : {}),
        ...(filters.toDate ? { lte: new Date(filters.toDate) } : {}),
      },
    } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.uKVIContactPoint.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sort]: order } as any,
      include: {
        ukviRecord: {
          include: {
            student: {
              include: {
                person: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
      },
    }),
    prisma.uKVIContactPoint.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}
