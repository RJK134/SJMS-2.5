// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  SJMS 2.5 — OpenAPI 3.0 Specification Generator                        ║
// ║  Auto-registers all 37 API modules from their Zod schemas               ║
// ╚══════════════════════════════════════════════════════════════════════════╝

import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

// ─── Shared Components ──────────────────────────────────────────────────────

const BearerAuth = registry.registerComponent('securitySchemes', 'BearerJWT', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'Keycloak-issued JWT token from the FHE realm',
});

const paginationParams = [
  { name: 'page', in: 'query' as const, schema: { type: 'integer' as const, default: 1, minimum: 1 } },
  { name: 'limit', in: 'query' as const, schema: { type: 'integer' as const, default: 25, minimum: 1, maximum: 100 } },
  { name: 'sort', in: 'query' as const, schema: { type: 'string' as const, default: 'createdAt' } },
  { name: 'order', in: 'query' as const, schema: { type: 'string' as const, enum: ['asc', 'desc'], default: 'desc' } },
  { name: 'search', in: 'query' as const, schema: { type: 'string' as const }, required: false },
];

const errorResponse = (description: string) => ({
  description,
  content: {
    'application/json': {
      schema: {
        type: 'object' as const,
        properties: {
          status: { type: 'string' as const, example: 'error' },
          code: { type: 'string' as const },
          message: { type: 'string' as const },
        },
      },
    },
  },
});

// ─── Module Definitions ─────────────────────────────────────────────────────

interface ApiModule {
  path: string;
  tag: string;
  description: string;
  createSchema: z.ZodObject<any>;
  hasDelete: boolean;
}

// Import all schemas dynamically
import { createSchema as studentsCreate } from '../api/students/students.schema';
import { createSchema as personsCreate } from '../api/persons/persons.schema';
import { createSchema as demographicsCreate } from '../api/demographics/demographics.schema';
import { createSchema as identifiersCreate } from '../api/identifiers/identifiers.schema';
import { createSchema as facultiesCreate } from '../api/faculties/faculties.schema';
import { createSchema as schoolsCreate } from '../api/schools/schools.schema';
import { createSchema as departmentsCreate } from '../api/departments/departments.schema';
import { createSchema as programmesCreate } from '../api/programmes/programmes.schema';
import { createSchema as modulesCreate } from '../api/modules/modules.schema';
import { createSchema as programmeModulesCreate } from '../api/programme-modules/programme-modules.schema';
import { createSchema as programmeApprovalsCreate } from '../api/programme-approvals/programme-approvals.schema';
import { createSchema as applicationsCreate } from '../api/applications/applications.schema';
import { createSchema as qualificationsCreate } from '../api/qualifications/qualifications.schema';
import { createSchema as referencesCreate } from '../api/references/references.schema';
import { createSchema as offersCreate } from '../api/offers/offers.schema';
import { createSchema as interviewsCreate } from '../api/interviews/interviews.schema';
import { createSchema as clearanceChecksCreate } from '../api/clearance-checks/clearance-checks.schema';
import { createSchema as admissionsEventsCreate } from '../api/admissions-events/admissions-events.schema';
import { createSchema as enrolmentsCreate } from '../api/enrolments/enrolments.schema';
import { createSchema as moduleRegistrationsCreate } from '../api/module-registrations/module-registrations.schema';
import { createSchema as programmeRoutesCreate } from '../api/programme-routes/programme-routes.schema';
import { createSchema as assessmentsCreate } from '../api/assessments/assessments.schema';
import { createSchema as marksCreate } from '../api/marks/marks.schema';
import { createSchema as submissionsCreate } from '../api/submissions/submissions.schema';
import { createSchema as moduleResultsCreate } from '../api/module-results/module-results.schema';
import { createSchema as examBoardsCreate } from '../api/exam-boards/exam-boards.schema';
import { createSchema as progressionsCreate } from '../api/progressions/progressions.schema';
import { createSchema as awardsCreate } from '../api/awards/awards.schema';
import { createSchema as transcriptsCreate } from '../api/transcripts/transcripts.schema';
import { createSchema as financeCreate } from '../api/finance/finance.schema';
import { createSchema as attendanceCreate } from '../api/attendance/attendance.schema';
import { createSchema as supportCreate } from '../api/support/support.schema';
import { createSchema as ukviCreate } from '../api/ukvi/ukvi.schema';
import { createSchema as ecClaimsCreate } from '../api/ec-claims/ec-claims.schema';
import { createSchema as appealsCreate } from '../api/appeals/appeals.schema';
import { createSchema as documentsCreate } from '../api/documents/documents.schema';
import { createSchema as communicationsCreate } from '../api/communications/communications.schema';

const modules: ApiModule[] = [
  { path: '/students', tag: 'Students', description: 'Student records management', createSchema: studentsCreate, hasDelete: true },
  { path: '/persons', tag: 'Persons', description: 'Person identity management', createSchema: personsCreate, hasDelete: true },
  { path: '/demographics', tag: 'Demographics', description: 'GDPR-protected demographic data', createSchema: demographicsCreate, hasDelete: true },
  { path: '/identifiers', tag: 'Identifiers', description: 'HUSID, ULN, UCAS ID, passport numbers', createSchema: identifiersCreate, hasDelete: true },
  { path: '/faculties', tag: 'Faculties', description: 'Faculty management', createSchema: facultiesCreate, hasDelete: true },
  { path: '/schools', tag: 'Schools', description: 'School management (by faculty)', createSchema: schoolsCreate, hasDelete: true },
  { path: '/departments', tag: 'Departments', description: 'Department management (by school)', createSchema: departmentsCreate, hasDelete: true },
  { path: '/programmes', tag: 'Programmes', description: 'Programme CRUD with specifications and approvals', createSchema: programmesCreate, hasDelete: true },
  { path: '/modules', tag: 'Modules', description: 'Module CRUD with specifications', createSchema: modulesCreate, hasDelete: true },
  { path: '/programme-modules', tag: 'Programme Modules', description: 'Programme-module links (core/optional/elective)', createSchema: programmeModulesCreate, hasDelete: true },
  { path: '/programme-approvals', tag: 'Programme Approvals', description: 'Approval workflow', createSchema: programmeApprovalsCreate, hasDelete: true },
  { path: '/applications', tag: 'Applications', description: 'Admissions application lifecycle', createSchema: applicationsCreate, hasDelete: true },
  { path: '/qualifications', tag: 'Qualifications', description: 'Applicant qualifications', createSchema: qualificationsCreate, hasDelete: true },
  { path: '/references', tag: 'References', description: 'Applicant references', createSchema: referencesCreate, hasDelete: true },
  { path: '/offers', tag: 'Offers', description: 'Offer conditions management', createSchema: offersCreate, hasDelete: true },
  { path: '/interviews', tag: 'Interviews', description: 'Interview scheduling and outcomes', createSchema: interviewsCreate, hasDelete: true },
  { path: '/clearance-checks', tag: 'Clearance Checks', description: 'DBS, occupational health, ATAS checks', createSchema: clearanceChecksCreate, hasDelete: true },
  { path: '/admissions-events', tag: 'Admissions Events', description: 'Open days, visit days, events', createSchema: admissionsEventsCreate, hasDelete: true },
  { path: '/enrolments', tag: 'Enrolments', description: 'Enrolment lifecycle with audit trail', createSchema: enrolmentsCreate, hasDelete: true },
  { path: '/module-registrations', tag: 'Module Registrations', description: 'Module registration and withdrawal', createSchema: moduleRegistrationsCreate, hasDelete: true },
  { path: '/programme-routes', tag: 'Programme Routes', description: 'Student programme routes (SPR)', createSchema: programmeRoutesCreate, hasDelete: true },
  { path: '/assessments', tag: 'Assessments', description: 'Assessment setup and configuration', createSchema: assessmentsCreate, hasDelete: true },
  { path: '/marks', tag: 'Marks', description: 'Mark entry, moderation, confirmation', createSchema: marksCreate, hasDelete: true },
  { path: '/submissions', tag: 'Submissions', description: 'Submission upload and management', createSchema: submissionsCreate, hasDelete: true },
  { path: '/module-results', tag: 'Module Results', description: 'Aggregated module results', createSchema: moduleResultsCreate, hasDelete: true },
  { path: '/exam-boards', tag: 'Exam Boards', description: 'Exam board management and decisions', createSchema: examBoardsCreate, hasDelete: true },
  { path: '/progressions', tag: 'Progressions', description: 'Progression decisions', createSchema: progressionsCreate, hasDelete: true },
  { path: '/awards', tag: 'Awards', description: 'Award records and classifications', createSchema: awardsCreate, hasDelete: true },
  { path: '/transcripts', tag: 'Transcripts', description: 'Transcript generation', createSchema: transcriptsCreate, hasDelete: true },
  { path: '/finance', tag: 'Finance', description: 'Student accounts, charges, invoices, payments', createSchema: financeCreate, hasDelete: true },
  { path: '/attendance', tag: 'Attendance', description: 'Attendance records and engagement', createSchema: attendanceCreate, hasDelete: true },
  { path: '/support', tag: 'Support', description: 'Support tickets and interactions', createSchema: supportCreate, hasDelete: true },
  { path: '/ukvi', tag: 'UKVI', description: 'UKVI compliance records', createSchema: ukviCreate, hasDelete: true },
  { path: '/ec-claims', tag: 'EC Claims', description: 'Extenuating circumstances claims', createSchema: ecClaimsCreate, hasDelete: true },
  { path: '/appeals', tag: 'Appeals', description: 'Academic appeals and misconduct', createSchema: appealsCreate, hasDelete: true },
  { path: '/documents', tag: 'Documents', description: 'Document upload and verification', createSchema: documentsCreate, hasDelete: true },
  { path: '/communications', tag: 'Communications', description: 'Templates, logs, bulk messaging', createSchema: communicationsCreate, hasDelete: true },
];

// ─── Register All Paths ─────────────────────────────────────────────────────

for (const mod of modules) {
  const fullPath = `/api/v1${mod.path}`;
  const itemPath = `${fullPath}/{id}`;

  // GET list
  registry.registerPath({
    method: 'get',
    path: fullPath,
    tags: [mod.tag],
    summary: `List ${mod.tag.toLowerCase()}`,
    description: mod.description,
    security: [{ [BearerAuth.name]: [] }],
    parameters: paginationParams,
    responses: {
      200: { description: 'Paginated list' },
      401: errorResponse('Unauthorised'),
      403: errorResponse('Forbidden'),
    },
  });

  // GET by ID
  registry.registerPath({
    method: 'get',
    path: itemPath,
    tags: [mod.tag],
    summary: `Get ${mod.tag.toLowerCase()} by ID`,
    security: [{ [BearerAuth.name]: [] }],
    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
    responses: {
      200: { description: 'Record found' },
      401: errorResponse('Unauthorised'),
      404: errorResponse('Not found'),
    },
  });

  // POST create
  registry.registerPath({
    method: 'post',
    path: fullPath,
    tags: [mod.tag],
    summary: `Create ${mod.tag.toLowerCase()}`,
    security: [{ [BearerAuth.name]: [] }],
    request: { body: { content: { 'application/json': { schema: mod.createSchema } } } },
    responses: {
      201: { description: 'Created' },
      400: errorResponse('Validation error'),
      401: errorResponse('Unauthorised'),
      403: errorResponse('Forbidden'),
    },
  });

  // PATCH update
  registry.registerPath({
    method: 'patch',
    path: itemPath,
    tags: [mod.tag],
    summary: `Update ${mod.tag.toLowerCase()}`,
    security: [{ [BearerAuth.name]: [] }],
    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
    request: { body: { content: { 'application/json': { schema: mod.createSchema.partial() } } } },
    responses: {
      200: { description: 'Updated' },
      400: errorResponse('Validation error'),
      401: errorResponse('Unauthorised'),
      404: errorResponse('Not found'),
    },
  });

  // DELETE
  if (mod.hasDelete) {
    registry.registerPath({
      method: 'delete',
      path: itemPath,
      tags: [mod.tag],
      summary: `Delete ${mod.tag.toLowerCase()}`,
      security: [{ [BearerAuth.name]: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        204: { description: 'Deleted' },
        401: errorResponse('Unauthorised'),
        403: errorResponse('Forbidden'),
        404: errorResponse('Not found'),
      },
    });
  }
}

// ─── Generate Spec ──────────────────────────────────────────────────────────

const generator = new OpenApiGeneratorV3(registry.definitions);

export const openApiSpec = generator.generateDocument({
  openapi: '3.0.3',
  info: {
    title: 'SJMS 2.5 API',
    version: '2.5.0',
    description: 'Student Journey Management System — Future Horizons Education. 37 domain modules covering the full student lifecycle from application through graduation.',
    contact: { name: 'Future Horizons Education', email: 'it@futurehorizons.ac.uk' },
  },
  servers: [
    { url: 'http://localhost:3001', description: 'Development' },
  ],
  tags: modules.map(m => ({ name: m.tag, description: m.description })),
});
