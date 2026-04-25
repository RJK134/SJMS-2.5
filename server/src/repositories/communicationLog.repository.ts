import prisma from '../utils/prisma';
import type { Prisma } from '@prisma/client';
import { type CursorPaginationParams, buildCursorPaginatedResponse, safeOrderBy } from '../utils/pagination';
import { COMMUNICATION_LOG_SORT } from '../utils/repository-sort-allow-lists';

export async function create(data: Prisma.CommunicationLogUncheckedCreateInput) {
  return prisma.communicationLog.create({ data });
}

export async function getById(id: string) {
  return prisma.communicationLog.findFirst({
    where: { id },
  });
}

export interface CommunicationLogFilters {
  recipientId?: string;
  channel?: string;
  deliveryStatus?: string;
}

export async function list(filters: CommunicationLogFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.CommunicationLogWhereInput = {
    ...(filters.recipientId && { recipientId: filters.recipientId }),
    ...(filters.channel && { channel: filters.channel as Prisma.EnumCommChannelFilter }),
    ...(filters.deliveryStatus && { deliveryStatus: filters.deliveryStatus as Prisma.EnumDeliveryStatusFilter }),
  };

  const [data, total] = await Promise.all([
    prisma.communicationLog.findMany({
      where,
      include: { template: true },
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: safeOrderBy(pagination, COMMUNICATION_LOG_SORT),
    }),
    prisma.communicationLog.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function updateStatus(id: string, deliveryStatus: string, error?: string) {
  return prisma.communicationLog.update({
    where: { id },
    data: {
      deliveryStatus: deliveryStatus as 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'BOUNCED',
      ...(deliveryStatus === 'SENT' || deliveryStatus === 'DELIVERED' ? { sentDate: new Date() } : {}),
    },
  });
}
