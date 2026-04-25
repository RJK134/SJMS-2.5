import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse, safeOrderBy } from '../utils/pagination';
import { type Prisma } from '@prisma/client';

const detailInclude = {
  person: {
    include: {
      contacts: true,
      addresses: true,
      identifiers: true,
      demographic: true,
    },
  },
} as const;

const listInclude: Prisma.StudentInclude = {
  person: {
    include: {
      names: { where: { endDate: null }, orderBy: { startDate: 'desc' } },
    },
  },
  enrolments: {
    // Show the most-recent non-deleted enrolment regardless of status —
    // this ensures the Programme column is populated for alumni
    // (COMPLETED) as well as currently-enrolled students. Bulk-seeded
    // rows share a createdAt, so academicYear is the reliable ordering.
    where: { deletedAt: null },
    take: 1,
    orderBy: [{ academicYear: 'desc' }, { createdAt: 'desc' }],
    include: { programme: { select: { title: true, programmeCode: true } } },
  },
};

export interface StudentFilters {
  moduleId?: string;
  feeStatus?: string;
  entryRoute?: string;
  search?: string;
}

export async function list(filters: StudentFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.StudentWhereInput = {
    deletedAt: null,
    ...(filters.moduleId && { enrolments: { some: { moduleRegistrations: { some: { moduleId: filters.moduleId, deletedAt: null } }, deletedAt: null } } }),
    ...(filters.feeStatus && { feeStatus: filters.feeStatus as any }),
    ...(filters.entryRoute && { entryRoute: filters.entryRoute as any }),
    ...(filters.search && {
      OR: [
        { studentNumber: { contains: filters.search, mode: 'insensitive' as const } },
        { person: { firstName: { contains: filters.search, mode: 'insensitive' as const } } },
        { person: { lastName: { contains: filters.search, mode: 'insensitive' as const } } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: listInclude,
      
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: safeOrderBy(pagination, ['id', 'createdAt', 'updatedAt', 'triggerDate', 'startDate', 'dayOfWeek', 'timestamp', 'settingKey', 'postedDate', 'dueDate', 'contactDate'] as const),
    }),
    prisma.student.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getById(id: string) {
  return prisma.student.findFirst({
    where: { id, deletedAt: null },
    include: {
      ...detailInclude,
      enrolments: {
        where: { deletedAt: null },
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function getByStudentNumber(studentNumber: string) {
  return prisma.student.findUnique({ where: { studentNumber }, include: detailInclude });
}

// Idempotency helper for the applicant-to-student converter (Phase 16C).
// The personId column is the real identity key for a human record — a
// student is created exactly once per person, regardless of how many
// applications that person submits over time. Returns the non-deleted
// Student with the full detailInclude shape (person + addresses/
// contacts/identifiers/demographic), consistent with
// `getByStudentNumber`. The conversion service only reads `id` and
// `studentNumber` off the result, so either projection is safe at the
// call site; the rich include is kept because future callers
// (detail/profile views) will likely want the relation.
//
// Note: PR #109 landed a duplicate unincluded version of this helper
// at the same time PR #107 landed this one. The duplicate has been
// removed in `chore/tooling-tsc-baseline` — TS2323/TS2393 on main
// would otherwise keep the server quality gate red.
export async function create(data: Prisma.StudentUncheckedCreateInput) {
  return prisma.student.create({ data });
}

export async function createWithPerson(data: {
  person: Prisma.PersonCreateWithoutStudentInput;
  student: Omit<Prisma.StudentUncheckedCreateInput, 'personId'>;
}) {
  return prisma.$transaction(async (tx) => {
    const person = await tx.person.create({ data: data.person });
    return tx.student.create({
      data: { ...data.student, personId: person.id },
      include: detailInclude,
    });
  });
}

export async function update(id: string, data: Prisma.StudentUpdateInput) {
  return prisma.student.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.student.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function getStudentsByProgramme(programmeId: string, pagination: CursorPaginationParams) {
  const where: Prisma.StudentWhereInput = {
    deletedAt: null,
    enrolments: { some: { programmeId, status: 'ENROLLED' } },
  };
  const [data, total] = await Promise.all([
    prisma.student.findMany({ where, include: detailInclude,  take: pagination.limit }),
    prisma.student.count({ where }),
  ]);
  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

/**
 * Find a student by the linked Person id. Used during applicant-to-student
 * conversion to establish whether a Student record already exists for the
 * person before attempting to create one (idempotency guard).
 */
export async function getByPersonId(personId: string) {
  return prisma.student.findFirst({
    where: { personId, deletedAt: null },
    include: detailInclude,
  });
}

/**
 * Count all non-deleted student records. Used to generate the next sequential
 * student number during conversion. The caller is responsible for handling
 * unique-constraint retries if a concurrent conversion races this value.
 */
export async function countStudents(): Promise<number> {
  return prisma.student.count({ where: { deletedAt: null } });
}
