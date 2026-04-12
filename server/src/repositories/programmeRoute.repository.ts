import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse } from '../utils/pagination';

export interface ProgrammeRouteFilters {
  studentId?: string;
  programmeId?: string;
  routeCode?: string;
  pathwayCode?: string;
}

export async function list(filters: ProgrammeRouteFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.StudentProgrammeRouteWhereInput = {
    deletedAt: null,
    ...(filters.studentId && { studentId: filters.studentId }),
    ...(filters.programmeId && { programmeId: filters.programmeId }),
    ...(filters.routeCode && { routeCode: filters.routeCode }),
    ...(filters.pathwayCode && { pathwayCode: filters.pathwayCode }),
  };

  const [data, total] = await Promise.all([
    prisma.studentProgrammeRoute.findMany({
      where,
      include: { student: { include: { person: true } }, programme: true },
      
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.studentProgrammeRoute.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getById(id: string) {
  return prisma.studentProgrammeRoute.findFirst({
    where: { id, deletedAt: null },
    include: { student: { include: { person: true } }, programme: true },
  });
}

export async function create(data: Prisma.StudentProgrammeRouteUncheckedCreateInput) {
  return prisma.studentProgrammeRoute.create({ data });
}

export async function update(id: string, data: Prisma.StudentProgrammeRouteUpdateInput) {
  return prisma.studentProgrammeRoute.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.studentProgrammeRoute.update({ where: { id }, data: { deletedAt: new Date() } });
}
