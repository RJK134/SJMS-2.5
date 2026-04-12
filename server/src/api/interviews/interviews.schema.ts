import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  applicationId: z.string().optional(),
});

export const createSchema = z.object({
  applicationId: z.string().min(1), interviewDate: z.coerce.date(),
    format: z.enum(['IN_PERSON','ONLINE','PHONE','GROUP']),
    outcome: z.string().optional(), notes: z.string().optional(),
    score: z.number().optional(),
});

export const updateSchema = createSchema.partial();
