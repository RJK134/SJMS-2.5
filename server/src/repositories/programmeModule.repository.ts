import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';

export interface ProgrammeModuleFilters {
  programmeId?: string;
  moduleId?: string;
  yearOfStudy?: number;
  semester?: string;
  moduleType?: string;
}

export async function list(filters: ProgrammeModuleFilters = {}, pagination: PaginationParams) {
  const where: Prisma.ProgrammeModuleWhereInput = {
    deletedAt: null,
    ...(filters.programmeId && { programmeId: filters.programmeId }),
    ...(filters.moduleId && { moduleId: filters.moduleId }),
    ...(filters.yearOfStudy !== undefined && { yearOfStudy: filters.yearOfStudy }),
    ...(filters.semester && { semester: filters.semester }),
    ...(filters.moduleType && { moduleType: filters.moduleType as any }),
  };

  const [data, total] = await Promise.all([
    prisma.programmeModule.findMany({
      where,
      include: { programme: true, module: true },
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.programmeModule.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
}

export async function getById(id: string) {
  return prisma.programmeModule.findFirst({
    where: { id, deletedAt: null },
    include: { programme: true, module: true },
  });
}

export async function create(data: Prisma.ProgrammeModuleUncheckedCreateInput) {
  return prisma.programmeModule.create({ data });
}

export async function update(id: string, data: Prisma.ProgrammeModuleUpdateInput) {
  return prisma.programmeModule.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.programmeModule.update({ where: { id }, data: { deletedAt: new Date() } });
}
