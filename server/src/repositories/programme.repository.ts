import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse, safeOrderBy } from '../utils/pagination';
import { type Prisma } from '@prisma/client';

export interface ProgrammeFilters {
  status?: string;
  level?: string;
  departmentId?: string;
  search?: string;
}

export async function list(filters: ProgrammeFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.ProgrammeWhereInput = {
    deletedAt: null,
    ...(filters.status && { status: filters.status as any }),
    ...(filters.level && { level: filters.level as any }),
    ...(filters.departmentId && { departmentId: filters.departmentId }),
    ...(filters.search && {
      OR: [
        { title: { contains: filters.search, mode: 'insensitive' as const } },
        { programmeCode: { contains: filters.search, mode: 'insensitive' as const } },
        { ucasCode: { contains: filters.search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.programme.findMany({
      where,
      include: { department: { include: { school: { include: { faculty: true } } } } },
      
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: safeOrderBy(pagination, ['id', 'createdAt', 'updatedAt', 'triggerDate', 'startDate', 'dayOfWeek', 'timestamp', 'settingKey', 'postedDate', 'dueDate', 'contactDate'] as const),
    }),
    prisma.programme.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getById(id: string) {
  return prisma.programme.findFirst({
    where: { id, deletedAt: null },
    include: {
      department: { include: { school: { include: { faculty: true } } } },
      programmeModules: { include: { module: true } },
      specifications: true,
      approvals: true,
    },
  });
}

export async function create(data: Prisma.ProgrammeUncheckedCreateInput) {
  return prisma.programme.create({
    data,
    include: { department: true },
  });
}

export async function update(id: string, data: Prisma.ProgrammeUpdateInput) {
  return prisma.programme.update({ where: { id }, data, include: { department: true } });
}

export async function softDelete(id: string) {
  return prisma.programme.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function getModulesForProgramme(programmeId: string) {
  return prisma.programmeModule.findMany({
    where: { programmeId },
    include: { module: true },
    orderBy: [{ yearOfStudy: 'asc' }, { semester: 'asc' }],
  });
}

export async function getByCode(programmeCode: string) {
  return prisma.programme.findUnique({
    where: { programmeCode },
    include: { department: { include: { school: true } } },
  });
}
