import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';

export interface ProgressionRecordFilters {
  enrolmentId?: string;
  decision?: string;
}

export async function list(filters: ProgressionRecordFilters = {}, pagination: PaginationParams) {
  const where: Prisma.ProgressionRecordWhereInput = {
    deletedAt: null,
    ...(filters.enrolmentId && { enrolmentId: filters.enrolmentId }),
    ...(filters.decision && { decision: filters.decision as any }),
  };

  const [data, total] = await Promise.all([
    prisma.progressionRecord.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.progressionRecord.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
}

export async function getById(id: string) {
  return prisma.progressionRecord.findFirst({
    where: { id, deletedAt: null },
    include: {
      enrolment: {
        include: { student: { include: { person: true } }, programme: true },
      },
    },
  });
}

export async function create(data: Prisma.ProgressionRecordUncheckedCreateInput) {
  return prisma.progressionRecord.create({ data });
}

export async function update(id: string, data: Prisma.ProgressionRecordUpdateInput) {
  return prisma.progressionRecord.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.progressionRecord.update({ where: { id }, data: { deletedAt: new Date() } });
}
