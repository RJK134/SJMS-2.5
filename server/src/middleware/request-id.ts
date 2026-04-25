import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { runWithRequestContext } from '../utils/request-context';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** UUID v4 attached by `requestId` middleware for correlation across logs, audit, and webhook payloads. */
      requestId?: string;
    }
  }
}

const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Correlation-ID middleware.
 *
 * - Reads an inbound `x-request-id` header if present (useful when the caller is
 *   already propagating an ID from an upstream gateway / trace)
 * - Otherwise mints a UUID v4
 * - Writes the value to `req.requestId` and echoes it on the response header
 *   so downstream systems and the client can correlate the same request.
 *
 * Mount this BEFORE Morgan + the per-request metrics timer so every log line
 * carries the ID.
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.get(REQUEST_ID_HEADER);
  const id = incoming && /^[\w.-]{1,128}$/.test(incoming) ? incoming : randomUUID();
  req.requestId = id;
  res.setHeader(REQUEST_ID_HEADER, id);
  runWithRequestContext({ requestId: id }, next);
}
