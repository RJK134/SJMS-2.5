import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse } from '../utils/pagination';

// AcademicCalendar is a reference model with no deletedAt field.
// Calendar entries remain on the record permanently for audit.

export interface AcademicCalendarFilters {
  academicYear?: string;
  eventType?: string;
  fromDate?: string | Date;
  toDate?: string | Date;
}

export async function list(filters: AcademicCalendarFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.AcademicCalendarWhereInput = {
    ...(filters.academicYear && { academicYear: filters.academicYear }),
    ...(filters.eventType && { eventType: filters.eventType as any }),
    ...((filters.fromDate || filters.toDate) && {
      startDate: {
        ...(filters.fromDate && { gte: new Date(filters.fromDate) }),
        ...(filters.toDate && { lte: new Date(filters.toDate) }),
      },
    }),
  };

  const [data, total] = await Promise.all([
    prisma.academicCalendar.findMany({
      where,
      
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.academicCalendar.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}
