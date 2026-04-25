import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse, safeOrderBy } from '../utils/pagination';

// StatutoryReturn is a read-heavy model with no deletedAt field — returns
// are state-driven via the `status` column (DRAFT, SUBMITTED, ACCEPTED, etc.)
// and remain on the record permanently for audit.

export interface StatutoryReturnFilters {
  academicYear?: string;
  returnType?: string;
  status?: string;
}

export async function list(filters: StatutoryReturnFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.StatutoryReturnWhereInput = {
    ...(filters.academicYear && { academicYear: filters.academicYear }),
    ...(filters.returnType && { returnType: filters.returnType as any }),
    ...(filters.status && { status: filters.status as any }),
  };

  const [data, total] = await Promise.all([
    prisma.statutoryReturn.findMany({
      where,
      
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: safeOrderBy(pagination, ['id', 'createdAt', 'updatedAt', 'triggerDate', 'startDate', 'dayOfWeek', 'timestamp', 'settingKey', 'postedDate', 'dueDate', 'contactDate'] as const),
    }),
    prisma.statutoryReturn.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getById(id: string) {
  return prisma.statutoryReturn.findUnique({ where: { id } });
}
