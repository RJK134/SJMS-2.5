import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useList } from '@/hooks/useApi';
import { Loader2, AlertCircle, Calendar } from 'lucide-react';

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
 * scopeToUser('studentId') on the timetable router injects the student's
 * identity into the query. The server resolves studentId → moduleIds via
 * module-registrations and filters teaching events to those modules —
 * no client-side merge needed.
 *
 * If the student has no module registrations or no teaching events are
 * seeded, the empty state explains that sessions haven't been published yet.
 */
export default function StudentMyTimetable() {
  // scopeToUser middleware injects studentId server-side — the client
  // just requests sessions and the server scopes the response.
  const { data: sessionData, isLoading, isError } = useList<TeachingSession>(
    'student-timetable-sessions',
    '/v1/attendance/timetable/sessions',
    { limit: 100, sort: 'dayOfWeek', order: 'asc' },
  );

  const sessions = sessionData?.data ?? [];

  // Group by day of week
  const byDay = new Map<number | 'unscheduled', TeachingSession[]>();
  for (const s of sessions) {
    const key = typeof s.dayOfWeek === 'number' ? s.dayOfWeek : 'unscheduled';
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(s);
  }

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
      ) : sessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 0].map(day => {
            const daySessions = byDay.get(day) ?? [];
            if (daySessions.length === 0) return null;
            return (
              <Card key={day}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> {DAY_NAMES[day]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {daySessions.map(s => (
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
