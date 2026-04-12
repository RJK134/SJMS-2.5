import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  userId: z.string().optional(),
  // Accept the string form "true"/"false" from the query string and coerce to
  // a real boolean. Prisma rejects `isRead: "false"` with a validation error
  // — the enum() alone produced the string, `.transform` lifts it to bool.
  isRead: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  category: z.string().optional(),
  priority: z.string().optional(),
});

export const createSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  category: z.string().min(1),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  actionUrl: z.string().optional(),
  expiresAt: z.coerce.date().optional(),
});

export const updateSchema = z.object({
  isRead: z.boolean().optional(),
});
