import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';

export interface ECClaimFilters {
  studentId?: string;
  status?: string;
  claimType?: string;
}

export async function list(filters: ECClaimFilters = {}, pagination: PaginationParams) {
  const where: Prisma.ECClaimWhereInput = {
    deletedAt: null,
    ...(filters.studentId && { studentId: filters.studentId }),
    ...(filters.status && { status: filters.status as any }),
    ...(filters.claimType && { claimType: filters.claimType as any }),
  };

  const [data, total] = await Promise.all([
    prisma.eCClaim.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.eCClaim.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
}

export async function getById(id: string) {
  return prisma.eCClaim.findFirst({
    where: { id, deletedAt: null },
    include: {
      student: { include: { person: true } },
      moduleRegistration: { include: { module: true } },
    },
  });
}

export async function create(data: Prisma.ECClaimUncheckedCreateInput) {
  return prisma.eCClaim.create({ data });
}

export async function update(id: string, data: Prisma.ECClaimUpdateInput) {
  return prisma.eCClaim.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.eCClaim.update({ where: { id }, data: { deletedAt: new Date() } });
}
