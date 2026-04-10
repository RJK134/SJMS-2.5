import prisma from '../../utils/prisma';

export async function getStaffStats() {
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

  return {
    students: { total: students },
    programmes: { total: programmes },
    modules: { total: modules },
    enrolments: { active: enrolments },
    assessments: { pending: assessments },
    applications: { total: applications },
  };
}

export async function getStudentDashboard(studentId: string) {
  const [enrolment, moduleRegs, attendance, finance] = await Promise.all([
    prisma.enrolment.findFirst({
      where: { studentId, deletedAt: null, status: 'ENROLLED' },
      orderBy: { createdAt: 'desc' },
      include: { programme: true },
    }),
    prisma.moduleRegistration.findMany({
      where: { enrolment: { studentId, deletedAt: null }, deletedAt: null },
      include: { module: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.attendanceRecord.findMany({
      where: { moduleRegistration: { enrolment: { studentId } }, deletedAt: null },
    }),
    prisma.studentAccount.findFirst({
      where: { studentId, deletedAt: null },
    }),
  ]);

  const totalAttendance = attendance.length;
  const present = attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
  const attendanceRate = totalAttendance > 0 ? Math.round((present / totalAttendance) * 100) : 0;

  return {
    enrolment: enrolment ? {
      programmeCode: enrolment.programme?.programmeCode,
      programmeTitle: enrolment.programme?.title,
      level: enrolment.programme?.level,
      credits: enrolment.programme?.creditTotal,
      duration: enrolment.programme?.duration,
      modeOfStudy: enrolment.modeOfStudy,
      yearOfStudy: enrolment.yearOfStudy,
      academicYear: enrolment.academicYear,
      expectedEndDate: enrolment.expectedEndDate,
      status: enrolment.status,
    } : null,
    modules: moduleRegs.map(mr => ({
      id: mr.id,
      moduleCode: mr.module?.moduleCode,
      title: mr.module?.title,
      credits: mr.module?.credits,
      status: mr.status,
    })),
    attendance: { rate: attendanceRate, present, total: totalAttendance },
    // NOTE: Schema rename — totalCharges → totalDebits, totalPayments → totalCredits.
    // Consumer in client/src/pages may need updating — flagged for Phase 5 frontend wiring.
    finance: finance ? {
      balance: Number(finance.balance ?? 0),
      totalDebits: Number(finance.totalDebits ?? 0),
      totalCredits: Number(finance.totalCredits ?? 0),
    } : { balance: 0, totalDebits: 0, totalCredits: 0 },
  };
}

export async function getApplicantDashboard(personId: string) {
  // NOTE: Schema migration in Phase 1:
  //   - Application no longer has direct personId — navigate via Applicant relation
  //   - Application.offers renamed to Application.conditions (OfferCondition[])
  //   - Application.entryRoute → Application.applicationRoute
  //   - Application.submittedDate removed — using decisionDate as placeholder;
  //     needs business logic review for true submission tracking
  //   - OfferCondition.offerType → conditionType
  // Response shape updated to match new schema. Frontend consumers are not
  // currently wired to this endpoint (ApplicantDashboard.tsx reads from
  // /v1/applications directly); rewire in Phase 5 portal build.
  const application = await prisma.application.findFirst({
    where: { applicant: { personId }, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: {
      programme: true,
      conditions: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 5 },
    },
  });

  return {
    application: application ? {
      id: application.id,
      programmeTitle: application.programme?.title,
      programmeCode: application.programme?.programmeCode,
      academicYear: application.academicYear,
      applicationRoute: application.applicationRoute,
      status: application.status,
      decisionDate: application.decisionDate,
    } : null,
    conditions: application?.conditions?.map((c) => ({
      id: c.id,
      type: c.conditionType,
      status: c.status,
    })) ?? [],
  };
}

export async function getAcademicDashboard(userId: string) {
  // Return aggregate stats; user-scoped filtering requires staff→module mapping.
  // NOTE: Module has no deletedAt column (not a soft-delete entity) — filter by
  // status instead, matching getStaffStats above (APPROVED + RUNNING = deliverable).
  // NOTE: Marks live in the MarkEntry model (not "Mark") and have no deletedAt by
  // design — academic mark history must never be destructively removed. "Pending"
  // here means marks still at DRAFT stage, i.e. not yet submitted for first
  // marking. MarkStage values: DRAFT | FIRST_MARK | SECOND_MARK | MODERATED |
  // EXTERNAL_REVIEWED | BOARD_APPROVED | RELEASED.
  const [modules, pendingMarks] = await Promise.all([
    prisma.module.count({ where: { status: { in: ['APPROVED', 'RUNNING'] } } }),
    prisma.markEntry.count({ where: { stage: 'DRAFT' } }),
  ]);

  return {
    modules: { total: modules },
    pendingMarks: { total: pendingMarks },
  };
}

export async function getEngagementScores(query: Record<string, any>) {
  const { page = 1, limit = 25, search, riskLevel, programmeId } = query;

  // Build attendance filter — supports programme scoping
  const attendanceWhere: Record<string, any> = {};
  if (programmeId) {
    attendanceWhere.moduleRegistration = { enrolment: { programmeId } };
  }

  // If searching by name/number, resolve matching studentIds first
  let searchStudentIds: string[] | undefined;
  if (search) {
    const matches = await prisma.student.findMany({
      where: {
        deletedAt: null,
        OR: [
          { studentNumber: { contains: search, mode: 'insensitive' } },
          { person: { firstName: { contains: search, mode: 'insensitive' } } },
          { person: { lastName: { contains: search, mode: 'insensitive' } } },
        ],
      },
      select: { id: true },
      take: 500,
    });
    searchStudentIds = matches.map(m => m.id);
    if (searchStudentIds.length === 0) {
      return {
        summary: { total: 0, green: 0, amber: 0, red: 0 },
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      };
    }
    attendanceWhere.studentId = { in: searchStudentIds };
  }

  // Aggregate attendance grouped by studentId — two queries for total vs present
  const [totalGroups, presentGroups] = await Promise.all([
    prisma.attendanceRecord.groupBy({
      by: ['studentId'],
      _count: { _all: true },
      where: attendanceWhere,
    }),
    prisma.attendanceRecord.groupBy({
      by: ['studentId'],
      _count: { _all: true },
      where: { ...attendanceWhere, status: { in: ['PRESENT', 'LATE'] } },
    }),
  ]);

  // Compute scores per student
  const presentMap = new Map(presentGroups.map(g => [g.studentId, g._count._all]));
  let scores = totalGroups.map(g => {
    const total = g._count._all;
    const present = presentMap.get(g.studentId) ?? 0;
    const score = total > 0 ? Math.round((present / total) * 100) : 0;
    const rating: 'green' | 'amber' | 'red' = score >= 80 ? 'green' : score >= 60 ? 'amber' : 'red';
    return { studentId: g.studentId, score, rating, totalRecords: total, presentCount: present };
  });

  // Summary stats — always reflects full population (before riskLevel filter)
  const summary = {
    total: scores.length,
    green: scores.filter(s => s.rating === 'green').length,
    amber: scores.filter(s => s.rating === 'amber').length,
    red: scores.filter(s => s.rating === 'red').length,
  };

  // Filter by risk level (only affects the paginated list, not summary)
  if (riskLevel) {
    scores = scores.filter(s => s.rating === riskLevel);
  }

  // Sort: worst scores first (for intervention prioritisation)
  scores.sort((a, b) => a.score - b.score);

  // Paginate
  const skip = (page - 1) * limit;
  const pageScores = scores.slice(skip, skip + limit);

  // Fetch student details only for this page
  const studentIds = pageScores.map(s => s.studentId);
  const students = studentIds.length > 0
    ? await prisma.student.findMany({
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
      })
    : [];

  // Merge scores with student details
  const studentMap = new Map(students.map(s => [s.id, s]));
  const data = pageScores.map(s => {
    const stu = studentMap.get(s.studentId);
    return {
      studentId: s.studentId,
      studentNumber: stu?.studentNumber ?? '',
      firstName: stu?.person?.firstName ?? '',
      lastName: stu?.person?.lastName ?? '',
      programme: stu?.enrolments?.[0]?.programme?.title ?? '—',
      programmeCode: stu?.enrolments?.[0]?.programme?.programmeCode ?? '—',
      score: s.score,
      rating: s.rating,
      totalRecords: s.totalRecords,
      presentCount: s.presentCount,
    };
  });

  return {
    summary,
    data,
    pagination: {
      page,
      limit,
      total: scores.length,
      totalPages: Math.ceil(scores.length / limit),
      hasNext: page * limit < scores.length,
      hasPrev: page > 1,
    },
  };
}

export async function getStaffTutees(staffId: string, query: Record<string, any>) {
  const { page = 1, limit = 25 } = query;
  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    prisma.personalTutoring.findMany({
      where: { tutorId: staffId },
      distinct: ['studentId'],
      skip,
      take: limit,
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
    }),
    prisma.personalTutoring.groupBy({
      by: ['studentId'],
      where: { tutorId: staffId },
    }).then(r => r.length),
  ]);

  // Deduplicate by studentId and shape response
  const seen = new Set<string>();
  const tutees = records
    .filter(r => { if (seen.has(r.studentId)) return false; seen.add(r.studentId); return true; })
    .map(r => ({
      studentId: r.studentId,
      studentNumber: r.student?.studentNumber,
      name: r.student?.person ? `${r.student.person.firstName} ${r.student.person.lastName}` : '—',
      programme: r.student?.enrolments?.[0]?.programme?.title ?? '—',
      programmeCode: r.student?.enrolments?.[0]?.programme?.programmeCode ?? '—',
      lastMeeting: r.meetingDate,
    }));

  return {
    data: tutees,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
  };
}
