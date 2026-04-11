import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';

export interface OfferConditionFilters {
  applicationId?: string;
  status?: string;
}

export async function list(filters: OfferConditionFilters = {}, pagination: PaginationParams) {
  const where: Prisma.OfferConditionWhereInput = {
    deletedAt: null,
    ...(filters.applicationId && { applicationId: filters.applicationId }),
    ...(filters.status && { status: filters.status as any }),
  };

  const [data, total] = await Promise.all([
    prisma.offerCondition.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.offerCondition.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
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
