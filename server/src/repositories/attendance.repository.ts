import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse } from '../utils/pagination';
import { type Prisma } from '@prisma/client';

export interface AttendanceFilters {
  studentId?: string;
  moduleRegistrationId?: string;
  dateFrom?: Date | string;
  dateTo?: Date | string;
  status?: string;
}

export interface AttendanceAlertFilters {
  studentId?: string;
  alertType?: string;
  status?: string;
}

export async function list(filters: AttendanceFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.AttendanceRecordWhereInput = {
    deletedAt: null,
    ...(filters.studentId && { studentId: filters.studentId }),
    ...(filters.moduleRegistrationId && { moduleRegistrationId: filters.moduleRegistrationId }),
    ...(filters.status && { status: filters.status as any }),
    ...((filters.dateFrom || filters.dateTo) && {
      date: {
        ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
        ...(filters.dateTo && { lte: new Date(filters.dateTo) }),
      },
    }),
  };

  const [data, total] = await Promise.all([
    prisma.attendanceRecord.findMany({
      where,
      include: { student: { include: { person: true } }, moduleRegistration: { include: { module: true } } },
      
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.attendanceRecord.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getById(id: string) {
  return prisma.attendanceRecord.findFirst({
    where: { id, deletedAt: null },
    include: { student: { include: { person: true } }, moduleRegistration: { include: { module: true } }, teachingEvent: true },
  });
}

export async function create(data: Prisma.AttendanceRecordUncheckedCreateInput) {
  return prisma.attendanceRecord.create({ data });
}

export async function update(id: string, data: Prisma.AttendanceRecordUpdateInput) {
  return prisma.attendanceRecord.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.attendanceRecord.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function listAlerts(filters: AttendanceAlertFilters = {}, pagination: CursorPaginationParams) {
  // AttendanceAlert has no deletedAt field — status drives the lifecycle.
  const where: Prisma.AttendanceAlertWhereInput = {
    ...(filters.studentId && { studentId: filters.studentId }),
    ...(filters.alertType && { alertType: filters.alertType as any }),
    ...(filters.status && { status: filters.status as any }),
  };

  const [data, total] = await Promise.all([
    prisma.attendanceAlert.findMany({
      where,
      
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: { [pagination.sort]: pagination.order } as any,
      include: {
        student: {
          include: {
            person: { select: { firstName: true, lastName: true } },
            enrolments: {
              where: { deletedAt: null, status: 'ENROLLED' },
              take: 1,
              orderBy: { createdAt: 'desc' },
              include: { programme: { select: { title: true, programmeCode: true } } },
            },
          },
        },
      },
    }),
    prisma.attendanceAlert.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getStudentAttendanceRate(studentId: string, academicYear: string) {
  const [total, present] = await Promise.all([
    prisma.attendanceRecord.count({
      where: { studentId, moduleRegistration: { academicYear } },
    }),
    prisma.attendanceRecord.count({
      where: { studentId, moduleRegistration: { academicYear }, status: { in: ['PRESENT', 'LATE'] } },
    }),
  ]);
  return { total, present, rate: total > 0 ? +(present / total * 100).toFixed(1) : 0 };
}

export async function getEngagementScores(studentId: string, academicYear: string) {
  return prisma.engagementScore.findMany({
    where: { studentId, academicYear },
    orderBy: { weekNumber: 'asc' },
  });
}

export async function createAlert(data: Prisma.AttendanceAlertUncheckedCreateInput) {
  return prisma.attendanceAlert.create({ data });
}

export async function findActiveEnrolmentForStudent(studentId: string) {
  return prisma.enrolment.findFirst({
    where: { studentId, status: 'ENROLLED', deletedAt: null },
    select: { academicYear: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getUkviRecordForStudent(studentId: string) {
  return prisma.uKVIRecord.findFirst({
    where: { studentId, deletedAt: null },
    select: { tier4Status: true, complianceStatus: true },
  });
}

export async function findActiveAlert(studentId: string, alertType: 'LOW_ATTENDANCE' | 'TIER4_RISK') {
  return prisma.attendanceAlert.findFirst({
    where: { studentId, alertType, status: 'ACTIVE' },
    select: { id: true },
  });
}
