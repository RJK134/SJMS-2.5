import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  isActive: z.string().optional(),
  eventType: z.string().optional(),
});

export const createSchema = z.object({
  url: z.string().url(),
  eventTypes: z.array(z.string().min(1)),
  secretKey: z.string().min(16),
  isActive: z.boolean().default(true),
});

export const updateSchema = createSchema.partial();
