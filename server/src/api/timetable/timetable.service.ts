import * as repo from '../../repositories/teachingEvent.repository';
import { NotFoundError } from '../../utils/errors';

export interface TimetableListQuery {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  moduleId?: string;
  staffId?: string;
  roomId?: string;
  dayOfWeek?: number;
  academicYear?: string;
  status?: string;
}

export async function listSessions(query: TimetableListQuery) {
  const { page, limit, sort, order, search, moduleId, staffId, roomId, dayOfWeek, academicYear, status } = query;
  return repo.listSessions(
    { search, moduleId, staffId, roomId, dayOfWeek, academicYear, status },
    { page, limit, skip: (page - 1) * limit, sort, order },
  );
}

export async function getSessionById(id: string) {
  const result = await repo.getSessionById(id);
  if (!result) throw new NotFoundError('TeachingEvent', id);
  return result;
}
