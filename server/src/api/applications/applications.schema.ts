import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  status: z.string().optional(),
  academicYear: z.string().optional(),
  programmeId: z.string().optional(),
  applicantId: z.string().optional(),
  // Accepted so `scopeToUser('personId')` can inject the applicant's
  // personId into req.query and have it survive validateQuery. Without
  // this field the scope filter was silently dropped and the applicant
  // persona saw every application in the system. The repository
  // translates this into `applicant: { personId }` because Application
  // has no direct personId column — the link goes through Applicant.
  personId: z.string().optional(),
});

export const createSchema = z.object({
  applicantId: z.string().min(1), programmeId: z.string().min(1),
    academicYear: z.string().regex(/^\d{4}\/\d{2}$/),
    applicationRoute: z.enum(['UCAS','DIRECT','CLEARING','INTERNATIONAL']),
    personalStatement: z.string().optional(),
});

export const updateSchema = createSchema.partial();
