import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/examBoard.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface ExamBoardListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  programmeId?: string;
  status?: string;
}

export async function list(query: ExamBoardListQuery) {
  const { cursor, limit, sort, order, search, programmeId, status } = query;
  return repo.list(
    { search, programmeId, status },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('ExamBoard', id);
  return result;
}

export async function create(data: Prisma.ExamBoardUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('ExamBoard', result.id, 'CREATE', userId, null, result, req);
  emitEvent({
    event: 'exam_board.scheduled',
    entityType: 'ExamBoard',
    entityId: result.id,
    actorId: userId,
    data: {
      programmeId: result.programmeId,
      boardType: result.boardType,
      academicYear: result.academicYear,
      scheduledDate: result.scheduledDate?.toISOString() ?? null,
      status: result.status,
    },
  });
  return result;
}

export async function update(id: string, data: Prisma.ExamBoardUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('ExamBoard', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'exam_board.updated',
    entityType: 'ExamBoard',
    entityId: id,
    actorId: userId,
    data: {
      programmeId: result.programmeId,
      academicYear: result.academicYear,
      status: result.status,
    },
  });
  if (result.status !== previous.status) {
    emitEvent({
      event: 'exam_board.status_changed',
      entityType: 'ExamBoard',
      entityId: id,
      actorId: userId,
      data: {
        programmeId: result.programmeId,
        previousStatus: previous.status,
        newStatus: result.status,
      },
    });
  }
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('ExamBoard', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'exam_board.deleted',
    entityType: 'ExamBoard',
    entityId: id,
    actorId: userId,
    data: {
      programmeId: previous.programmeId,
      title: previous.title,
    },
  });
}
