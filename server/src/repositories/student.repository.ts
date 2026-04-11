import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';
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
  feeStatus?: string;
  entryRoute?: string;
  search?: string;
}

export async function list(filters: StudentFilters = {}, pagination: PaginationParams) {
  const where: Prisma.StudentWhereInput = {
    deletedAt: null,
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
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.student.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
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

export async function getStudentsByProgramme(programmeId: string, pagination: PaginationParams) {
  const where: Prisma.StudentWhereInput = {
    deletedAt: null,
    enrolments: { some: { programmeId, status: 'ENROLLED' } },
  };
  const [data, total] = await Promise.all([
    prisma.student.findMany({ where, include: detailInclude, skip: pagination.skip, take: pagination.limit }),
    prisma.student.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, pagination);
}
