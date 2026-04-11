import prisma from '../utils/prisma';

// The dashboard repository exposes aggregation queries used by the staff,
// academic, student and applicant dashboards. Each function is purpose-built
// and returns pre-shaped data for its caller — the dashboard service layer
// wraps these with audit/event emission where relevant.

export async function getStaffCounts() {
  // NOTE: Programme, Module and Assessment models do NOT have a deletedAt column
  // in the current schema, so we must not filter on it. Programme status values
  // are DRAFT | APPROVED | SUSPENDED | WITHDRAWN | CLOSED — "APPROVED" is the
  // live/active state. Module status values are DRAFT | APPROVED | RUNNING |
  // SUSPENDED | WITHDRAWN — we count RUNNING + APPROVED as the deliverable set.
  const [students, programmes, modules, enrolments, assessments, applications] = await Promise.all([
    prisma.student.count({ where: { deletedAt: null } }),
    prisma.programme.count({ where: { status: 'APPROVED' } }),
    prisma.module.count({ where: { status: { in: ['APPROVED', 'RUNNING'] } } }),
    prisma.enrolment.count({ where: { deletedAt: null, status: 'ENROLLED' } }),
    prisma.assessment.count(),
    prisma.application.count({ where: { deletedAt: null } }),
  ]);

  return { students, programmes, modules, enrolments, assessments, applications };
}

export async function getStudentLatestEnrolment(studentId: string) {
  return prisma.enrolment.findFirst({
    where: { studentId, deletedAt: null, status: 'ENROLLED' },
    orderBy: { createdAt: 'desc' },
    include: { programme: true },
  });
}

export async function getStudentModuleRegistrations(studentId: string, take: number) {
  return prisma.moduleRegistration.findMany({
    where: {
      enrolment: { studentId, deletedAt: null },
      deletedAt: null,
    },
    include: { module: true },
    orderBy: { createdAt: 'desc' },
    take,
  });
}

export async function getStudentAttendance(studentId: string) {
  return prisma.attendanceRecord.findMany({
    where: {
      moduleRegistration: { enrolment: { studentId } },
      deletedAt: null,
    },
  });
}

export async function getStudentFinance(studentId: string) {
  return prisma.studentAccount.findFirst({
    where: { studentId, deletedAt: null },
  });
}

export async function getApplicantLatestApplication(personId: string) {
  // NOTE: Schema migration in Phase 1:
  //   - Application no longer has direct personId — navigate via Applicant relation
  //   - Application.offers renamed to Application.conditions (OfferCondition[])
  //   - Application.entryRoute → Application.applicationRoute
  //   - Application.submittedDate removed — using decisionDate as placeholder;
  //     needs business logic review for true submission tracking
  //   - OfferCondition.offerType → conditionType
  return prisma.application.findFirst({
    where: { applicant: { personId }, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: {
      programme: true,
      conditions: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 5 },
    },
  });
}

export async function getAcademicCounts() {
  // NOTE: Module has no deletedAt column (not a soft-delete entity) — filter by
  // status instead (APPROVED + RUNNING = deliverable). Marks live in the
  // MarkEntry model and have no deletedAt — mark history must never be removed.
  // MarkStage values: DRAFT | FIRST_MARK | SECOND_MARK | MODERATED |
  // EXTERNAL_REVIEWED | BOARD_APPROVED | RELEASED.
  const [modules, pendingMarks] = await Promise.all([
    prisma.module.count({ where: { status: { in: ['APPROVED', 'RUNNING'] } } }),
    prisma.markEntry.count({ where: { stage: 'DRAFT' } }),
  ]);
  return { modules, pendingMarks };
}

export async function getAttendanceGroupedByStudent(where: any, status?: string[]) {
  return prisma.attendanceRecord.groupBy({
    by: ['studentId'],
    _count: { _all: true },
    where: status ? { ...where, status: { in: status as any } } : where,
  });
}

export async function findStudentsBySearch(search: string, take: number) {
  return prisma.student.findMany({
    where: {
      deletedAt: null,
      OR: [
        { studentNumber: { contains: search, mode: 'insensitive' } },
        { person: { firstName: { contains: search, mode: 'insensitive' } } },
        { person: { lastName: { contains: search, mode: 'insensitive' } } },
      ],
    },
    select: { id: true },
    take,
  });
}

export async function getStudentsWithEnrolments(studentIds: string[]) {
  return prisma.student.findMany({
    where: { id: { in: studentIds } },
    include: {
      person: { select: { firstName: true, lastName: true } },
      enrolments: {
        where: { deletedAt: null, status: 'ENROLLED' },
        take: 1,
        orderBy: { createdAt: 'desc' },
        include: { programme: { select: { title: true, programmeCode: true } } },
      },
    },
  });
}

export async function getStaffTutees(staffId: string, skip: number, take: number) {
  return prisma.personalTutoring.findMany({
    where: { tutorId: staffId },
    distinct: ['studentId'],
    skip,
    take,
    orderBy: { meetingDate: 'desc' },
    include: {
      student: {
        include: {
          person: { select: { firstName: true, lastName: true } },
          enrolments: {
            where: { deletedAt: null, status: 'ENROLLED' },
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: { programme: { select: { title: true, programmeCode: true } } },
          },
        },
      },
    },
  });
}

export async function countDistinctStaffTutees(staffId: string) {
  const grouped = await prisma.personalTutoring.groupBy({
    by: ['studentId'],
    where: { tutorId: staffId },
  });
  return grouped.length;
}
