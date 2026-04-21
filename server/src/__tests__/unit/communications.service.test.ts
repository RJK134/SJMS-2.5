import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundError } from '../../utils/errors';

// ── Mock dependencies before importing the service under test ──────────────
vi.mock('../../repositories/communicationTemplate.repository', () => ({
  list: vi.fn(),
  getById: vi.fn(),
  getByCode: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}));
vi.mock('../../repositories/communicationLog.repository', () => ({
  create: vi.fn(),
  updateStatus: vi.fn(),
}));
vi.mock('../../utils/audit', () => ({ logAudit: vi.fn() }));
vi.mock('../../utils/webhooks', () => ({ emitEvent: vi.fn() }));
vi.mock('../../utils/logger', () => ({
  default: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import * as commsService from '../../api/communications/communications.service';
import * as templateRepo from '../../repositories/communicationTemplate.repository';
import * as logRepo from '../../repositories/communicationLog.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';

const mockedTemplateRepo = vi.mocked(templateRepo);
const mockedLogRepo = vi.mocked(logRepo);
const mockedLogAudit = vi.mocked(logAudit);
const mockedEmitEvent = vi.mocked(emitEvent);

// ── Fixtures ───────────────────────────────────────────────────────────────
const fakeTemplate = {
  id: 'tmpl-1',
  templateCode: 'ENROL_CONFIRM',
  title: 'Enrolment Confirmation',
  subject: 'Your enrolment is confirmed',
  body: 'Dear {{name}}, your enrolment...',
  channel: 'EMAIL',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
};

const fakeLogEntry = {
  id: 'log-1',
  recipientId: 'person-1',
  recipientType: 'Person',
  templateId: 'tmpl-1',
  channel: 'EMAIL',
  subject: 'Your enrolment is confirmed',
  body: 'Dear Student, your enrolment...',
  deliveryStatus: 'PENDING',
  createdBy: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const fakeReq = { ip: '127.0.0.1', user: {}, get: vi.fn() } as any;

// ── Tests ──────────────────────────────────────────────────────────────────
describe('communications.service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // ── list() ──────────────────────────────────────────────────────────────
  describe('list()', () => {
    it('should return paginated communication template results', async () => {
      const paginatedResult = { data: [fakeTemplate], total: 1, nextCursor: null };
      mockedTemplateRepo.list.mockResolvedValue(paginatedResult);

      const result = await commsService.list({
        limit: 20,
        sort: 'createdAt',
        order: 'desc',
      });

      expect(mockedTemplateRepo.list).toHaveBeenCalledWith(
        { search: undefined, channel: undefined, isActive: undefined },
        { cursor: undefined, limit: 20, sort: 'createdAt', order: 'desc' },
      );
      expect(result).toEqual(paginatedResult);
    });

    it('should forward filter parameters to the repository', async () => {
      mockedTemplateRepo.list.mockResolvedValue({ data: [], total: 0, nextCursor: null });

      await commsService.list({
        limit: 10,
        sort: 'title',
        order: 'asc',
        channel: 'SMS',
        isActive: true,
        search: 'enrol',
      });

      expect(mockedTemplateRepo.list).toHaveBeenCalledWith(
        expect.objectContaining({ channel: 'SMS', isActive: true, search: 'enrol' }),
        expect.any(Object),
      );
    });
  });

  // ── getById() ───────────────────────────────────────────────────────────
  describe('getById()', () => {
    it('should return the template when found', async () => {
      mockedTemplateRepo.getById.mockResolvedValue(fakeTemplate as any);

      const result = await commsService.getById('tmpl-1');
      expect(result).toEqual(fakeTemplate);
      expect(mockedTemplateRepo.getById).toHaveBeenCalledWith('tmpl-1');
    });

    it('should throw NotFoundError when template does not exist', async () => {
      mockedTemplateRepo.getById.mockResolvedValue(null);

      await expect(commsService.getById('missing-id'))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  // ── create() ────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('should create a template, log audit, and emit event', async () => {
      const createData = {
        templateCode: 'ENROL_CONFIRM',
        title: 'Enrolment Confirmation',
        subject: 'Your enrolment is confirmed',
        body: 'Dear {{name}}, your enrolment...',
        channel: 'EMAIL',
      };
      mockedTemplateRepo.create.mockResolvedValue({ ...fakeTemplate, ...createData } as any);

      const result = await commsService.create(createData as any, 'user-1', fakeReq);

      expect(mockedTemplateRepo.create).toHaveBeenCalledWith(createData);
      expect(mockedLogAudit).toHaveBeenCalledWith(
        'CommunicationTemplate',
        'tmpl-1',
        'CREATE',
        'user-1',
        null,
        expect.objectContaining({ id: 'tmpl-1' }),
        fakeReq,
      );
      // Communications service uses the canonical WebhookPayload object form.
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'communications.created',
          entityType: 'CommunicationTemplate',
          entityId: 'tmpl-1',
          actorId: 'user-1',
        }),
      );
      expect(result.id).toBe('tmpl-1');
    });
  });

  // ── update() ────────────────────────────────────────────────────────────
  describe('update()', () => {
    it('should update a template, log audit, and emit event', async () => {
      const updated = { ...fakeTemplate, title: 'Updated Title' };

      mockedTemplateRepo.getById.mockResolvedValue(fakeTemplate as any);
      mockedTemplateRepo.update.mockResolvedValue(updated as any);

      const result = await commsService.update('tmpl-1', { title: 'Updated Title' } as any, 'user-1', fakeReq);

      expect(mockedLogAudit).toHaveBeenCalledWith(
        'CommunicationTemplate',
        'tmpl-1',
        'UPDATE',
        'user-1',
        fakeTemplate,
        updated,
        fakeReq,
      );
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'communications.updated',
          entityType: 'CommunicationTemplate',
          entityId: 'tmpl-1',
          actorId: 'user-1',
        }),
      );
      expect(result.title).toBe('Updated Title');
    });
  });

  // ── remove() ────────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('should soft delete, log audit, and emit communications.deleted', async () => {
      mockedTemplateRepo.getById.mockResolvedValue(fakeTemplate as any);
      mockedTemplateRepo.softDelete.mockResolvedValue(undefined as any);

      await commsService.remove('tmpl-1', 'user-1', fakeReq);

      expect(mockedTemplateRepo.softDelete).toHaveBeenCalledWith('tmpl-1');
      expect(mockedLogAudit).toHaveBeenCalledWith(
        'CommunicationTemplate',
        'tmpl-1',
        'DELETE',
        'user-1',
        fakeTemplate,
        null,
        fakeReq,
      );
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'communications.deleted',
          entityType: 'CommunicationTemplate',
          entityId: 'tmpl-1',
          actorId: 'user-1',
        }),
      );
    });

    it('should throw NotFoundError if template does not exist before deletion', async () => {
      mockedTemplateRepo.getById.mockResolvedValue(null);

      await expect(commsService.remove('missing-id', 'user-1', fakeReq))
        .rejects
        .toThrow(NotFoundError);

      expect(mockedTemplateRepo.softDelete).not.toHaveBeenCalled();
    });
  });

  // ── send() ──────────────────────────────────────────────────────────────
  describe('send()', () => {
    it('should resolve template, create log entry, and emit communication.sent', async () => {
      mockedTemplateRepo.getByCode.mockResolvedValue(fakeTemplate as any);
      mockedLogRepo.create.mockResolvedValue(fakeLogEntry as any);
      mockedLogRepo.updateStatus.mockResolvedValue(undefined as any);

      const result = await commsService.send(
        {
          templateKey: 'ENROL_CONFIRM',
          channel: 'EMAIL',
          recipientId: 'person-1',
          data: { name: 'Test Student' },
        },
        'user-1',
        fakeReq,
      );

      // 1. Template resolution
      expect(mockedTemplateRepo.getByCode).toHaveBeenCalledWith('ENROL_CONFIRM');

      // 2. Log entry creation with correct data
      expect(mockedLogRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: 'person-1',
          recipientType: 'Person',
          templateId: 'tmpl-1',
          channel: 'EMAIL',
          subject: 'Your enrolment is confirmed',
          deliveryStatus: 'PENDING',
          createdBy: 'user-1',
        }),
      );

      // 3. Audit log for CommunicationLog creation
      expect(mockedLogAudit).toHaveBeenCalledWith(
        'CommunicationLog',
        'log-1',
        'CREATE',
        'user-1',
        null,
        fakeLogEntry,
        fakeReq,
      );

      // 4. Status updated to SENT
      expect(mockedLogRepo.updateStatus).toHaveBeenCalledWith('log-1', 'SENT');

      // 5. Event emitted
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'communication.sent',
          entityType: 'CommunicationLog',
          entityId: 'log-1',
          data: expect.objectContaining({
            templateKey: 'ENROL_CONFIRM',
            channel: 'EMAIL',
            recipientId: 'person-1',
            deliveryStatus: 'SENT',
          }),
        }),
      );

      // 6. Returned object includes deliveryStatus
      expect(result.deliveryStatus).toBe('SENT');
    });

    it('should set recipientId to "bulk" and recipientType to "Bulk" when no recipientId provided', async () => {
      mockedTemplateRepo.getByCode.mockResolvedValue(fakeTemplate as any);
      mockedLogRepo.create.mockResolvedValue({ ...fakeLogEntry, recipientId: 'bulk', recipientType: 'Bulk' } as any);
      mockedLogRepo.updateStatus.mockResolvedValue(undefined as any);

      await commsService.send(
        { templateKey: 'ENROL_CONFIRM', channel: 'EMAIL' },
        'user-1',
        fakeReq,
      );

      expect(mockedLogRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: 'bulk',
          recipientType: 'Bulk',
        }),
      );
    });

    it('should use placeholder content when template is not found', async () => {
      mockedTemplateRepo.getByCode.mockResolvedValue(null);
      mockedLogRepo.create.mockResolvedValue({ ...fakeLogEntry, templateId: null } as any);
      mockedLogRepo.updateStatus.mockResolvedValue(undefined as any);

      await commsService.send(
        { templateKey: 'UNKNOWN_TPL', channel: 'SMS', recipientId: 'person-1' },
        'user-1',
        fakeReq,
      );

      expect(mockedLogRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          templateId: null,
          subject: '[UNKNOWN_TPL]',
          body: 'Template "UNKNOWN_TPL" — placeholder content',
        }),
      );
    });

    it('should emit communication.failed and update status to FAILED on delivery error', async () => {
      mockedTemplateRepo.getByCode.mockResolvedValue(fakeTemplate as any);
      mockedLogRepo.create.mockResolvedValue(fakeLogEntry as any);
      // Simulate delivery failure — updateStatus for SENT throws
      mockedLogRepo.updateStatus.mockImplementation(async (id: string, status: string) => {
        if (status === 'SENT') throw new Error('SMTP connection refused');
        return undefined as any;
      });

      const result = await commsService.send(
        { templateKey: 'ENROL_CONFIRM', channel: 'EMAIL', recipientId: 'person-1' },
        'user-1',
        fakeReq,
      );

      // Status update to FAILED should be called after the error
      expect(mockedLogRepo.updateStatus).toHaveBeenCalledWith('log-1', 'FAILED');

      // Event should be communication.failed
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'communication.failed',
          data: expect.objectContaining({ deliveryStatus: 'FAILED' }),
        }),
      );

      expect(result.deliveryStatus).toBe('FAILED');
    });
  });
});
