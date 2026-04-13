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
// Each n8n workflow listens on its own path to avoid shared-path conflicts.
const EVENT_ROUTES: Record<string, string> = {
  'enrolment.created':        '/webhook/sjms/enrolments',
  'enrolment.updated':        '/webhook/sjms/enrolment-changes',
  'enrolment.status_changed': '/webhook/sjms/enrolment-changes',
  'enrolment.withdrawn':      '/webhook/sjms/enrolment-changes',
  'application':              '/webhook/sjms/applications',
  'marks':                    '/webhook/sjms/marks',
  'attendance':               '/webhook/sjms/attendance',
  'ukvi':                     '/webhook/sjms/ukvi',
  'finance':                  '/webhook/sjms/finance',
  'ec_claims':                '/webhook/sjms/ec-claims',
  'documents':                '/webhook/sjms/documents',
  'exam_boards':              '/webhook/sjms/exam-boards',
  'offers':                   '/webhook/sjms/offers',
  'module_registrations':     '/webhook/sjms/module-registrations',
  'support':                  '/webhook/sjms/support',
  'programme_approvals':      '/webhook/sjms/programme-approvals',
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
 * - Exponential-backoff retry: 3 attempts at 1 s, 2 s, 4 s
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
        // Exponential backoff: 2^0=1s, 2^1=2s, 2^2=4s
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
        return fireWithRetry(payload, attempt + 1);
      }
      throw new Error(`Webhook returned ${res.status}: ${res.statusText}`);
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
