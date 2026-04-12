import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  studentId: z.string().optional(), programmeId: z.string().optional(),
});

export const createSchema = z.object({
  studentId: z.string().min(1), programmeId: z.string().min(1),
    routeCode: z.string().min(1), pathwayCode: z.string().optional(),
    cohort: z.string().optional(), entryDate: z.coerce.date(),
    qualificationAim: z.string().optional(),
});

export const updateSchema = createSchema.partial();
