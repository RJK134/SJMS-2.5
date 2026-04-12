import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';

// TeachingEvent has no deletedAt field in the current schema — teaching
// sessions are state-driven via `status` (scheduled, cancelled, etc).

export interface TeachingEventFilters {
  search?: string;
  moduleId?: string;
  moduleIds?: string[];
  staffId?: string;
  roomId?: string;
  dayOfWeek?: number;
  academicYear?: string;
  status?: string;
}

export async function listSessions(filters: TeachingEventFilters = {}, pagination: PaginationParams) {
  const where: Prisma.TeachingEventWhereInput = {
    ...(filters.moduleIds && { moduleId: { in: filters.moduleIds } }),
    ...(filters.moduleId && { moduleId: filters.moduleId }),
    ...(filters.staffId && { staffId: filters.staffId }),
    ...(filters.roomId && { roomId: filters.roomId }),
    ...(filters.dayOfWeek !== undefined && { dayOfWeek: filters.dayOfWeek }),
    ...(filters.academicYear && { academicYear: filters.academicYear }),
    ...(filters.status && { status: filters.status as any }),
    ...(filters.search && {
      OR: [
        { title: { contains: filters.search, mode: 'insensitive' as const } },
        { module: { moduleCode: { contains: filters.search, mode: 'insensitive' as const } } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.teachingEvent.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
      include: {
        module: { select: { id: true, moduleCode: true, title: true, credits: true } },
        room: { select: { id: true, roomCode: true, building: true, capacity: true, roomType: true } },
      },
    }),
    prisma.teachingEvent.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
}

export async function getSessionById(id: string) {
  return prisma.teachingEvent.findUnique({
    where: { id },
    include: {
      module: { select: { id: true, moduleCode: true, title: true, credits: true, level: true } },
      room: true,
      timetableSlots: true,
    },
  });
}
