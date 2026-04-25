import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse, safeOrderBy } from '../utils/pagination';
import { COMMUNICATION_TEMPLATE_SORT } from '../utils/repository-sort-allow-lists';

export interface CommunicationTemplateFilters {
  search?: string;
  channel?: string;
  isActive?: boolean;
}

export async function list(filters: CommunicationTemplateFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.CommunicationTemplateWhereInput = {
    deletedAt: null,
    ...(filters.channel && { channel: filters.channel as any }),
    ...(filters.isActive !== undefined && { isActive: filters.isActive }),
    ...(filters.search && {
      OR: [
        { title: { contains: filters.search, mode: 'insensitive' as const } },
        { templateCode: { contains: filters.search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.communicationTemplate.findMany({
      where,
      
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: safeOrderBy(pagination, COMMUNICATION_TEMPLATE_SORT),
    }),
    prisma.communicationTemplate.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getById(id: string) {
  return prisma.communicationTemplate.findFirst({ where: { id, deletedAt: null } });
}

/** Exact match by templateCode (used by the workflow send endpoint). */
export async function getByCode(templateCode: string) {
  return prisma.communicationTemplate.findFirst({
    where: { templateCode, deletedAt: null, isActive: true },
  });
}

export async function create(data: Prisma.CommunicationTemplateUncheckedCreateInput) {
  return prisma.communicationTemplate.create({ data });
}

export async function update(id: string, data: Prisma.CommunicationTemplateUpdateInput) {
  return prisma.communicationTemplate.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.communicationTemplate.update({ where: { id }, data: { deletedAt: new Date() } });
}
