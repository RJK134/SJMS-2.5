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

export async function create(data: Prisma.ModuleRegistrationUncheckedCreateInput) {
  return prisma.moduleRegistration.create({ data });
}

export async function update(id: string, data: Prisma.ModuleRegistrationUpdateInput) {
  return prisma.moduleRegistration.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.moduleRegistration.update({ where: { id }, data: { deletedAt: new Date() } });
}
