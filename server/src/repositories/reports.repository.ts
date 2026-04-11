import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';

// Reports repository provides an entity-aware fetch for report generation.
// The service layer owns the entity-to-model mapping; this repository only
// exposes the raw findMany calls so the service can remain declarative.

export type ReportableEntity =
  | 'students'
  | 'enrolments'
  | 'modules'
  | 'programmes'
  | 'marks'
  | 'finance'
  | 'attendance';

const ENTITY_MAP: Record<ReportableEntity, { model: keyof typeof prisma; defaultInclude?: Record<string, any> }> = {
  students: {
    model: 'student',
    defaultInclude: { person: { select: { firstName: true, lastName: true } } },
  },
  enrolments: {
    model: 'enrolment',
    defaultInclude: {
      student: { include: { person: { select: { firstName: true, lastName: true } } } },
      programme: { select: { title: true, programmeCode: true } },
    },
  },
  modules: {
    model: 'module',
    defaultInclude: { department: { select: { title: true } } },
  },
  programmes: {
    model: 'programme',
    defaultInclude: { department: { select: { title: true } } },
  },
  marks: { model: 'markEntry' },
  finance: {
    model: 'studentAccount',
    defaultInclude: {
      student: { include: { person: { select: { firstName: true, lastName: true } } } },
    },
  },
  attendance: {
    model: 'attendanceRecord',
    defaultInclude: {
      student: { include: { person: { select: { firstName: true, lastName: true } } } },
    },
  },
};

export function isReportableEntity(value: string): value is ReportableEntity {
  return value in ENTITY_MAP;
}

export async function fetchReport(
  entity: ReportableEntity,
  where: Record<string, unknown>,
  limit: number,
) {
  const config = ENTITY_MAP[entity];
  // The delegate lookup is dynamic by design — each entity maps to a different
  // Prisma model. This is the narrowest possible surface for `any`.
  const delegate = (prisma as unknown as Record<string, { findMany: (args: unknown) => Promise<unknown[]> }>)[config.model as string];
  return delegate.findMany({
    where,
    take: limit,
    include: config.defaultInclude,
    orderBy: { createdAt: 'desc' },
  });
}
