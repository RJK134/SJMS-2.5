import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse, safeOrderBy } from '../utils/pagination';

export interface ApplicationQualificationFilters {
  applicationId?: string;
  search?: string;
}

export async function list(filters: ApplicationQualificationFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.ApplicationQualificationWhereInput = {
    deletedAt: null,
    ...(filters.applicationId && { applicationId: filters.applicationId }),
    ...(filters.search && {
      subject: { contains: filters.search, mode: 'insensitive' as const },
    }),
  };

  const [data, total] = await Promise.all([
    prisma.applicationQualification.findMany({
      where,
      
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: safeOrderBy(pagination, ['id', 'createdAt', 'updatedAt', 'triggerDate', 'startDate', 'dayOfWeek', 'timestamp', 'settingKey', 'postedDate', 'dueDate', 'contactDate'] as const),
    }),
    prisma.applicationQualification.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getById(id: string) {
  return prisma.applicationQualification.findFirst({
    where: { id, deletedAt: null },
    include: { application: true },
  });
}

export async function create(data: Prisma.ApplicationQualificationUncheckedCreateInput) {
  return prisma.applicationQualification.create({ data });
}

export async function update(id: string, data: Prisma.ApplicationQualificationUpdateInput) {
  return prisma.applicationQualification.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.applicationQualification.update({ where: { id }, data: { deletedAt: new Date() } });
}
