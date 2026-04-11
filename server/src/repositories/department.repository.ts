import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';

export interface DepartmentFilters {
  search?: string;
  schoolId?: string;
}

export async function list(filters: DepartmentFilters = {}, pagination: PaginationParams) {
  const where: Prisma.DepartmentWhereInput = {
    deletedAt: null,
    ...(filters.schoolId && { schoolId: filters.schoolId }),
    ...(filters.search && {
      OR: [
        { title: { contains: filters.search, mode: 'insensitive' as const } },
        { code: { contains: filters.search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.department.findMany({
      where,
      include: { school: { include: { faculty: true } } },
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.department.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
}

export async function getById(id: string) {
  return prisma.department.findFirst({
    where: { id, deletedAt: null },
    include: {
      school: { include: { faculty: true } },
      programmes: { where: { deletedAt: null } },
    },
  });
}

export async function getByCode(code: string) {
  return prisma.department.findUnique({ where: { code } });
}

export async function create(data: Prisma.DepartmentUncheckedCreateInput) {
  return prisma.department.create({ data });
}

export async function update(id: string, data: Prisma.DepartmentUpdateInput) {
  return prisma.department.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.department.update({ where: { id }, data: { deletedAt: new Date() } });
}
