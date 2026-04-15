import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundError } from '../../utils/errors';

// ── Mock dependencies before importing the service under test ──────────────
vi.mock('../../repositories/ecClaim.repository', () => ({
  list: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}));
vi.mock('../../utils/audit', () => ({ logAudit: vi.fn() }));
vi.mock('../../utils/webhooks', () => ({ emitEvent: vi.fn() }));

import * as ecClaimsService from '../../api/ec-claims/ec-claims.service';
import * as repo from '../../repositories/ecClaim.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';

const mockedRepo = vi.mocked(repo);
const mockedLogAudit = vi.mocked(logAudit);
const mockedEmitEvent = vi.mocked(emitEvent);

// ── Fixtures ───────────────────────────────────────────────────────────────
const fakeClaim = {
  id: 'ec-1',
  studentId: 'stu-1',
  moduleRegistrationId: 'modreg-1',
  claimType: 'EXTENSION',
  reason: 'Medical emergency',
  status: 'SUBMITTED',
  decision: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
};

const fakeReq = { ip: '127.0.0.1', user: {}, get: vi.fn() } as any;

// ── Tests ──────────────────────────────────────────────────────────────────
describe('ec-claims.service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('list()', () => {
    it('should return paginated EC claim results', async () => {
      const paginatedResult = { data: [fakeClaim], total: 1, nextCursor: null };
      mockedRepo.list.mockResolvedValue(paginatedResult);

      const result = await ecClaimsService.list({
        limit: 20,
        sort: 'createdAt',
        order: 'desc',
      });

      expect(mockedRepo.list).toHaveBeenCalledWith(
        { studentId: undefined, status: undefined, claimType: undefined },
        { cursor: undefined, limit: 20, sort: 'createdAt', order: 'desc' },
      );
      expect(result).toEqual(paginatedResult);
    });

    it('should forward filter parameters to the repository', async () => {
      mockedRepo.list.mockResolvedValue({ data: [], total: 0, nextCursor: null });

      await ecClaimsService.list({
        limit: 10,
        sort: 'createdAt',
        order: 'asc',
        studentId: 'stu-1',
        status: 'SUBMITTED',
        claimType: 'EXTENSION',
      });

      expect(mockedRepo.list).toHaveBeenCalledWith(
        expect.objectContaining({ studentId: 'stu-1', status: 'SUBMITTED', claimType: 'EXTENSION' }),
        expect.any(Object),
      );
    });
  });

  describe('getById()', () => {
    it('should return the EC claim when found', async () => {
      mockedRepo.getById.mockResolvedValue(fakeClaim as any);

      const result = await ecClaimsService.getById('ec-1');
      expect(result).toEqual(fakeClaim);
      expect(mockedRepo.getById).toHaveBeenCalledWith('ec-1');
    });

    it('should throw NotFoundError when EC claim does not exist', async () => {
      mockedRepo.getById.mockResolvedValue(null);

      await expect(ecClaimsService.getById('missing-id'))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('create()', () => {
    it('should create an EC claim, log audit, and emit event', async () => {
      const createData = {
        studentId: 'stu-1',
        moduleRegistrationId: 'modreg-1',
        claimType: 'EXTENSION',
        reason: 'Medical emergency',
      };
      mockedRepo.create.mockResolvedValue({ ...fakeClaim, ...createData } as any);

      const result = await ecClaimsService.create(createData as any, 'user-1', fakeReq);

      expect(mockedRepo.create).toHaveBeenCalledWith(createData);
      expect(mockedLogAudit).toHaveBeenCalledWith(
        'ECClaim', 'ec-1', 'CREATE', 'user-1', null,
        expect.objectContaining({ id: 'ec-1' }),
        fakeReq,
      );
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'ec_claim.submitted',
          entityType: 'ECClaim',
          entityId: 'ec-1',
          actorId: 'user-1',
        }),
      );
      expect(result.id).toBe('ec-1');
    });
  });

  describe('update()', () => {
    it('should update the EC claim, log audit, and emit event', async () => {
      const previous = { ...fakeClaim, status: 'SUBMITTED' };
      const updated = { ...fakeClaim, status: 'SUBMITTED', reason: 'Updated reason' };

      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      const result = await ecClaimsService.update('ec-1', { reason: 'Updated reason' } as any, 'user-1', fakeReq);

      expect(mockedLogAudit).toHaveBeenCalledWith(
        'ECClaim', 'ec-1', 'UPDATE', 'user-1', previous, updated, fakeReq,
      );
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({ event: 'ec_claim.updated' }),
      );
      expect(result.reason).toBe('Updated reason');
    });

    it('should emit ec_claim.status_changed when status changes', async () => {
      const previous = { ...fakeClaim, status: 'SUBMITTED' };
      const updated = { ...fakeClaim, status: 'APPROVED', decision: 'APPROVED' };

      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await ecClaimsService.update('ec-1', { status: 'APPROVED', decision: 'APPROVED' } as any, 'user-1', fakeReq);

      const emittedEvents = mockedEmitEvent.mock.calls.map((c) =>
        typeof c[0] === 'object' ? c[0].event : c[0],
      );
      expect(emittedEvents).toContain('ec_claim.status_changed');
    });

    it('should NOT emit status_changed when status remains the same', async () => {
      const previous = { ...fakeClaim, status: 'SUBMITTED' };
      const updated = { ...fakeClaim, status: 'SUBMITTED' };

      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await ecClaimsService.update('ec-1', { reason: 'Minor edit' } as any, 'user-1', fakeReq);

      const emittedEvents = mockedEmitEvent.mock.calls.map((c) =>
        typeof c[0] === 'object' ? c[0].event : c[0],
      );
      expect(emittedEvents).not.toContain('ec_claim.status_changed');
    });
  });

  describe('remove()', () => {
    it('should soft delete, log audit, and emit ec_claim.deleted event', async () => {
      mockedRepo.getById.mockResolvedValue(fakeClaim as any);
      mockedRepo.softDelete.mockResolvedValue(undefined as any);

      await ecClaimsService.remove('ec-1', 'user-1', fakeReq);

      expect(mockedRepo.softDelete).toHaveBeenCalledWith('ec-1');
      expect(mockedLogAudit).toHaveBeenCalledWith(
        'ECClaim', 'ec-1', 'DELETE', 'user-1', fakeClaim, null, fakeReq,
      );
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'ec_claim.deleted',
          entityType: 'ECClaim',
          entityId: 'ec-1',
        }),
      );
    });

    it('should throw NotFoundError if EC claim does not exist before deletion', async () => {
      mockedRepo.getById.mockResolvedValue(null);

      await expect(ecClaimsService.remove('missing-id', 'user-1', fakeReq))
        .rejects
        .toThrow(NotFoundError);

      expect(mockedRepo.softDelete).not.toHaveBeenCalled();
    });
  });
});
