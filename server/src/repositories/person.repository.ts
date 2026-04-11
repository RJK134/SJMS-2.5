import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';

export interface PersonFilters {
  search?: string;
}

export async function list(filters: PersonFilters = {}, pagination: PaginationParams) {
  const where: Prisma.PersonWhereInput = {
    deletedAt: null,
    ...(filters.search && {
      OR: [
        { firstName: { contains: filters.search, mode: 'insensitive' as const } },
        { lastName: { contains: filters.search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.person.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.person.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
}

export async function getById(id: string) {
  return prisma.person.findFirst({
    where: { id, deletedAt: null },
    include: { contacts: true, addresses: true, identifiers: true, demographic: true },
  });
}

export async function create(data: Prisma.PersonUncheckedCreateInput) {
  return prisma.person.create({ data });
}

export async function update(id: string, data: Prisma.PersonUpdateInput) {
  return prisma.person.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.person.update({ where: { id }, data: { deletedAt: new Date() } });
}
