import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse, safeOrderBy } from '../utils/pagination';

export interface OfferConditionFilters {
  applicationId?: string;
  status?: string;
}

export async function list(filters: OfferConditionFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.OfferConditionWhereInput = {
    deletedAt: null,
    ...(filters.applicationId && { applicationId: filters.applicationId }),
    ...(filters.status && { status: filters.status as any }),
  };

  const [data, total] = await Promise.all([
    prisma.offerCondition.findMany({
      where,
      
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: safeOrderBy(pagination, ['id', 'createdAt', 'updatedAt', 'triggerDate', 'startDate', 'dayOfWeek', 'timestamp', 'settingKey', 'postedDate', 'dueDate', 'contactDate'] as const),
    }),
    prisma.offerCondition.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getById(id: string) {
  return prisma.offerCondition.findFirst({
    where: { id, deletedAt: null },
    include: { application: true },
  });
}

export async function create(data: Prisma.OfferConditionUncheckedCreateInput) {
  return prisma.offerCondition.create({ data });
}

export async function update(id: string, data: Prisma.OfferConditionUpdateInput) {
  return prisma.offerCondition.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.offerCondition.update({ where: { id }, data: { deletedAt: new Date() } });
}
