import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';
import { type Prisma } from '@prisma/client';

interface UKVIFilters {
  studentId?: string;
  complianceStatus?: string;
  tier4Status?: string;
}

export async function list(filters: UKVIFilters = {}, pagination: PaginationParams) {
  const where: Prisma.UKVIRecordWhereInput = {
    deletedAt: null,
    ...(filters.studentId && { studentId: filters.studentId }),
    ...(filters.complianceStatus && { complianceStatus: filters.complianceStatus as any }),
    ...(filters.tier4Status && { tier4Status: filters.tier4Status as any }),
  };

  const [data, total] = await Promise.all([
    prisma.uKVIRecord.findMany({
      where,
      include: { student: { include: { person: true } } },
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.uKVIRecord.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
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

export async function getNonCompliantStudents(pagination: PaginationParams) {
  const where: Prisma.UKVIRecordWhereInput = {
    deletedAt: null,
    complianceStatus: { in: ['AT_RISK', 'NON_COMPLIANT'] },
  };
  const [data, total] = await Promise.all([
    prisma.uKVIRecord.findMany({
      where,
      include: { student: { include: { person: true } } },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.uKVIRecord.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, pagination);
}
