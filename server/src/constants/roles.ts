// ── SJMS 2.5 Role Constants ──────────────────────────────────────────────
// Maps to Keycloak realm roles for the SJMS realm

// Administrative roles
export const ROLE_SYSTEM_ADMIN = "system_admin";
export const ROLE_REGISTRY_MANAGER = "registry_manager";
export const ROLE_REGISTRY_OFFICER = "registry_officer";
export const ROLE_ADMISSIONS_MANAGER = "admissions_manager";
export const ROLE_ADMISSIONS_OFFICER = "admissions_officer";
export const ROLE_FINANCE_MANAGER = "finance_manager";
export const ROLE_FINANCE_OFFICER = "finance_officer";
export const ROLE_QA_MANAGER = "qa_manager";
export const ROLE_QA_OFFICER = "qa_officer";
export const ROLE_COMPLIANCE_OFFICER = "compliance_officer";
export const ROLE_HR_MANAGER = "hr_manager";
export const ROLE_TIMETABLE_OFFICER = "timetable_officer";
export const ROLE_STUDENT_SUPPORT_OFFICER = "student_support_officer";

// Academic roles
export const ROLE_DEAN = "dean";
export const ROLE_ASSOCIATE_DEAN = "associate_dean";
export const ROLE_PROGRAMME_LEADER = "programme_leader";
export const ROLE_MODULE_LEADER = "module_leader";
export const ROLE_LECTURER = "lecturer";
export const ROLE_PERSONAL_TUTOR = "personal_tutor";
export const ROLE_EXTERNAL_EXAMINER = "external_examiner";
export const ROLE_INTERNAL_EXAMINER = "internal_examiner";
export const ROLE_PLACEMENT_COORDINATOR = "placement_coordinator";
export const ROLE_RESEARCH_SUPERVISOR = "research_supervisor";

// Student roles
export const ROLE_STUDENT = "student";
export const ROLE_STUDENT_REP = "student_rep";

// Applicant roles
export const ROLE_APPLICANT = "applicant";

// Agent / external roles
export const ROLE_AGENT = "agent";

// ── Role Groups ──────────────────────────────────────────────────────────

export const ROLE_GROUPS = {
  /** Full system access */
  SUPER_ADMIN: [ROLE_SYSTEM_ADMIN] as const,

  /** Administrative staff across all departments */
  ADMIN_STAFF: [
    ROLE_SYSTEM_ADMIN,
    ROLE_REGISTRY_MANAGER,
    ROLE_REGISTRY_OFFICER,
    ROLE_ADMISSIONS_MANAGER,
    ROLE_ADMISSIONS_OFFICER,
    ROLE_FINANCE_MANAGER,
    ROLE_FINANCE_OFFICER,
    ROLE_QA_MANAGER,
    ROLE_QA_OFFICER,
    ROLE_COMPLIANCE_OFFICER,
    ROLE_HR_MANAGER,
    ROLE_TIMETABLE_OFFICER,
    ROLE_STUDENT_SUPPORT_OFFICER,
  ] as const,

  /** Registry team */
  REGISTRY: [
    ROLE_REGISTRY_MANAGER,
    ROLE_REGISTRY_OFFICER,
  ] as const,

  /** Admissions team */
  ADMISSIONS: [
    ROLE_ADMISSIONS_MANAGER,
    ROLE_ADMISSIONS_OFFICER,
  ] as const,

  /** Finance team */
  FINANCE: [
    ROLE_FINANCE_MANAGER,
    ROLE_FINANCE_OFFICER,
  ] as const,

  /** Quality Assurance */
  QA: [
    ROLE_QA_MANAGER,
    ROLE_QA_OFFICER,
  ] as const,

  /** All academic staff */
  ACADEMIC_STAFF: [
    ROLE_DEAN,
    ROLE_ASSOCIATE_DEAN,
    ROLE_PROGRAMME_LEADER,
    ROLE_MODULE_LEADER,
    ROLE_LECTURER,
    ROLE_PERSONAL_TUTOR,
    ROLE_EXTERNAL_EXAMINER,
    ROLE_INTERNAL_EXAMINER,
    ROLE_PLACEMENT_COORDINATOR,
    ROLE_RESEARCH_SUPERVISOR,
  ] as const,

  /** Senior academic leadership */
  ACADEMIC_LEADERSHIP: [
    ROLE_DEAN,
    ROLE_ASSOCIATE_DEAN,
    ROLE_PROGRAMME_LEADER,
  ] as const,

  /** Exam board members */
  EXAM_BOARD: [
    ROLE_DEAN,
    ROLE_ASSOCIATE_DEAN,
    ROLE_PROGRAMME_LEADER,
    ROLE_MODULE_LEADER,
    ROLE_EXTERNAL_EXAMINER,
    ROLE_INTERNAL_EXAMINER,
  ] as const,

  /** Teaching staff */
  TEACHING: [
    ROLE_PROGRAMME_LEADER,
    ROLE_MODULE_LEADER,
    ROLE_LECTURER,
    ROLE_PERSONAL_TUTOR,
  ] as const,

  /** All student-type roles */
  STUDENTS: [
    ROLE_STUDENT,
    ROLE_STUDENT_REP,
  ] as const,

  /** All roles that can access the system */
  ALL_AUTHENTICATED: [
    ROLE_SYSTEM_ADMIN,
    ROLE_REGISTRY_MANAGER,
    ROLE_REGISTRY_OFFICER,
    ROLE_ADMISSIONS_MANAGER,
    ROLE_ADMISSIONS_OFFICER,
    ROLE_FINANCE_MANAGER,
    ROLE_FINANCE_OFFICER,
    ROLE_QA_MANAGER,
    ROLE_QA_OFFICER,
    ROLE_COMPLIANCE_OFFICER,
    ROLE_HR_MANAGER,
    ROLE_TIMETABLE_OFFICER,
    ROLE_STUDENT_SUPPORT_OFFICER,
    ROLE_DEAN,
    ROLE_ASSOCIATE_DEAN,
    ROLE_PROGRAMME_LEADER,
    ROLE_MODULE_LEADER,
    ROLE_LECTURER,
    ROLE_PERSONAL_TUTOR,
    ROLE_EXTERNAL_EXAMINER,
    ROLE_INTERNAL_EXAMINER,
    ROLE_PLACEMENT_COORDINATOR,
    ROLE_RESEARCH_SUPERVISOR,
    ROLE_STUDENT,
    ROLE_STUDENT_REP,
    ROLE_APPLICANT,
    ROLE_AGENT,
  ] as const,
} as const;

export type Role = (typeof ROLE_GROUPS.ALL_AUTHENTICATED)[number];
