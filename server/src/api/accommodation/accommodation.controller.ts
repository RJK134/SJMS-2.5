import type { Request, Response, NextFunction } from 'express';
import * as service from './accommodation.service';

// ── Block handlers ───────────────────────────────────────────────────────

export async function listBlocks(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.listBlocks(req.query as unknown as service.AccommodationListQuery);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function getBlockById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getBlockById(req.params.id as string);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function createBlock(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.createBlock(req.body, req.user?.sub ?? 'system', req);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}

export async function updateBlock(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.updateBlock(req.params.id as string, req.body, req.user?.sub ?? 'system', req);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function removeBlock(req: Request, res: Response, next: NextFunction) {
  try {
    await service.removeBlock(req.params.id as string, req.user?.sub ?? 'system', req);
    res.status(204).send();
  } catch (err) { next(err); }
}

// ── Room handlers ────────────────────────────────────────────────────────

export async function listRooms(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.listRooms(req.query as unknown as service.AccommodationListQuery);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function getRoomById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getRoomById(req.params.id as string);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function createRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.createRoom(req.body, req.user?.sub ?? 'system', req);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}

export async function updateRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.updateRoom(req.params.id as string, req.body, req.user?.sub ?? 'system', req);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function removeRoom(req: Request, res: Response, next: NextFunction) {
  try {
    await service.removeRoom(req.params.id as string, req.user?.sub ?? 'system', req);
    res.status(204).send();
  } catch (err) { next(err); }
}

// ── Booking handlers ─────────────────────────────────────────────────────

export async function listBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.listBookings(req.query as unknown as service.AccommodationListQuery);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function getBookingById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getBookingById(req.params.id as string);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function createBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.createBooking(req.body, req.user?.sub ?? 'system', req);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}

export async function updateBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.updateBooking(req.params.id as string, req.body, req.user?.sub ?? 'system', req);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function removeBooking(req: Request, res: Response, next: NextFunction) {
  try {
    await service.removeBooking(req.params.id as string, req.user?.sub ?? 'system', req);
    res.status(204).send();
  } catch (err) { next(err); }
}
