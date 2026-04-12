import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  studentId: z.string().optional(), programmeId: z.string().optional(),
    academicYear: z.string().optional(), status: z.string().optional(),
});

export const createSchema = z.object({
  studentId: z.string().min(1), programmeId: z.string().min(1),
    academicYear: z.string().regex(/^\d{4}\/\d{2}$/),
    yearOfStudy: z.number().int().min(1).max(6),
    modeOfStudy: z.enum(['FULL_TIME','PART_TIME','SANDWICH','DISTANCE','BLOCK_RELEASE']),
    startDate: z.coerce.date(),
    feeStatus: z.enum(['HOME','OVERSEAS','EU_TRANSITIONAL','ISLANDS','CHANNEL_ISLANDS']),
});

export const updateSchema = createSchema.partial();
