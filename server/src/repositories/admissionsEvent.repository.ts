import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse, safeOrderBy } from '../utils/pagination';
import { ADMISSIONS_EVENT_SORT } from '../utils/repository-sort-allow-lists';

export interface AdmissionsEventFilters {
  search?: string;
  eventType?: string;
}

export async function list(filters: AdmissionsEventFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.AdmissionsEventWhereInput = {
    deletedAt: null,
    ...(filters.eventType && { eventType: filters.eventType as any }),
    ...(filters.search && {
      OR: [{ title: { contains: filters.search, mode: 'insensitive' as const } }],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.admissionsEvent.findMany({
      where,
      
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: safeOrderBy(pagination, ADMISSIONS_EVENT_SORT, 'date'),
    }),
    prisma.admissionsEvent.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getById(id: string) {
  return prisma.admissionsEvent.findFirst({
    where: { id, deletedAt: null },
    include: { attendees: true },
  });
}

export async function create(data: Prisma.AdmissionsEventUncheckedCreateInput) {
  return prisma.admissionsEvent.create({ data });
}

export async function update(id: string, data: Prisma.AdmissionsEventUpdateInput) {
  return prisma.admissionsEvent.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.admissionsEvent.update({ where: { id }, data: { deletedAt: new Date() } });
}
