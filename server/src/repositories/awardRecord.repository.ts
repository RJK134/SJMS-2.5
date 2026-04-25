import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse, safeOrderBy } from '../utils/pagination';
import { AWARD_RECORD_SORT } from '../utils/repository-sort-allow-lists';

export interface AwardRecordFilters {
  studentId?: string;
  programmeId?: string;
  classification?: string;
}

export async function list(filters: AwardRecordFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.AwardRecordWhereInput = {
    deletedAt: null,
    ...(filters.studentId && { studentId: filters.studentId }),
    ...(filters.programmeId && { programmeId: filters.programmeId }),
    ...(filters.classification && { classification: filters.classification as any }),
  };

  const [data, total] = await Promise.all([
    prisma.awardRecord.findMany({
      where,
      include: { student: { include: { person: true } }, programme: true },
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: safeOrderBy(pagination, AWARD_RECORD_SORT),
    }),
    prisma.awardRecord.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getById(id: string) {
  return prisma.awardRecord.findFirst({
    where: { id, deletedAt: null },
    include: {
      student: { include: { person: true } },
      programme: true,
      enrolment: true,
      degreeCalculation: true,
    },
  });
}

export async function create(data: Prisma.AwardRecordUncheckedCreateInput) {
  return prisma.awardRecord.create({ data });
}

export async function update(id: string, data: Prisma.AwardRecordUpdateInput) {
  return prisma.awardRecord.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.awardRecord.update({ where: { id }, data: { deletedAt: new Date() } });
}
