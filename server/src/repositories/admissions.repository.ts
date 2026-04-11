import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';
import { type Prisma } from '@prisma/client';

export interface ApplicationFilters {
  status?: string;
  academicYear?: string;
  programmeId?: string;
  applicantId?: string;
  search?: string;
}

const defaultInclude = {
  applicant: { include: { person: true } },
  programme: true,
  qualifications: true,
  references: true,
  conditions: true,
  interviews: true,
  clearanceChecks: true,
} as const;

export async function list(filters: ApplicationFilters = {}, pagination: PaginationParams) {
  const where: Prisma.ApplicationWhereInput = {
    deletedAt: null,
    ...(filters.status && { status: filters.status as any }),
    ...(filters.academicYear && { academicYear: filters.academicYear }),
    ...(filters.programmeId && { programmeId: filters.programmeId }),
    ...(filters.applicantId && { applicantId: filters.applicantId }),
    ...(filters.search && {
      applicant: {
        person: {
          OR: [
            { firstName: { contains: filters.search, mode: 'insensitive' as const } },
            { lastName: { contains: filters.search, mode: 'insensitive' as const } },
          ],
        },
      },
    }),
  };

  const [data, total] = await Promise.all([
    prisma.application.findMany({
      where,
      include: { applicant: { include: { person: true } }, programme: true },
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.application.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
}

export async function getById(id: string) {
  return prisma.application.findUnique({ where: { id }, include: defaultInclude });
}

export async function createApplication(data: Prisma.ApplicationUncheckedCreateInput) {
  return prisma.application.create({ data, include: defaultInclude });
}

export async function createApplicantWithApplication(data: {
  person: Prisma.PersonCreateInput;
  applicant: Omit<Prisma.ApplicantUncheckedCreateInput, 'personId'>;
  application: Omit<Prisma.ApplicationUncheckedCreateInput, 'applicantId'>;
  qualifications?: Prisma.ApplicationQualificationCreateManyInput[];
}) {
  return prisma.$transaction(async (tx) => {
    const person = await tx.person.create({ data: data.person });
    const applicant = await tx.applicant.create({
      data: { ...data.applicant, personId: person.id },
    });
    const application = await tx.application.create({
      data: { ...data.application, applicantId: applicant.id },
      include: defaultInclude,
    });
    if (data.qualifications?.length) {
      await tx.applicationQualification.createMany({
        data: data.qualifications.map(q => ({ ...q, applicationId: application.id })),
      });
    }
    return application;
  });
}

export async function update(id: string, data: Prisma.ApplicationUpdateInput) {
  return prisma.application.update({ where: { id }, data, include: defaultInclude });
}

export async function softDelete(id: string) {
  return prisma.application.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function updateOfferCondition(conditionId: string, data: Prisma.OfferConditionUpdateInput) {
  return prisma.offerCondition.update({ where: { id: conditionId }, data });
}

export async function getApplicationsByApplicant(applicantId: string) {
  return prisma.application.findMany({
    where: { applicantId, deletedAt: null },
    include: { programme: true, conditions: true },
    orderBy: { createdAt: 'desc' },
  });
}
