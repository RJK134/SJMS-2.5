import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse, safeOrderBy } from '../utils/pagination';

export interface FacultyFilters {
  search?: string;
}

export async function list(filters: FacultyFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.FacultyWhereInput = {
    deletedAt: null,
    ...(filters.search && {
      OR: [
        { title: { contains: filters.search, mode: 'insensitive' as const } },
        { code: { contains: filters.search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.faculty.findMany({
      where,
      
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: safeOrderBy(pagination, ['id', 'createdAt', 'updatedAt', 'triggerDate', 'startDate', 'dayOfWeek', 'timestamp', 'settingKey', 'postedDate', 'dueDate', 'contactDate'] as const),
    }),
    prisma.faculty.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getById(id: string) {
  return prisma.faculty.findFirst({
    where: { id, deletedAt: null },
    include: { schools: { where: { deletedAt: null } } },
  });
}

export async function getByCode(code: string) {
  return prisma.faculty.findUnique({ where: { code } });
}

export async function create(data: Prisma.FacultyUncheckedCreateInput) {
  return prisma.faculty.create({ data });
}

export async function update(id: string, data: Prisma.FacultyUpdateInput) {
  return prisma.faculty.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.faculty.update({ where: { id }, data: { deletedAt: new Date() } });
}
