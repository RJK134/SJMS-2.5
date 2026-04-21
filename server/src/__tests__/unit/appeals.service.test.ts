import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundError } from '../../utils/errors';

// ── Mock dependencies before importing the service under test ──────────────
vi.mock('../../repositories/appeal.repository', () => ({
  list: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}));
vi.mock('../../utils/audit', () => ({ logAudit: vi.fn() }));
vi.mock('../../utils/webhooks', () => ({ emitEvent: vi.fn() }));

import * as appealsService from '../../api/appeals/appeals.service';
import * as repo from '../../repositories/appeal.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';

const mockedRepo = vi.mocked(repo);
const mockedLogAudit = vi.mocked(logAudit);
const mockedEmitEvent = vi.mocked(emitEvent);

// ── Fixtures ───────────────────────────────────────────────────────────────
const fakeAppeal = {
  id: 'appeal-1',
  studentId: 'stu-1',
  appealType: 'MARK_REVIEW',
  grounds: 'Procedural irregularity',
  status: 'SUBMITTED',
  outcome: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
};

const fakeReq = { ip: '127.0.0.1', user: {}, get: vi.fn() } as any;

// ── Tests ──────────────────────────────────────────────────────────────────
describe('appeals.service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('list()', () => {
    it('should return paginated appeal results', async () => {
      const paginatedResult = { data: [fakeAppeal], total: 1, nextCursor: null };
      mockedRepo.list.mockResolvedValue(paginatedResult);

      const result = await appealsService.list({
        limit: 20,
        sort: 'createdAt',
        order: 'desc',
      });

      expect(mockedRepo.list).toHaveBeenCalledWith(
        { studentId: undefined, status: undefined, appealType: undefined },
        { cursor: undefined, limit: 20, sort: 'createdAt', order: 'desc' },
      );
      expect(result).toEqual(paginatedResult);
    });

    it('should forward filter parameters to the repository', async () => {
      mockedRepo.list.mockResolvedValue({ data: [], total: 0, nextCursor: null });

      await appealsService.list({
        limit: 10,
        sort: 'createdAt',
        order: 'asc',
        studentId: 'stu-1',
        status: 'SUBMITTED',
        appealType: 'MARK_REVIEW',
      });

      expect(mockedRepo.list).toHaveBeenCalledWith(
        expect.objectContaining({ studentId: 'stu-1', status: 'SUBMITTED', appealType: 'MARK_REVIEW' }),
        expect.any(Object),
      );
    });
  });

  describe('getById()', () => {
    it('should return the appeal when found', async () => {
      mockedRepo.getById.mockResolvedValue(fakeAppeal as any);

      const result = await appealsService.getById('appeal-1');
      expect(result).toEqual(fakeAppeal);
      expect(mockedRepo.getById).toHaveBeenCalledWith('appeal-1');
    });

    it('should throw NotFoundError when appeal does not exist', async () => {
      mockedRepo.getById.mockResolvedValue(null);

      await expect(appealsService.getById('missing-id'))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('create()', () => {
    it('should create an appeal, log audit, and emit event', async () => {
      const createData = {
        studentId: 'stu-1',
        appealType: 'MARK_REVIEW',
        grounds: 'Procedural irregularity',
      };
      mockedRepo.create.mockResolvedValue({ ...fakeAppeal, ...createData } as any);

      const result = await appealsService.create(createData as any, 'user-1', fakeReq);

      expect(mockedRepo.create).toHaveBeenCalledWith(createData);
      expect(mockedLogAudit).toHaveBeenCalledWith(
        'Appeal', 'appeal-1', 'CREATE', 'user-1', null,
        expect.objectContaining({ id: 'appeal-1' }),
        fakeReq,
      );
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'appeals.created',
          entityType: 'Appeal',
          entityId: 'appeal-1',
          actorId: 'user-1',
        }),
      );
      expect(result.id).toBe('appeal-1');
    });
  });

  describe('update()', () => {
    it('should update the appeal, log audit, and emit event', async () => {
      const previous = { ...fakeAppeal, status: 'SUBMITTED' };
      const updated = { ...fakeAppeal, status: 'UNDER_REVIEW' };

      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      const result = await appealsService.update('appeal-1', { status: 'UNDER_REVIEW' } as any, 'user-1', fakeReq);

      expect(mockedLogAudit).toHaveBeenCalledWith(
        'Appeal', 'appeal-1', 'UPDATE', 'user-1', previous, updated, fakeReq,
      );
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'appeals.updated',
          entityType: 'Appeal',
          entityId: 'appeal-1',
          actorId: 'user-1',
        }),
      );
      expect(result.status).toBe('UNDER_REVIEW');
    });

    it('should throw NotFoundError when updating a non-existent appeal', async () => {
      mockedRepo.getById.mockResolvedValue(null);

      await expect(appealsService.update('missing-id', { status: 'UPHELD' } as any, 'user-1', fakeReq))
        .rejects
        .toThrow(NotFoundError);

      expect(mockedRepo.update).not.toHaveBeenCalled();
    });

    it('should emit appeals.status_changed when status moves through a valid transition', async () => {
      const previous = { ...fakeAppeal, status: 'SUBMITTED' };
      const updated = { ...fakeAppeal, status: 'UNDER_REVIEW' };
      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await appealsService.update('appeal-1', { status: 'UNDER_REVIEW' } as any, 'user-1', fakeReq);

      const events = mockedEmitEvent.mock.calls.map((c) =>
        typeof c[0] === 'object' ? (c[0] as { event: string }).event : c[0],
      );
      expect(events).toContain('appeals.status_changed');
    });

    it('should reject an invalid appeal status transition', async () => {
      const previous = { ...fakeAppeal, status: 'SUBMITTED' };
      mockedRepo.getById.mockResolvedValue(previous as any);

      // SUBMITTED → HEARD is not a legal transition (must pass through
      // UNDER_REVIEW → HEARING_SCHEDULED first).
      await expect(
        appealsService.update('appeal-1', { status: 'HEARD' } as any, 'user-1', fakeReq),
      ).rejects.toThrow(/Invalid appeal status transition/);
      expect(mockedRepo.update).not.toHaveBeenCalled();
    });

    it('should not emit status_changed when no status supplied', async () => {
      const previous = { ...fakeAppeal, status: 'SUBMITTED' };
      const updated = { ...fakeAppeal, grounds: 'updated grounds text' };
      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await appealsService.update('appeal-1', { grounds: 'updated grounds text' } as any, 'user-1', fakeReq);

      const events = mockedEmitEvent.mock.calls.map((c) =>
        typeof c[0] === 'object' ? (c[0] as { event: string }).event : c[0],
      );
      expect(events).not.toContain('appeals.status_changed');
    });
  });

  describe('remove()', () => {
    it('should soft delete, log audit, and emit appeals.deleted event', async () => {
      mockedRepo.getById.mockResolvedValue(fakeAppeal as any);
      mockedRepo.softDelete.mockResolvedValue(undefined as any);

      await appealsService.remove('appeal-1', 'user-1', fakeReq);

      expect(mockedRepo.softDelete).toHaveBeenCalledWith('appeal-1');
      expect(mockedLogAudit).toHaveBeenCalledWith(
        'Appeal', 'appeal-1', 'DELETE', 'user-1', fakeAppeal, null, fakeReq,
      );
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'appeals.deleted',
          entityType: 'Appeal',
          entityId: 'appeal-1',
          data: expect.objectContaining({ status: 'DELETED' }),
        }),
      );
    });

    it('should throw NotFoundError if appeal does not exist before deletion', async () => {
      mockedRepo.getById.mockResolvedValue(null);

      await expect(appealsService.remove('missing-id', 'user-1', fakeReq))
        .rejects
        .toThrow(NotFoundError);

      expect(mockedRepo.softDelete).not.toHaveBeenCalled();
    });
  });
});
