import * as repo from '../../repositories/dashboard.repository';

export interface EngagementScoresQuery {
  page?: number;
  limit?: number;
  search?: string;
  riskLevel?: 'green' | 'amber' | 'red';
  programmeId?: string;
}

export interface StaffTuteesQuery {
  page?: number;
  limit?: number;
}

export async function getStaffStats() {
  const counts = await repo.getStaffCounts();
  return {
    students: { total: counts.students },
    programmes: { total: counts.programmes },
    modules: { total: counts.modules },
    enrolments: { active: counts.enrolments },
    assessments: { pending: counts.assessments },
    applications: { total: counts.applications },
  };
}

export async function getStudentDashboard(studentId: string) {
  const [enrolment, moduleRegs, attendance, finance] = await Promise.all([
    repo.getStudentLatestEnrolment(studentId),
    repo.getStudentModuleRegistrations(studentId, 10),
    repo.getStudentAttendance(studentId),
    repo.getStudentFinance(studentId),
  ]);

  const totalAttendance = attendance.length;
  const present = attendance.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
  const attendanceRate = totalAttendance > 0 ? Math.round((present / totalAttendance) * 100) : 0;

  return {
    enrolment: enrolment
      ? {
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
        }
      : null,
    modules: moduleRegs.map((mr) => ({
      id: mr.id,
      moduleCode: mr.module?.moduleCode,
      title: mr.module?.title,
      credits: mr.module?.credits,
      status: mr.status,
    })),
    attendance: { rate: attendanceRate, present, total: totalAttendance },
    // NOTE: Schema rename — totalCharges → totalDebits, totalPayments → totalCredits.
    // Consumer in client/src/pages may need updating — flagged for Phase 5 frontend wiring.
    finance: finance
      ? {
          balance: Number(finance.balance ?? 0),
          totalDebits: Number(finance.totalDebits ?? 0),
          totalCredits: Number(finance.totalCredits ?? 0),
        }
      : { balance: 0, totalDebits: 0, totalCredits: 0 },
  };
}

export async function getApplicantDashboard(personId: string) {
  const application = await repo.getApplicantLatestApplication(personId);

  return {
    application: application
      ? {
          id: application.id,
          programmeTitle: application.programme?.title,
          programmeCode: application.programme?.programmeCode,
          academicYear: application.academicYear,
          applicationRoute: application.applicationRoute,
          status: application.status,
          decisionDate: application.decisionDate,
        }
      : null,
    conditions:
      application?.conditions?.map((c) => ({
        id: c.id,
        type: c.conditionType,
        status: c.status,
      })) ?? [],
  };
}

export async function getAcademicDashboard(_userId: string) {
  // Return aggregate stats; user-scoped filtering requires staff→module mapping.
  const counts = await repo.getAcademicCounts();
  return {
    modules: { total: counts.modules },
    pendingMarks: { total: counts.pendingMarks },
  };
}

export async function getEngagementScores(query: EngagementScoresQuery) {
  const { page = 1, limit = 25, search, riskLevel, programmeId } = query;

  // Build attendance filter — supports programme scoping
  const attendanceWhere: Record<string, any> = {};
  if (programmeId) {
    attendanceWhere.moduleRegistration = { enrolment: { programmeId } };
  }

  // If searching by name/number, resolve matching studentIds first
  let searchStudentIds: string[] | undefined;
  if (search) {
    const matches = await repo.findStudentsBySearch(search, 500);
    searchStudentIds = matches.map((m) => m.id);
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
    repo.getAttendanceGroupedByStudent(attendanceWhere),
    repo.getAttendanceGroupedByStudent(attendanceWhere, ['PRESENT', 'LATE']),
  ]);

  // Compute scores per student
  const presentMap = new Map(presentGroups.map((g) => [g.studentId, g._count._all]));
  let scores = totalGroups.map((g) => {
    const total = g._count._all;
    const present = presentMap.get(g.studentId) ?? 0;
    const score = total > 0 ? Math.round((present / total) * 100) : 0;
    const rating: 'green' | 'amber' | 'red' = score >= 80 ? 'green' : score >= 60 ? 'amber' : 'red';
    return { studentId: g.studentId, score, rating, totalRecords: total, presentCount: present };
  });

  // Summary stats — always reflects full population (before riskLevel filter)
  const summary = {
    total: scores.length,
    green: scores.filter((s) => s.rating === 'green').length,
    amber: scores.filter((s) => s.rating === 'amber').length,
    red: scores.filter((s) => s.rating === 'red').length,
  };

  // Filter by risk level (only affects the paginated list, not summary)
  if (riskLevel) {
    scores = scores.filter((s) => s.rating === riskLevel);
  }

  // Sort: worst scores first (for intervention prioritisation)
  scores.sort((a, b) => a.score - b.score);

  // Paginate
  const skip = (page - 1) * limit;
  const pageScores = scores.slice(skip, skip + limit);

  // Fetch student details only for this page
  const studentIds = pageScores.map((s) => s.studentId);
  const students = studentIds.length > 0 ? await repo.getStudentsWithEnrolments(studentIds) : [];

  // Merge scores with student details
  const studentMap = new Map(students.map((s) => [s.id, s]));
  const data = pageScores.map((s) => {
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

export async function getStaffTutees(staffId: string, query: StaffTuteesQuery) {
  const { page = 1, limit = 25 } = query;
  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    repo.getStaffTutees(staffId, skip, limit),
    repo.countDistinctStaffTutees(staffId),
  ]);

  // Deduplicate by studentId and shape response
  const seen = new Set<string>();
  const tutees = records
    .filter((r) => {
      if (seen.has(r.studentId)) return false;
      seen.add(r.studentId);
      return true;
    })
    .map((r) => ({
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
