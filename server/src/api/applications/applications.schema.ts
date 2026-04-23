import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

// The 10 canonical ApplicationStatus values. Must mirror the Prisma enum
// declared in prisma/schema.prisma. A new value cannot be accepted here
// without a coordinated Prisma migration and a state-machine update in
// applications.service.ts.
export const applicationStatusEnum = z.enum([
  'SUBMITTED',
  'UNDER_REVIEW',
  'INTERVIEW',
  'CONDITIONAL_OFFER',
  'UNCONDITIONAL_OFFER',
  'FIRM',
  'INSURANCE',
  'DECLINED',
  'WITHDRAWN',
  'REJECTED',
]);

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

// The status field is exposed on update so admissions staff can move the
// application through its lifecycle via PATCH /applications/:id. The
// service layer (applications.service.update) enforces the canonical
// transition map on top of this enum check.
export const updateSchema = createSchema.partial().extend({
  status: applicationStatusEnum.optional(),
});
