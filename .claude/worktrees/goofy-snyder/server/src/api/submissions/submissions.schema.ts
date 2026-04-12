import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  assessmentId: z.string().optional(), moduleRegistrationId: z.string().optional(),
});

export const createSchema = z.object({
  assessmentId: z.string().min(1), moduleRegistrationId: z.string().min(1),
    submittedDate: z.coerce.date(), fileName: z.string().optional(),
    filePath: z.string().optional(), fileSize: z.number().int().optional(),
    isLate: z.boolean().default(false),
});

export const updateSchema = createSchema.partial();
