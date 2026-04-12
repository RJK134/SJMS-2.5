import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse } from '../utils/pagination';

export interface ProgrammeApprovalFilters {
  programmeId?: string;
  status?: string;
  approvalType?: string;
}

export async function list(filters: ProgrammeApprovalFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.ProgrammeApprovalWhereInput = {
    deletedAt: null,
    ...(filters.programmeId && { programmeId: filters.programmeId }),
    ...(filters.status && { status: filters.status as any }),
    ...(filters.approvalType && { approvalType: filters.approvalType as any }),
  };

  const [data, total] = await Promise.all([
    prisma.programmeApproval.findMany({
      where,
      include: { programme: true },
      
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.programmeApproval.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getById(id: string) {
  return prisma.programmeApproval.findFirst({
    where: { id, deletedAt: null },
    include: { programme: true },
  });
}

export async function create(data: Prisma.ProgrammeApprovalUncheckedCreateInput) {
  return prisma.programmeApproval.create({ data });
}

export async function update(id: string, data: Prisma.ProgrammeApprovalUpdateInput) {
  return prisma.programmeApproval.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.programmeApproval.update({ where: { id }, data: { deletedAt: new Date() } });
}
