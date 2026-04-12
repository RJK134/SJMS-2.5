import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  personId: z.string().optional(),
});

export const createSchema = z.object({
  personId: z.string().min(1),
    ethnicity: z.string().optional(),
    disability: z.string().optional(),
    religion: z.string().optional(),
    sexualOrientation: z.string().optional(),
    careLeaver: z.boolean().optional(),
    parentalEducation: z.boolean().optional(),
    polarQuintile: z.number().min(1).max(5).optional(),
    imdQuintile: z.number().min(1).max(5).optional(),
});

export const updateSchema = createSchema.partial();
