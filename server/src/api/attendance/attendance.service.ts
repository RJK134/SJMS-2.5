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
  emitEvent({
    event: 'attendance.recorded',
    entityType: 'AttendanceRecord',
    entityId: result.id,
    actorId: userId,
    data: {
      studentId: result.studentId,
      moduleRegistrationId: result.moduleRegistrationId,
      date: result.date.toISOString(),
      status: result.status,
    },
  });
  return result;
}

export async function update(id: string, data: Prisma.AttendanceRecordUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('AttendanceRecord', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'attendance.recorded',
    entityType: 'AttendanceRecord',
    entityId: id,
    actorId: userId,
    data: {
      studentId: result.studentId,
      moduleRegistrationId: result.moduleRegistrationId,
      date: result.date.toISOString(),
      status: result.status,
      previousStatus: previous.status,
    },
  });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('AttendanceRecord', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'attendance.recorded',
    entityType: 'AttendanceRecord',
    entityId: id,
    actorId: userId,
    data: {
      studentId: previous.studentId,
      moduleRegistrationId: previous.moduleRegistrationId,
      date: previous.date.toISOString(),
      status: 'DELETED',
    },
  });
}

// ── Attendance Alerts ────────────────────────────────────────────────────

export async function listAlerts(query: AttendanceAlertListQuery) {
  const { cursor, limit, sort, order, studentId, alertType, status } = query;
  return repo.listAlerts(
    { studentId, alertType, status },
    { cursor, limit, sort, order },
  );
}

// ── Attendance monitoring event helpers ──────────────────────────────────
// Called by attendance-monitoring logic (n8n webhook handler or scheduled job)
// when a student's attendance rate crosses a configured threshold.

/**
 * Emit an attendance alert event when a student drops below the
 * institution's attendance threshold.
 */
export function emitAttendanceAlert(
  studentId: string,
  attendanceRate: number,
  threshold: number,
  weekEnding: string,
  actorId: string,
): void {
  emitEvent({
    event: 'attendance.alert_triggered',
    entityType: 'Student',
    entityId: studentId,
    actorId,
    data: { studentId, attendanceRate, threshold, weekEnding },
  });
}

/**
 * Emit a UKVI breach-risk event when a Tier 4 / Student-route visa
 * holder's attendance risks falling below the statutory threshold.
 */
export function emitUkviBreach(
  studentId: string,
  attendanceRate: number,
  actorId: string,
): void {
  emitEvent({
    event: 'attendance.ukvi_breach_risk',
    entityType: 'Student',
    entityId: studentId,
    actorId,
    data: { studentId, attendanceRate, ukviThreshold: 70 },
  });
}
