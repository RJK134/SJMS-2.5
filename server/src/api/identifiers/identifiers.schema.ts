import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  personId: z.string().optional(), identifierType: z.string().optional(),
});

export const createSchema = z.object({
  personId: z.string().min(1),
    identifierType: z.enum(['HUSID','ULN','UCAS_ID','SLC_SSN','PASSPORT','NATIONAL_ID','OTHER']),
    value: z.string().min(1),
    issuer: z.string().optional(),
    issueDate: z.coerce.date().optional(),
    expiryDate: z.coerce.date().optional(),
});

export const updateSchema = createSchema.partial();
