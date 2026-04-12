import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse } from '../utils/pagination';
import { type Prisma } from '@prisma/client';

export interface UKVIFilters {
  studentId?: string;
  complianceStatus?: string;
  tier4Status?: string;
  search?: string;
}

export interface ContactPointFilters {
  contactType?: string;
  status?: string;
  studentId?: string;
  fromDate?: string | Date;
  toDate?: string | Date;
}

export async function list(filters: UKVIFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.UKVIRecordWhereInput = {
    deletedAt: null,
    ...(filters.studentId && { studentId: filters.studentId }),
    ...(filters.complianceStatus && { complianceStatus: filters.complianceStatus as any }),
    ...(filters.tier4Status && { tier4Status: filters.tier4Status as any }),
    ...(filters.search && {
      OR: [
        { casNumber: { contains: filters.search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.uKVIRecord.findMany({
      where,
      include: { student: { include: { person: true } } },
      
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.uKVIRecord.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getById(id: string) {
  return prisma.uKVIRecord.findUnique({
    where: { id },
    include: {
      student: { include: { person: true } },
      contactPoints: { orderBy: { contactDate: 'desc' } },
      reports: { orderBy: { reportDate: 'desc' } },
      attendanceMonitoring: { orderBy: { monitoringDate: 'desc' } },
    },
  });
}

export async function create(data: Prisma.UKVIRecordUncheckedCreateInput) {
  return prisma.uKVIRecord.create({ data, include: { student: { include: { person: true } } } });
}

export async function update(id: string, data: Prisma.UKVIRecordUpdateInput) {
  return prisma.uKVIRecord.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.uKVIRecord.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function addContactPoint(data: Prisma.UKVIContactPointUncheckedCreateInput) {
  return prisma.uKVIContactPoint.create({ data });
}

export async function createReport(data: Prisma.UKVIReportUncheckedCreateInput) {
  return prisma.uKVIReport.create({ data });
}

export async function listContactPoints(
  filters: ContactPointFilters = {},
  pagination: CursorPaginationParams,
) {
  const where: Prisma.UKVIContactPointWhereInput = {
    ...(filters.contactType && { contactType: filters.contactType as any }),
    ...(filters.status && { status: filters.status as any }),
    ...(filters.studentId && { ukviRecord: { studentId: filters.studentId } }),
    ...((filters.fromDate || filters.toDate) && {
      contactDate: {
        ...(filters.fromDate && { gte: new Date(filters.fromDate) }),
        ...(filters.toDate && { lte: new Date(filters.toDate) }),
      },
    }),
  };

  const [data, total] = await Promise.all([
    prisma.uKVIContactPoint.findMany({
      where,
      
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: { [pagination.sort]: pagination.order } as any,
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

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getNonCompliantStudents(pagination: CursorPaginationParams) {
  const where: Prisma.UKVIRecordWhereInput = {
    deletedAt: null,
    complianceStatus: { in: ['AT_RISK', 'NON_COMPLIANT'] },
  };
  const [data, total] = await Promise.all([
    prisma.uKVIRecord.findMany({
      where,
      include: { student: { include: { person: true } } },
      
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
    }),
    prisma.uKVIRecord.count({ where }),
  ]);
  return buildCursorPaginatedResponse(data, total, pagination.limit);
}
