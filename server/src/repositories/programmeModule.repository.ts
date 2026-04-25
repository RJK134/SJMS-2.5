import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse, safeOrderBy } from '../utils/pagination';
import { PROGRAMME_MODULE_SORT } from '../utils/repository-sort-allow-lists';

export interface ProgrammeModuleFilters {
  programmeId?: string;
  moduleId?: string;
  yearOfStudy?: number;
  semester?: string;
  moduleType?: string;
}

export async function list(filters: ProgrammeModuleFilters = {}, pagination: CursorPaginationParams) {
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
      
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: safeOrderBy(pagination, PROGRAMME_MODULE_SORT),
    }),
    prisma.programmeModule.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
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
