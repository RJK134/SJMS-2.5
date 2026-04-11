import type { Request, Response, NextFunction } from 'express';
import * as service from './reports.service';

export async function execute(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.execute(req.body as service.ReportRequest, req.user?.sub ?? 'system', req);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}
