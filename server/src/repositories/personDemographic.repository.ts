import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';

export interface PersonDemographicFilters {
  personId?: string;
}

export async function list(filters: PersonDemographicFilters = {}, pagination: PaginationParams) {
  const where: Prisma.PersonDemographicWhereInput = {
    deletedAt: null,
    ...(filters.personId && { personId: filters.personId }),
  };

  const [data, total] = await Promise.all([
    prisma.personDemographic.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.personDemographic.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
}

export async function getById(id: string) {
  return prisma.personDemographic.findFirst({
    where: { id, deletedAt: null },
    include: { person: true },
  });
}

export async function create(data: Prisma.PersonDemographicUncheckedCreateInput) {
  return prisma.personDemographic.create({ data });
}

export async function update(id: string, data: Prisma.PersonDemographicUpdateInput) {
  return prisma.personDemographic.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.personDemographic.update({ where: { id }, data: { deletedAt: new Date() } });
}
