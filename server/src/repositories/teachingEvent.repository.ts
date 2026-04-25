import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse, safeOrderBy } from '../utils/pagination';

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

export async function listSessions(filters: TeachingEventFilters = {}, pagination: CursorPaginationParams) {
  // Merge moduleId and moduleIds into a single clause to avoid key collision.
  // When both are present, intersect: only the direct moduleId IF it's in the
  // student-scoped array. Otherwise one filter wins and the other is silently lost.
  const moduleIdClause: Prisma.TeachingEventWhereInput = (() => {
    if (filters.moduleIds && filters.moduleId) {
      return { moduleId: { in: filters.moduleIds.filter(id => id === filters.moduleId) } };
    }
    if (filters.moduleIds) return { moduleId: { in: filters.moduleIds } };
    if (filters.moduleId) return { moduleId: filters.moduleId };
    return {};
  })();

  const where: Prisma.TeachingEventWhereInput = {
    ...moduleIdClause,
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
      
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: safeOrderBy(pagination, ['id', 'createdAt', 'updatedAt', 'triggerDate', 'startDate', 'dayOfWeek', 'timestamp', 'settingKey', 'postedDate', 'dueDate', 'contactDate'] as const),
      include: {
        module: { select: { id: true, moduleCode: true, title: true, credits: true } },
        room: { select: { id: true, roomCode: true, building: true, capacity: true, roomType: true } },
      },
    }),
    prisma.teachingEvent.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
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
