import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse, safeOrderBy } from '../utils/pagination';
import { PROGRESSION_RECORD_SORT } from '../utils/repository-sort-allow-lists';

export interface ProgressionRecordFilters {
  enrolmentId?: string;
  decision?: string;
}

export async function list(filters: ProgressionRecordFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.ProgressionRecordWhereInput = {
    deletedAt: null,
    ...(filters.enrolmentId && { enrolmentId: filters.enrolmentId }),
    ...(filters.decision && { decision: filters.decision as any }),
  };

  const [data, total] = await Promise.all([
    prisma.progressionRecord.findMany({
      where,
      include: { enrolment: { include: { student: { include: { person: true } }, programme: true } } },
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: safeOrderBy(pagination, PROGRESSION_RECORD_SORT),
    }),
    prisma.progressionRecord.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getById(id: string) {
  return prisma.progressionRecord.findFirst({
    where: { id, deletedAt: null },
    include: {
      enrolment: {
        include: { student: { include: { person: true } }, programme: true },
      },
    },
  });
}

export async function create(data: Prisma.ProgressionRecordUncheckedCreateInput) {
  return prisma.progressionRecord.create({ data });
}

export async function update(id: string, data: Prisma.ProgressionRecordUpdateInput) {
  return prisma.progressionRecord.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.progressionRecord.update({ where: { id }, data: { deletedAt: new Date() } });
}
