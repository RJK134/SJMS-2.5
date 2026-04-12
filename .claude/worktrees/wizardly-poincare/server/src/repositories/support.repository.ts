import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';
import { type Prisma } from '@prisma/client';

interface TicketFilters {
  studentId?: string;
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: string;
}

export async function list(filters: TicketFilters = {}, pagination: PaginationParams) {
  const where: Prisma.SupportTicketWhereInput = {
    ...(filters.studentId && { studentId: filters.studentId }),
    ...(filters.status && { status: filters.status as any }),
    ...(filters.priority && { priority: filters.priority as any }),
    ...(filters.category && { category: filters.category as any }),
    ...(filters.assignedTo && { assignedTo: filters.assignedTo }),
  };

  const [data, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      include: { student: { include: { person: true } } },
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.supportTicket.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
}

export async function getById(id: string) {
  return prisma.supportTicket.findUnique({
    where: { id },
    include: {
      student: { include: { person: true } },
      interactions: { orderBy: { createdAt: 'asc' } },
    },
  });
}

export async function create(data: Prisma.SupportTicketUncheckedCreateInput) {
  return prisma.supportTicket.create({ data, include: { student: { include: { person: true } } } });
}

export async function update(id: string, data: Prisma.SupportTicketUpdateInput) {
  return prisma.supportTicket.update({ where: { id }, data, include: { interactions: true } });
}

export async function addInteraction(data: Prisma.SupportInteractionUncheckedCreateInput) {
  return prisma.supportInteraction.create({ data });
}

export async function getStudentFlags(studentId: string) {
  return prisma.studentFlag.findMany({
    where: { studentId, status: 'ACTIVE' },
    orderBy: { raisedDate: 'desc' },
  });
}

export async function createFlag(data: Prisma.StudentFlagUncheckedCreateInput) {
  return prisma.studentFlag.create({ data });
}

export async function getPersonalTutoring(studentId: string, academicYear: string) {
  return prisma.personalTutoring.findMany({
    where: { studentId, academicYear },
    include: { tutor: { include: { person: true } }, actions: true },
    orderBy: { meetingDate: 'desc' },
  });
}
