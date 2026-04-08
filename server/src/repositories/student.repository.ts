import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';
import { type Prisma } from '@prisma/client';

const defaultInclude = {
  person: {
    include: {
      contacts: true,
      addresses: true,
      identifiers: true,
      demographic: true,
    },
  },
} as const;

interface StudentFilters {
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
      include: defaultInclude,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.student.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
}

export async function getById(id: string) {
  return prisma.student.findUnique({
    where: { id },
    include: {
      ...defaultInclude,
      enrolments: { include: { programme: true }, where: { deletedAt: null } },
    },
  });
}

export async function getByStudentNumber(studentNumber: string) {
  return prisma.student.findUnique({ where: { studentNumber }, include: defaultInclude });
}

export async function create(data: {
  person: Prisma.PersonCreateWithoutStudentInput;
  student: Omit<Prisma.StudentUncheckedCreateInput, 'personId'>;
}) {
  return prisma.$transaction(async (tx) => {
    const person = await tx.person.create({ data: data.person });
    return tx.student.create({
      data: { ...data.student, personId: person.id },
      include: defaultInclude,
    });
  });
}

export async function update(id: string, data: Prisma.StudentUpdateInput) {
  return prisma.student.update({ where: { id }, data, include: defaultInclude });
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
    prisma.student.findMany({ where, include: defaultInclude, skip: pagination.skip, take: pagination.limit }),
    prisma.student.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, pagination);
}
