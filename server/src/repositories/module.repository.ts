import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse, safeOrderBy } from '../utils/pagination';

export interface ModuleFilters {
  search?: string;
  departmentId?: string;
  status?: string;
  level?: number;
}

export async function list(filters: ModuleFilters = {}, pagination: CursorPaginationParams) {
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
      
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: safeOrderBy(pagination, ['id', 'createdAt', 'updatedAt', 'triggerDate', 'startDate', 'dayOfWeek', 'timestamp', 'settingKey', 'postedDate', 'dueDate', 'contactDate'] as const),
    }),
    prisma.module.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
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
