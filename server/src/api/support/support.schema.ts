import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  studentId: z.string().optional(), status: z.string().optional(),
    priority: z.string().optional(), category: z.string().optional(),
});

export const createSchema = z.object({
  studentId: z.string().min(1),
    category: z.enum([
      'ACADEMIC', 'FINANCIAL', 'WELLBEING', 'ACCOMMODATION', 'DISABILITY',
      'COMPLAINTS', 'IT', 'OTHER',
      // Extended categories used by n8n workflow automation
      'ADMISSIONS', 'REGISTRY', 'FINANCE', 'IT_SERVICES', 'LIBRARY',
      'ASSESSMENT', 'COMPLIANCE',
    ]),
    subject: z.string().min(1), description: z.string().min(1),
    priority: z.enum(['LOW','NORMAL','HIGH','URGENT','CRITICAL']).default('NORMAL'),
});

export const updateSchema = createSchema.partial();
