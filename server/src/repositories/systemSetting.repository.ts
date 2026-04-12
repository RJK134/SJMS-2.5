import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse } from '../utils/pagination';
import { type Prisma } from '@prisma/client';

export interface SystemSettingFilters {
  search?: string;
  category?: string;
}

export async function list(filters: SystemSettingFilters, pagination: CursorPaginationParams) {
  const where: Prisma.SystemSettingWhereInput = {
    ...(filters.search && {
      OR: [
        { settingKey: { contains: filters.search, mode: 'insensitive' as const } },
        { description: { contains: filters.search, mode: 'insensitive' as const } },
      ],
    }),
    ...(filters.category && { category: filters.category }),
  };

  const [data, total] = await Promise.all([
    prisma.systemSetting.findMany({
      where,
      take: pagination.limit + 1,
      ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: { [pagination.sort]: pagination.order },
    }),
    prisma.systemSetting.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getById(id: string) {
  return prisma.systemSetting.findUnique({ where: { id } });
}

export async function getByKey(settingKey: string) {
  return prisma.systemSetting.findUnique({ where: { settingKey } });
}

export async function create(data: Prisma.SystemSettingCreateInput) {
  return prisma.systemSetting.create({ data });
}

export async function update(id: string, data: Prisma.SystemSettingUpdateInput) {
  return prisma.systemSetting.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.systemSetting.delete({ where: { id } });
}
