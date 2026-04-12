// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  SJMS 2.5 — API Module Generator                                       ║
// ║  Generates 37 domain modules (schema + service + controller + router)   ║
// ╚══════════════════════════════════════════════════════════════════════════╝

import * as fs from 'fs';
import * as path from 'path';

const API_DIR = path.join(__dirname, '..', 'server', 'src', 'api');

interface Mod {
  dir: string;       // directory + file prefix
  model: string;     // prisma accessor (e.g. 'faculty', 'eCClaim')
  entity: string;    // human display name
  router: string;    // export name
  fields: string;    // Zod create fields (template string)
  filters: string;   // extra query filters
  inc: string;       // Prisma include for getById (empty = none)
  search: string[];  // searchable fields (dot notation)
  roles: [string, string, string, string]; // list, read, write, delete
  soft: boolean;     // has deletedAt?
}

// ─── Module Definitions ─────────────────────────────────────────────────────

const MODS: Mod[] = [
  // ── CORE STUDENT MANAGEMENT ──
  {
    dir: 'students', model: 'student', entity: 'Student', router: 'studentsRouter',
    fields: `feeStatus: z.enum(['HOME','OVERSEAS','EU_TRANSITIONAL','ISLANDS','CHANNEL_ISLANDS']),
    entryRoute: z.enum(['UCAS','DIRECT','CLEARING','INTERNATIONAL','INTERNAL_TRANSFER']),
    originalEntryDate: z.coerce.date(),
    personId: z.string().min(1),`,
    filters: `feeStatus: z.string().optional(),
    entryRoute: z.string().optional(),`,
    inc: `{ person: { include: { contacts: true, addresses: true, identifiers: true, demographic: true } }, enrolments: { where: { deletedAt: null }, take: 5, orderBy: { createdAt: 'desc' } } }`,
    search: ['studentNumber', 'person.firstName', 'person.lastName'],
    roles: ['ADMIN_STAFF', 'ALL_AUTHENTICATED', 'REGISTRY', 'SUPER_ADMIN'],
    soft: true,
  },
  {
    dir: 'persons', model: 'person', entity: 'Person', router: 'personsRouter',
    fields: `title: z.string().optional(),
    firstName: z.string().min(1).max(100),
    middleNames: z.string().optional(),
    lastName: z.string().min(1).max(100),
    dateOfBirth: z.coerce.date(),
    gender: z.enum(['MALE','FEMALE','NON_BINARY','OTHER','PREFER_NOT_TO_SAY']).optional(),
    legalSex: z.enum(['MALE','FEMALE','INDETERMINATE']).optional(),
    pronouns: z.string().optional(),`,
    filters: '', inc: `{ contacts: true, addresses: true, identifiers: true, demographic: true }`,
    search: ['firstName', 'lastName'], roles: ['ADMIN_STAFF', 'ADMIN_STAFF', 'REGISTRY', 'SUPER_ADMIN'], soft: true,
  },
  {
    dir: 'demographics', model: 'personDemographic', entity: 'PersonDemographic', router: 'demographicsRouter',
    fields: `personId: z.string().min(1),
    ethnicity: z.string().optional(),
    disability: z.string().optional(),
    religion: z.string().optional(),
    sexualOrientation: z.string().optional(),
    careLeaver: z.boolean().optional(),
    parentalEducation: z.boolean().optional(),
    polarQuintile: z.number().min(1).max(5).optional(),
    imdQuintile: z.number().min(1).max(5).optional(),`,
    filters: 'personId: z.string().optional(),',
    inc: '{ person: true }', search: [], roles: ['REGISTRY', 'REGISTRY', 'REGISTRY', 'SUPER_ADMIN'], soft: false,
  },
  {
    dir: 'identifiers', model: 'personIdentifier', entity: 'PersonIdentifier', router: 'identifiersRouter',
    fields: `personId: z.string().min(1),
    identifierType: z.enum(['HUSID','ULN','UCAS_ID','SLC_SSN','PASSPORT','NATIONAL_ID','OTHER']),
    value: z.string().min(1),
    issuer: z.string().optional(),
    issueDate: z.coerce.date().optional(),
    expiryDate: z.coerce.date().optional(),`,
    filters: 'personId: z.string().optional(), identifierType: z.string().optional(),',
    inc: '{ person: true }', search: ['value'], roles: ['ADMIN_STAFF', 'ADMIN_STAFF', 'REGISTRY', 'SUPER_ADMIN'], soft: false,
  },

  // ── CURRICULUM ──
  {
    dir: 'faculties', model: 'faculty', entity: 'Faculty', router: 'facultiesRouter',
    fields: `code: z.string().min(1).max(20), title: z.string().min(1).max(200),`,
    filters: '', inc: '{ schools: true }', search: ['title', 'code'],
    roles: ['ALL_AUTHENTICATED', 'ALL_AUTHENTICATED', 'SUPER_ADMIN', 'SUPER_ADMIN'], soft: false,
  },
  {
    dir: 'schools', model: 'school', entity: 'School', router: 'schoolsRouter',
    fields: `facultyId: z.string().min(1), code: z.string().min(1).max(20), title: z.string().min(1).max(200),`,
    filters: 'facultyId: z.string().optional(),', inc: '{ faculty: true, departments: true }', search: ['title', 'code'],
    roles: ['ALL_AUTHENTICATED', 'ALL_AUTHENTICATED', 'SUPER_ADMIN', 'SUPER_ADMIN'], soft: false,
  },
  {
    dir: 'departments', model: 'department', entity: 'Department', router: 'departmentsRouter',
    fields: `schoolId: z.string().min(1), code: z.string().min(1).max(20), title: z.string().min(1).max(200),`,
    filters: 'schoolId: z.string().optional(),', inc: '{ school: { include: { faculty: true } } }', search: ['title', 'code'],
    roles: ['ALL_AUTHENTICATED', 'ALL_AUTHENTICATED', 'ACADEMIC_LEADERSHIP', 'SUPER_ADMIN'], soft: false,
  },
  {
    dir: 'programmes', model: 'programme', entity: 'Programme', router: 'programmesRouter',
    fields: `departmentId: z.string().min(1),
    programmeCode: z.string().min(1),
    ucasCode: z.string().optional(),
    title: z.string().min(1).max(300),
    level: z.enum(['LEVEL_3','LEVEL_4','LEVEL_5','LEVEL_6','LEVEL_7','LEVEL_8']),
    creditTotal: z.number().int().min(1),
    duration: z.number().int().min(1),
    modeOfStudy: z.enum(['FULL_TIME','PART_TIME','SANDWICH','DISTANCE','BLOCK_RELEASE']),
    awardingBody: z.string().min(1),
    status: z.enum(['DRAFT','APPROVED','SUSPENDED','WITHDRAWN','CLOSED']).default('DRAFT'),`,
    filters: `status: z.string().optional(), level: z.string().optional(), departmentId: z.string().optional(),`,
    inc: `{ department: { include: { school: { include: { faculty: true } } } }, programmeModules: { include: { module: true } }, specifications: true }`,
    search: ['title', 'programmeCode', 'ucasCode'],
    roles: ['ALL_AUTHENTICATED', 'ALL_AUTHENTICATED', 'ACADEMIC_LEADERSHIP', 'SUPER_ADMIN'], soft: false,
  },
  {
    dir: 'modules', model: 'module', entity: 'Module', router: 'modulesRouter',
    fields: `departmentId: z.string().min(1),
    moduleCode: z.string().min(1),
    title: z.string().min(1).max(300),
    credits: z.number().int().min(1).max(120),
    level: z.number().int().min(3).max(8),
    semester: z.string().optional(),
    status: z.enum(['DRAFT','APPROVED','RUNNING','SUSPENDED','WITHDRAWN']).default('DRAFT'),`,
    filters: `status: z.string().optional(), departmentId: z.string().optional(), level: z.coerce.number().optional(),`,
    inc: '{ department: true, programmeModules: { include: { programme: true } } }',
    search: ['title', 'moduleCode'],
    roles: ['ALL_AUTHENTICATED', 'ALL_AUTHENTICATED', 'ACADEMIC_LEADERSHIP', 'SUPER_ADMIN'], soft: false,
  },
  {
    dir: 'programme-modules', model: 'programmeModule', entity: 'ProgrammeModule', router: 'programmeModulesRouter',
    fields: `programmeId: z.string().min(1), moduleId: z.string().min(1),
    moduleType: z.enum(['CORE','OPTIONAL','ELECTIVE']),
    yearOfStudy: z.number().int().min(1).max(6), semester: z.string().optional(),`,
    filters: 'programmeId: z.string().optional(), moduleId: z.string().optional(),',
    inc: '{ programme: true, module: true }', search: [],
    roles: ['ACADEMIC_LEADERSHIP', 'ALL_AUTHENTICATED', 'ACADEMIC_LEADERSHIP', 'SUPER_ADMIN'], soft: false,
  },
  {
    dir: 'programme-approvals', model: 'programmeApproval', entity: 'ProgrammeApproval', router: 'programmeApprovalsRouter',
    fields: `programmeId: z.string().min(1),
    stage: z.enum(['INITIAL','FACULTY','ACADEMIC_BOARD','SENATE']),
    status: z.enum(['PENDING','APPROVED','REJECTED','RETURNED']).default('PENDING'),
    comments: z.string().optional(),`,
    filters: 'programmeId: z.string().optional(), status: z.string().optional(),',
    inc: '{ programme: true }', search: [],
    roles: ['QUALITY', 'ALL_AUTHENTICATED', 'QUALITY', 'SUPER_ADMIN'], soft: false,
  },

  // ── ADMISSIONS ──
  {
    dir: 'applications', model: 'application', entity: 'Application', router: 'applicationsRouter',
    fields: `applicantId: z.string().min(1), programmeId: z.string().min(1),
    academicYear: z.string().regex(/^\\d{4}\\/\\d{2}$/),
    applicationRoute: z.enum(['UCAS','DIRECT','CLEARING','INTERNATIONAL']),
    personalStatement: z.string().optional(),`,
    filters: `status: z.string().optional(), academicYear: z.string().optional(), programmeId: z.string().optional(),`,
    inc: '{ applicant: { include: { person: true } }, programme: true, qualifications: true, references: true, conditions: true }',
    search: [], roles: ['ADMISSIONS', 'ADMISSIONS', 'ADMISSIONS', 'SUPER_ADMIN'], soft: true,
  },
  {
    dir: 'qualifications', model: 'applicationQualification', entity: 'ApplicationQualification', router: 'qualificationsRouter',
    fields: `applicationId: z.string().min(1), qualificationType: z.string().min(1),
    subject: z.string().min(1), grade: z.string().optional(),
    predicted: z.boolean().default(false), institution: z.string().optional(),
    dateAwarded: z.coerce.date().optional(),`,
    filters: 'applicationId: z.string().optional(),', inc: '{ application: true }', search: ['subject'],
    roles: ['ADMISSIONS', 'ADMISSIONS', 'ADMISSIONS', 'SUPER_ADMIN'], soft: false,
  },
  {
    dir: 'references', model: 'applicationReference', entity: 'ApplicationReference', router: 'referencesRouter',
    fields: `applicationId: z.string().min(1), refereeName: z.string().min(1),
    refereeEmail: z.string().email(), refereePosition: z.string().optional(),
    referenceText: z.string().optional(), receivedDate: z.coerce.date().optional(),`,
    filters: 'applicationId: z.string().optional(),', inc: '{ application: true }', search: ['refereeName'],
    roles: ['ADMISSIONS', 'ADMISSIONS', 'ADMISSIONS', 'SUPER_ADMIN'], soft: false,
  },
  {
    dir: 'offers', model: 'offerCondition', entity: 'OfferCondition', router: 'offersRouter',
    fields: `applicationId: z.string().min(1),
    conditionType: z.enum(['ACADEMIC','ENGLISH_LANGUAGE','FINANCIAL','DOCUMENT','OTHER']),
    description: z.string().min(1), targetGrade: z.string().optional(),
    status: z.enum(['PENDING','MET','NOT_MET','WAIVED']).default('PENDING'),`,
    filters: 'applicationId: z.string().optional(), status: z.string().optional(),',
    inc: '{ application: true }', search: [],
    roles: ['ADMISSIONS', 'ADMISSIONS', 'ADMISSIONS', 'SUPER_ADMIN'], soft: false,
  },
  {
    dir: 'interviews', model: 'interview', entity: 'Interview', router: 'interviewsRouter',
    fields: `applicationId: z.string().min(1), interviewDate: z.coerce.date(),
    format: z.enum(['IN_PERSON','ONLINE','PHONE','GROUP']),
    outcome: z.string().optional(), notes: z.string().optional(),
    score: z.number().optional(),`,
    filters: 'applicationId: z.string().optional(),', inc: '{ application: { include: { applicant: { include: { person: true } } } } }',
    search: [], roles: ['ADMISSIONS', 'ADMISSIONS', 'ADMISSIONS', 'SUPER_ADMIN'], soft: false,
  },
  {
    dir: 'clearance-checks', model: 'clearanceCheck', entity: 'ClearanceCheck', router: 'clearanceChecksRouter',
    fields: `applicationId: z.string().min(1),
    checkType: z.enum(['DBS','OCCUPATIONAL_HEALTH','ATAS','FINANCIAL','RIGHT_TO_STUDY']),
    status: z.enum(['PENDING','IN_PROGRESS','CLEARED','FAILED','EXPIRED']).default('PENDING'),
    reference: z.string().optional(),`,
    filters: 'applicationId: z.string().optional(), status: z.string().optional(), checkType: z.string().optional(),',
    inc: '{ application: true }', search: [],
    roles: ['ADMISSIONS', 'ADMISSIONS', 'ADMISSIONS', 'SUPER_ADMIN'], soft: false,
  },
  {
    dir: 'admissions-events', model: 'admissionsEvent', entity: 'AdmissionsEvent', router: 'admissionsEventsRouter',
    fields: `title: z.string().min(1), eventType: z.string().min(1),
    date: z.coerce.date(), venue: z.string().optional(), capacity: z.number().int().optional(),`,
    filters: 'eventType: z.string().optional(),', inc: '{ attendees: true }', search: ['title'],
    roles: ['ADMISSIONS', 'ALL_AUTHENTICATED', 'ADMISSIONS', 'SUPER_ADMIN'], soft: false,
  },

  // ── ENROLMENT & REGISTRATION ──
  {
    dir: 'enrolments', model: 'enrolment', entity: 'Enrolment', router: 'enrolmentsRouter',
    fields: `studentId: z.string().min(1), programmeId: z.string().min(1),
    academicYear: z.string().regex(/^\\d{4}\\/\\d{2}$/),
    yearOfStudy: z.number().int().min(1).max(6),
    modeOfStudy: z.enum(['FULL_TIME','PART_TIME','SANDWICH','DISTANCE','BLOCK_RELEASE']),
    startDate: z.coerce.date(),
    feeStatus: z.enum(['HOME','OVERSEAS','EU_TRANSITIONAL','ISLANDS','CHANNEL_ISLANDS']),`,
    filters: `studentId: z.string().optional(), programmeId: z.string().optional(),
    academicYear: z.string().optional(), status: z.string().optional(),`,
    inc: '{ student: { include: { person: true } }, programme: true, moduleRegistrations: { where: { deletedAt: null }, include: { module: true } } }',
    search: [], roles: ['ADMIN_STAFF', 'ALL_AUTHENTICATED', 'REGISTRY', 'SUPER_ADMIN'], soft: true,
  },
  {
    dir: 'module-registrations', model: 'moduleRegistration', entity: 'ModuleRegistration', router: 'moduleRegistrationsRouter',
    fields: `enrolmentId: z.string().min(1), moduleId: z.string().min(1),
    academicYear: z.string().regex(/^\\d{4}\\/\\d{2}$/),
    registrationType: z.enum(['CORE','OPTIONAL','ELECTIVE']),`,
    filters: `enrolmentId: z.string().optional(), moduleId: z.string().optional(),
    academicYear: z.string().optional(), status: z.string().optional(),`,
    inc: '{ enrolment: { include: { student: { include: { person: true } } } }, module: true }',
    search: [], roles: ['ADMIN_STAFF', 'ALL_AUTHENTICATED', 'REGISTRY', 'SUPER_ADMIN'], soft: true,
  },
  {
    dir: 'programme-routes', model: 'studentProgrammeRoute', entity: 'StudentProgrammeRoute', router: 'programmeRoutesRouter',
    fields: `studentId: z.string().min(1), programmeId: z.string().min(1),
    routeCode: z.string().min(1), pathwayCode: z.string().optional(),
    cohort: z.string().optional(), entryDate: z.coerce.date(),
    qualificationAim: z.string().optional(),`,
    filters: 'studentId: z.string().optional(), programmeId: z.string().optional(),',
    inc: '{ student: { include: { person: true } }, programme: true }',
    search: [], roles: ['REGISTRY', 'ALL_AUTHENTICATED', 'REGISTRY', 'SUPER_ADMIN'], soft: false,
  },

  // ── ASSESSMENT & MARKS ──
  {
    dir: 'assessments', model: 'assessment', entity: 'Assessment', router: 'assessmentsRouter',
    fields: `moduleId: z.string().min(1),
    academicYear: z.string().regex(/^\\d{4}\\/\\d{2}$/),
    title: z.string().min(1), assessmentType: z.enum(['COURSEWORK','EXAM','PRACTICAL','PRESENTATION','PORTFOLIO','DISSERTATION','GROUP_WORK','VIVA','LAB_REPORT']),
    weighting: z.number().int().min(0).max(100), maxMark: z.number().min(0), passMark: z.number().min(0),
    dueDate: z.coerce.date().optional(),
    isAnonymous: z.boolean().default(false), allowLateSubmission: z.boolean().default(false),`,
    filters: `moduleId: z.string().optional(), academicYear: z.string().optional(), assessmentType: z.string().optional(),`,
    inc: '{ module: true, criteria: true, attempts: { take: 50 } }',
    search: ['title'], roles: ['TEACHING', 'ALL_AUTHENTICATED', 'TEACHING', 'SUPER_ADMIN'], soft: false,
  },
  {
    dir: 'marks', model: 'assessmentAttempt', entity: 'AssessmentAttempt', router: 'marksRouter',
    fields: `assessmentId: z.string().min(1), moduleRegistrationId: z.string().min(1),
    attemptNumber: z.number().int().min(1).default(1),
    rawMark: z.number().min(0).optional(), finalMark: z.number().min(0).optional(),
    grade: z.string().optional(), status: z.enum(['PENDING','SUBMITTED','MARKED','MODERATED','CONFIRMED','REFERRED','DEFERRED']).default('PENDING'),
    feedback: z.string().optional(),`,
    filters: `assessmentId: z.string().optional(), moduleRegistrationId: z.string().optional(), status: z.string().optional(),`,
    inc: '{ assessment: { include: { module: true } }, moduleRegistration: { include: { enrolment: { include: { student: { include: { person: true } } } } } } }',
    search: [], roles: ['TEACHING', 'TEACHING', 'TEACHING', 'SUPER_ADMIN'], soft: false,
  },
  {
    dir: 'submissions', model: 'submission', entity: 'Submission', router: 'submissionsRouter',
    fields: `assessmentId: z.string().min(1), moduleRegistrationId: z.string().min(1),
    submittedDate: z.coerce.date(), fileName: z.string().optional(),
    filePath: z.string().optional(), fileSize: z.number().int().optional(),
    isLate: z.boolean().default(false),`,
    filters: 'assessmentId: z.string().optional(), moduleRegistrationId: z.string().optional(),',
    inc: '{ assessment: true, moduleRegistration: true }',
    search: ['fileName'], roles: ['TEACHING', 'ALL_AUTHENTICATED', 'ALL_AUTHENTICATED', 'SUPER_ADMIN'], soft: false,
  },
  {
    dir: 'module-results', model: 'moduleResult', entity: 'ModuleResult', router: 'moduleResultsRouter',
    fields: `moduleRegistrationId: z.string().min(1), moduleId: z.string().min(1),
    academicYear: z.string().regex(/^\\d{4}\\/\\d{2}$/),
    aggregateMark: z.number().min(0).optional(), grade: z.string().optional(),
    status: z.enum(['PROVISIONAL','CONFIRMED','REFERRED','DEFERRED']).default('PROVISIONAL'),`,
    filters: `moduleId: z.string().optional(), academicYear: z.string().optional(), status: z.string().optional(),`,
    inc: '{ moduleRegistration: { include: { enrolment: { include: { student: { include: { person: true } } } } } }, module: true }',
    search: [], roles: ['TEACHING', 'ALL_AUTHENTICATED', 'TEACHING', 'SUPER_ADMIN'], soft: false,
  },
  {
    dir: 'exam-boards', model: 'examBoard', entity: 'ExamBoard', router: 'examBoardsRouter',
    fields: `title: z.string().min(1), programmeId: z.string().min(1),
    academicYear: z.string().regex(/^\\d{4}\\/\\d{2}$/),
    boardType: z.enum(['MODULE','PROGRESSION','AWARD']),
    scheduledDate: z.coerce.date().optional(),
    status: z.enum(['SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED']).default('SCHEDULED'),`,
    filters: `programmeId: z.string().optional(), academicYear: z.string().optional(), status: z.string().optional(),`,
    inc: '{ programme: true, decisions: { include: { student: { include: { person: true } } } }, members: { include: { staff: { include: { person: true } } } } }',
    search: ['title'], roles: ['EXAM_BOARD', 'EXAM_BOARD', 'EXAM_BOARD', 'SUPER_ADMIN'], soft: false,
  },

  // ── PROGRESSION & AWARDS ──
  {
    dir: 'progressions', model: 'progressionRecord', entity: 'ProgressionRecord', router: 'progressionsRouter',
    fields: `enrolmentId: z.string().min(1),
    academicYear: z.string().regex(/^\\d{4}\\/\\d{2}$/),
    yearOfStudy: z.number().int().min(1),
    totalCreditsAttempted: z.number().int(), totalCreditsPassed: z.number().int(),
    averageMark: z.number().optional(),
    progressionDecision: z.enum(['PROGRESS','REPEAT_YEAR','REPEAT_MODULES','WITHDRAW','TRANSFER','AWARD']),`,
    filters: 'enrolmentId: z.string().optional(), academicYear: z.string().optional(),',
    inc: '{ enrolment: { include: { student: { include: { person: true } }, programme: true } } }',
    search: [], roles: ['REGISTRY', 'ALL_AUTHENTICATED', 'REGISTRY', 'SUPER_ADMIN'], soft: false,
  },
  {
    dir: 'awards', model: 'awardRecord', entity: 'AwardRecord', router: 'awardsRouter',
    fields: `studentId: z.string().min(1), enrolmentId: z.string().min(1), programmeId: z.string().min(1),
    awardTitle: z.string().min(1), classification: z.string().optional(),
    totalCredits: z.number().int(), status: z.enum(['RECOMMENDED','APPROVED','CONFERRED','REVOKED']).default('RECOMMENDED'),`,
    filters: `studentId: z.string().optional(), programmeId: z.string().optional(), status: z.string().optional(),`,
    inc: '{ student: { include: { person: true } }, programme: true, enrolment: true, degreeCalculation: true }',
    search: [], roles: ['REGISTRY', 'ALL_AUTHENTICATED', 'REGISTRY', 'SUPER_ADMIN'], soft: false,
  },
  {
    dir: 'transcripts', model: 'transcript', entity: 'Transcript', router: 'transcriptsRouter',
    fields: `studentId: z.string().min(1),
    transcriptType: z.enum(['INTERIM','FINAL','REPLACEMENT']),
    generatedDate: z.coerce.date(),`,
    filters: 'studentId: z.string().optional(), transcriptType: z.string().optional(),',
    inc: '{ student: { include: { person: true } }, lines: true }',
    search: [], roles: ['REGISTRY', 'ALL_AUTHENTICATED', 'REGISTRY', 'SUPER_ADMIN'], soft: false,
  },

  // ── STUDENT FINANCE ──
  {
    dir: 'finance', model: 'studentAccount', entity: 'StudentAccount', router: 'financeRouter',
    fields: `studentId: z.string().min(1), academicYear: z.string().regex(/^\\d{4}\\/\\d{2}$/),`,
    filters: `studentId: z.string().optional(), academicYear: z.string().optional(), status: z.string().optional(),`,
    inc: '{ student: { include: { person: true } }, chargeLines: { orderBy: { createdAt: \'desc\' } }, invoices: { include: { payments: true } }, paymentPlans: true }',
    search: [], roles: ['FINANCE', 'FINANCE', 'FINANCE', 'SUPER_ADMIN'], soft: false,
  },

  // ── ATTENDANCE & ENGAGEMENT ──
  {
    dir: 'attendance', model: 'attendanceRecord', entity: 'AttendanceRecord', router: 'attendanceRouter',
    fields: `moduleRegistrationId: z.string().min(1), studentId: z.string().min(1),
    date: z.coerce.date(),
    status: z.enum(['PRESENT','ABSENT','LATE','EXCUSED','AUTHORISED_ABSENCE']).default('ABSENT'),
    method: z.enum(['REGISTER','CARD_SWIPE','BIOMETRIC','ONLINE','SELF_REPORTED']).optional(),`,
    filters: `studentId: z.string().optional(), moduleRegistrationId: z.string().optional(),
    status: z.string().optional(),`,
    inc: '{ student: { include: { person: true } }, moduleRegistration: { include: { module: true } } }',
    search: [], roles: ['TEACHING', 'ALL_AUTHENTICATED', 'TEACHING', 'SUPER_ADMIN'], soft: false,
  },

  // ── STUDENT SUPPORT ──
  {
    dir: 'support', model: 'supportTicket', entity: 'SupportTicket', router: 'supportRouter',
    fields: `studentId: z.string().min(1),
    category: z.enum(['ACADEMIC','FINANCIAL','WELLBEING','ACCOMMODATION','DISABILITY','COMPLAINTS','IT','OTHER']),
    subject: z.string().min(1), description: z.string().min(1),
    priority: z.enum(['LOW','NORMAL','HIGH','URGENT','CRITICAL']).default('NORMAL'),`,
    filters: `studentId: z.string().optional(), status: z.string().optional(),
    priority: z.string().optional(), category: z.string().optional(),`,
    inc: '{ student: { include: { person: true } }, interactions: { orderBy: { createdAt: \'asc\' } } }',
    search: ['subject'], roles: ['SUPPORT', 'SUPPORT', 'SUPPORT', 'SUPER_ADMIN'], soft: false,
  },

  // ── COMPLIANCE ──
  {
    dir: 'ukvi', model: 'uKVIRecord', entity: 'UKVIRecord', router: 'ukviRouter',
    fields: `studentId: z.string().min(1),
    tier4Status: z.enum(['SPONSORED','NOT_SPONSORED','PENDING','EXPIRED']),
    casNumber: z.string().optional(), visaType: z.string().optional(),
    complianceStatus: z.enum(['COMPLIANT','AT_RISK','NON_COMPLIANT','REPORTED']).default('COMPLIANT'),`,
    filters: `studentId: z.string().optional(), complianceStatus: z.string().optional(),`,
    inc: '{ student: { include: { person: true } }, contactPoints: true, reports: true }',
    search: ['casNumber'], roles: ['COMPLIANCE', 'COMPLIANCE', 'COMPLIANCE', 'SUPER_ADMIN'], soft: true,
  },

  // ── EXTENUATING CIRCUMSTANCES ──
  {
    dir: 'ec-claims', model: 'eCClaim', entity: 'ECClaim', router: 'ecClaimsRouter',
    fields: `studentId: z.string().min(1), moduleRegistrationId: z.string().optional(),
    reason: z.string().min(1), evidenceType: z.string().optional(),
    requestedOutcome: z.string().optional(), submittedDate: z.coerce.date(),`,
    filters: `studentId: z.string().optional(), status: z.string().optional(),`,
    inc: '{ student: { include: { person: true } }, moduleRegistration: { include: { module: true } } }',
    search: [], roles: ['REGISTRY', 'ALL_AUTHENTICATED', 'REGISTRY', 'SUPER_ADMIN'], soft: false,
  },
  {
    dir: 'appeals', model: 'appeal', entity: 'Appeal', router: 'appealsRouter',
    fields: `studentId: z.string().min(1),
    appealType: z.enum(['ASSESSMENT','PROGRESSION','AWARD','DISCIPLINARY','EC']),
    grounds: z.string().min(1), submittedDate: z.coerce.date(),`,
    filters: `studentId: z.string().optional(), appealType: z.string().optional(), status: z.string().optional(),`,
    inc: '{ student: { include: { person: true } } }',
    search: [], roles: ['REGISTRY', 'ALL_AUTHENTICATED', 'REGISTRY', 'SUPER_ADMIN'], soft: false,
  },

  // ── DOCUMENTS & COMMS ──
  {
    dir: 'documents', model: 'document', entity: 'Document', router: 'documentsRouter',
    fields: `studentId: z.string().optional(),
    documentType: z.enum(['TRANSCRIPT','CERTIFICATE','EVIDENCE','LETTER','PASSPORT','VISA','QUALIFICATION','PHOTO','OTHER']),
    title: z.string().min(1), filePath: z.string().min(1),
    mimeType: z.string().min(1), fileSize: z.number().int(),`,
    filters: `studentId: z.string().optional(), documentType: z.string().optional(),
    verificationStatus: z.string().optional(),`,
    inc: '{ student: { include: { person: true } }, verifications: true }',
    search: ['title'], roles: ['ADMIN_STAFF', 'ALL_AUTHENTICATED', 'ADMIN_STAFF', 'SUPER_ADMIN'], soft: false,
  },
  {
    dir: 'communications', model: 'communicationTemplate', entity: 'CommunicationTemplate', router: 'communicationsRouter',
    fields: `templateCode: z.string().min(1), title: z.string().min(1),
    category: z.string().min(1),
    channel: z.enum(['EMAIL','SMS','PORTAL','LETTER','PUSH']),
    subject: z.string().optional(), body: z.string().min(1),
    isActive: z.boolean().default(true),`,
    filters: `channel: z.string().optional(), category: z.string().optional(),`,
    inc: '', search: ['title', 'templateCode'],
    roles: ['ADMIN_STAFF', 'ADMIN_STAFF', 'ADMIN_STAFF', 'SUPER_ADMIN'], soft: false,
  },
];

// ─── Template Functions ─────────────────────────────────────────────────────

function genSchema(m: Mod): string {
  return `import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  ${m.filters}
});

export const createSchema = z.object({
  ${m.fields}
});

export const updateSchema = createSchema.partial();
`;
}

function genService(m: Mod): string {
  const searchClause = m.search.length > 0
    ? `...(search ? { OR: [${m.search.map(f => {
        if (f.includes('.')) {
          const [rel, field] = f.split('.');
          return `{ ${rel}: { ${field}: { contains: search, mode: 'insensitive' as const } } }`;
        }
        return `{ ${f}: { contains: search, mode: 'insensitive' as const } }`;
      }).join(', ')}] } : {}),`
    : '';

  const filterLines = m.filters.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('//'))
    .map(l => {
      const match = l.match(/^(\w+):/);
      if (!match) return '';
      const key = match[1];
      return `...(filters.${key} ? { ${key}: filters.${key} as any } : {}),`;
    })
    .filter(Boolean)
    .join('\n      ');

  return `import prisma from '../../utils/prisma';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';
import { buildPaginatedResponse } from '../../utils/pagination';
import type { Request } from 'express';

export async function list(query: Record<string, any>) {
  const { page, limit, sort, order, search, ...filters } = query;
  const skip = (page - 1) * limit;
  const where: Record<string, any> = {
    ${m.soft ? 'deletedAt: null,' : ''}
    ${searchClause}
    ${filterLines}
  };
  const [data, total] = await Promise.all([
    prisma.${m.model}.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any${m.inc ? '' : ''} }),
    prisma.${m.model}.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

export async function getById(id: string) {
  const result = await prisma.${m.model}.findUnique({ where: { id }${m.inc ? `, include: ${m.inc}` : ''} });
  if (!result) throw new NotFoundError('${m.entity}', id);
  return result;
}

export async function create(data: any, userId: string, req: Request) {
  const result = await prisma.${m.model}.create({ data });
  await logAudit('${m.entity}', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('${m.dir.replace(/-/g, '_')}.created', { id: result.id });
  return result;
}

export async function update(id: string, data: any, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await prisma.${m.model}.update({ where: { id }, data });
  await logAudit('${m.entity}', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('${m.dir.replace(/-/g, '_')}.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  ${m.soft
    ? `await prisma.${m.model}.update({ where: { id }, data: { deletedAt: new Date() } });`
    : `await prisma.${m.model}.delete({ where: { id } });`}
  await logAudit('${m.entity}', id, 'DELETE', userId, previous, null, req);
  await emitEvent('${m.dir.replace(/-/g, '_')}.deleted', { id });
}
`;
}

function genController(_m: Mod): string {
  const n = _m.dir;
  return `import type { Request, Response, NextFunction } from 'express';
import * as service from './${n}.service';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.list(req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const data = await service.getById(id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.create(req.body, req.user?.sub ?? 'system', req);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const data = await service.update(id, req.body, req.user?.sub ?? 'system', req);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    await service.remove(id, req.user?.sub ?? 'system', req);
    res.status(204).send();
  } catch (err) { next(err); }
}
`;
}

function genRouter(m: Mod): string {
  const n = m.dir;
  return `import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './${n}.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './${n}.schema';

export const ${m.router} = Router();

${m.router}.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.${m.roles[0]}), ctrl.list);
${m.router}.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.${m.roles[1]}), ctrl.getById);
${m.router}.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.${m.roles[2]}), ctrl.create);
${m.router}.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.${m.roles[2]}), ctrl.update);
${m.router}.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.${m.roles[3]}), ctrl.remove);
`;
}

// ─── Generate API index (route registration) ───────────────────────────────

function genApiIndex(): string {
  const imports = MODS.map(m =>
    `import { ${m.router} } from './${m.dir}/${m.dir}.router';`
  ).join('\n');

  const mounts = MODS.map(m =>
    `apiV1Router.use('/${m.dir}', ${m.router});`
  ).join('\n');

  return `import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth';

${imports}

export const apiV1Router = Router();
apiV1Router.use(authenticateJWT);

${mounts}
`;
}

// ─── Main ───────────────────────────────────────────────────────────────────

let totalFiles = 0;

for (const m of MODS) {
  const dir = path.join(API_DIR, m.dir);
  fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(path.join(dir, `${m.dir}.schema.ts`), genSchema(m));
  fs.writeFileSync(path.join(dir, `${m.dir}.service.ts`), genService(m));
  fs.writeFileSync(path.join(dir, `${m.dir}.controller.ts`), genController(m));
  fs.writeFileSync(path.join(dir, `${m.dir}.router.ts`), genRouter(m));
  totalFiles += 4;
}

// API index
fs.writeFileSync(path.join(API_DIR, 'index.ts'), genApiIndex());
totalFiles += 1;

console.log(`✅ Generated ${MODS.length} API modules (${totalFiles} files) in server/src/api/`);
console.log(`   Modules: ${MODS.map(m => m.dir).join(', ')}`);
