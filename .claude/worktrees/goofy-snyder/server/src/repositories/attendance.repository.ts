import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';
import { type Prisma } from '@prisma/client';

interface AttendanceFilters {
  studentId?: string;
  moduleRegistrationId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  status?: string;
}

export async function list(filters: AttendanceFilters = {}, pagination: PaginationParams) {
  const where: Prisma.AttendanceRecordWhereInput = {
    ...(filters.studentId && { studentId: filters.studentId }),
    ...(filters.moduleRegistrationId && { moduleRegistrationId: filters.moduleRegistrationId }),
    ...(filters.status && { status: filters.status as any }),
    ...((filters.dateFrom || filters.dateTo) && {
      date: {
        ...(filters.dateFrom && { gte: filters.dateFrom }),
        ...(filters.dateTo && { lte: filters.dateTo }),
      },
    }),
  };

  const [data, total] = await Promise.all([
    prisma.attendanceRecord.findMany({
      where,
      include: { student: { include: { person: true } }, moduleRegistration: { include: { module: true } } },
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { date: pagination.order },
    }),
    prisma.attendanceRecord.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
}

export async function getById(id: string) {
  return prisma.attendanceRecord.findUnique({
    where: { id },
    include: { student: { include: { person: true } }, moduleRegistration: { include: { module: true } }, teachingEvent: true },
  });
}

export async function create(data: Prisma.AttendanceRecordUncheckedCreateInput) {
  return prisma.attendanceRecord.create({ data });
}

export async function update(id: string, data: Prisma.AttendanceRecordUpdateInput) {
  return prisma.attendanceRecord.update({ where: { id }, data });
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
