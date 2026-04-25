import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse, safeOrderBy } from '../utils/pagination';
import { WEBHOOK_SUBSCRIPTION_SORT } from '../utils/repository-sort-allow-lists';
import { type Prisma } from '@prisma/client';

export interface WebhookSubscriptionFilters {
  search?: string;
  isActive?: string;
  eventType?: string;
}

export async function list(filters: WebhookSubscriptionFilters, pagination: CursorPaginationParams) {
  const where: Prisma.WebhookSubscriptionWhereInput = {
    ...(filters.search && { url: { contains: filters.search, mode: 'insensitive' as const } }),
    ...(filters.isActive !== undefined && { isActive: filters.isActive === 'true' }),
  };

  const [data, total] = await Promise.all([
    prisma.webhookSubscription.findMany({
      where,
      take: pagination.limit + 1,
      ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: safeOrderBy(pagination, WEBHOOK_SUBSCRIPTION_SORT),
    }),
    prisma.webhookSubscription.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getById(id: string) {
  return prisma.webhookSubscription.findUnique({ where: { id } });
}

export async function create(data: Prisma.WebhookSubscriptionUncheckedCreateInput) {
  return prisma.webhookSubscription.create({ data });
}

export async function update(id: string, data: Prisma.WebhookSubscriptionUpdateInput) {
  return prisma.webhookSubscription.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.webhookSubscription.update({
    where: { id },
    data: { isActive: false },
  });
}
