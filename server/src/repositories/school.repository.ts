import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';

export interface SchoolFilters {
  search?: string;
  facultyId?: string;
}

export async function list(filters: SchoolFilters = {}, pagination: PaginationParams) {
  const where: Prisma.SchoolWhereInput = {
    deletedAt: null,
    ...(filters.facultyId && { facultyId: filters.facultyId }),
    ...(filters.search && {
      OR: [
        { title: { contains: filters.search, mode: 'insensitive' as const } },
        { code: { contains: filters.search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.school.findMany({
      where,
      include: { faculty: true },
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.school.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
}

export async function getById(id: string) {
  return prisma.school.findFirst({
    where: { id, deletedAt: null },
    include: {
      faculty: true,
      departments: { where: { deletedAt: null } },
    },
  });
}

export async function create(data: Prisma.SchoolUncheckedCreateInput) {
  return prisma.school.create({ data, include: { faculty: true } });
}

export async function update(id: string, data: Prisma.SchoolUpdateInput) {
  return prisma.school.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.school.update({ where: { id }, data: { deletedAt: new Date() } });
}
