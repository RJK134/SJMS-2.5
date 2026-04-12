import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  moduleId: z.string().optional(), // filter to students registered on this module
  feeStatus: z.string().optional(),
    entryRoute: z.string().optional(),
});

export const createSchema = z.object({
  feeStatus: z.enum(['HOME','OVERSEAS','EU_TRANSITIONAL','ISLANDS','CHANNEL_ISLANDS']),
    entryRoute: z.enum(['UCAS','DIRECT','CLEARING','INTERNATIONAL','INTERNAL_TRANSFER']),
    originalEntryDate: z.coerce.date(),
    personId: z.string().min(1),
});

export const updateSchema = createSchema.partial();
