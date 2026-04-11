import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';

export interface AwardRecordFilters {
  studentId?: string;
  programmeId?: string;
  classification?: string;
}

export async function list(filters: AwardRecordFilters = {}, pagination: PaginationParams) {
  const where: Prisma.AwardRecordWhereInput = {
    deletedAt: null,
    ...(filters.studentId && { studentId: filters.studentId }),
    ...(filters.programmeId && { programmeId: filters.programmeId }),
    ...(filters.classification && { classification: filters.classification as any }),
  };

  const [data, total] = await Promise.all([
    prisma.awardRecord.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.awardRecord.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
}

export async function getById(id: string) {
  return prisma.awardRecord.findFirst({
    where: { id, deletedAt: null },
    include: {
      student: { include: { person: true } },
      programme: true,
      enrolment: true,
      degreeCalculation: true,
    },
  });
}

export async function create(data: Prisma.AwardRecordUncheckedCreateInput) {
  return prisma.awardRecord.create({ data });
}

export async function update(id: string, data: Prisma.AwardRecordUpdateInput) {
  return prisma.awardRecord.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.awardRecord.update({ where: { id }, data: { deletedAt: new Date() } });
}
