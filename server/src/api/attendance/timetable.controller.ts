import type { Request, Response, NextFunction } from 'express';
import * as service from './timetable.service';

export async function listSessions(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.listSessions(req.query as unknown as service.TimetableListQuery);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function getSessionById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : '';
    const data = await service.getSessionById(id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}
