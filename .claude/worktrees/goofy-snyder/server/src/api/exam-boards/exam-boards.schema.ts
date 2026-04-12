import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  programmeId: z.string().optional(), academicYear: z.string().optional(), status: z.string().optional(),
});

export const createSchema = z.object({
  title: z.string().min(1), programmeId: z.string().min(1),
    academicYear: z.string().regex(/^\d{4}\/\d{2}$/),
    boardType: z.enum(['MODULE','PROGRESSION','AWARD']),
    scheduledDate: z.coerce.date().optional(),
    status: z.enum(['SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED']).default('SCHEDULED'),
});

export const updateSchema = createSchema.partial();
