import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse, safeOrderBy } from '../utils/pagination';

export interface ECClaimFilters {
  studentId?: string;
  status?: string;
}

export async function list(filters: ECClaimFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.ECClaimWhereInput = {
    deletedAt: null,
    ...(filters.studentId && { studentId: filters.studentId }),
    ...(filters.status && { status: filters.status as any }),
  };

  const [data, total] = await Promise.all([
    prisma.eCClaim.findMany({
      where,
      include: { student: { include: { person: true } }, moduleRegistration: { include: { module: true } } },
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: safeOrderBy(pagination, ['id', 'createdAt', 'updatedAt', 'triggerDate', 'startDate', 'dayOfWeek', 'timestamp', 'settingKey', 'postedDate', 'dueDate', 'contactDate'] as const),
    }),
    prisma.eCClaim.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getById(id: string) {
  return prisma.eCClaim.findFirst({
    where: { id, deletedAt: null },
    include: {
      student: { include: { person: true } },
      moduleRegistration: { include: { module: true } },
    },
  });
}

export async function create(data: Prisma.ECClaimUncheckedCreateInput) {
  return prisma.eCClaim.create({ data });
}

export async function update(id: string, data: Prisma.ECClaimUpdateInput) {
  return prisma.eCClaim.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.eCClaim.update({ where: { id }, data: { deletedAt: new Date() } });
}
