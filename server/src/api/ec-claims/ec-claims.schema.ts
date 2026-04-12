import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  studentId: z.string().optional(), status: z.string().optional(),
});

export const createSchema = z.object({
  studentId: z.string().min(1), moduleRegistrationId: z.string().optional(),
    reason: z.string().min(1), evidenceType: z.string().optional(),
    requestedOutcome: z.string().optional(), submittedDate: z.coerce.date(),
});

export const updateSchema = createSchema.partial();
