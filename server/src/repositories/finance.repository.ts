import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';
import { type Prisma } from '@prisma/client';

export interface AccountFilters {
  studentId?: string;
  academicYear?: string;
  status?: string;
}

export interface TransactionFilters {
  transactionType?: string;
  status?: string;
  fromDate?: string | Date;
  toDate?: string | Date;
}

export async function list(filters: AccountFilters = {}, pagination: PaginationParams) {
  const where: Prisma.StudentAccountWhereInput = {
    deletedAt: null,
    ...(filters.studentId && { studentId: filters.studentId }),
    ...(filters.academicYear && { academicYear: filters.academicYear }),
    ...(filters.status && { status: filters.status }),
  };

  const [data, total] = await Promise.all([
    prisma.studentAccount.findMany({
      where,
      include: { student: { include: { person: true } } },
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.studentAccount.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
}

export async function getById(id: string) {
  return prisma.studentAccount.findFirst({
    where: { id, deletedAt: null },
    include: {
      student: { include: { person: true } },
      chargeLines: { orderBy: { createdAt: 'desc' } },
      invoices: { include: { payments: true }, orderBy: { issueDate: 'desc' } },
      paymentPlans: { include: { instalments: true } },
      sponsorAgreements: true,
    },
  });
}

export async function create(data: Prisma.StudentAccountUncheckedCreateInput) {
  return prisma.studentAccount.create({ data, include: { student: { include: { person: true } } } });
}

export async function update(id: string, data: Prisma.StudentAccountUpdateInput) {
  return prisma.studentAccount.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.studentAccount.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function listTransactions(
  studentAccountId: string,
  filters: TransactionFilters = {},
  pagination: PaginationParams,
) {
  const where: Prisma.FinancialTransactionWhereInput = {
    studentAccountId,
    ...(filters.transactionType && { transactionType: filters.transactionType as any }),
    ...(filters.status && { status: filters.status as any }),
    ...((filters.fromDate || filters.toDate) && {
      postedDate: {
        ...(filters.fromDate && { gte: new Date(filters.fromDate) }),
        ...(filters.toDate && { lte: new Date(filters.toDate) }),
      },
    }),
  };

  const [data, total] = await Promise.all([
    prisma.financialTransaction.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
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

  return buildPaginatedResponse(data, total, pagination);
}

export async function createCharge(data: Prisma.ChargeLineUncheckedCreateInput) {
  return prisma.$transaction(async (tx) => {
    const charge = await tx.chargeLine.create({ data });
    await tx.studentAccount.update({
      where: { id: data.studentAccountId },
      data: { balance: { increment: Number(data.amount) } },
    });
    return charge;
  });
}

export async function createPayment(data: Prisma.PaymentUncheckedCreateInput) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({ data });
    await tx.studentAccount.update({
      where: { id: data.studentAccountId },
      data: { balance: { decrement: Number(data.amount) } },
    });
    if (data.invoiceId) {
      await tx.invoice.update({
        where: { id: data.invoiceId },
        data: { paidAmount: { increment: Number(data.amount) } },
      });
    }
    return payment;
  });
}

export async function getAccountBalance(studentId: string, academicYear: string) {
  return prisma.studentAccount.findFirst({
    where: { studentId, academicYear },
    select: { id: true, balance: true, status: true },
  });
}

export async function getInvoicesByStudent(studentId: string) {
  return prisma.invoice.findMany({
    where: { studentAccount: { studentId } },
    include: { chargeLines: true, payments: true },
    orderBy: { issueDate: 'desc' },
  });
}
