import type { Request, Response, NextFunction } from 'express';
import * as service from './governance.service';

// ── Committee handlers ──────────────────────────────────────────────────

export async function listCommittees(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.listCommittees(req.query as unknown as service.GovernanceListQuery);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function getCommitteeById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getCommitteeById(req.params.id as string);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function createCommittee(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.createCommittee(req.body, req.user?.sub ?? 'system', req);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}

export async function updateCommittee(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.updateCommittee(req.params.id as string, req.body, req.user?.sub ?? 'system', req);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function removeCommittee(req: Request, res: Response, next: NextFunction) {
  try {
    await service.removeCommittee(req.params.id as string, req.user?.sub ?? 'system', req);
    res.status(204).send();
  } catch (err) { next(err); }
}

// ── Meeting handlers ────────────────────────────────────────────────────

export async function listMeetings(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.listMeetings(req.query as unknown as service.GovernanceListQuery);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function getMeetingById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getMeetingById(req.params.id as string);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function createMeeting(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.createMeeting(req.body, req.user?.sub ?? 'system', req);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}

export async function updateMeeting(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.updateMeeting(req.params.id as string, req.body, req.user?.sub ?? 'system', req);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

// ── Member handlers ─────────────────────────────────────────────────────

export async function addMember(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.addMember(req.body, req.user?.sub ?? 'system', req);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}

export async function removeMember(req: Request, res: Response, next: NextFunction) {
  try {
    await service.removeMember(req.params.id as string, req.user?.sub ?? 'system', req);
    res.status(204).send();
  } catch (err) { next(err); }
}
