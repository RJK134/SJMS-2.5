import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse, safeOrderBy } from '../utils/pagination';

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
      orderBy: safeOrderBy(pagination, ['id', 'createdAt', 'updatedAt', 'triggerDate', 'startDate', 'dayOfWeek', 'timestamp', 'settingKey', 'postedDate', 'dueDate', 'contactDate'] as const),
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
