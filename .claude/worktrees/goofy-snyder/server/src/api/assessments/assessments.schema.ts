import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  moduleId: z.string().optional(), academicYear: z.string().optional(), assessmentType: z.string().optional(),
});

export const createSchema = z.object({
  moduleId: z.string().min(1),
    academicYear: z.string().regex(/^\d{4}\/\d{2}$/),
    title: z.string().min(1), assessmentType: z.enum(['COURSEWORK','EXAM','PRACTICAL','PRESENTATION','PORTFOLIO','DISSERTATION','GROUP_WORK','VIVA','LAB_REPORT']),
    weighting: z.number().int().min(0).max(100), maxMark: z.number().min(0), passMark: z.number().min(0),
    dueDate: z.coerce.date().optional(),
    isAnonymous: z.boolean().default(false), allowLateSubmission: z.boolean().default(false),
});

export const updateSchema = createSchema.partial();
