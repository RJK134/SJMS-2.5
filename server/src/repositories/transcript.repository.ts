import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';

export interface TranscriptFilters {
  studentId?: string;
  transcriptType?: string;
}

export async function list(filters: TranscriptFilters = {}, pagination: PaginationParams) {
  const where: Prisma.TranscriptWhereInput = {
    deletedAt: null,
    ...(filters.studentId && { studentId: filters.studentId }),
    ...(filters.transcriptType && { transcriptType: filters.transcriptType as any }),
  };

  const [data, total] = await Promise.all([
    prisma.transcript.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.transcript.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
}

export async function getById(id: string) {
  return prisma.transcript.findFirst({
    where: { id, deletedAt: null },
    include: { student: { include: { person: true } }, lines: true },
  });
}

export async function create(data: Prisma.TranscriptUncheckedCreateInput) {
  return prisma.transcript.create({ data });
}

export async function update(id: string, data: Prisma.TranscriptUpdateInput) {
  return prisma.transcript.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.transcript.update({ where: { id }, data: { deletedAt: new Date() } });
}
