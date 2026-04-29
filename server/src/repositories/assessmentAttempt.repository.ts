import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse, safeOrderBy } from '../utils/pagination';
import { ASSESSMENT_ATTEMPT_SORT } from '../utils/repository-sort-allow-lists';

export interface AssessmentAttemptFilters {
  studentId?: string;
  assessmentId?: string;
  moduleRegistrationId?: string;
  attemptNumber?: number;
  status?: string;
}

export async function list(filters: AssessmentAttemptFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.AssessmentAttemptWhereInput = {
    deletedAt: null,
    ...(filters.studentId && { moduleRegistration: { enrolment: { studentId: filters.studentId } } }),
    ...(filters.assessmentId && { assessmentId: filters.assessmentId }),
    ...(filters.moduleRegistrationId && { moduleRegistrationId: filters.moduleRegistrationId }),
    ...(filters.attemptNumber !== undefined && { attemptNumber: filters.attemptNumber }),
    ...(filters.status && { status: filters.status as any }),
  };

  const [data, total] = await Promise.all([
    prisma.assessmentAttempt.findMany({
      where,
      include: {
        assessment: { include: { module: true } },
        moduleRegistration: {
          include: { enrolment: { include: { student: { include: { person: true } } } } },
        },
      },
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: safeOrderBy(pagination, ASSESSMENT_ATTEMPT_SORT),
    }),
    prisma.assessmentAttempt.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getById(id: string) {
  return prisma.assessmentAttempt.findFirst({
    where: { id, deletedAt: null },
    include: {
      assessment: { include: { module: true } },
      moduleRegistration: {
        include: { enrolment: { include: { student: { include: { person: true } } } } },
      },
    },
  });
}

export async function create(data: Prisma.AssessmentAttemptUncheckedCreateInput) {
  return prisma.assessmentAttempt.create({ data });
}

export async function update(id: string, data: Prisma.AssessmentAttemptUpdateInput) {
  return prisma.assessmentAttempt.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.assessmentAttempt.update({ where: { id }, data: { deletedAt: new Date() } });
}

/**
 * Phase 17B — cross-entity guard helper.
 *
 * Returns the number of non-deleted AssessmentAttempt rows for the given
 * moduleRegistrationId whose status is anything other than CONFIRMED.
 * The ModuleResult cascade uses this to refuse PROVISIONAL → CONFIRMED
 * transitions while attempts remain open.
 *
 * Returning a count (not a list) keeps the helper cheap on hot paths and
 * avoids dragging the include tree through unnecessary joins.
 */
export async function countNonConfirmedByModuleRegistration(
  moduleRegistrationId: string,
): Promise<number> {
  return prisma.assessmentAttempt.count({
    where: {
      moduleRegistrationId,
      deletedAt: null,
      status: { not: 'CONFIRMED' as Prisma.AssessmentAttemptWhereInput['status'] },
    },
  });
}
