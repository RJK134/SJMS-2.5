import logger from './logger';

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:5678';
const MAX_RETRIES = 3;

export async function emitEvent(eventType: string, payload: unknown): Promise<void> {
  fireWithRetry(eventType, payload, 0).catch(err => {
    logger.warn(`Webhook failed for ${eventType}`, { error: (err as Error).message });
  });
}

async function fireWithRetry(eventType: string, payload: unknown, attempt: number): Promise<void> {
  try {
    const res = await fetch(`${WEBHOOK_URL}/webhook/sjms`, {
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
