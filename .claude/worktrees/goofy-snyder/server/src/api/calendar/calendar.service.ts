import prisma from '../../utils/prisma';
import { buildPaginatedResponse } from '../../utils/pagination';

export async function list(query: Record<string, any>) {
  const { page, limit, sort, order, ...filters } = query;
  const skip = (page - 1) * limit;
  const where: Record<string, any> = {
    ...(filters.academicYear ? { academicYear: filters.academicYear } : {}),
    ...(filters.eventType ? { eventType: filters.eventType } : {}),
    ...(filters.fromDate || filters.toDate ? {
      startDate: {
        ...(filters.fromDate ? { gte: new Date(filters.fromDate) } : {}),
        ...(filters.toDate ? { lte: new Date(filters.toDate) } : {}),
      },
    } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.academicCalendar.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any }),
    prisma.academicCalendar.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}
