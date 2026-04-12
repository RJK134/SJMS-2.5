import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  studentId: z.string().optional(), moduleRegistrationId: z.string().optional(),
    status: z.string().optional(),
});

export const createSchema = z.object({
  moduleRegistrationId: z.string().min(1), studentId: z.string().min(1),
    date: z.coerce.date(),
    status: z.enum(['PRESENT','ABSENT','LATE','EXCUSED','AUTHORISED_ABSENCE']).default('ABSENT'),
    method: z.enum(['REGISTER','CARD_SWIPE','BIOMETRIC','ONLINE','SELF_REPORTED']).optional(),
});

export const updateSchema = createSchema.partial();

export const alertsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('triggerDate'),
  order: z.enum(['asc', 'desc']).default('desc'),
  studentId: z.string().optional(),
  alertType: z.string().optional(),
  status: z.string().optional(),
});
