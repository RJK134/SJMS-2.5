import prisma from '../../utils/prisma';

export async function getStaffStats() {
  const [students, programmes, modules, enrolments, pendingAssessments, applications] = await Promise.all([
    prisma.student.count({ where: { deletedAt: null } }),
    prisma.programme.count({ where: { deletedAt: null, status: 'ACTIVE' } }),
    prisma.module.count({ where: { deletedAt: null } }),
    prisma.enrolment.count({ where: { deletedAt: null, status: 'ENROLLED' } }),
    prisma.assessment.count({ where: { deletedAt: null } }),
    prisma.application.count({ where: { deletedAt: null } }),
  ]);

  return {
    students: { total: students },
    programmes: { total: programmes },
    modules: { total: modules },
    enrolments: { active: enrolments },
    assessments: { pending: pendingAssessments },
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
    finance: finance ? {
      balance: Number(finance.balance ?? 0),
      totalCharges: Number(finance.totalCharges ?? 0),
      totalPayments: Number(finance.totalPayments ?? 0),
    } : { balance: 0, totalCharges: 0, totalPayments: 0 },
  };
}

export async function getApplicantDashboard(personId: string) {
  const application = await prisma.application.findFirst({
    where: { personId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: { programme: true, offers: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 5 } },
  });

  return {
    application: application ? {
      id: application.id,
      programmeTitle: application.programme?.title,
      programmeCode: application.programme?.programmeCode,
      academicYear: application.academicYear,
      entryRoute: application.entryRoute,
      status: application.status,
      submittedDate: application.submittedDate,
    } : null,
    offers: application?.offers?.map(o => ({
      id: o.id,
      type: o.offerType,
      status: o.status,
    })) ?? [],
  };
}

export async function getAcademicDashboard(userId: string) {
  // Return aggregate stats; user-scoped filtering requires staff→module mapping
  const [modules, pendingMarks] = await Promise.all([
    prisma.module.count({ where: { deletedAt: null } }),
    prisma.mark.count({ where: { deletedAt: null, status: 'DRAFT' } }),
  ]);

  return {
    modules: { total: modules },
    pendingMarks: { total: pendingMarks },
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
