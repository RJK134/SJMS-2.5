import prisma from '../../utils/prisma';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';
import { buildPaginatedResponse } from '../../utils/pagination';
import type { Request } from 'express';

export async function list(query: Record<string, any>) {
  const { page, limit, sort, order, search, ...filters } = query;
  const skip = (page - 1) * limit;
  const where: Record<string, any> = {
    
    
    ...(filters.studentId ? { studentId: filters.studentId as any } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.studentAccount.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any }),
    prisma.studentAccount.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

export async function getById(id: string) {
  const result = await prisma.studentAccount.findUnique({ where: { id }, include: { student: { include: { person: true } }, chargeLines: { orderBy: { createdAt: 'desc' } }, invoices: { include: { payments: true } }, paymentPlans: true } });
  if (!result) throw new NotFoundError('StudentAccount', id);
  return result;
}

export async function create(data: any, userId: string, req: Request) {
  const result = await prisma.studentAccount.create({ data });
  await logAudit('StudentAccount', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('finance.created', { id: result.id });
  return result;
}

export async function update(id: string, data: any, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await prisma.studentAccount.update({ where: { id }, data });
  await logAudit('StudentAccount', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('finance.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await prisma.studentAccount.delete({ where: { id } });
  await logAudit('StudentAccount', id, 'DELETE', userId, previous, null, req);
  await emitEvent('finance.deleted', { id });
}

// ── Financial Transactions ──────────────────────────────────────────────

export async function listTransactions(studentAccountId: string, query: Record<string, any>) {
  const { page, limit, sort, order, ...filters } = query;
  const skip = (page - 1) * limit;
  const where: Record<string, any> = {
    studentAccountId,
    ...(filters.transactionType ? { transactionType: filters.transactionType } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.fromDate || filters.toDate ? {
      postedDate: {
        ...(filters.fromDate ? { gte: new Date(filters.fromDate) } : {}),
        ...(filters.toDate ? { lte: new Date(filters.toDate) } : {}),
      },
    } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.financialTransaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sort]: order } as any,
      select: {
        id: true,
        transactionRef: true,
        transactionType: true,
        debitAmount: true,
        creditAmount: true,
        runningBalance: true,
        description: true,
        reference: true,
        postedDate: true,
        effectiveDate: true,
        status: true,
      },
    }),
    prisma.financialTransaction.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}
