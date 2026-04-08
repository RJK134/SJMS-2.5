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
    
    
    ...(filters.studentId ? { studentId: filters.studentId as any } : {}),
      ...(filters.status ? { status: filters.status as any } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.attendanceRecord.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any }),
    prisma.attendanceRecord.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

export async function getById(id: string) {
  const result = await prisma.attendanceRecord.findUnique({ where: { id }, include: { student: { include: { person: true } }, moduleRegistration: { include: { module: true } } } });
  if (!result) throw new NotFoundError('AttendanceRecord', id);
  return result;
}

export async function create(data: any, userId: string, req: Request) {
  const result = await prisma.attendanceRecord.create({ data });
  await logAudit('AttendanceRecord', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('attendance.created', { id: result.id });
  return result;
}

export async function update(id: string, data: any, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await prisma.attendanceRecord.update({ where: { id }, data });
  await logAudit('AttendanceRecord', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('attendance.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await prisma.attendanceRecord.delete({ where: { id } });
  await logAudit('AttendanceRecord', id, 'DELETE', userId, previous, null, req);
  await emitEvent('attendance.deleted', { id });
}
