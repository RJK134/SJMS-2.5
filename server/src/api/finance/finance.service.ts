import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/finance.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface FinanceListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  studentId?: string;
  academicYear?: string;
  status?: string;
}

export interface TransactionListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  transactionType?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

export async function list(query: FinanceListQuery) {
  const { cursor, limit, sort, order, studentId, academicYear, status } = query;
  return repo.list(
    { studentId, academicYear, status },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('StudentAccount', id);
  return result;
}

export async function create(data: Prisma.StudentAccountUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('StudentAccount', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('finance.created', { id: result.id });
  return result;
}

export async function update(id: string, data: Prisma.StudentAccountUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('StudentAccount', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('finance.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('StudentAccount', id, 'DELETE', userId, previous, null, req);
  await emitEvent('finance.deleted', { id });
}

// ── Financial Transactions ──────────────────────────────────────────────

export async function listTransactions(studentAccountId: string, query: TransactionListQuery) {
  const { cursor, limit, sort, order, transactionType, status, fromDate, toDate } = query;
  return repo.listTransactions(
    studentAccountId,
    { transactionType, status, fromDate, toDate },
    { cursor, limit, sort, order },
  );
}
