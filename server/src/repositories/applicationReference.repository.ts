import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';

export interface ApplicationReferenceFilters {
  applicationId?: string;
  search?: string;
}

export async function list(filters: ApplicationReferenceFilters = {}, pagination: PaginationParams) {
  const where: Prisma.ApplicationReferenceWhereInput = {
    deletedAt: null,
    ...(filters.applicationId && { applicationId: filters.applicationId }),
    ...(filters.search && {
      OR: [{ refereeName: { contains: filters.search, mode: 'insensitive' as const } }],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.applicationReference.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.applicationReference.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
}

export async function getById(id: string) {
  return prisma.applicationReference.findFirst({
    where: { id, deletedAt: null },
    include: { application: true },
  });
}

export async function create(data: Prisma.ApplicationReferenceUncheckedCreateInput) {
  return prisma.applicationReference.create({ data });
}

export async function update(id: string, data: Prisma.ApplicationReferenceUpdateInput) {
  return prisma.applicationReference.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.applicationReference.update({ where: { id }, data: { deletedAt: new Date() } });
}
