import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  studentId: z.string().optional(), academicYear: z.string().optional(), status: z.string().optional(),
});

export const createSchema = z.object({
  studentId: z.string().min(1), academicYear: z.string().regex(/^\d{4}\/\d{2}$/),
});

export const updateSchema = createSchema.partial();

export const transactionsParamsSchema = z.object({ studentAccountId: z.string().min(1) });

export const transactionsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('postedDate'),
  order: z.enum(['asc', 'desc']).default('desc'),
  transactionType: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  status: z.string().optional(),
});
