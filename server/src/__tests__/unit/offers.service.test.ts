import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundError } from '../../utils/errors';

// ── Mock dependencies before importing the service under test ──────────────
vi.mock('../../repositories/offerCondition.repository', () => ({
  list: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}));
vi.mock('../../utils/audit', () => ({ logAudit: vi.fn() }));
vi.mock('../../utils/webhooks', () => ({ emitEvent: vi.fn() }));
vi.mock('../../api/applications/applications.service', () => ({
  evaluateOfferConditionsAndAutoPromote: vi.fn(),
}));

import * as offersService from '../../api/offers/offers.service';
import * as repo from '../../repositories/offerCondition.repository';
import * as applicationsService from '../../api/applications/applications.service';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';

const mockedRepo = vi.mocked(repo);
const mockedApplicationsService = vi.mocked(applicationsService);
const mockedLogAudit = vi.mocked(logAudit);
const mockedEmitEvent = vi.mocked(emitEvent);

// ── Fixtures ───────────────────────────────────────────────────────────────
const fakeCondition = {
  id: 'cond-1',
  applicationId: 'app-1',
  conditionType: 'ACADEMIC',
  description: 'A in Maths',
  targetGrade: 'A',
  status: 'PENDING',
  evidenceProvided: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
};

const fakeReq = { ip: '127.0.0.1', user: {}, get: vi.fn() } as any;

describe('offers.service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getById()', () => {
    it('returns the condition when it exists', async () => {
      mockedRepo.getById.mockResolvedValue(fakeCondition as any);
      const result = await offersService.getById('cond-1');
      expect(result).toEqual(fakeCondition);
    });

    it('throws NotFoundError when the condition does not exist', async () => {
      mockedRepo.getById.mockResolvedValue(null);
      await expect(offersService.getById('missing')).rejects.toThrow(NotFoundError);
    });
  });

  describe('create()', () => {
    it('creates, audits, emits offer_condition.created, and runs the auto-promote backstop', async () => {
      mockedRepo.create.mockResolvedValue(fakeCondition as any);

      await offersService.create(
        {
          applicationId: 'app-1',
          conditionType: 'ACADEMIC',
          description: 'A in Maths',
          status: 'PENDING',
        } as any,
        'user-42',
        fakeReq,
      );

      expect(mockedRepo.create).toHaveBeenCalledTimes(1);
      expect(mockedLogAudit).toHaveBeenCalledWith(
        'OfferCondition',
        'cond-1',
        'CREATE',
        'user-42',
        null,
        fakeCondition,
        fakeReq,
      );
      const emittedEvents = mockedEmitEvent.mock.calls.map((c) =>
        typeof c[0] === 'object' ? (c[0] as { event: string }).event : c[0],
      );
      expect(emittedEvents).toContain('offer_condition.created');
      expect(
        mockedApplicationsService.evaluateOfferConditionsAndAutoPromote,
      ).toHaveBeenCalledWith('app-1', 'user-42', fakeReq);
    });
  });

  describe('update()', () => {
    it('emits offer_condition.updated plus status_changed when status flips, then runs the backstop', async () => {
      const previous = { ...fakeCondition, status: 'PENDING' };
      const updated = { ...fakeCondition, status: 'MET' };
      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await offersService.update('cond-1', { status: 'MET' } as any, 'user-42', fakeReq);

      const emittedEvents = mockedEmitEvent.mock.calls.map((c) =>
        typeof c[0] === 'object' ? (c[0] as { event: string }).event : c[0],
      );
      expect(emittedEvents).toContain('offer_condition.updated');
      expect(emittedEvents).toContain('offer_condition.status_changed');
      expect(
        mockedApplicationsService.evaluateOfferConditionsAndAutoPromote,
      ).toHaveBeenCalledWith('app-1', 'user-42', fakeReq);
    });

    it('does not emit status_changed when status is unchanged, but still runs the backstop', async () => {
      const previous = { ...fakeCondition, status: 'MET', description: 'old' };
      const updated = { ...fakeCondition, status: 'MET', description: 'new' };
      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await offersService.update(
        'cond-1',
        { description: 'new' } as any,
        'user-42',
        fakeReq,
      );

      const emittedEvents = mockedEmitEvent.mock.calls.map((c) =>
        typeof c[0] === 'object' ? (c[0] as { event: string }).event : c[0],
      );
      expect(emittedEvents).toContain('offer_condition.updated');
      expect(emittedEvents).not.toContain('offer_condition.status_changed');
      // Backstop still fires — a description-only edit that follows a
      // prior status flip in a different condition row must not leave
      // promotion dangling.
      expect(
        mockedApplicationsService.evaluateOfferConditionsAndAutoPromote,
      ).toHaveBeenCalledWith('app-1', 'user-42', fakeReq);
    });
  });

  describe('remove()', () => {
    it('soft-deletes, audits, emits offer_condition.deleted, and runs the backstop', async () => {
      mockedRepo.getById.mockResolvedValue(fakeCondition as any);
      mockedRepo.softDelete.mockResolvedValue(undefined as any);

      await offersService.remove('cond-1', 'user-42', fakeReq);

      expect(mockedRepo.softDelete).toHaveBeenCalledWith('cond-1');
      expect(mockedLogAudit).toHaveBeenCalledWith(
        'OfferCondition',
        'cond-1',
        'DELETE',
        'user-42',
        fakeCondition,
        null,
        fakeReq,
      );
      const emittedEvents = mockedEmitEvent.mock.calls.map((c) =>
        typeof c[0] === 'object' ? (c[0] as { event: string }).event : c[0],
      );
      expect(emittedEvents).toContain('offer_condition.deleted');
      expect(
        mockedApplicationsService.evaluateOfferConditionsAndAutoPromote,
      ).toHaveBeenCalledWith('app-1', 'user-42', fakeReq);
    });
  });
});
