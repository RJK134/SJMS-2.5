import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  studentId: z.string().optional(), complianceStatus: z.string().optional(),
});

export const createSchema = z.object({
  studentId: z.string().min(1),
    tier4Status: z.enum(['SPONSORED','NOT_SPONSORED','PENDING','EXPIRED']),
    casNumber: z.string().optional(), visaType: z.string().optional(),
    complianceStatus: z.enum(['COMPLIANT','AT_RISK','NON_COMPLIANT','REPORTED']).default('COMPLIANT'),
});

export const updateSchema = createSchema.partial();

export const contactPointsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('contactDate'),
  order: z.enum(['asc', 'desc']).default('desc'),
  studentId: z.string().optional(),
  contactType: z.string().optional(),
  status: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});
