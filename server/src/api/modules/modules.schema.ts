import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  status: z.string().optional(), departmentId: z.string().optional(), level: z.coerce.number().optional(),
});

export const createSchema = z.object({
  departmentId: z.string().min(1),
    moduleCode: z.string().min(1),
    title: z.string().min(1).max(300),
    credits: z.number().int().min(1).max(120),
    level: z.number().int().min(3).max(8),
    semester: z.string().optional(),
    status: z.enum(['DRAFT','APPROVED','RUNNING','SUSPENDED','WITHDRAWN']).default('DRAFT'),
});

export const updateSchema = createSchema.partial();
