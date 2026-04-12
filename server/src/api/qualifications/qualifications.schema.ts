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
  applicationId: z.string().min(1), qualificationType: z.string().min(1),
    subject: z.string().min(1), grade: z.string().optional(),
    predicted: z.boolean().default(false), institution: z.string().optional(),
    dateAwarded: z.coerce.date().optional(),
});

export const updateSchema = createSchema.partial();
