import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';

export interface SubmissionFilters {
  assessmentId?: string;
  moduleRegistrationId?: string;
  search?: string;
  status?: string;
}

export async function list(filters: SubmissionFilters = {}, pagination: PaginationParams) {
  const where: Prisma.SubmissionWhereInput = {
    deletedAt: null,
    ...(filters.assessmentId && { assessmentId: filters.assessmentId }),
    ...(filters.moduleRegistrationId && { moduleRegistrationId: filters.moduleRegistrationId }),
    ...(filters.status && { status: filters.status as any }),
    ...(filters.search && {
      OR: [{ fileName: { contains: filters.search, mode: 'insensitive' as const } }],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.submission.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
}

export async function getById(id: string) {
  return prisma.submission.findFirst({
    where: { id, deletedAt: null },
    include: { assessment: true, moduleRegistration: true },
  });
}

export async function create(data: Prisma.SubmissionUncheckedCreateInput) {
  return prisma.submission.create({ data });
}

export async function update(id: string, data: Prisma.SubmissionUpdateInput) {
  return prisma.submission.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.submission.update({ where: { id }, data: { deletedAt: new Date() } });
}
