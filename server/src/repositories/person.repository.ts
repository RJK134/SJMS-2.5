import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse, safeOrderBy } from '../utils/pagination';

export interface PersonFilters {
  search?: string;
}

export async function list(filters: PersonFilters = {}, pagination: CursorPaginationParams) {
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
      
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: safeOrderBy(pagination, ['id', 'createdAt', 'updatedAt', 'triggerDate', 'startDate', 'dayOfWeek', 'timestamp', 'settingKey', 'postedDate', 'dueDate', 'contactDate'] as const),
    }),
    prisma.person.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
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
