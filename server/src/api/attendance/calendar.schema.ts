import { z } from 'zod';

export const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  sort: z.string().default('startDate'),
  order: z.enum(['asc', 'desc']).default('asc'),
  academicYear: z.string().optional(),
  eventType: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});
