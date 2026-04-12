import logger from './logger';

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:5678';
const MAX_RETRIES = 3;

// Maps event type prefixes to dedicated n8n webhook paths.
// Each workflow listens on its own path to avoid n8n's shared-path conflict.
const EVENT_ROUTES: Record<string, string> = {
  'enrolments.created': '/webhook/sjms/enrolments',
  'enrolments.updated': '/webhook/sjms/enrolment-changes',
  'enrolments.deleted': '/webhook/sjms/enrolment-changes',
  'applications': '/webhook/sjms/applications',
  'marks': '/webhook/sjms/marks',
  'attendance': '/webhook/sjms/attendance',
  'ukvi': '/webhook/sjms/ukvi',
  'finance': '/webhook/sjms/finance',
  'ec_claims': '/webhook/sjms/ec-claims',
  'documents': '/webhook/sjms/documents',
  'exam_boards': '/webhook/sjms/exam-boards',
  'offers': '/webhook/sjms/offers',
  'module_registrations': '/webhook/sjms/module-registrations',
  'support': '/webhook/sjms/support',
  'programme_approvals': '/webhook/sjms/programme-approvals',
};

function resolveWebhookPath(eventType: string): string {
  // Exact match first
  if (EVENT_ROUTES[eventType]) return EVENT_ROUTES[eventType];
  // Prefix match (e.g., 'applications.created' → 'applications')
  const prefix = eventType.split('.')[0];
  if (EVENT_ROUTES[prefix]) return EVENT_ROUTES[prefix];
  // Fallback: general webhook
  return '/webhook/sjms';
}

export async function emitEvent(eventType: string, payload: unknown): Promise<void> {
  fireWithRetry(eventType, payload, 0).catch(err => {
    logger.warn(`Webhook failed for ${eventType}`, { error: (err as Error).message });
  });
}

async function fireWithRetry(eventType: string, payload: unknown, attempt: number): Promise<void> {
  const path = resolveWebhookPath(eventType);
  try {
    const res = await fetch(`${WEBHOOK_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: eventType, timestamp: new Date().toISOString(), data: payload }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok && attempt < MAX_RETRIES) {
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
      return fireWithRetry(eventType, payload, attempt + 1);
    }
  } catch {
    if (attempt < MAX_RETRIES) {
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
      return fireWithRetry(eventType, payload, attempt + 1);
    }
  }
}
