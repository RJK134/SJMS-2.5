import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  applicationId: z.string().optional(), status: z.string().optional(), checkType: z.string().optional(),
});

export const createSchema = z.object({
  applicationId: z.string().min(1),
    checkType: z.enum(['DBS','OCCUPATIONAL_HEALTH','ATAS','FINANCIAL','RIGHT_TO_STUDY']),
    status: z.enum(['PENDING','IN_PROGRESS','CLEARED','FAILED','EXPIRED']).default('PENDING'),
    reference: z.string().optional(),
});

export const updateSchema = createSchema.partial();
