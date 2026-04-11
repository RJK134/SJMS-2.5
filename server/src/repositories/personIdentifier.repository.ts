import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';

export interface PersonIdentifierFilters {
  personId?: string;
  identifierType?: string;
  search?: string;
}

export async function list(filters: PersonIdentifierFilters = {}, pagination: PaginationParams) {
  const where: Prisma.PersonIdentifierWhereInput = {
    deletedAt: null,
    ...(filters.personId && { personId: filters.personId }),
    ...(filters.identifierType && { identifierType: filters.identifierType as any }),
    ...(filters.search && {
      value: { contains: filters.search, mode: 'insensitive' as const },
    }),
  };

  const [data, total] = await Promise.all([
    prisma.personIdentifier.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.personIdentifier.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
}

export async function getById(id: string) {
  return prisma.personIdentifier.findFirst({
    where: { id, deletedAt: null },
    include: { person: true },
  });
}

export async function create(data: Prisma.PersonIdentifierUncheckedCreateInput) {
  return prisma.personIdentifier.create({ data });
}

export async function update(id: string, data: Prisma.PersonIdentifierUpdateInput) {
  return prisma.personIdentifier.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.personIdentifier.update({ where: { id }, data: { deletedAt: new Date() } });
}
