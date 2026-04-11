import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';

export interface AppealFilters {
  studentId?: string;
  status?: string;
  appealType?: string;
}

export async function list(filters: AppealFilters = {}, pagination: PaginationParams) {
  const where: Prisma.AppealWhereInput = {
    deletedAt: null,
    ...(filters.studentId && { studentId: filters.studentId }),
    ...(filters.status && { status: filters.status as any }),
    ...(filters.appealType && { appealType: filters.appealType as any }),
  };

  const [data, total] = await Promise.all([
    prisma.appeal.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.appeal.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
}

export async function getById(id: string) {
  return prisma.appeal.findFirst({
    where: { id, deletedAt: null },
    include: { student: { include: { person: true } } },
  });
}

export async function create(data: Prisma.AppealUncheckedCreateInput) {
  return prisma.appeal.create({ data });
}

export async function update(id: string, data: Prisma.AppealUpdateInput) {
  return prisma.appeal.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.appeal.update({ where: { id }, data: { deletedAt: new Date() } });
}
