import type { Request, Response, NextFunction } from 'express';
import * as service from './dashboard.service';

export async function staffStats(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getStaffStats();
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function studentDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const studentId = req.params.studentId;
    const data = await service.getStudentDashboard(studentId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function applicantDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const personId = req.params.personId;
    const data = await service.getApplicantDashboard(personId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function academicDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.sub ?? '';
    const data = await service.getAcademicDashboard(userId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function staffTutees(req: Request, res: Response, next: NextFunction) {
  try {
    const staffId = req.params.staffId;
    const result = await service.getStaffTutees(staffId, req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}
