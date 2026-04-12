import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('settingKey'),
  order: z.enum(['asc', 'desc']).default('asc'),
  search: z.string().optional(),
  category: z.string().optional(),
});

export const createSchema = z.object({
  settingKey: z.string().min(1),
  settingValue: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional(),
});

export const updateSchema = z.object({
  settingValue: z.string().optional(),
  description: z.string().optional(),
});
