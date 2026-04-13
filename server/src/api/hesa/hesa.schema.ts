import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  status: z.enum(['PENDING', 'SUBMITTED', 'ACKNOWLEDGED', 'REJECTED']).optional(),
});

export const createSchema = z.object({
  entityType: z.string().min(1),
  entityId: z.string().min(1),
  changeType: z.string().min(1),
  payload: z.record(z.unknown()).optional(),
});

export const updateSchema = z.object({
  status: z.enum(['PENDING', 'SUBMITTED', 'ACKNOWLEDGED', 'REJECTED']).optional(),
  payload: z.record(z.unknown()).optional(),
});
