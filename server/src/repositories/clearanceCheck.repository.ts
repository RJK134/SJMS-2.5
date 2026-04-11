import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';

export interface ClearanceCheckFilters {
  applicationId?: string;
  status?: string;
  checkType?: string;
}

export async function list(filters: ClearanceCheckFilters = {}, pagination: PaginationParams) {
  const where: Prisma.ClearanceCheckWhereInput = {
    deletedAt: null,
    ...(filters.applicationId && { applicationId: filters.applicationId }),
    ...(filters.status && { status: filters.status as any }),
    ...(filters.checkType && { checkType: filters.checkType as any }),
  };

  const [data, total] = await Promise.all([
    prisma.clearanceCheck.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.clearanceCheck.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
}

export async function getById(id: string) {
  return prisma.clearanceCheck.findFirst({
    where: { id, deletedAt: null },
    include: { application: true },
  });
}

export async function create(data: Prisma.ClearanceCheckUncheckedCreateInput) {
  return prisma.clearanceCheck.create({ data });
}

export async function update(id: string, data: Prisma.ClearanceCheckUpdateInput) {
  return prisma.clearanceCheck.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.clearanceCheck.update({ where: { id }, data: { deletedAt: new Date() } });
}
