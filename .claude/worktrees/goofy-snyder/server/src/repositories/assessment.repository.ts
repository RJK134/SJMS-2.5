import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';
import { type Prisma } from '@prisma/client';

interface AssessmentFilters {
  moduleId?: string;
  academicYear?: string;
  assessmentType?: string;
}

export async function list(filters: AssessmentFilters = {}, pagination: PaginationParams) {
  const where: Prisma.AssessmentWhereInput = {
    ...(filters.moduleId && { moduleId: filters.moduleId }),
    ...(filters.academicYear && { academicYear: filters.academicYear }),
    ...(filters.assessmentType && { assessmentType: filters.assessmentType as any }),
  };

  const [data, total] = await Promise.all([
    prisma.assessment.findMany({
      where,
      include: { module: true },
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.assessment.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
}

export async function getById(id: string) {
  return prisma.assessment.findUnique({
    where: { id },
    include: {
      module: true,
      attempts: { orderBy: { attemptNumber: 'asc' } },
      criteria: { orderBy: { sortOrder: 'asc' } },
      markingSchemes: true,
      gradeBoundaries: { orderBy: { lowerBound: 'asc' } },
    },
  });
}

export async function create(data: Prisma.AssessmentUncheckedCreateInput) {
  return prisma.assessment.create({ data, include: { module: true } });
}

export async function update(id: string, data: Prisma.AssessmentUpdateInput) {
  return prisma.assessment.update({ where: { id }, data, include: { module: true } });
}

export async function submitMark(data: Prisma.AssessmentAttemptUncheckedCreateInput) {
  return prisma.assessmentAttempt.create({
    data,
    include: { assessment: true, moduleRegistration: { include: { module: true } } },
  });
}

export async function updateAttempt(id: string, data: Prisma.AssessmentAttemptUpdateInput) {
  return prisma.assessmentAttempt.update({ where: { id }, data });
}

export async function getResultsByBoard(examBoardId: string) {
  return prisma.examBoardDecision.findMany({
    where: { examBoardId },
    include: {
      student: { include: { person: true } },
      examBoard: true,
    },
    orderBy: { student: { person: { lastName: 'asc' } } },
  });
}

export async function getModuleResults(moduleId: string, academicYear: string) {
  return prisma.moduleResult.findMany({
    where: { moduleId, academicYear },
    include: { moduleRegistration: { include: { enrolment: { include: { student: { include: { person: true } } } } } } },
    orderBy: { aggregateMark: 'desc' },
  });
}
