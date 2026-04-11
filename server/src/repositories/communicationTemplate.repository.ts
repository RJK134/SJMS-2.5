import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';

export interface CommunicationTemplateFilters {
  search?: string;
  channel?: string;
  isActive?: boolean;
}

export async function list(filters: CommunicationTemplateFilters = {}, pagination: PaginationParams) {
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
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.communicationTemplate.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
}

export async function getById(id: string) {
  return prisma.communicationTemplate.findFirst({ where: { id, deletedAt: null } });
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
