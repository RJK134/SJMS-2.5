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
  await emitEvent('exam_boards.created', { id: result.id });
  return result;
}

export async function update(id: string, data: Prisma.ExamBoardUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('ExamBoard', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('exam_boards.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('ExamBoard', id, 'DELETE', userId, previous, null, req);
  await emitEvent('exam_boards.deleted', { id });
}
