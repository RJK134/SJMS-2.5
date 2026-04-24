import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundError } from '../../utils/errors';

// ── Mock dependencies before importing the service under test ──────────────
vi.mock('../../repositories/clearanceCheck.repository', () => ({
  list: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}));
vi.mock('../../utils/audit', () => ({ logAudit: vi.fn() }));
vi.mock('../../utils/webhooks', () => ({ emitEvent: vi.fn() }));

import * as service from '../../api/clearance-checks/clearance-checks.service';
import * as repo from '../../repositories/clearanceCheck.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';

const mockedRepo = vi.mocked(repo);
const mockedLogAudit = vi.mocked(logAudit);
const mockedEmitEvent = vi.mocked(emitEvent);

// ── Fixtures ───────────────────────────────────────────────────────────────
const fakeClearanceCheck = {
  id: 'chk-1',
  applicationId: 'app-1',
  checkType: 'DBS',
  status: 'PENDING',
  completedDate: null,
  expiryDate: null,
  reference: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
};

const fakeReq = { ip: '127.0.0.1', user: {}, get: vi.fn() } as any;

// ── Tests ──────────────────────────────────────────────────────────────────
describe('clearance-checks.service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getById()', () => {
    it('returns the clearance check when found', async () => {
      mockedRepo.getById.mockResolvedValue(fakeClearanceCheck as any);
      const result = await service.getById('chk-1');
      expect(result).toEqual(fakeClearanceCheck);
    });

    it('throws NotFoundError when the clearance check does not exist', async () => {
      mockedRepo.getById.mockResolvedValue(null);
      await expect(service.getById('missing-id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('create()', () => {
    it('creates a clearance check, logs audit, and emits clearance_checks.created', async () => {
      mockedRepo.create.mockResolvedValue(fakeClearanceCheck as any);

      const result = await service.create(
        {
          applicationId: 'app-1',
          checkType: 'DBS',
          status: 'PENDING',
        } as any,
        'user-42',
        fakeReq,
      );

      expect(mockedRepo.create).toHaveBeenCalledTimes(1);
      expect(mockedLogAudit).toHaveBeenCalledWith(
        'ClearanceCheck',
        'chk-1',
        'CREATE',
        'user-42',
        null,
        fakeClearanceCheck,
        fakeReq,
      );
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'clearance_checks.created',
          entityType: 'ClearanceCheck',
          entityId: 'chk-1',
          actorId: 'user-42',
          data: expect.objectContaining({
            applicationId: 'app-1',
            checkType: 'DBS',
            status: 'PENDING',
          }),
        }),
      );
      expect(result.id).toBe('chk-1');
    });
  });

  describe('update()', () => {
    it('emits clearance_checks.updated and clearance_checks.status_changed when status flips', async () => {
      const previous = { ...fakeClearanceCheck, status: 'PENDING' };
      const updated = { ...fakeClearanceCheck, status: 'CLEARED' };
      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await service.update('chk-1', { status: 'CLEARED' } as any, 'user-42', fakeReq);

      const emittedEvents = mockedEmitEvent.mock.calls.map((c) =>
        typeof c[0] === 'object' ? (c[0] as { event: string }).event : c[0],
      );
      expect(emittedEvents).toContain('clearance_checks.updated');
      expect(emittedEvents).toContain('clearance_checks.status_changed');

      const statusEvent = mockedEmitEvent.mock.calls.find(
        (c) =>
          typeof c[0] === 'object' &&
          (c[0] as { event: string }).event === 'clearance_checks.status_changed',
      )?.[0] as any;
      expect(statusEvent.data.previousStatus).toBe('PENDING');
      expect(statusEvent.data.newStatus).toBe('CLEARED');
    });

    it('does NOT emit status_changed when only metadata is updated', async () => {
      const previous = { ...fakeClearanceCheck, status: 'IN_PROGRESS', reference: 'old-ref' };
      const updated = { ...fakeClearanceCheck, status: 'IN_PROGRESS', reference: 'new-ref' };
      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await service.update('chk-1', { reference: 'new-ref' } as any, 'user-42', fakeReq);

      const emittedEvents = mockedEmitEvent.mock.calls.map((c) =>
        typeof c[0] === 'object' ? (c[0] as { event: string }).event : c[0],
      );
      expect(emittedEvents).toContain('clearance_checks.updated');
      expect(emittedEvents).not.toContain('clearance_checks.status_changed');
    });

    it('throws NotFoundError when updating a missing clearance check', async () => {
      mockedRepo.getById.mockResolvedValue(null);

      await expect(
        service.update('missing-id', { status: 'CLEARED' } as any, 'user-42', fakeReq),
      ).rejects.toThrow(NotFoundError);
      expect(mockedRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('remove()', () => {
    it('soft deletes, logs audit, and emits clearance_checks.deleted', async () => {
      mockedRepo.getById.mockResolvedValue(fakeClearanceCheck as any);
      mockedRepo.softDelete.mockResolvedValue(undefined as any);

      await service.remove('chk-1', 'user-42', fakeReq);

      expect(mockedRepo.softDelete).toHaveBeenCalledWith('chk-1');
      expect(mockedLogAudit).toHaveBeenCalledWith(
        'ClearanceCheck',
        'chk-1',
        'DELETE',
        'user-42',
        fakeClearanceCheck,
        null,
        fakeReq,
      );
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'clearance_checks.deleted',
          entityType: 'ClearanceCheck',
          entityId: 'chk-1',
          data: { applicationId: 'app-1' },
        }),
      );
    });

    it('throws NotFoundError if the clearance check does not exist before deletion', async () => {
      mockedRepo.getById.mockResolvedValue(null);

      await expect(service.remove('missing-id', 'user-42', fakeReq)).rejects.toThrow(NotFoundError);
      expect(mockedRepo.softDelete).not.toHaveBeenCalled();
    });
  });
});
