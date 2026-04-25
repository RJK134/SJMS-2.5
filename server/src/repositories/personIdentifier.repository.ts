import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse, safeOrderBy } from '../utils/pagination';
import { PERSON_IDENTIFIER_SORT } from '../utils/repository-sort-allow-lists';

export interface PersonIdentifierFilters {
  personId?: string;
  identifierType?: string;
  search?: string;
}

export async function list(filters: PersonIdentifierFilters = {}, pagination: CursorPaginationParams) {
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
      
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: safeOrderBy(pagination, PERSON_IDENTIFIER_SORT),
    }),
    prisma.personIdentifier.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
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
