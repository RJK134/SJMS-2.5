import type { Request, Response, NextFunction } from 'express';
import * as service from './applications.service';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.list(req.query as unknown as service.ApplicationListQuery);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const data = await service.getById(id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.create(req.body, req.user?.sub ?? 'system', req);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const data = await service.update(id, req.body, req.user?.sub ?? 'system', req);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    await service.remove(id, req.user?.sub ?? 'system', req);
    res.status(204).send();
  } catch (err) { next(err); }
}

/**
 * POST /applications/:id/convert
 *
 * Converts an accepted application (FIRM or UNCONDITIONAL_OFFER) into a live
 * Student record and initial Enrolment. The operation is idempotent: calling
 * it twice for the same application returns the existing student/enrolment
 * rather than creating duplicates.
 */
export async function convert(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const result = await service.convertToStudent(
      id,
      req.body as service.ConversionInput,
      req.user?.sub ?? 'system',
      req,
    );
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
}
