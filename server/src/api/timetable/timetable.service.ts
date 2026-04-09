import prisma from '../../utils/prisma';
import { NotFoundError } from '../../utils/errors';
import { buildPaginatedResponse } from '../../utils/pagination';

export async function listSessions(query: Record<string, any>) {
  const { page, limit, sort, order, search, ...filters } = query;
  const skip = (page - 1) * limit;
  const where: Record<string, any> = {
    ...(search ? { OR: [
      { title: { contains: search, mode: 'insensitive' as const } },
      { module: { moduleCode: { contains: search, mode: 'insensitive' as const } } },
    ]} : {}),
    ...(filters.moduleId ? { moduleId: filters.moduleId } : {}),
    ...(filters.staffId ? { staffId: filters.staffId } : {}),
    ...(filters.roomId ? { roomId: filters.roomId } : {}),
    ...(filters.dayOfWeek !== undefined ? { dayOfWeek: filters.dayOfWeek } : {}),
    ...(filters.academicYear ? { academicYear: filters.academicYear } : {}),
    ...(filters.status ? { status: filters.status } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.teachingEvent.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sort]: order } as any,
      include: {
        module: { select: { id: true, moduleCode: true, title: true, credits: true } },
        room: { select: { id: true, roomCode: true, building: true, capacity: true, roomType: true } },
      },
    }),
    prisma.teachingEvent.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

export async function getSessionById(id: string) {
  const result = await prisma.teachingEvent.findUnique({
    where: { id },
    include: {
      module: { select: { id: true, moduleCode: true, title: true, credits: true, level: true } },
      room: true,
      timetableSlots: true,
    },
  });
  if (!result) throw new NotFoundError('TeachingEvent', id);
  return result;
}
