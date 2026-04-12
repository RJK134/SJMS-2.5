import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/attendance.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface AttendanceListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  studentId?: string;
  moduleRegistrationId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}

export interface AttendanceAlertListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  studentId?: string;
  alertType?: string;
  status?: string;
}

export async function list(query: AttendanceListQuery) {
  const { cursor, limit, sort, order, studentId, moduleRegistrationId, dateFrom, dateTo, status } = query;
  return repo.list(
    { studentId, moduleRegistrationId, dateFrom, dateTo, status },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('AttendanceRecord', id);
  return result;
}

export async function create(data: Prisma.AttendanceRecordUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('AttendanceRecord', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('attendance.created', { id: result.id });
  return result;
}

export async function update(id: string, data: Prisma.AttendanceRecordUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('AttendanceRecord', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('attendance.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('AttendanceRecord', id, 'DELETE', userId, previous, null, req);
  await emitEvent('attendance.deleted', { id });
}

// ── Attendance Alerts ────────────────────────────────────────────────────

export async function listAlerts(query: AttendanceAlertListQuery) {
  const { cursor, limit, sort, order, studentId, alertType, status } = query;
  return repo.listAlerts(
    { studentId, alertType, status },
    { cursor, limit, sort, order },
  );
}
