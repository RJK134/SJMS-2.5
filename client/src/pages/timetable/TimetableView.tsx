import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useList } from '@/hooks/useApi';

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 08:00 - 18:00
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

interface TeachingSession {
  id: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  duration?: number;
  title?: string;
  eventType?: string;
  module?: { moduleCode: string; title: string };
  room?: { roomCode: string; building: string };
}

const EVENT_COLOURS: Record<string, string> = {
  LECTURE: 'bg-green-100 border-green-300',
  LAB: 'bg-blue-100 border-blue-300',
  SEMINAR: 'bg-amber-100 border-amber-300',
  TUTORIAL: 'bg-purple-100 border-purple-300',
  WORKSHOP: 'bg-pink-100 border-pink-300',
};

export default function TimetableView() {
  const [weekOffset, setWeekOffset] = useState(0);
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7);

  const { data, isLoading } = useList<TeachingSession>('timetable-sessions', '/v1/timetable/sessions', { limit: 100, sort: 'dayOfWeek', order: 'asc' });
  const sessions = data?.data ?? [];

  const parseHour = (time?: string) => {
    if (!time) return null;
    const parts = time.split(':');
    return parseInt(parts[0], 10);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Timetable" breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Timetable' }]}>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>This Week</Button>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Week of {weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="grid grid-cols-[80px_repeat(5,1fr)] min-w-[800px]">
              {/* Header */}
              <div className="border-b p-2" />
              {DAYS.map((day, di) => {
                const d = new Date(weekStart);
                d.setDate(weekStart.getDate() + di);
                return (
                  <div key={day} className="border-b border-l p-2 text-center">
                    <p className="font-semibold text-sm">{day}</p>
                    <p className="text-xs text-muted-foreground">{d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                  </div>
                );
              })}

              {/* Time slots */}
              {HOURS.map(hour => (
                <div key={`row-${hour}`} className="contents">
                  <div className="border-b p-2 text-xs text-muted-foreground text-right pr-3">
                    {String(hour).padStart(2, '0')}:00
                  </div>
                  {DAYS.map((_, di) => {
                    const event = sessions.find(s => s.dayOfWeek === di && parseHour(s.startTime) === hour);
                    const duration = event?.duration ?? 1;
                    const colour = EVENT_COLOURS[event?.eventType ?? ''] ?? 'bg-slate-100 border-slate-300';
                    return (
                      <div key={`${di}-${hour}`} className="border-b border-l relative min-h-[48px]">
                        {event && (
                          <div className={`absolute inset-x-1 top-1 rounded border p-1.5 ${colour} cursor-pointer hover:shadow-sm transition-shadow`}
                            style={{ height: `${duration * 48 - 8}px`, zIndex: 1 }}>
                            <p className="text-xs font-semibold truncate">{event.module ? `${event.module.moduleCode} — ${event.module.title}` : event.title}</p>
                            <p className="text-[10px] text-muted-foreground">{event.room ? `${event.room.roomCode}` : ''} {event.eventType ? `· ${event.eventType}` : ''}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {!isLoading && sessions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4 mt-4">No timetable sessions found. Sessions will appear here once they are scheduled.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
