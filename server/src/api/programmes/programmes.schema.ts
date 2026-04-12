import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  status: z.string().optional(), level: z.string().optional(), departmentId: z.string().optional(),
});

export const createSchema = z.object({
  departmentId: z.string().min(1),
    programmeCode: z.string().min(1),
    ucasCode: z.string().optional(),
    title: z.string().min(1).max(300),
    level: z.enum(['LEVEL_3','LEVEL_4','LEVEL_5','LEVEL_6','LEVEL_7','LEVEL_8']),
    creditTotal: z.number().int().min(1),
    duration: z.number().int().min(1),
    modeOfStudy: z.enum(['FULL_TIME','PART_TIME','SANDWICH','DISTANCE','BLOCK_RELEASE']),
    awardingBody: z.string().min(1),
    status: z.enum(['DRAFT','APPROVED','SUSPENDED','WITHDRAWN','CLOSED']).default('DRAFT'),
});

export const updateSchema = createSchema.partial();
