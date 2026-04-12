import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  studentId: z.string().optional(), // injected by scopeToUser middleware — do NOT remove
  assessmentId: z.string().optional(), moduleRegistrationId: z.string().optional(), status: z.string().optional(),
});

export const createSchema = z.object({
  assessmentId: z.string().min(1), moduleRegistrationId: z.string().min(1),
    attemptNumber: z.number().int().min(1).default(1),
    rawMark: z.number().min(0).optional(), finalMark: z.number().min(0).optional(),
    grade: z.string().optional(), status: z.enum(['PENDING','SUBMITTED','MARKED','MODERATED','CONFIRMED','REFERRED','DEFERRED']).default('PENDING'),
    feedback: z.string().optional(),
});

export const updateSchema = createSchema.partial();
