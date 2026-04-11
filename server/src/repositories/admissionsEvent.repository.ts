import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';

export interface AdmissionsEventFilters {
  search?: string;
  eventType?: string;
}

export async function list(filters: AdmissionsEventFilters = {}, pagination: PaginationParams) {
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
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.admissionsEvent.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
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
