import type { Request, Response, NextFunction } from 'express';
import * as service from './audit-logs.service';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.list(req.query as unknown as service.AuditLogListQuery);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}
