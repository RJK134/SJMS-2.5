import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('dayOfWeek'),
  order: z.enum(['asc', 'desc']).default('asc'),
  search: z.string().optional(),
  studentId: z.string().optional(), // injected by scopeToUser middleware — do NOT remove
  moduleId: z.string().optional(),
  staffId: z.string().optional(),
  roomId: z.string().optional(),
  dayOfWeek: z.coerce.number().min(0).max(6).optional(),
  academicYear: z.string().optional(),
  status: z.string().optional(),
});
