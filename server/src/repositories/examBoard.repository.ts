import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse } from '../utils/pagination';

export interface ExamBoardFilters {
  programmeId?: string;
  status?: string;
  search?: string;
}

export async function list(filters: ExamBoardFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.ExamBoardWhereInput = {
    deletedAt: null,
    ...(filters.programmeId && { programmeId: filters.programmeId }),
    ...(filters.status && { status: filters.status as any }),
    ...(filters.search && {
      OR: [{ title: { contains: filters.search, mode: 'insensitive' as const } }],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.examBoard.findMany({
      where,
      include: { programme: true },
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.examBoard.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getById(id: string) {
  return prisma.examBoard.findFirst({
    where: { id, deletedAt: null },
    include: {
      programme: true,
      decisions: { include: { student: { include: { person: true } } } },
      members: { include: { staff: { include: { person: true } } } },
    },
  });
}

export async function create(data: Prisma.ExamBoardUncheckedCreateInput) {
  return prisma.examBoard.create({ data });
}

export async function update(id: string, data: Prisma.ExamBoardUpdateInput) {
  return prisma.examBoard.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.examBoard.update({ where: { id }, data: { deletedAt: new Date() } });
}
