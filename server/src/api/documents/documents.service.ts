import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/document.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface DocumentListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  studentId?: string;
  documentType?: string;
  verificationStatus?: string;
}

export async function list(query: DocumentListQuery) {
  const { cursor, limit, sort, order, studentId, documentType, verificationStatus } = query;
  return repo.list(
    { studentId, documentType, verificationStatus },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('Document', id);
  return result;
}

export async function create(data: Prisma.DocumentUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('Document', result.id, 'CREATE', userId, null, result, req);
  emitEvent({
    event: 'document.uploaded',
    entityType: 'Document',
    entityId: result.id,
    actorId: userId,
    data: {
      studentId: result.studentId,
      documentType: result.documentType,
      title: result.title,
      mimeType: result.mimeType,
    },
  });
  return result;
}

export async function update(id: string, data: Prisma.DocumentUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('Document', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'document.updated',
    entityType: 'Document',
    entityId: id,
    actorId: userId,
    data: {
      studentId: result.studentId,
      documentType: result.documentType,
      title: result.title,
    },
  });
  if (result.verificationStatus !== previous.verificationStatus) {
    emitEvent({
      event: 'document.verification_changed',
      entityType: 'Document',
      entityId: id,
      actorId: userId,
      data: {
        studentId: result.studentId,
        documentType: result.documentType,
        previousStatus: previous.verificationStatus,
        newStatus: result.verificationStatus,
      },
    });
  }
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('Document', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'document.deleted',
    entityType: 'Document',
    entityId: id,
    actorId: userId,
    data: {
      studentId: previous.studentId,
      title: previous.title,
    },
  });
}
