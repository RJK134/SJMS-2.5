import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  committeeType: z.string().optional(),
  committeeId: z.string().optional(),
  status: z.string().optional(),
});

export const committeeCreateSchema = z.object({
  committeeName: z.string().min(1),
  committeeType: z.enum([
    'SENATE', 'ACADEMIC_BOARD', 'FACULTY_BOARD',
    'EXAM_BOARD', 'QUALITY', 'DISCIPLINARY',
  ]),
  chairId: z.string().optional(),
  meetingFrequency: z.string().optional(),
  status: z.string().default('active'),
});

export const committeeUpdateSchema = committeeCreateSchema.partial();

export const meetingCreateSchema = z.object({
  committeeId: z.string().min(1),
  meetingDate: z.coerce.date(),
  venue: z.string().optional(),
  agendaPath: z.string().optional(),
  minutesPath: z.string().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('SCHEDULED'),
});

export const meetingUpdateSchema = meetingCreateSchema.partial();

export const memberCreateSchema = z.object({
  committeeId: z.string().min(1),
  staffId: z.string().min(1),
  role: z.enum(['CHAIR', 'SECRETARY', 'MEMBER', 'EX_OFFICIO']).default('MEMBER'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
});
