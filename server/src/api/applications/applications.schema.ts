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

// Schema for the POST /applications/:id/convert endpoint (Batch 16C).
// Carries the enrolment-specific fields that cannot be derived from the
// application row alone. All fields drive both the initial Student record
// (when the person has not been converted before) and the first Enrolment.
export const convertSchema = z.object({
  // Year of study at point of enrolment — 1 for a standard first-year
  // intake, 2+ for advanced standing or direct entry to later years.
  yearOfStudy: z.coerce.number().int().min(1).max(6).default(1),
  modeOfStudy: z.enum(['FULL_TIME', 'PART_TIME', 'SANDWICH', 'DISTANCE', 'BLOCK_RELEASE']),
  // Date the enrolment (and the corresponding student record) takes effect.
  startDate: z.coerce.date(),
  // Fee status required for both the Student and the Enrolment row.
  feeStatus: z.enum(['HOME', 'OVERSEAS', 'EU_TRANSITIONAL', 'ISLANDS', 'CHANNEL_ISLANDS']),
  // Original entry date for the Student record. Defaults to startDate when
  // omitted. Typically equals startDate for first-time entrants but may
  // differ for transfers where the student's original entry to HE was earlier.
  originalEntryDate: z.coerce.date().optional(),
});
