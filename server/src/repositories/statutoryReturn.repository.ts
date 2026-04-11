import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';

// StatutoryReturn is a read-heavy model with no deletedAt field — returns
// are state-driven via the `status` column (DRAFT, SUBMITTED, ACCEPTED, etc.)
// and remain on the record permanently for audit.

export interface StatutoryReturnFilters {
  academicYear?: string;
  returnType?: string;
  status?: string;
}

export async function list(filters: StatutoryReturnFilters = {}, pagination: PaginationParams) {
  const where: Prisma.StatutoryReturnWhereInput = {
    ...(filters.academicYear && { academicYear: filters.academicYear }),
    ...(filters.returnType && { returnType: filters.returnType as any }),
    ...(filters.status && { status: filters.status as any }),
  };

  const [data, total] = await Promise.all([
    prisma.statutoryReturn.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.statutoryReturn.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
}

export async function getById(id: string) {
  return prisma.statutoryReturn.findUnique({ where: { id } });
}
