import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/document.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface DocumentListQuery {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  studentId?: string;
  documentType?: string;
  verificationStatus?: string;
}

export async function list(query: DocumentListQuery) {
  const { page, limit, sort, order, studentId, documentType, verificationStatus } = query;
  return repo.list(
    { studentId, documentType, verificationStatus },
    { page, limit, skip: (page - 1) * limit, sort, order },
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
  await emitEvent('documents.created', { id: result.id });
  return result;
}

export async function update(id: string, data: Prisma.DocumentUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('Document', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('documents.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('Document', id, 'DELETE', userId, previous, null, req);
  await emitEvent('documents.deleted', { id });
}
