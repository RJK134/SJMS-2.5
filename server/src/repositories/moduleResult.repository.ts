import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse } from '../utils/pagination';

export interface ModuleResultFilters {
  moduleId?: string;
  moduleRegistrationId?: string;
  academicYear?: string;
  outcome?: string;
}

export async function list(filters: ModuleResultFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.ModuleResultWhereInput = {
    deletedAt: null,
    ...(filters.moduleId && { moduleId: filters.moduleId }),
    ...(filters.moduleRegistrationId && { moduleRegistrationId: filters.moduleRegistrationId }),
    ...(filters.academicYear && { academicYear: filters.academicYear }),
    ...(filters.outcome && { outcome: filters.outcome as any }),
  };

  const [data, total] = await Promise.all([
    prisma.moduleResult.findMany({
      where,
      include: { moduleRegistration: { include: { module: true, enrolment: { include: { student: { include: { person: true } } } } } }, module: true },
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.moduleResult.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getById(id: string) {
  return prisma.moduleResult.findFirst({
    where: { id, deletedAt: null },
    include: {
      moduleRegistration: {
        include: { enrolment: { include: { student: { include: { person: true } } } } },
      },
      module: true,
    },
  });
}

export async function create(data: Prisma.ModuleResultUncheckedCreateInput) {
  return prisma.moduleResult.create({ data });
}

export async function update(id: string, data: Prisma.ModuleResultUpdateInput) {
  return prisma.moduleResult.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.moduleResult.update({ where: { id }, data: { deletedAt: new Date() } });
}
