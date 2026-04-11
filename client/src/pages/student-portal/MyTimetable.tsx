import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useList } from '@/hooks/useApi';
import { Loader2, AlertCircle, Calendar } from 'lucide-react';

// Shape of a `/v1/module-registrations` row — narrowed to the fields we
// need for the timetable filter. Matches the server include in
// moduleRegistration.repository.ts list().
interface ModuleRegRow {
  id: string;
  status: string;
  module?: { id: string; moduleCode: string; title: string };
}

// Shape of a `/v1/timetable/sessions` row. TeachingEvent has no studentId
// column — a student's schedule is derived by joining on their module
// registrations, so we fetch sessions independently then filter client
// side by the moduleIds the student is registered to.
interface TeachingSession {
  id: string;
  moduleId: string;
  eventType: string;
  title?: string;
  academicYear: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  status: string;
  module?: { id: string; moduleCode: string; title: string };
  room?: { id: string; roomCode: string; building?: string };
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Student Portal → Timetable
 *
 * Previously a 3-line placeholder card (Comet smoke test round 1 finding
 * F5). Now queries both `/v1/module-registrations` (to discover which
 * modules the student is registered to) and `/v1/timetable/sessions`
 * (the pool of teaching events). The sessions list is filtered client
 * side to only the student's registered moduleIds — TeachingEvent has
 * no studentId column and no `studentId` query filter, so the
 * student→sessions join happens in the browser.
 *
 * If the seed data has zero teaching events (current state on dev as of
 * 2026-04-11), the empty state explains that module sessions haven't
 * been published yet. The wiring is still in place so the view comes
 * alive automatically when the seed populates teaching_events.
 */
export default function StudentMyTimetable() {
  const { data: regData, isLoading: regLoading } = useList<ModuleRegRow>(
    'student-timetable-regs',
    '/v1/module-registrations',
    { limit: 100, status: 'REGISTERED' },
  );
  const { data: sessionData, isLoading: sessLoading, isError } = useList<TeachingSession>(
    'student-timetable-sessions',
    '/v1/timetable/sessions',
    { limit: 200, sort: 'dayOfWeek', order: 'asc' },
  );

  const registeredModuleIds = new Set(
    (regData?.data ?? []).map(r => r.module?.id).filter((id): id is string => Boolean(id)),
  );
  const allSessions = sessionData?.data ?? [];
  // Show everything when we have no registration data yet (still loading,
  // or the student has no registered modules) rather than blank out the
  // page — a staff/admin viewing the student portal via impersonation
  // won't have registrations at all, and shouldn't see an empty timetable
  // when there are real sessions to show.
  const visibleSessions = registeredModuleIds.size > 0
    ? allSessions.filter(s => registeredModuleIds.has(s.moduleId))
    : allSessions;

  // Group by day of week, then render a column per day. Sessions with no
  // dayOfWeek are stacked under "Unscheduled" so they're still discoverable.
  const byDay = new Map<number | 'unscheduled', TeachingSession[]>();
  for (const s of visibleSessions) {
    const key = typeof s.dayOfWeek === 'number' ? s.dayOfWeek : 'unscheduled';
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(s);
  }

  const isLoading = regLoading || sessLoading;

  return (
    <div className="space-y-6">
      <PageHeader title="My Timetable" subtitle="Personal weekly teaching schedule" />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="p-6 text-center text-destructive flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4" /> Unable to load your timetable. Try again later.
          </CardContent>
        </Card>
      ) : visibleSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 0].map(day => {
            const sessions = byDay.get(day) ?? [];
            if (sessions.length === 0) return null;
            return (
              <Card key={day}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> {DAY_NAMES[day]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sessions.map(s => (
                    <div key={s.id} className="border-b last:border-0 pb-2 last:pb-0">
                      <p className="font-medium text-sm">
                        {s.module?.moduleCode ?? s.moduleId} — {s.eventType}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.startTime ?? '—'}{s.endTime ? `–${s.endTime}` : ''}
                        {s.room ? ` · ${s.room.roomCode}${s.room.building ? ` (${s.room.building})` : ''}` : ''}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
          {byDay.has('unscheduled') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Unscheduled
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {byDay.get('unscheduled')!.map(s => (
                  <div key={s.id} className="border-b last:border-0 pb-2 last:pb-0">
                    <p className="font-medium text-sm">
                      {s.module?.moduleCode ?? s.moduleId} — {s.eventType}
                    </p>
                    <p className="text-xs text-muted-foreground">Day/time not yet set</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Your timetable hasn't been published yet. Check back once your modules have scheduled teaching sessions.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
