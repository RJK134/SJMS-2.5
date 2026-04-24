import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse } from '../utils/pagination';

export interface ModuleRegistrationFilters {
  enrolmentId?: string;
  moduleId?: string;
  academicYear?: string;
  status?: string;
  // studentId is the student-portal scope filter — set by
  // scopeToUser('studentId') middleware. ModuleRegistration has no
  // direct studentId column; the link is
  // ModuleRegistration → Enrolment.studentId, so the filter becomes a
  // nested `enrolment: { studentId }` constraint. Parallels the
  // Application → Applicant.personId pattern in admissions.repository.
  studentId?: string;
}

export async function list(filters: ModuleRegistrationFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.ModuleRegistrationWhereInput = {
    deletedAt: null,
    ...(filters.enrolmentId && { enrolmentId: filters.enrolmentId }),
    ...(filters.moduleId && { moduleId: filters.moduleId }),
    ...(filters.academicYear && { academicYear: filters.academicYear }),
    ...(filters.status && { status: filters.status as any }),
    ...(filters.studentId && { enrolment: { studentId: filters.studentId } }),
  };

  const [data, total] = await Promise.all([
    prisma.moduleRegistration.findMany({
      where,
      
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: { [pagination.sort]: pagination.order } as any,
      // Include the module so list consumers (the student MyModules
      // page, the student dashboard) can render moduleCode / title
      // without a separate fetch. Without this, those pages showed
      // blank rows — the list route previously returned only the raw
      // ModuleRegistration columns.
      include: {
        module: { select: { id: true, moduleCode: true, title: true, credits: true, level: true } },
        enrolment: { select: { id: true, studentId: true, academicYear: true } },
      },
    }),
    prisma.moduleRegistration.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getById(id: string) {
  return prisma.moduleRegistration.findFirst({
    where: { id, deletedAt: null },
    include: {
      enrolment: { include: { student: { include: { person: true } } } },
      module: true,
    },
  });
}

export async function findMandatoryPrerequisites(moduleId: string) {
  return prisma.modulePrerequisite.findMany({
    where: { moduleId, isMandatory: true },
    include: { prerequisiteModule: { select: { id: true, title: true, moduleCode: true } } },
  });
}

export async function getEnrolmentForRuleChecks(enrolmentId: string) {
  return prisma.enrolment.findUnique({
    where: { id: enrolmentId },
    select: {
      studentId: true,
      modeOfStudy: true,
      programme: { select: { level: true } },
    },
  });
}

export async function findPassedPrerequisiteResults(
  studentId: string,
  prerequisiteModuleIds: string[],
  passMark: number,
  passingGrades: string[],
) {
  return prisma.moduleResult.findMany({
    where: {
      moduleRegistration: { enrolment: { studentId } },
      moduleId: { in: prerequisiteModuleIds },
      status: { in: ['CONFIRMED', 'PROVISIONAL'] },
      OR: [
        { aggregateMark: { gte: passMark } },
        {
          aggregateMark: null,
          grade: { in: passingGrades },
        },
      ],
    },
    select: { moduleId: true },
  });
}

export async function getModuleCredits(moduleId: string) {
  return prisma.module.findUnique({
    where: { id: moduleId },
    select: { credits: true },
  });
}

export async function findActiveCreditRegistrations(enrolmentId: string, academicYear: string) {
  return prisma.moduleRegistration.findMany({
    where: {
      enrolmentId,
      academicYear,
      status: { in: ['REGISTERED', 'COMPLETED'] },
      deletedAt: null,
    },
    select: { moduleId: true },
  });
}

export async function findModuleCredits(moduleIds: string[]) {
  return prisma.module.findMany({
    where: { id: { in: moduleIds } },
    select: { id: true, credits: true },
  });
}

export async function create(data: Prisma.ModuleRegistrationUncheckedCreateInput) {
  return prisma.moduleRegistration.create({ data });
}

export async function update(id: string, data: Prisma.ModuleRegistrationUpdateInput) {
  return prisma.moduleRegistration.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.moduleRegistration.update({ where: { id }, data: { deletedAt: new Date() } });
}

/**
 * Find every active (`status: REGISTERED`, non-deleted) module registration
 * for an enrolment. Returns the minimum projection needed by the enrolment
 * status cascade — id and moduleId — so the caller can iterate without
 * over-fetching. Used by `enrolments.service.update()` to cascade an
 * enrolment status flip onto its child registrations through the
 * repository layer rather than a service-level direct Prisma call.
 *
 * Closes KI-P12-001.
 */
export async function findActiveByEnrolment(enrolmentId: string) {
  return prisma.moduleRegistration.findMany({
    where: { enrolmentId, status: 'REGISTERED', deletedAt: null },
    select: { id: true, moduleId: true },
  });
}

/**
 * Cascade-write helper for the enrolment status cascade. Patches a single
 * module-registration row with a new status and the userId driving the
 * change. Distinct from the generic `update()` because the cascade has a
 * narrower contract — only `status` plus `updatedBy` are written, and the
 * caller is the enrolment status cascade rather than a routine
 * registration mutation. Localising the write here keeps the repository
 * the single source of truth for `prisma.moduleRegistration.*`.
 *
 * Closes KI-P12-001.
 */
export async function cascadeStatusForEnrolment(
  registrationId: string,
  newStatus: 'WITHDRAWN' | 'DEFERRED',
  userId: string,
) {
  return prisma.moduleRegistration.update({
    where: { id: registrationId },
    data: { status: newStatus, updatedBy: userId },
  });
}
