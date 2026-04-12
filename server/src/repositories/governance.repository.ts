import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse } from '../utils/pagination';
import { type Prisma } from '@prisma/client';

interface CommitteeFilters {
  committeeType?: string;
  status?: string;
}

export async function list(filters: CommitteeFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.CommitteeWhereInput = {
    ...(filters.committeeType && { committeeType: filters.committeeType as any }),
    ...(filters.status && { status: filters.status }),
  };

  const [data, total] = await Promise.all([
    prisma.committee.findMany({
      where,
      include: { members: { include: { staff: { include: { person: true } } } } },
      
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.committee.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getById(id: string) {
  return prisma.committee.findUnique({
    where: { id },
    include: {
      members: { include: { staff: { include: { person: true } } } },
      meetings: { include: { agendaItems: true }, orderBy: { meetingDate: 'desc' } },
    },
  });
}

export async function create(data: Prisma.CommitteeCreateInput) {
  return prisma.committee.create({ data });
}

export async function update(id: string, data: Prisma.CommitteeUpdateInput) {
  return prisma.committee.update({ where: { id }, data });
}

export async function addMember(data: Prisma.CommitteeMemberUncheckedCreateInput) {
  return prisma.committeeMember.create({
    data,
    include: { staff: { include: { person: true } } },
  });
}

export async function removeMember(memberId: string) {
  return prisma.committeeMember.update({
    where: { id: memberId },
    data: { endDate: new Date() },
  });
}

export async function scheduleMeeting(data: Prisma.CommitteeMeetingUncheckedCreateInput) {
  return prisma.committeeMeeting.create({
    data,
    include: { committee: true },
  });
}

export async function getMeetingById(id: string) {
  return prisma.committeeMeeting.findUnique({
    where: { id },
    include: { committee: true, agendaItems: { orderBy: { itemNumber: 'asc' } } },
  });
}
