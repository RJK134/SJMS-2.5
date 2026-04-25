import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse, safeOrderBy } from '../utils/pagination';
import { APPEAL_SORT } from '../utils/repository-sort-allow-lists';

export interface AppealFilters {
  studentId?: string;
  status?: string;
  appealType?: string;
}

export async function list(filters: AppealFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.AppealWhereInput = {
    deletedAt: null,
    ...(filters.studentId && { studentId: filters.studentId }),
    ...(filters.status && { status: filters.status as any }),
    ...(filters.appealType && { appealType: filters.appealType as any }),
  };

  const [data, total] = await Promise.all([
    prisma.appeal.findMany({
      where,
      include: { student: { include: { person: true } } },
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: safeOrderBy(pagination, APPEAL_SORT, 'submittedDate'),
    }),
    prisma.appeal.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getById(id: string) {
  return prisma.appeal.findFirst({
    where: { id, deletedAt: null },
    include: { student: { include: { person: true } } },
  });
}

export async function create(data: Prisma.AppealUncheckedCreateInput) {
  return prisma.appeal.create({ data });
}

export async function update(id: string, data: Prisma.AppealUpdateInput) {
  return prisma.appeal.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.appeal.update({ where: { id }, data: { deletedAt: new Date() } });
}
