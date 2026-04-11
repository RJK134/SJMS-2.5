import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';

export interface ModuleResultFilters {
  moduleId?: string;
  moduleRegistrationId?: string;
  academicYear?: string;
  outcome?: string;
}

export async function list(filters: ModuleResultFilters = {}, pagination: PaginationParams) {
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
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.moduleResult.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
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
