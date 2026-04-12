import { z } from 'zod';

export const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('timestamp'),
  order: z.enum(['asc', 'desc']).default('desc'),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  action: z.string().optional(),
  userId: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});
