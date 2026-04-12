import * as repo from '../../repositories/teachingEvent.repository';
import * as modRegRepo from '../../repositories/moduleRegistration.repository';
import { NotFoundError } from '../../utils/errors';

export interface TimetableListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  studentId?: string;
  moduleId?: string;
  staffId?: string;
  roomId?: string;
  dayOfWeek?: number;
  academicYear?: string;
  status?: string;
}

export async function listSessions(query: TimetableListQuery) {
  const { cursor, limit, sort, order, search, studentId, moduleId, staffId, roomId, dayOfWeek, academicYear, status } = query;

  // If studentId is provided, resolve their registered moduleIds server-side
  // so the client doesn't need a two-step fetch + client-side merge.
  let resolvedModuleIds: string[] | undefined;
  if (studentId) {
    const regs = await modRegRepo.list(
      { studentId },
      { limit: 200, sort: 'createdAt', order: 'desc' },
    );
    resolvedModuleIds = regs.data.map((r: any) => r.moduleId).filter(Boolean);
    if (resolvedModuleIds.length === 0) {
      // Student has no module registrations — return empty result
      return { data: [], pagination: { limit, total: 0, hasNext: false, nextCursor: null } };
    }
  }

  return repo.listSessions(
    { search, moduleId, moduleIds: resolvedModuleIds, staffId, roomId, dayOfWeek, academicYear, status },
    { cursor, limit, sort, order },
  );
}

export async function getSessionById(id: string) {
  const result = await repo.getSessionById(id);
  if (!result) throw new NotFoundError('TeachingEvent', id);
  return result;
}
