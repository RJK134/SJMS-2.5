import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  userId: z.string().optional(),
  isRead: z.enum(['true', 'false']).optional(),
  category: z.string().optional(),
  priority: z.string().optional(),
});

export const createSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  category: z.string().min(1),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  actionUrl: z.string().optional(),
  expiresAt: z.coerce.date().optional(),
});

export const updateSchema = z.object({
  isRead: z.boolean().optional(),
});
