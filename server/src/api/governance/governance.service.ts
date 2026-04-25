import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/governance.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

// ── Query interface ─────────────────────────────────────────────────────

export interface GovernanceListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  committeeType?: string;
  committeeId?: string;
  status?: string;
}

// ── Committee operations ────────────────────────────────────────────────

export async function listCommittees(query: GovernanceListQuery) {
  const { cursor, limit, sort, order, search, committeeType, status } = query;
  return repo.listCommittees({ search, committeeType, status }, { cursor, limit, sort, order });
}

export async function getCommitteeById(id: string) {
  const result = await repo.getCommitteeById(id);
  if (!result) throw new NotFoundError('Committee', id);
  return result;
}

export async function createCommittee(
  data: Prisma.CommitteeCreateInput,
  userId: string,
  req: Request,
) {
  const result = await repo.createCommittee(data);
  await logAudit('Committee', result.id, 'CREATE', userId, null, result, req);
  emitEvent({
    event: 'governance.committee_created',
    entityType: 'Committee',
    entityId: result.id,
    actorId: userId,
    data: { committeeName: result.committeeName, committeeType: result.committeeType },
  });
  return result;
}

export async function updateCommittee(
  id: string,
  data: Prisma.CommitteeUpdateInput,
  userId: string,
  req: Request,
) {
  const previous = await getCommitteeById(id);
  const result = await repo.updateCommittee(id, data);
  await logAudit('Committee', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'governance.committee_updated',
    entityType: 'Committee',
    entityId: id,
    actorId: userId,
    data: { committeeName: result.committeeName, committeeType: result.committeeType },
  });
  return result;
}

export async function removeCommittee(id: string, userId: string, req: Request) {
  const previous = await getCommitteeById(id);
  await repo.softDeleteCommittee(id);
  await logAudit('Committee', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'governance.committee_deleted',
    entityType: 'Committee',
    entityId: id,
    actorId: userId,
    data: { committeeName: previous.committeeName, status: 'inactive' },
  });
}

// ── Meeting operations ──────────────────────────────────────────────────

export async function listMeetings(query: GovernanceListQuery) {
  const { cursor, limit, sort, order, search, committeeId, status } = query;
  return repo.listMeetings({ search, committeeId, status }, { cursor, limit, sort, order });
}

export async function getMeetingById(id: string) {
  const result = await repo.getMeetingById(id);
  if (!result) throw new NotFoundError('CommitteeMeeting', id);
  return result;
}

export async function createMeeting(
  data: Prisma.CommitteeMeetingUncheckedCreateInput,
  userId: string,
  req: Request,
) {
  const result = await repo.createMeeting(data);
  await logAudit('CommitteeMeeting', result.id, 'CREATE', userId, null, result, req);
  emitEvent({
    event: 'governance.meeting_scheduled',
    entityType: 'CommitteeMeeting',
    entityId: result.id,
    actorId: userId,
    data: {
      committeeId: result.committeeId,
      meetingDate: result.meetingDate,
      status: result.status,
    },
  });
  return result;
}

export async function updateMeeting(
  id: string,
  data: Prisma.CommitteeMeetingUpdateInput,
  userId: string,
  req: Request,
) {
  const previous = await getMeetingById(id);
  const result = await repo.updateMeeting(id, data);
  await logAudit('CommitteeMeeting', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'governance.meeting_updated',
    entityType: 'CommitteeMeeting',
    entityId: id,
    actorId: userId,
    data: {
      committeeId: result.committeeId,
      meetingDate: result.meetingDate,
      status: result.status,
    },
  });
  return result;
}

// ── Member operations ───────────────────────────────────────────────────

export async function addMember(
  data: Prisma.CommitteeMemberUncheckedCreateInput,
  userId: string,
  req: Request,
) {
  const result = await repo.addMember(data);
  await logAudit('CommitteeMember', result.id, 'CREATE', userId, null, result, req);
  emitEvent({
    event: 'governance.member_added',
    entityType: 'CommitteeMember',
    entityId: result.id,
    actorId: userId,
    data: {
      committeeId: result.committeeId,
      staffId: result.staffId,
      role: result.role,
    },
  });
  return result;
}

export async function removeMember(id: string, userId: string, req: Request) {
  const previous = await repo.getMemberById(id);
  if (!previous) throw new NotFoundError('CommitteeMember', id);
  const result = await repo.removeMember(id);
  await logAudit('CommitteeMember', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'governance.member_removed',
    entityType: 'CommitteeMember',
    entityId: id,
    actorId: userId,
    data: {
      committeeId: result.committeeId,
      staffId: result.staffId,
      endDate: result.endDate,
    },
  });
  return result;
}
