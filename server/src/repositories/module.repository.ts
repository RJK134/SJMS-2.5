import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';

export interface ModuleFilters {
  search?: string;
  departmentId?: string;
  status?: string;
  level?: number;
}

export async function list(filters: ModuleFilters = {}, pagination: PaginationParams) {
  const where: Prisma.ModuleWhereInput = {
    deletedAt: null,
    ...(filters.departmentId && { departmentId: filters.departmentId }),
    ...(filters.status && { status: filters.status as any }),
    ...(filters.level !== undefined && { level: filters.level }),
    ...(filters.search && {
      OR: [
        { title: { contains: filters.search, mode: 'insensitive' as const } },
        { moduleCode: { contains: filters.search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.module.findMany({
      where,
      include: { department: { select: { title: true } } },
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.module.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
}

export async function getById(id: string) {
  return prisma.module.findFirst({
    where: { id, deletedAt: null },
    include: {
      department: true,
      specifications: true,
      programmeModules: { include: { programme: true } },
    },
  });
}

export async function create(data: Prisma.ModuleUncheckedCreateInput) {
  return prisma.module.create({ data });
}

export async function update(id: string, data: Prisma.ModuleUpdateInput) {
  return prisma.module.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.module.update({ where: { id }, data: { deletedAt: new Date() } });
}
