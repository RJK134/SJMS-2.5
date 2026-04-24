import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse } from '../utils/pagination';
import { type Prisma, type EnrolmentStatus } from '@prisma/client';

export interface EnrolmentFilters {
  studentId?: string;
  programmeId?: string;
  academicYear?: string;
  status?: string;
}

const defaultInclude = {
  student: { include: { person: true } },
  programme: true,
} as const;

export async function list(filters: EnrolmentFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.EnrolmentWhereInput = {
    deletedAt: null,
    ...(filters.studentId && { studentId: filters.studentId }),
    ...(filters.programmeId && { programmeId: filters.programmeId }),
    ...(filters.academicYear && { academicYear: filters.academicYear }),
    ...(filters.status && { status: filters.status as any }),
  };

  const [data, total] = await Promise.all([
    prisma.enrolment.findMany({
      where,
      include: defaultInclude,
      
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.enrolment.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getById(id: string) {
  return prisma.enrolment.findUnique({
    where: { id },
    include: {
      ...defaultInclude,
      moduleRegistrations: { include: { module: true }, where: { deletedAt: null } },
      statusHistory: { orderBy: { changeDate: 'desc' } },
      progressionRecords: true,
    },
  });
}

// Idempotency helper for the applicant-to-student converter (Phase 16C).
// An enrolment is uniquely identified by the tuple {student, programme,
// academic year}: the same person cannot be enrolled on the same
// programme twice in the same year. Returns the non-deleted match, or
// null when no record exists.
export async function findOneByStudentProgrammeYear(
  studentId: string,
  programmeId: string,
  academicYear: string,
) {
  return prisma.enrolment.findFirst({
    where: { studentId, programmeId, academicYear, deletedAt: null },
  });
}

export async function create(data: Prisma.EnrolmentUncheckedCreateInput) {
  return prisma.$transaction(async (tx) => {
    const enrolment = await tx.enrolment.create({ data, include: defaultInclude });
    await tx.enrolmentStatusHistory.create({
      data: {
        enrolmentId: enrolment.id,
        previousStatus: 'ENROLLED',
        newStatus: enrolment.status,
        changeDate: new Date(),
        reason: 'Initial enrolment',
        changedBy: data.createdBy ?? 'system',
      },
    });
    return enrolment;
  });
}

export async function update(id: string, data: Prisma.EnrolmentUpdateInput) {
  return prisma.enrolment.update({ where: { id }, data, include: defaultInclude });
}

export async function softDelete(id: string) {
  return prisma.enrolment.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function changeStatus(id: string, newStatus: EnrolmentStatus, reason: string, changedBy: string) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.enrolment.findUniqueOrThrow({ where: { id } });
    const updated = await tx.enrolment.update({
      where: { id },
      data: { status: newStatus },
      include: defaultInclude,
    });
    await tx.enrolmentStatusHistory.create({
      data: {
        enrolmentId: id,
        previousStatus: current.status,
        newStatus,
        changeDate: new Date(),
        reason,
        changedBy,
      },
    });
    return updated;
  });
}

export async function getModuleRegistrations(enrolmentId: string) {
  return prisma.moduleRegistration.findMany({
    where: { enrolmentId, deletedAt: null },
    include: { module: true, results: true },
    orderBy: { module: { moduleCode: 'asc' } },
  });
}
