import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  enrolmentId: z.string().optional(), moduleId: z.string().optional(),
    academicYear: z.string().optional(), status: z.string().optional(),
});

export const createSchema = z.object({
  enrolmentId: z.string().min(1), moduleId: z.string().min(1),
    academicYear: z.string().regex(/^\d{4}\/\d{2}$/),
    registrationType: z.enum(['CORE','OPTIONAL','ELECTIVE']),
});

export const updateSchema = createSchema.partial();
