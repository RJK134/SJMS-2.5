import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/transcript.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface TranscriptListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  studentId?: string;
  transcriptType?: string;
}

export async function list(query: TranscriptListQuery) {
  const { cursor, limit, sort, order, studentId, transcriptType } = query;
  return repo.list(
    { studentId, transcriptType },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('Transcript', id);
  return result;
}

export async function create(data: Prisma.TranscriptUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('Transcript', result.id, 'CREATE', userId, null, result, req);
  emitEvent({
    event: 'transcripts.created',
    entityType: 'Transcript',
    entityId: result.id,
    actorId: userId,
    data: {
      studentId: result.studentId,
      transcriptType: (result as { transcriptType?: string }).transcriptType ?? null,
    },
  });
  return result;
}

export async function update(id: string, data: Prisma.TranscriptUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('Transcript', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'transcripts.updated',
    entityType: 'Transcript',
    entityId: id,
    actorId: userId,
    data: {
      studentId: result.studentId,
      transcriptType: (result as { transcriptType?: string }).transcriptType ?? null,
    },
  });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('Transcript', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'transcripts.deleted',
    entityType: 'Transcript',
    entityId: id,
    actorId: userId,
    data: { studentId: previous.studentId },
  });
}
