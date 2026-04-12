import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  eventType: z.string().optional(),
});

export const createSchema = z.object({
  title: z.string().min(1), eventType: z.string().min(1),
    date: z.coerce.date(), venue: z.string().optional(), capacity: z.number().int().optional(),
});

export const updateSchema = createSchema.partial();
