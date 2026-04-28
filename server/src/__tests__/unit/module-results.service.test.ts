import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundError, ValidationError } from '../../utils/errors';

// ── Mock dependencies before importing the service under test ──────────────
vi.mock('../../repositories/moduleResult.repository', () => ({
  list: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}));
vi.mock('../../repositories/assessmentAttempt.repository', () => ({
  countNonConfirmedByModuleRegistration: vi.fn(),
}));
vi.mock('../../utils/audit', () => ({ logAudit: vi.fn() }));
vi.mock('../../utils/webhooks', () => ({ emitEvent: vi.fn() }));

import * as moduleResultsService from '../../api/module-results/module-results.service';
import * as repo from '../../repositories/moduleResult.repository';
import * as attemptRepo from '../../repositories/assessmentAttempt.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';

const mockedRepo = vi.mocked(repo);
const mockedAttemptRepo = vi.mocked(attemptRepo);
const mockedLogAudit = vi.mocked(logAudit);
const mockedEmitEvent = vi.mocked(emitEvent);

// ── Fixtures ───────────────────────────────────────────────────────────────
const fakeModuleResult = {
  id: 'mr-1',
  moduleRegistrationId: 'modreg-1',
  moduleId: 'mod-1',
  academicYear: '2025/26',
  aggregateMark: null,
  grade: null,
  classification: null,
  status: 'PROVISIONAL',
  confirmedDate: null,
  confirmedBy: null,
  boardId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
};

const fakeReq = { ip: '127.0.0.1', user: {}, get: vi.fn() } as any;

const events = () => mockedEmitEvent.mock.calls.map((c) => (typeof c[0] === 'object' ? c[0] : null));

// ── Tests ──────────────────────────────────────────────────────────────────
describe('module-results.service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Default cross-entity check: every attempt is already CONFIRMED.
    mockedAttemptRepo.countNonConfirmedByModuleRegistration.mockResolvedValue(0);
  });

  describe('getById()', () => {
    it('returns the module result when found', async () => {
      mockedRepo.getById.mockResolvedValue(fakeModuleResult as any);
      await expect(moduleResultsService.getById('mr-1')).resolves.toEqual(fakeModuleResult);
    });

    it('throws NotFoundError when missing', async () => {
      mockedRepo.getById.mockResolvedValue(null);
      await expect(moduleResultsService.getById('missing')).rejects.toThrow(NotFoundError);
    });
  });

  describe('create()', () => {
    it('creates, audits, and emits module_results.created', async () => {
      mockedRepo.create.mockResolvedValue(fakeModuleResult as any);

      await moduleResultsService.create(
        { moduleRegistrationId: 'modreg-1', moduleId: 'mod-1', academicYear: '2025/26' } as any,
        'user-1',
        fakeReq,
      );

      expect(mockedLogAudit).toHaveBeenCalledWith(
        'ModuleResult',
        'mr-1',
        'CREATE',
        'user-1',
        null,
        expect.objectContaining({ id: 'mr-1' }),
        fakeReq,
      );
      const created = events().find((e) => e?.event === 'module_results.created');
      expect(created).toBeDefined();
    });
  });

  // ── Phase 17B — lifecycle state machine ──────────────────────────────────
  // Canonical ModuleResultStatus transition graph:
  //   PROVISIONAL → CONFIRMED, REFERRED, DEFERRED
  //   CONFIRMED   → REFERRED                    (post-confirmation referral)
  //   REFERRED    → PROVISIONAL                  (resit cycle)
  //   DEFERRED    → PROVISIONAL                  (deferred submission cycle)
  describe('lifecycle state machine', () => {
    type Edge = { from: string; to: string };
    const validEdges: Edge[] = [
      { from: 'PROVISIONAL', to: 'CONFIRMED' },
      { from: 'PROVISIONAL', to: 'REFERRED' },
      { from: 'PROVISIONAL', to: 'DEFERRED' },
      { from: 'CONFIRMED', to: 'REFERRED' },
      { from: 'REFERRED', to: 'PROVISIONAL' },
      { from: 'DEFERRED', to: 'PROVISIONAL' },
    ];

    for (const edge of validEdges) {
      it(`allows valid ${edge.from} → ${edge.to} and emits status_changed`, async () => {
        const previous = { ...fakeModuleResult, status: edge.from };
        const updated = { ...fakeModuleResult, status: edge.to };
        mockedRepo.getById.mockResolvedValue(previous as any);
        mockedRepo.update.mockResolvedValue(updated as any);

        await moduleResultsService.update('mr-1', { status: edge.to } as any, 'user-1', fakeReq);

        const sc = events().find((e) => e?.event === 'module_results.status_changed');
        expect(sc).toBeDefined();
        expect(sc?.data).toEqual(
          expect.objectContaining({ previousStatus: edge.from, newStatus: edge.to }),
        );
      });
    }

    const invalidEdges: Edge[] = [
      { from: 'CONFIRMED', to: 'PROVISIONAL' },     // cannot un-confirm directly
      { from: 'CONFIRMED', to: 'DEFERRED' },        // cannot defer once confirmed
      { from: 'REFERRED', to: 'CONFIRMED' },        // resit must re-enter via PROVISIONAL
      { from: 'DEFERRED', to: 'CONFIRMED' },        // deferred must re-enter via PROVISIONAL
    ];

    for (const edge of invalidEdges) {
      it(`rejects invalid ${edge.from} → ${edge.to} with ValidationError`, async () => {
        const previous = { ...fakeModuleResult, status: edge.from };
        mockedRepo.getById.mockResolvedValue(previous as any);

        await expect(
          moduleResultsService.update('mr-1', { status: edge.to } as any, 'user-1', fakeReq),
        ).rejects.toThrow(ValidationError);

        expect(mockedRepo.update).not.toHaveBeenCalled();
      });
    }

    it('skips the guard when no status field is supplied', async () => {
      const previous = { ...fakeModuleResult, status: 'CONFIRMED' };
      const updated = { ...fakeModuleResult, status: 'CONFIRMED', aggregateMark: 65 };
      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      // aggregateMark-only update must succeed even though CONFIRMED only
      // has one outgoing edge.
      await expect(
        moduleResultsService.update('mr-1', { aggregateMark: 65 } as any, 'user-1', fakeReq),
      ).resolves.toBeDefined();

      const eventNames = events().map((e) => e?.event);
      expect(eventNames).not.toContain('module_results.status_changed');
    });

    it('skips the guard when status is supplied but unchanged', async () => {
      const previous = { ...fakeModuleResult, status: 'PROVISIONAL' };
      const updated = { ...fakeModuleResult, status: 'PROVISIONAL' };
      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await expect(
        moduleResultsService.update('mr-1', { status: 'PROVISIONAL' } as any, 'user-1', fakeReq),
      ).resolves.toBeDefined();

      const eventNames = events().map((e) => e?.event);
      expect(eventNames).not.toContain('module_results.status_changed');
    });
  });

  // ── Phase 17B — cross-entity guard ───────────────────────────────────────
  describe('cross-entity guard (assessment attempts must be CONFIRMED before ratify)', () => {
    it('rejects PROVISIONAL → CONFIRMED when at least one attempt is non-CONFIRMED', async () => {
      const previous = { ...fakeModuleResult, status: 'PROVISIONAL' };
      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedAttemptRepo.countNonConfirmedByModuleRegistration.mockResolvedValue(2);

      await expect(
        moduleResultsService.update('mr-1', { status: 'CONFIRMED' } as any, 'user-1', fakeReq),
      ).rejects.toThrow(/non-CONFIRMED AssessmentAttempt/);

      expect(mockedAttemptRepo.countNonConfirmedByModuleRegistration).toHaveBeenCalledWith('modreg-1');
      expect(mockedRepo.update).not.toHaveBeenCalled();
    });

    it('allows PROVISIONAL → CONFIRMED when every attempt is CONFIRMED (count = 0)', async () => {
      const previous = { ...fakeModuleResult, status: 'PROVISIONAL' };
      const updated = { ...fakeModuleResult, status: 'CONFIRMED' };
      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);
      mockedAttemptRepo.countNonConfirmedByModuleRegistration.mockResolvedValue(0);

      await expect(
        moduleResultsService.update('mr-1', { status: 'CONFIRMED' } as any, 'user-1', fakeReq),
      ).resolves.toEqual(updated);

      expect(mockedRepo.update).toHaveBeenCalled();
    });

    it('does not run the cross-entity check on non-CONFIRMED transitions', async () => {
      const previous = { ...fakeModuleResult, status: 'PROVISIONAL' };
      const updated = { ...fakeModuleResult, status: 'REFERRED' };
      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await moduleResultsService.update('mr-1', { status: 'REFERRED' } as any, 'user-1', fakeReq);

      // The expensive count query must not run when we are not heading
      // into CONFIRMED — protects PROVISIONAL → REFERRED / DEFERRED hot paths.
      expect(mockedAttemptRepo.countNonConfirmedByModuleRegistration).not.toHaveBeenCalled();
    });

    it('does not run the cross-entity check on CONFIRMED → REFERRED (post-confirmation referral)', async () => {
      const previous = { ...fakeModuleResult, status: 'CONFIRMED' };
      const updated = { ...fakeModuleResult, status: 'REFERRED' };
      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await moduleResultsService.update('mr-1', { status: 'REFERRED' } as any, 'user-1', fakeReq);

      expect(mockedAttemptRepo.countNonConfirmedByModuleRegistration).not.toHaveBeenCalled();
    });
  });

  // ── Phase 17B — module_results.ratified additive event ───────────────────
  describe('module_results.ratified emission', () => {
    it('emits module_results.ratified on PROVISIONAL → CONFIRMED', async () => {
      const previous = { ...fakeModuleResult, status: 'PROVISIONAL' };
      const updated = { ...fakeModuleResult, status: 'CONFIRMED' };
      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await moduleResultsService.update('mr-1', { status: 'CONFIRMED' } as any, 'user-1', fakeReq);

      const ratified = events().find((e) => e?.event === 'module_results.ratified');
      expect(ratified).toBeDefined();
      expect(ratified?.data).toEqual(
        expect.objectContaining({ previousStatus: 'PROVISIONAL', newStatus: 'CONFIRMED' }),
      );
    });

    it('does NOT emit module_results.ratified on REFERRED → PROVISIONAL', async () => {
      const previous = { ...fakeModuleResult, status: 'REFERRED' };
      const updated = { ...fakeModuleResult, status: 'PROVISIONAL' };
      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await moduleResultsService.update('mr-1', { status: 'PROVISIONAL' } as any, 'user-1', fakeReq);

      const eventNames = events().map((e) => e?.event);
      expect(eventNames).not.toContain('module_results.ratified');
    });

    it('does NOT emit module_results.ratified on CONFIRMED → REFERRED', async () => {
      const previous = { ...fakeModuleResult, status: 'CONFIRMED' };
      const updated = { ...fakeModuleResult, status: 'REFERRED' };
      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await moduleResultsService.update('mr-1', { status: 'REFERRED' } as any, 'user-1', fakeReq);

      const eventNames = events().map((e) => e?.event);
      expect(eventNames).not.toContain('module_results.ratified');
    });
  });

  describe('remove()', () => {
    it('soft deletes, audits, emits module_results.deleted', async () => {
      mockedRepo.getById.mockResolvedValue(fakeModuleResult as any);
      await moduleResultsService.remove('mr-1', 'user-1', fakeReq);
      expect(mockedRepo.softDelete).toHaveBeenCalledWith('mr-1');
      const deleted = events().find((e) => e?.event === 'module_results.deleted');
      expect(deleted).toBeDefined();
    });

    it('throws NotFoundError when missing', async () => {
      mockedRepo.getById.mockResolvedValue(null);
      await expect(moduleResultsService.remove('missing', 'user-1', fakeReq)).rejects.toThrow(NotFoundError);
      expect(mockedRepo.softDelete).not.toHaveBeenCalled();
    });
  });
});
