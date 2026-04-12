import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  programmeId: z.string().optional(), moduleId: z.string().optional(),
});

export const createSchema = z.object({
  programmeId: z.string().min(1), moduleId: z.string().min(1),
    moduleType: z.enum(['CORE','OPTIONAL','ELECTIVE']),
    yearOfStudy: z.number().int().min(1).max(6), semester: z.string().optional(),
});

export const updateSchema = createSchema.partial();
