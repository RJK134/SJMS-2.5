import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse } from '../utils/pagination';
import { type Prisma } from '@prisma/client';

export interface DocumentFilters {
  studentId?: string;
  documentType?: string;
  verificationStatus?: string;
}

export async function list(filters: DocumentFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.DocumentWhereInput = {
    deletedAt: null,
    ...(filters.studentId && { studentId: filters.studentId }),
    ...(filters.documentType && { documentType: filters.documentType as any }),
    ...(filters.verificationStatus && { verificationStatus: filters.verificationStatus as any }),
  };

  const [data, total] = await Promise.all([
    prisma.document.findMany({
      where,
      include: { student: { include: { person: true } } },
      
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.document.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getById(id: string) {
  return prisma.document.findFirst({
    where: { id, deletedAt: null },
    include: {
      student: { include: { person: true } },
      verifications: { orderBy: { verifiedDate: 'desc' } },
    },
  });
}

export async function create(data: Prisma.DocumentUncheckedCreateInput) {
  return prisma.document.create({ data });
}

export async function update(id: string, data: Prisma.DocumentUpdateInput) {
  return prisma.document.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.document.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function verify(documentId: string, data: Omit<Prisma.DocumentVerificationUncheckedCreateInput, 'documentId'>) {
  return prisma.$transaction(async (tx) => {
    const verification = await tx.documentVerification.create({
      data: { ...data, documentId },
    });
    await tx.document.update({
      where: { id: documentId },
      data: { verificationStatus: data.status as any },
    });
    return verification;
  });
}

export async function generateLetter(data: Prisma.GeneratedLetterUncheckedCreateInput) {
  return prisma.generatedLetter.create({
    data,
    include: { template: true },
  });
}

export async function getLetterTemplates(category?: string) {
  return prisma.letterTemplate.findMany({
    where: { isActive: true, ...(category && { category }) },
    orderBy: { title: 'asc' },
  });
}
