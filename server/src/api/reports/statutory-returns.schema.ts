import { z } from 'zod';

export const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('dueDate'),
  order: z.enum(['asc', 'desc']).default('asc'),
  academicYear: z.string().optional(),
  returnType: z.string().optional(),
  status: z.string().optional(),
});
