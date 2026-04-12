import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  enrolmentId: z.string().optional(), moduleId: z.string().optional(),
    academicYear: z.string().optional(), status: z.string().optional(),
  // studentId is accepted so `scopeToUser('studentId')` middleware can
  // inject the authenticated student's id into req.query and have it
  // survive validateQuery — without this field, zod strips it and the
  // student persona sees every module registration in the system.
  // ModuleRegistration has no direct studentId column; the repository
  // translates this into `enrolment: { studentId }` because the link
  // goes through Enrolment. Parallels the Application → Applicant
  // personId fix in admissions (PR #17, commit 6959065).
  studentId: z.string().optional(),
});

export const createSchema = z.object({
  enrolmentId: z.string().min(1), moduleId: z.string().min(1),
    academicYear: z.string().regex(/^\d{4}\/\d{2}$/),
    registrationType: z.enum(['CORE','OPTIONAL','ELECTIVE']),
});

export const updateSchema = createSchema.partial();
