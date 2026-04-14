import prisma from '../utils/prisma';
import type { Prisma } from '@prisma/client';

export async function create(data: Prisma.CommunicationLogUncheckedCreateInput) {
  return prisma.communicationLog.create({ data });
}

export async function getById(id: string) {
  return prisma.communicationLog.findFirst({
    where: { id },
  });
}

export async function list(
  filters: { recipientId?: string; channel?: string; deliveryStatus?: string },
  pagination: { cursor?: string; limit: number; sort: string; order: 'asc' | 'desc' },
) {
  const where: Prisma.CommunicationLogWhereInput = {};
  if (filters.recipientId) where.recipientId = filters.recipientId;
  if (filters.channel) where.channel = filters.channel as Prisma.EnumCommChannelFilter;
  if (filters.deliveryStatus) where.deliveryStatus = filters.deliveryStatus as Prisma.EnumDeliveryStatusFilter;

  const orderBy = { [pagination.sort]: pagination.order };
  const take = pagination.limit + 1;

  const items = await prisma.communicationLog.findMany({
    where,
    orderBy,
    take,
    ...(pagination.cursor ? { skip: 1, cursor: { id: pagination.cursor } } : {}),
  });

  const hasMore = items.length > pagination.limit;
  const data = hasMore ? items.slice(0, -1) : items;
  return {
    data,
    nextCursor: hasMore ? data[data.length - 1]?.id : null,
  };
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
