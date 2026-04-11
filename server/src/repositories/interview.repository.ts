import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';

export interface InterviewFilters {
  applicationId?: string;
  status?: string;
}

export async function list(filters: InterviewFilters = {}, pagination: PaginationParams) {
  const where: Prisma.InterviewWhereInput = {
    deletedAt: null,
    ...(filters.applicationId && { applicationId: filters.applicationId }),
    ...(filters.status && { status: filters.status as any }),
  };

  const [data, total] = await Promise.all([
    prisma.interview.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.interview.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
}

export async function getById(id: string) {
  return prisma.interview.findFirst({
    where: { id, deletedAt: null },
    include: {
      application: {
        include: { applicant: { include: { person: true } } },
      },
    },
  });
}

export async function create(data: Prisma.InterviewUncheckedCreateInput) {
  return prisma.interview.create({ data });
}

export async function update(id: string, data: Prisma.InterviewUpdateInput) {
  return prisma.interview.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.interview.update({ where: { id }, data: { deletedAt: new Date() } });
}
