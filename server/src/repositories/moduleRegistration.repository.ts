import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';

export interface ModuleRegistrationFilters {
  enrolmentId?: string;
  moduleId?: string;
  academicYear?: string;
  status?: string;
}

export async function list(filters: ModuleRegistrationFilters = {}, pagination: PaginationParams) {
  const where: Prisma.ModuleRegistrationWhereInput = {
    deletedAt: null,
    ...(filters.enrolmentId && { enrolmentId: filters.enrolmentId }),
    ...(filters.moduleId && { moduleId: filters.moduleId }),
    ...(filters.academicYear && { academicYear: filters.academicYear }),
    ...(filters.status && { status: filters.status as any }),
  };

  const [data, total] = await Promise.all([
    prisma.moduleRegistration.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.moduleRegistration.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
}

export async function getById(id: string) {
  return prisma.moduleRegistration.findFirst({
    where: { id, deletedAt: null },
    include: {
      enrolment: { include: { student: { include: { person: true } } } },
      module: true,
    },
  });
}

export async function create(data: Prisma.ModuleRegistrationUncheckedCreateInput) {
  return prisma.moduleRegistration.create({ data });
}

export async function update(id: string, data: Prisma.ModuleRegistrationUpdateInput) {
  return prisma.moduleRegistration.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.moduleRegistration.update({ where: { id }, data: { deletedAt: new Date() } });
}
