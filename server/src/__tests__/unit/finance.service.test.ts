import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundError } from '../../utils/errors';

// ── Mock dependencies before importing the service under test ──────────────
vi.mock('../../repositories/finance.repository', () => ({
  list: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
  listTransactions: vi.fn(),
}));
vi.mock('../../utils/audit', () => ({ logAudit: vi.fn() }));
vi.mock('../../utils/webhooks', () => ({ emitEvent: vi.fn() }));

import * as financeService from '../../api/finance/finance.service';
import * as repo from '../../repositories/finance.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';

const mockedRepo = vi.mocked(repo);
const mockedLogAudit = vi.mocked(logAudit);
const mockedEmitEvent = vi.mocked(emitEvent);

// ── Fixtures ───────────────────────────────────────────────────────────────
const fakeAccount = {
  id: 'acct-1',
  studentId: 'stu-1',
  academicYear: '2025/26',
  status: 'ACTIVE',
  balance: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
};

const fakeReq = { ip: '127.0.0.1', user: {}, get: vi.fn() } as any;

// ── Tests ──────────────────────────────────────────────────────────────────
describe('finance.service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('list()', () => {
    it('should return paginated student account results', async () => {
      const paginatedResult = { data: [fakeAccount], total: 1, nextCursor: null };
      mockedRepo.list.mockResolvedValue(paginatedResult);

      const result = await financeService.list({
        limit: 20,
        sort: 'createdAt',
        order: 'desc',
      });

      expect(mockedRepo.list).toHaveBeenCalledWith(
        { studentId: undefined, academicYear: undefined, status: undefined },
        { cursor: undefined, limit: 20, sort: 'createdAt', order: 'desc' },
      );
      expect(result).toEqual(paginatedResult);
    });

    it('should forward filter parameters to the repository', async () => {
      mockedRepo.list.mockResolvedValue({ data: [], total: 0, nextCursor: null });

      await financeService.list({
        limit: 10,
        sort: 'createdAt',
        order: 'asc',
        studentId: 'stu-1',
        academicYear: '2025/26',
        status: 'ACTIVE',
      });

      expect(mockedRepo.list).toHaveBeenCalledWith(
        expect.objectContaining({ studentId: 'stu-1', academicYear: '2025/26', status: 'ACTIVE' }),
        expect.any(Object),
      );
    });
  });

  describe('getById()', () => {
    it('should return the student account when found', async () => {
      mockedRepo.getById.mockResolvedValue(fakeAccount as any);

      const result = await financeService.getById('acct-1');
      expect(result).toEqual(fakeAccount);
      expect(mockedRepo.getById).toHaveBeenCalledWith('acct-1');
    });

    it('should throw NotFoundError when account does not exist', async () => {
      mockedRepo.getById.mockResolvedValue(null);

      await expect(financeService.getById('missing-id'))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('create()', () => {
    it('should create a student account, log audit, and emit event', async () => {
      const createData = {
        studentId: 'stu-1',
        academicYear: '2025/26',
        status: 'ACTIVE',
      };
      mockedRepo.create.mockResolvedValue({ ...fakeAccount, ...createData } as any);

      const result = await financeService.create(createData as any, 'user-1', fakeReq);

      expect(mockedRepo.create).toHaveBeenCalledWith(createData);
      expect(mockedLogAudit).toHaveBeenCalledWith(
        'StudentAccount',
        'acct-1',
        'CREATE',
        'user-1',
        null,
        expect.objectContaining({ id: 'acct-1' }),
        fakeReq,
      );
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'finance.account_created',
          entityType: 'StudentAccount',
          entityId: 'acct-1',
          actorId: 'user-1',
          data: expect.objectContaining({
            studentId: 'stu-1',
            academicYear: '2025/26',
            status: 'ACTIVE',
          }),
        }),
      );
      expect(result.id).toBe('acct-1');
    });
  });

  describe('update()', () => {
    it('should update the account, log audit, and emit finance.account_updated', async () => {
      const updated = { ...fakeAccount, academicYear: '2026/27' };

      mockedRepo.getById.mockResolvedValue(fakeAccount as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      const result = await financeService.update('acct-1', { academicYear: '2026/27' } as any, 'user-1', fakeReq);

      expect(mockedLogAudit).toHaveBeenCalledWith(
        'StudentAccount',
        'acct-1',
        'UPDATE',
        'user-1',
        fakeAccount,
        updated,
        fakeReq,
      );
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({ event: 'finance.account_updated' }),
      );
      expect(result.academicYear).toBe('2026/27');
    });

    it('should emit finance.status_changed when status transitions', async () => {
      const previous = { ...fakeAccount, status: 'ACTIVE' };
      const updated = { ...fakeAccount, status: 'ON_HOLD' };

      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await financeService.update('acct-1', { status: 'ON_HOLD' } as any, 'user-1', fakeReq);

      // Two events should be emitted: account_updated and status_changed
      expect(mockedEmitEvent).toHaveBeenCalledTimes(2);
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'finance.status_changed',
          data: expect.objectContaining({
            previousStatus: 'ACTIVE',
            newStatus: 'ON_HOLD',
          }),
        }),
      );
    });

    it('should NOT emit finance.status_changed when status remains the same', async () => {
      const previous = { ...fakeAccount, status: 'ACTIVE' };
      const updated = { ...fakeAccount, status: 'ACTIVE', balance: 100 };

      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await financeService.update('acct-1', { balance: 100 } as any, 'user-1', fakeReq);

      // Only the account_updated event, no status_changed
      expect(mockedEmitEvent).toHaveBeenCalledTimes(1);
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({ event: 'finance.account_updated' }),
      );
    });
  });

  describe('remove()', () => {
    it('should soft delete, log audit, and emit finance.account_deleted', async () => {
      mockedRepo.getById.mockResolvedValue(fakeAccount as any);
      mockedRepo.softDelete.mockResolvedValue(undefined as any);

      await financeService.remove('acct-1', 'user-1', fakeReq);

      expect(mockedRepo.softDelete).toHaveBeenCalledWith('acct-1');
      expect(mockedLogAudit).toHaveBeenCalledWith(
        'StudentAccount',
        'acct-1',
        'DELETE',
        'user-1',
        fakeAccount,
        null,
        fakeReq,
      );
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'finance.account_deleted',
          entityType: 'StudentAccount',
          entityId: 'acct-1',
          data: expect.objectContaining({ studentId: 'stu-1' }),
        }),
      );
    });

    it('should throw NotFoundError if account does not exist before deletion', async () => {
      mockedRepo.getById.mockResolvedValue(null);

      await expect(financeService.remove('missing-id', 'user-1', fakeReq))
        .rejects
        .toThrow(NotFoundError);

      expect(mockedRepo.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('listTransactions()', () => {
    it('should return paginated transaction data for a student account', async () => {
      const fakeTransactions = {
        data: [{ id: 'txn-1', transactionType: 'CHARGE', debitAmount: 1500 }],
        total: 1,
        nextCursor: null,
      };
      mockedRepo.listTransactions.mockResolvedValue(fakeTransactions);

      const result = await financeService.listTransactions('acct-1', {
        limit: 20,
        sort: 'postedDate',
        order: 'desc',
      });

      expect(mockedRepo.listTransactions).toHaveBeenCalledWith(
        'acct-1',
        { transactionType: undefined, status: undefined, fromDate: undefined, toDate: undefined },
        { cursor: undefined, limit: 20, sort: 'postedDate', order: 'desc' },
      );
      expect(result).toEqual(fakeTransactions);
    });

    it('should forward date range filters to the repository', async () => {
      mockedRepo.listTransactions.mockResolvedValue({ data: [], total: 0, nextCursor: null });

      await financeService.listTransactions('acct-1', {
        limit: 50,
        sort: 'postedDate',
        order: 'asc',
        fromDate: '2025-09-01',
        toDate: '2026-06-30',
        transactionType: 'PAYMENT',
      });

      expect(mockedRepo.listTransactions).toHaveBeenCalledWith(
        'acct-1',
        expect.objectContaining({
          fromDate: '2025-09-01',
          toDate: '2026-06-30',
          transactionType: 'PAYMENT',
        }),
        expect.any(Object),
      );
    });
  });
});
