import type { Request, Response, NextFunction } from 'express';
import * as service from './calendar.service';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.list(req.query as unknown as service.CalendarListQuery);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}
