// ── SJMS 2.5 Role Constants ──────────────────────────────────────────────
// Maps to Keycloak realm roles for the FHE realm (36 roles)

// Top-level admin
export const ROLE_SUPER_ADMIN = 'super_admin' as const;
export const ROLE_SYSTEM_ADMIN = 'system_admin' as const;

// Registry
export const ROLE_REGISTRAR = 'registrar' as const;
export const ROLE_SENIOR_REGISTRY_OFFICER = 'senior_registry_officer' as const;
export const ROLE_REGISTRY_OFFICER = 'registry_officer' as const;
export const ROLE_ADMISSIONS_MANAGER = 'admissions_manager' as const;
export const ROLE_ADMISSIONS_OFFICER = 'admissions_officer' as const;
export const ROLE_ADMISSIONS_TUTOR = 'admissions_tutor' as const;
export const ROLE_ASSESSMENT_OFFICER = 'assessment_officer' as const;
export const ROLE_PROGRESSION_OFFICER = 'progression_officer' as const;
export const ROLE_GRADUATION_OFFICER = 'graduation_officer' as const;

// Finance
export const ROLE_FINANCE_DIRECTOR = 'finance_director' as const;
export const ROLE_FINANCE_MANAGER = 'finance_manager' as const;
export const ROLE_FINANCE_OFFICER = 'finance_officer' as const;

// Quality
export const ROLE_QUALITY_DIRECTOR = 'quality_director' as const;
export const ROLE_QUALITY_OFFICER = 'quality_officer' as const;
export const ROLE_COMPLIANCE_OFFICER = 'compliance_officer' as const;

// Academic hierarchy
export const ROLE_DEAN = 'dean' as const;
export const ROLE_ASSOCIATE_DEAN = 'associate_dean' as const;
export const ROLE_HEAD_OF_DEPARTMENT = 'head_of_department' as const;
export const ROLE_PROGRAMME_LEADER = 'programme_leader' as const;
export const ROLE_MODULE_LEADER = 'module_leader' as const;
export const ROLE_ACADEMIC_STAFF = 'academic_staff' as const;
export const ROLE_LECTURER = 'lecturer' as const;
export const ROLE_SENIOR_LECTURER = 'senior_lecturer' as const;
export const ROLE_PROFESSOR = 'professor' as const;

// Student support
export const ROLE_STUDENT_SUPPORT_MANAGER = 'student_support_manager' as const;
export const ROLE_STUDENT_SUPPORT_OFFICER = 'student_support_officer' as const;
export const ROLE_PERSONAL_TUTOR = 'personal_tutor' as const;
export const ROLE_DISABILITY_ADVISOR = 'disability_advisor' as const;
export const ROLE_WELLBEING_OFFICER = 'wellbeing_officer' as const;

// Specialist
export const ROLE_INTERNATIONAL_OFFICER = 'international_officer' as const;
export const ROLE_ACCOMMODATION_OFFICER = 'accommodation_officer' as const;

// End users
export const ROLE_STUDENT = 'student' as const;
export const ROLE_APPLICANT = 'applicant' as const;
export const ROLE_PUBLIC = 'public' as const;

// ── Role Groups ──────────────────────────────────────────────────────────

export const ROLE_GROUPS = {
  /** Full system access */
  SUPER_ADMIN: [ROLE_SUPER_ADMIN] as const,

  /** All administrative staff */
  ADMIN_STAFF: [
    ROLE_SUPER_ADMIN, ROLE_SYSTEM_ADMIN,
    ROLE_REGISTRAR, ROLE_SENIOR_REGISTRY_OFFICER, ROLE_REGISTRY_OFFICER,
    ROLE_ADMISSIONS_MANAGER, ROLE_ADMISSIONS_OFFICER,
    ROLE_ASSESSMENT_OFFICER, ROLE_PROGRESSION_OFFICER, ROLE_GRADUATION_OFFICER,
    ROLE_FINANCE_DIRECTOR, ROLE_FINANCE_MANAGER, ROLE_FINANCE_OFFICER,
    ROLE_QUALITY_DIRECTOR, ROLE_QUALITY_OFFICER, ROLE_COMPLIANCE_OFFICER,
    ROLE_STUDENT_SUPPORT_MANAGER, ROLE_STUDENT_SUPPORT_OFFICER,
    ROLE_INTERNATIONAL_OFFICER, ROLE_ACCOMMODATION_OFFICER,
  ] as const,

  /** Registry team */
  REGISTRY: [
    ROLE_REGISTRAR, ROLE_SENIOR_REGISTRY_OFFICER, ROLE_REGISTRY_OFFICER,
  ] as const,

  /** Admissions team */
  ADMISSIONS: [
    ROLE_ADMISSIONS_MANAGER, ROLE_ADMISSIONS_OFFICER, ROLE_ADMISSIONS_TUTOR,
  ] as const,

  /** Finance team */
  FINANCE: [
    ROLE_FINANCE_DIRECTOR, ROLE_FINANCE_MANAGER, ROLE_FINANCE_OFFICER,
  ] as const,

  /** Quality & compliance */
  QUALITY: [
    ROLE_QUALITY_DIRECTOR, ROLE_QUALITY_OFFICER, ROLE_COMPLIANCE_OFFICER,
  ] as const,

  /** Academic hierarchy */
  ACADEMIC_LEADERSHIP: [
    ROLE_DEAN, ROLE_ASSOCIATE_DEAN, ROLE_HEAD_OF_DEPARTMENT,
    ROLE_PROGRAMME_LEADER,
  ] as const,

  /** All teaching staff */
  TEACHING: [
    ROLE_DEAN, ROLE_ASSOCIATE_DEAN, ROLE_HEAD_OF_DEPARTMENT,
    ROLE_PROGRAMME_LEADER, ROLE_MODULE_LEADER,
    ROLE_ACADEMIC_STAFF, ROLE_LECTURER, ROLE_SENIOR_LECTURER, ROLE_PROFESSOR,
  ] as const,

  /** Academic staff (alias for TEACHING) */
  ACADEMIC_STAFF: [
    ROLE_DEAN, ROLE_ASSOCIATE_DEAN, ROLE_HEAD_OF_DEPARTMENT,
    ROLE_PROGRAMME_LEADER, ROLE_MODULE_LEADER,
    ROLE_ACADEMIC_STAFF, ROLE_LECTURER, ROLE_SENIOR_LECTURER, ROLE_PROFESSOR,
  ] as const,

  /** Exam board eligible */
  EXAM_BOARD: [
    ROLE_DEAN, ROLE_ASSOCIATE_DEAN,
    ROLE_PROGRAMME_LEADER, ROLE_MODULE_LEADER,
    ROLE_SENIOR_LECTURER, ROLE_PROFESSOR,
  ] as const,

  /** Student support */
  SUPPORT: [
    ROLE_STUDENT_SUPPORT_MANAGER, ROLE_STUDENT_SUPPORT_OFFICER,
    ROLE_PERSONAL_TUTOR, ROLE_DISABILITY_ADVISOR, ROLE_WELLBEING_OFFICER,
  ] as const,

  /** UKVI compliance */
  COMPLIANCE: [
    ROLE_COMPLIANCE_OFFICER, ROLE_INTERNATIONAL_OFFICER, ROLE_REGISTRAR,
  ] as const,

  /** Student-facing roles */
  STUDENTS: [ROLE_STUDENT] as const,

  /** All authenticated roles (for route guards) */
  ALL_AUTHENTICATED: [
    ROLE_SUPER_ADMIN, ROLE_SYSTEM_ADMIN,
    ROLE_REGISTRAR, ROLE_SENIOR_REGISTRY_OFFICER, ROLE_REGISTRY_OFFICER,
    ROLE_ADMISSIONS_MANAGER, ROLE_ADMISSIONS_OFFICER, ROLE_ADMISSIONS_TUTOR,
    ROLE_ASSESSMENT_OFFICER, ROLE_PROGRESSION_OFFICER, ROLE_GRADUATION_OFFICER,
    ROLE_FINANCE_DIRECTOR, ROLE_FINANCE_MANAGER, ROLE_FINANCE_OFFICER,
    ROLE_QUALITY_DIRECTOR, ROLE_QUALITY_OFFICER, ROLE_COMPLIANCE_OFFICER,
    ROLE_DEAN, ROLE_ASSOCIATE_DEAN, ROLE_HEAD_OF_DEPARTMENT,
    ROLE_PROGRAMME_LEADER, ROLE_MODULE_LEADER,
    ROLE_ACADEMIC_STAFF, ROLE_LECTURER, ROLE_SENIOR_LECTURER, ROLE_PROFESSOR,
    ROLE_STUDENT_SUPPORT_MANAGER, ROLE_STUDENT_SUPPORT_OFFICER,
    ROLE_PERSONAL_TUTOR, ROLE_DISABILITY_ADVISOR, ROLE_WELLBEING_OFFICER,
    ROLE_INTERNATIONAL_OFFICER, ROLE_ACCOMMODATION_OFFICER,
    ROLE_STUDENT, ROLE_APPLICANT,
  ] as const,
} as const;

export type Role = (typeof ROLE_GROUPS.ALL_AUTHENTICATED)[number];
