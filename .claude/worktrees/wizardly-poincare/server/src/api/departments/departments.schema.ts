import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  schoolId: z.string().optional(),
});

export const createSchema = z.object({
  schoolId: z.string().min(1), code: z.string().min(1).max(20), title: z.string().min(1).max(200),
});

export const updateSchema = createSchema.partial();
