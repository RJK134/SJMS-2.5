// SJMS 2.5 — Client-side role constants
//
// These constants mirror a subset of `server/src/constants/roles.ts` — the
// role groups that the client uses for route gating. Keep in sync manually
// when the server `ROLE_GROUPS` definitions change.
//
// Server source of truth: server/src/constants/roles.ts

/**
 * All administrative staff roles. Used to gate AdminRouter (/admin/*) entry.
 * Mirrors server `ROLE_GROUPS.ADMIN_STAFF` (20 roles).
 */
export const ADMIN_STAFF_ROLES = [
  'super_admin',
  'system_admin',
  'registrar',
  'senior_registry_officer',
  'registry_officer',
  'admissions_manager',
  'admissions_officer',
  'assessment_officer',
  'progression_officer',
  'graduation_officer',
  'finance_director',
  'finance_manager',
  'finance_officer',
  'quality_director',
  'quality_officer',
  'compliance_officer',
  'student_support_manager',
  'student_support_officer',
  'international_officer',
  'accommodation_officer',
] as const;

/**
 * All teaching / academic staff roles. Used to gate AcademicPortal (/academic/*) entry.
 * Mirrors server `ROLE_GROUPS.ACADEMIC_STAFF` / `TEACHING` (9 roles).
 */
export const ACADEMIC_STAFF_ROLES = [
  'dean',
  'associate_dean',
  'head_of_department',
  'programme_leader',
  'module_leader',
  'academic_staff',
  'lecturer',
  'senior_lecturer',
  'professor',
] as const;

/**
 * Enrolled student role. Used to gate StudentPortal (/student/*) entry.
 */
export const STUDENT_ROLES = ['student'] as const;

/**
 * Prospective applicant role. Used to gate ApplicantPortal (/applicant/*) entry.
 */
export const APPLICANT_ROLES = ['applicant'] as const;
