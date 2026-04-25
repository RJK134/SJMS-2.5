import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundError } from '../../utils/errors';

// ── Mock dependencies before importing the service under test ──────────────
vi.mock('../../repositories/support.repository', () => ({
  list: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}));
vi.mock('../../utils/audit', () => ({ logAudit: vi.fn() }));
vi.mock('../../utils/webhooks', () => ({ emitEvent: vi.fn() }));

import * as supportService from '../../api/support/support.service';
import * as repo from '../../repositories/support.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';

const mockedRepo = vi.mocked(repo);
const mockedLogAudit = vi.mocked(logAudit);
const mockedEmitEvent = vi.mocked(emitEvent);

// ── Fixtures ───────────────────────────────────────────────────────────────
const fakeTicket = {
  id: 'ticket-1',
  studentId: 'stu-1',
  category: 'ACADEMIC',
  subject: 'Module registration issue',
  description: 'Cannot register for elective module',
  status: 'OPEN',
  priority: 'MEDIUM',
  assignedTo: null,
  resolvedDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
};

const fakeReq = { ip: '127.0.0.1', user: {}, get: vi.fn() } as any;

// ── Tests ──────────────────────────────────────────────────────────────────
describe('support.service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('list()', () => {
    it('should return paginated support ticket results', async () => {
      const paginatedResult = { data: [fakeTicket], total: 1, nextCursor: null };
      mockedRepo.list.mockResolvedValue(paginatedResult);

      const result = await supportService.list({
        limit: 20,
        sort: 'createdAt',
        order: 'desc',
      });

      expect(mockedRepo.list).toHaveBeenCalledWith(
        expect.objectContaining({ studentId: undefined, status: undefined, priority: undefined }),
        { cursor: undefined, limit: 20, sort: 'createdAt', order: 'desc' },
      );
      expect(result).toEqual(paginatedResult);
    });

    it('should forward filter parameters to the repository', async () => {
      mockedRepo.list.mockResolvedValue({ data: [], total: 0, nextCursor: null });

      await supportService.list({
        limit: 10,
        sort: 'createdAt',
        order: 'asc',
        studentId: 'stu-1',
        status: 'OPEN',
        priority: 'HIGH',
        category: 'ACADEMIC',
        assignedTo: 'staff-1',
      });

      expect(mockedRepo.list).toHaveBeenCalledWith(
        expect.objectContaining({
          studentId: 'stu-1',
          status: 'OPEN',
          priority: 'HIGH',
          category: 'ACADEMIC',
          assignedTo: 'staff-1',
        }),
        expect.any(Object),
      );
    });
  });

  describe('getById()', () => {
    it('should return the support ticket when found', async () => {
      mockedRepo.getById.mockResolvedValue(fakeTicket as any);

      const result = await supportService.getById('ticket-1');
      expect(result).toEqual(fakeTicket);
      expect(mockedRepo.getById).toHaveBeenCalledWith('ticket-1');
    });

    it('should throw NotFoundError when ticket does not exist', async () => {
      mockedRepo.getById.mockResolvedValue(null);

      await expect(supportService.getById('missing-id'))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('create()', () => {
    it('should create a support ticket, log audit, and emit event', async () => {
      const createData = {
        studentId: 'stu-1',
        category: 'ACADEMIC',
        subject: 'Module issue',
        priority: 'MEDIUM',
      };
      mockedRepo.create.mockResolvedValue({ ...fakeTicket, ...createData } as any);

      const result = await supportService.create(createData as any, 'user-1', fakeReq);

      expect(mockedRepo.create).toHaveBeenCalledWith(createData);
      expect(mockedLogAudit).toHaveBeenCalledWith(
        'SupportTicket', 'ticket-1', 'CREATE', 'user-1', null,
        expect.objectContaining({ id: 'ticket-1' }),
        fakeReq,
      );
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'support.ticket_created',
          entityType: 'SupportTicket',
          entityId: 'ticket-1',
          actorId: 'user-1',
        }),
      );
      expect(result.id).toBe('ticket-1');
    });
  });

  describe('update()', () => {
    it('should update the ticket, log audit when no status/assignment changes', async () => {
      const previous = { ...fakeTicket };
      const updated = { ...fakeTicket, subject: 'Updated subject' };

      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      const result = await supportService.update('ticket-1', { subject: 'Updated subject' } as any, 'user-1', fakeReq);

      expect(mockedLogAudit).toHaveBeenCalledWith(
        'SupportTicket', 'ticket-1', 'UPDATE', 'user-1', previous, updated, fakeReq,
      );
      expect(result.subject).toBe('Updated subject');
    });

    it('should emit support.ticket_assigned when assignedTo changes', async () => {
      const previous = { ...fakeTicket, assignedTo: null };
      const updated = { ...fakeTicket, assignedTo: 'staff-1' };

      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await supportService.update('ticket-1', { assignedTo: 'staff-1' } as any, 'user-1', fakeReq);

      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'support.ticket_assigned',
          data: expect.objectContaining({ assignedTo: 'staff-1' }),
        }),
      );
    });

    it('should NOT emit ticket_assigned when assignedTo is set to null', async () => {
      const previous = { ...fakeTicket, assignedTo: 'staff-1' };
      const updated = { ...fakeTicket, assignedTo: null };

      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await supportService.update('ticket-1', { assignedTo: null } as any, 'user-1', fakeReq);

      const emittedEvents = mockedEmitEvent.mock.calls.map((c) =>
        typeof c[0] === 'object' ? c[0].event : c[0],
      );
      expect(emittedEvents).not.toContain('support.ticket_assigned');
    });

    it('should emit support.ticket_resolved when status transitions to RESOLVED', async () => {
      const previous = { ...fakeTicket, status: 'OPEN' };
      const updated = { ...fakeTicket, status: 'RESOLVED', resolvedDate: new Date() };

      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await supportService.update('ticket-1', { status: 'RESOLVED' } as any, 'user-1', fakeReq);

      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'support.ticket_resolved',
          entityType: 'SupportTicket',
          entityId: 'ticket-1',
        }),
      );
    });

    it('should NOT emit ticket_resolved if already RESOLVED', async () => {
      const previous = { ...fakeTicket, status: 'RESOLVED' };
      const updated = { ...fakeTicket, status: 'RESOLVED' };

      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await supportService.update('ticket-1', { priority: 'LOW' } as any, 'user-1', fakeReq);

      const emittedEvents = mockedEmitEvent.mock.calls.map((c) =>
        typeof c[0] === 'object' ? c[0].event : c[0],
      );
      expect(emittedEvents).not.toContain('support.ticket_resolved');
    });
  });

  describe('remove()', () => {
    it('should soft delete, log audit, and emit support.ticket_deleted event', async () => {
      mockedRepo.getById.mockResolvedValue(fakeTicket as any);
      mockedRepo.softDelete.mockResolvedValue(undefined as any);

      await supportService.remove('ticket-1', 'user-1', fakeReq);

      expect(mockedRepo.softDelete).toHaveBeenCalledWith('ticket-1');
      expect(mockedLogAudit).toHaveBeenCalledWith(
        'SupportTicket', 'ticket-1', 'DELETE', 'user-1', fakeTicket, null, fakeReq,
      );
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'support.ticket_deleted',
          entityType: 'SupportTicket',
          entityId: 'ticket-1',
          data: expect.objectContaining({ status: 'DELETED' }),
        }),
      );
    });

    it('should throw NotFoundError if ticket does not exist before deletion', async () => {
      mockedRepo.getById.mockResolvedValue(null);

      await expect(supportService.remove('missing-id', 'user-1', fakeReq))
        .rejects
        .toThrow(NotFoundError);

      expect(mockedRepo.softDelete).not.toHaveBeenCalled();
    });
  });
});
