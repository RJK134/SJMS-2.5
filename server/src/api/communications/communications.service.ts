import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/communicationTemplate.repository';
import * as logRepo from '../../repositories/communicationLog.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';
import logger from '../../utils/logger';

export interface CommunicationListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  channel?: string;
  isActive?: boolean;
}

export async function list(query: CommunicationListQuery) {
  const { cursor, limit, sort, order, search, channel, isActive } = query;
  return repo.list(
    { search, channel, isActive },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('CommunicationTemplate', id);
  return result;
}

export async function create(data: Prisma.CommunicationTemplateUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('CommunicationTemplate', result.id, 'CREATE', userId, null, result, req);
  emitEvent({
    event: 'communications.created',
    entityType: 'CommunicationTemplate',
    entityId: result.id,
    actorId: userId,
    data: {
      templateCode: (result as { templateCode?: string }).templateCode ?? null,
      channel: (result as { channel?: string }).channel ?? null,
      isActive: (result as { isActive?: boolean }).isActive ?? null,
    },
  });
  return result;
}

export async function update(id: string, data: Prisma.CommunicationTemplateUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('CommunicationTemplate', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'communications.updated',
    entityType: 'CommunicationTemplate',
    entityId: id,
    actorId: userId,
    data: {
      templateCode: (result as { templateCode?: string }).templateCode ?? null,
      channel: (result as { channel?: string }).channel ?? null,
      isActive: (result as { isActive?: boolean }).isActive ?? null,
    },
  });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('CommunicationTemplate', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'communications.deleted',
    entityType: 'CommunicationTemplate',
    entityId: id,
    actorId: userId,
    data: { templateCode: (previous as { templateCode?: string }).templateCode ?? null },
  });
}

// ── Send endpoint (workflow-facing) ─────────────────────────────────────

export interface SendRequest {
  templateKey: string;
  channel: 'EMAIL' | 'SMS' | 'PORTAL' | 'LETTER' | 'PUSH';
  recipientId?: string;
  data?: Record<string, unknown>;
  bulk?: boolean;
}

/**
 * Queue a communication for delivery. Creates a CommunicationLog record
 * with status PENDING, then attempts to resolve the template and deliver.
 *
 * This is the endpoint n8n workflows call to send notifications.
 */
export async function send(input: SendRequest, userId: string, req: Request) {
  // 1. Resolve template by exact templateCode match (not fuzzy search)
  const template = await repo.getByCode(input.templateKey);

  // 2. Create delivery log
  const logEntry = await logRepo.create({
    recipientId: input.recipientId ?? 'bulk',
    recipientType: input.recipientId ? 'Person' : 'Bulk',
    templateId: template?.id ?? null,
    channel: input.channel,
    subject: template?.subject ?? `[${input.templateKey}]`,
    body: template?.body ?? `Template "${input.templateKey}" — placeholder content`,
    deliveryStatus: 'PENDING',
    createdBy: userId,
  });

  await logAudit('CommunicationLog', logEntry.id, 'CREATE', userId, null, logEntry, req);

  // 3. Attempt delivery (placeholder — actual SMTP/SMS integration in Phase 8)
  let deliveryStatus: 'SENT' | 'FAILED' = 'SENT';
  try {
    // TODO(Phase 8): Wire actual email/SMS delivery via SMTP_* env vars
    // Use structured logging (Winston meta object) so user-controlled values
    // are field values, not free-form strings interpolated into the log line.
    // Fixes CodeQL js/log-injection.
    logger.info('Communication queued', {
      channel: input.channel,
      recipientId: input.recipientId,
      templateKey: input.templateKey,
    });
    await logRepo.updateStatus(logEntry.id, 'SENT');
  } catch (err) {
    deliveryStatus = 'FAILED';
    const e = err as Error;
    logger.error('Communication delivery failed', { errorMessage: e.message, errorName: e.name });
    await logRepo.updateStatus(logEntry.id, 'FAILED');
  }

  emitEvent({
    event: deliveryStatus === 'SENT' ? 'communication.sent' : 'communication.failed',
    entityType: 'CommunicationLog',
    entityId: logEntry.id,
    actorId: userId,
    data: {
      templateKey: input.templateKey,
      channel: input.channel,
      recipientId: input.recipientId,
      deliveryStatus,
    },
  });

  // Return the log entry with current delivery status
  return { ...logEntry, deliveryStatus };
}
