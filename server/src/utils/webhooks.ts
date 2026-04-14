import { createHmac } from 'crypto';
import logger from './logger';
import prisma from './prisma';

// ── Canonical webhook payload contract ──────────────────────────────────────
// All SJMS events MUST use this shape.

/** Structured webhook payload for n8n integration. */
export interface WebhookPayload {
  /** Event name, e.g. "enrolment.created" */
  event: string;
  /** Prisma model name, e.g. "Enrolment" */
  entityType: string;
  /** Primary key of the affected entity */
  entityId: string;
  /** Keycloak user ID (sub claim) of the actor who triggered the mutation */
  actorId: string;
  /** ISO 8601 UTC timestamp — auto-generated if omitted */
  timestamp?: string;
  /** Relevant fields only (never the full Prisma object) */
  data: Record<string, unknown>;
}

// ── Configuration ───────────────────────────────────────────────────────────
// WEBHOOK_BASE_URL is preferred; falls back to legacy WEBHOOK_URL for compat.
const WEBHOOK_BASE_URL =
  process.env.WEBHOOK_BASE_URL || process.env.WEBHOOK_URL || 'http://localhost:5678';
const rawWebhookSecret = process.env.WEBHOOK_SECRET?.trim();
const isDevelopmentLikeEnv =
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

if (!rawWebhookSecret && !isDevelopmentLikeEnv) {
  throw new Error(
    'WEBHOOK_SECRET must be configured for webhook signing outside development/test environments'
  );
}

const WEBHOOK_SECRET = rawWebhookSecret || '';
const MAX_RETRIES = 3;

// ── Event routing ───────────────────────────────────────────────────────────
// Every event maps to a unique n8n webhook path so that each workflow can
// listen on its own path without shared-path conflicts (resolves KI-P6-005).
// Exact event name is checked first; prefix-based fallback handles events
// that do not yet have a dedicated workflow.
const EVENT_ROUTES: Record<string, string> = {
  // ── Admissions (unique path per workflow) ──────────────────────────────
  'enquiry.created':                  '/webhook/sjms/enquiry/created',
  'application.created':              '/webhook/sjms/application/created',
  'application.status_changed':       '/webhook/sjms/application/status-changed',
  'application.offer_made':           '/webhook/sjms/offer/decision-made',
  'application.withdrawn':            '/webhook/sjms/application/withdrawn',
  'application.deleted':              '/webhook/sjms/application/deleted',

  // ── Enrolment ─────────────────────────────────────────────────────────
  'enrolment.created':                '/webhook/sjms/enrolment/created',
  'enrolment.updated':                '/webhook/sjms/enrolment/updated',
  'enrolment.status_changed':         '/webhook/sjms/enrolment/status-changed',
  'enrolment.withdrawn':              '/webhook/sjms/enrolment/withdrawn',

  // ── Assessment / Marks ────────────────────────────────────────────────
  'marks.submitted':                  '/webhook/sjms/marks/submitted',
  'marks.created':                    '/webhook/sjms/marks/created',
  'marks.moderated':                  '/webhook/sjms/marks/moderated',
  'marks.ratified':                   '/webhook/sjms/marks/ratified',
  'marks.released':                   '/webhook/sjms/marks/released',
  'marks.deleted':                    '/webhook/sjms/marks/deleted',

  // ── Exam boards ───────────────────────────────────────────────────────
  'exam_board.scheduled':             '/webhook/sjms/exam-board/scheduled',
  'exam_board.updated':               '/webhook/sjms/exam-board/updated',
  'exam_board.status_changed':        '/webhook/sjms/exam-board/status-changed',
  'exam_board.deleted':               '/webhook/sjms/exam-board/deleted',

  // ── UKVI ──────────────────────────────────────────────────────────────
  'ukvi.record_created':              '/webhook/sjms/ukvi/record-created',
  'ukvi.record_updated':              '/webhook/sjms/ukvi/record-updated',
  'ukvi.compliance_changed':          '/webhook/sjms/ukvi/compliance-changed',
  'ukvi.record_deleted':              '/webhook/sjms/ukvi/record-deleted',

  // ── Prefix-based fallback for domains without dedicated workflows ─────
  'finance':                          '/webhook/sjms/finance',
  'ec_claim':                         '/webhook/sjms/ec-claim',
  'document':                         '/webhook/sjms/document',
  'offer_condition':                  '/webhook/sjms/offer-condition',
  'module_registration':              '/webhook/sjms/module-registration',
  'support':                          '/webhook/sjms/support',
  'programme_approval':               '/webhook/sjms/programme-approval',
  'attendance':                       '/webhook/sjms/attendance',
};

function resolveWebhookPath(eventType: string): string {
  // Exact match first
  if (EVENT_ROUTES[eventType]) return EVENT_ROUTES[eventType];
  // Prefix match (e.g., 'application.created' -> 'application')
  const prefix = eventType.split('.')[0];
  if (EVENT_ROUTES[prefix]) return EVENT_ROUTES[prefix];
  // Fallback: general webhook
  return '/webhook/sjms';
}

/** HMAC-SHA256 signature of the JSON body using WEBHOOK_SECRET. */
function signPayload(body: string): string {
  return createHmac('sha256', WEBHOOK_SECRET).update(body).digest('hex');
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Fire-and-forget webhook event emitter.
 *
 * - Posts to WEBHOOK_BASE_URL with HMAC-SHA256 `x-webhook-signature` header
 * - Exponential-backoff retry: 3 retries (4 total attempts) with 1 s, 2 s, 4 s backoffs
 * - Logs to AuditLog on final delivery failure only (avoids success log spam)
 *
 * Accepts either:
 *   emitEvent({ event, entityType, entityId, actorId, data })  -- preferred
 *   emitEvent('event.name', { id, ... })                       -- legacy compat
 */
export function emitEvent(payload: WebhookPayload): void;
/** @deprecated Use the single WebhookPayload argument form. */
export function emitEvent(eventType: string, legacyData: unknown): void;
export function emitEvent(
  eventTypeOrPayload: string | WebhookPayload,
  legacyData?: unknown,
): void {
  let resolved: Required<WebhookPayload>;

  if (typeof eventTypeOrPayload === 'string') {
    // Legacy two-argument form — best-effort conversion for backward compat
    const raw = (legacyData && typeof legacyData === 'object' ? legacyData : {}) as Record<string, unknown>;
    resolved = {
      event: eventTypeOrPayload,
      entityType: eventTypeOrPayload.split('.')[0],
      entityId: String(raw.id ?? 'unknown'),
      actorId: 'system',
      timestamp: new Date().toISOString(),
      data: raw,
    };
  } else {
    resolved = {
      ...eventTypeOrPayload,
      timestamp: eventTypeOrPayload.timestamp || new Date().toISOString(),
    };
  }

  fireWithRetry(resolved, 0).catch((err) => {
    logger.error(`Webhook delivery failed for ${resolved.event} after ${MAX_RETRIES} retries`, {
      error: (err as Error).message,
      event: resolved.event,
      entityType: resolved.entityType,
      entityId: resolved.entityId,
    });
    // Persist failure to AuditLog for operational visibility
    logWebhookFailure(resolved, (err as Error).message).catch(() => {
      // Audit write must never propagate errors to the caller
    });
  });
}

// ── Internal helpers ────────────────────────────────────────────────────────

async function fireWithRetry(
  payload: Required<WebhookPayload>,
  attempt: number,
): Promise<void> {
  const path = resolveWebhookPath(payload.event);
  const body = JSON.stringify(payload);
  const signature = signPayload(body);

  try {
    const res = await fetch(`${WEBHOOK_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-signature': signature,
      },
      body,
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      if (attempt < MAX_RETRIES) {
        try {
          await res.body?.cancel();
        } catch {
          // Ignore body disposal errors and continue retry flow
        }
        // Exponential backoff: 2^0=1s, 2^1=2s, 2^2=4s
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
        return fireWithRetry(payload, attempt + 1);
      }
      let responseText = '';
      try {
        responseText = await res.text();
      } catch {
        // Ignore body read errors
      }
      throw new Error(
        responseText
          ? `Webhook returned ${res.status}: ${res.statusText} - ${responseText}`
          : `Webhook returned ${res.status}: ${res.statusText}`,
      );
    }
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
      return fireWithRetry(payload, attempt + 1);
    }
    throw err;
  }
}

/** Write a WebhookDelivery failure record to AuditLog. */
async function logWebhookFailure(
  payload: Required<WebhookPayload>,
  errorMessage: string,
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        entityType: 'WebhookDelivery',
        entityId: payload.entityId,
        action: 'CREATE',
        userId: payload.actorId !== 'system' ? payload.actorId : null,
        newData: {
          event: payload.event,
          targetEntityType: payload.entityType,
          error: errorMessage,
          failedAt: new Date().toISOString(),
        },
      },
    });
  } catch {
    // Audit write must never throw into the calling chain
  }
}
