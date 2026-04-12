import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  
});

export const createSchema = z.object({
  title: z.string().optional(),
    firstName: z.string().min(1).max(100),
    middleNames: z.string().optional(),
    lastName: z.string().min(1).max(100),
    dateOfBirth: z.coerce.date(),
    gender: z.enum(['MALE','FEMALE','NON_BINARY','OTHER','PREFER_NOT_TO_SAY']).optional(),
    legalSex: z.enum(['MALE','FEMALE','INDETERMINATE']).optional(),
    pronouns: z.string().optional(),
});

export const updateSchema = createSchema.partial();
