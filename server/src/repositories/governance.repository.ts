import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse, safeOrderBy } from '../utils/pagination';
import { type Prisma } from '@prisma/client';

// ── Filter interfaces ────────────────────────────────────────────────────

export interface CommitteeFilters {
  committeeType?: string;
  status?: string;
  search?: string;
}

export interface MeetingFilters {
  committeeId?: string;
  status?: string;
  search?: string;
}

// ── Committee operations ────────────────────────────────────────────────

export async function listCommittees(filters: CommitteeFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.CommitteeWhereInput = {
    // Use requested status filter but never allow 'inactive' (soft-deleted) to leak through
    status: filters.status && filters.status !== 'inactive' ? filters.status : { not: 'inactive' },
    ...(filters.committeeType && { committeeType: filters.committeeType as any }),
    ...(filters.search && {
      OR: [
        { committeeName: { contains: filters.search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.committee.findMany({
      where,
      include: { members: { include: { staff: { include: { person: true } } } } },
      take: pagination.limit + 1,
      ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: safeOrderBy(pagination, ['id', 'createdAt', 'updatedAt', 'triggerDate', 'startDate', 'dayOfWeek', 'timestamp', 'settingKey', 'postedDate', 'dueDate', 'contactDate'] as const),
    }),
    prisma.committee.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getCommitteeById(id: string) {
  return prisma.committee.findUnique({
    where: { id, status: { not: 'inactive' } },
    include: {
      members: { include: { staff: { include: { person: true } } } },
      meetings: { include: { agendaItems: true }, orderBy: { meetingDate: 'desc' } },
    },
  });
}

export async function createCommittee(data: Prisma.CommitteeCreateInput) {
  return prisma.committee.create({
    data,
    include: { members: true },
  });
}

export async function updateCommittee(id: string, data: Prisma.CommitteeUpdateInput) {
  return prisma.committee.update({
    where: { id },
    data,
    include: { members: { include: { staff: { include: { person: true } } } } },
  });
}

export async function softDeleteCommittee(id: string) {
  return prisma.committee.update({
    where: { id },
    data: { status: 'inactive' },
  });
}

// ── Meeting operations ──────────────────────────────────────────────────

export async function listMeetings(filters: MeetingFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.CommitteeMeetingWhereInput = {
    ...(filters.committeeId && { committeeId: filters.committeeId }),
    ...(filters.status && { status: filters.status as any }),
    ...(filters.search && {
      OR: [
        { venue: { contains: filters.search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.committeeMeeting.findMany({
      where,
      include: { committee: true },
      take: pagination.limit + 1,
      ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: safeOrderBy(pagination, ['id', 'createdAt', 'updatedAt', 'triggerDate', 'startDate', 'dayOfWeek', 'timestamp', 'settingKey', 'postedDate', 'dueDate', 'contactDate'] as const),
    }),
    prisma.committeeMeeting.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getMeetingById(id: string) {
  return prisma.committeeMeeting.findUnique({
    where: { id },
    include: {
      committee: true,
      agendaItems: { orderBy: { itemNumber: 'asc' } },
    },
  });
}

export async function createMeeting(data: Prisma.CommitteeMeetingUncheckedCreateInput) {
  return prisma.committeeMeeting.create({
    data,
    include: { committee: true },
  });
}

export async function updateMeeting(id: string, data: Prisma.CommitteeMeetingUpdateInput) {
  return prisma.committeeMeeting.update({
    where: { id },
    data,
    include: { committee: true, agendaItems: { orderBy: { itemNumber: 'asc' } } },
  });
}

// ── Member operations ───────────────────────────────────────────────────

export async function addMember(data: Prisma.CommitteeMemberUncheckedCreateInput) {
  return prisma.committeeMember.create({
    data,
    include: { staff: { include: { person: true } }, committee: true },
  });
}

export async function removeMember(memberId: string) {
  return prisma.committeeMember.update({
    where: { id: memberId },
    data: { endDate: new Date() },
    include: { staff: { include: { person: true } }, committee: true },
  });
}

export async function getMemberById(memberId: string) {
  return prisma.committeeMember.findUnique({
    where: { id: memberId },
    include: { staff: { include: { person: true } }, committee: true },
  });
}
