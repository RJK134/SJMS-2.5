import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  applicationId: z.string().optional(), status: z.string().optional(),
});

export const createSchema = z.object({
  applicationId: z.string().min(1),
    conditionType: z.enum(['ACADEMIC','ENGLISH_LANGUAGE','FINANCIAL','DOCUMENT','OTHER']),
    description: z.string().min(1), targetGrade: z.string().optional(),
    status: z.enum(['PENDING','MET','NOT_MET','WAIVED']).default('PENDING'),
});

export const updateSchema = createSchema.partial();
