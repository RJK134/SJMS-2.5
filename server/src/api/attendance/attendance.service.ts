import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/attendance.repository';
import * as settingsRepo from '../../repositories/systemSetting.repository';
import prisma from '../../utils/prisma';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import logger from '../../utils/logger';
import { NotFoundError } from '../../utils/errors';

/** Default UKVI attendance threshold if not configured in SystemSetting. */
const UKVI_ATTENDANCE_THRESHOLD_DEFAULT = 70;
/** Default general attendance alert threshold (below UKVI level). */
const GENERAL_ATTENDANCE_THRESHOLD_DEFAULT = 80;

/** Reads the UKVI attendance threshold from SystemSetting, falling back to default. */
async function getUkviAttendanceThreshold(): Promise<number> {
  const setting = await settingsRepo.getByKey('ukvi.attendance.threshold');
  if (setting?.settingValue) {
    const parsed = parseInt(setting.settingValue, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 100) return parsed;
  }
  return UKVI_ATTENDANCE_THRESHOLD_DEFAULT;
}

/** Reads the general (non-UKVI) attendance alert threshold from SystemSetting. */
async function getGeneralAttendanceThreshold(): Promise<number> {
  const setting = await settingsRepo.getByKey('attendance.alert.threshold');
  if (setting?.settingValue) {
    const parsed = parseInt(setting.settingValue, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 100) return parsed;
  }
  return GENERAL_ATTENDANCE_THRESHOLD_DEFAULT;
}

/**
 * Evaluate attendance thresholds for the current active enrolment of the given
 * student and, if the rolling rate is under the configured threshold(s), emit
 * the matching alert event and create an `AttendanceAlert` row.
 *
 * This closes the KI-P6-003 follow-up: attendance monitoring was config-aware
 * but never invoked from the mutation path (TODO on line 129 of this file).
 *
 * Behaviour:
 * - Looks up the student's active enrolment (status `ENROLLED`) to derive the
 *   current academic year. If none, the function is a no-op (attendance
 *   recorded for a withdrawn student is not a compliance event).
 * - Computes the rolling rate via `repo.getStudentAttendanceRate`.
 * - If a Tier-4 visa holder and rate is below the UKVI threshold, emits
 *   `attendance.ukvi_breach_risk` and creates a TIER4_RISK alert.
 * - If rate is below the general threshold, emits `attendance.alert_triggered`
 *   and creates a LOW_ATTENDANCE alert.
 * - Deduplicates: only creates a new ACTIVE alert of the same type if no
 *   ACTIVE alert of that type already exists for the student.
 * - All alert-creation errors are swallowed — attendance mutation must never
 *   roll back because alert persistence failed (audit log will still record
 *   the underlying attendance change).
 */
async function evaluateAttendanceThresholds(
  studentId: string,
  actorId: string,
): Promise<void> {
  try {
    const enrolment = await prisma.enrolment.findFirst({
      where: { studentId, status: 'ENROLLED', deletedAt: null },
      select: { academicYear: true },
      orderBy: { createdAt: 'desc' },
    });
    if (!enrolment) return;

    const { rate, total } = await repo.getStudentAttendanceRate(studentId, enrolment.academicYear);
    // Need a meaningful sample size before firing a compliance-grade alert.
    if (total < 5) return;

    const generalThreshold = await getGeneralAttendanceThreshold();
    const ukviThreshold = await getUkviAttendanceThreshold();

    const visa = await prisma.uKVIRecord.findFirst({
      where: { studentId, deletedAt: null },
      select: { tier4Status: true, complianceStatus: true },
    });
    const isSponsored = visa?.tier4Status === 'SPONSORED';

    // UKVI breach takes precedence for sponsored students.
    if (isSponsored && rate < ukviThreshold) {
      await createAlertIfNotOpen(studentId, 'TIER4_RISK', rate, ukviThreshold);
      emitEvent({
        event: 'attendance.ukvi_breach_risk',
        entityType: 'Student',
        entityId: studentId,
        actorId,
        data: {
          studentId,
          academicYear: enrolment.academicYear,
          attendanceRate: rate,
          ukviThreshold,
        },
      });
      return;
    }

    if (rate < generalThreshold) {
      await createAlertIfNotOpen(studentId, 'LOW_ATTENDANCE', rate, generalThreshold);
      emitEvent({
        event: 'attendance.alert_triggered',
        entityType: 'Student',
        entityId: studentId,
        actorId,
        data: {
          studentId,
          academicYear: enrolment.academicYear,
          attendanceRate: rate,
          threshold: generalThreshold,
        },
      });
    }
  } catch (err) {
    logger.warn('Attendance threshold evaluation failed; the underlying mutation succeeded', {
      studentId,
      error: (err as Error).message,
    });
  }
}

async function createAlertIfNotOpen(
  studentId: string,
  alertType: 'LOW_ATTENDANCE' | 'TIER4_RISK',
  currentValue: number,
  threshold: number,
): Promise<void> {
  const existing = await prisma.attendanceAlert.findFirst({
    where: { studentId, alertType, status: 'ACTIVE' },
    select: { id: true },
  });
  if (existing) return;
  // Prisma accepts plain number literals for Decimal columns and serialises
  // via the driver's Decimal adapter — no explicit Prisma.Decimal construction
  // needed (and we only imported Prisma as a type).
  await repo.createAlert({
    studentId,
    alertType,
    threshold,
    currentValue,
    triggerDate: new Date(),
    status: 'ACTIVE',
  } as unknown as Prisma.AttendanceAlertUncheckedCreateInput);
}

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
  // Fire-and-forget threshold evaluation — must not block the response.
  void evaluateAttendanceThresholds(result.studentId, userId);
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
  // Re-evaluate only when the marking of attendance changed; purely cosmetic
  // updates (e.g. method) don't shift the rate.
  if (previous.status !== result.status) {
    void evaluateAttendanceThresholds(result.studentId, userId);
  }
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

// ── Attendance monitoring event helpers (kept for n8n handler use) ───────
// These are still exported because an external attendance-monitoring job
// (e.g. a weekly cron in n8n) also calls them. The in-process threshold
// evaluator above runs on every attendance mutation as a near-real-time
// backstop so compliance is not dependent on n8n being active.

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
 * Threshold is read from SystemSetting (key: ukvi.attendance.threshold).
 */
export async function emitUkviBreach(
  studentId: string,
  attendanceRate: number,
  actorId: string,
): Promise<void> {
  const threshold = await getUkviAttendanceThreshold();
  emitEvent({
    event: 'attendance.ukvi_breach_risk',
    entityType: 'Student',
    entityId: studentId,
    actorId,
    data: { studentId, attendanceRate, ukviThreshold: threshold },
  });
}

// Re-exported for unit tests without polluting the module's public surface.
export const __test = { evaluateAttendanceThresholds, getGeneralAttendanceThreshold };
