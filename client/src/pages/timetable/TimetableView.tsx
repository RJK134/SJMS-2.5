import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 08:00 - 18:00
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const SAMPLE_EVENTS = [
  { day: 0, startHour: 9, duration: 2, title: 'CS4001 — Intro to Programming', room: 'LAB-003', type: 'Lab', colour: 'bg-blue-100 border-blue-300' },
  { day: 0, startHour: 14, duration: 1, title: 'PH4001 — Classical Mechanics', room: 'LT-001', type: 'Lecture', colour: 'bg-green-100 border-green-300' },
  { day: 1, startHour: 10, duration: 2, title: 'BM4001 — Management Principles', room: 'SR-003', type: 'Seminar', colour: 'bg-amber-100 border-amber-300' },
  { day: 1, startHour: 15, duration: 1, title: 'LW4001 — Contract Law', room: 'SR-008', type: 'Lecture', colour: 'bg-purple-100 border-purple-300' },
  { day: 2, startHour: 9, duration: 1, title: 'SE4001 — Software Dev Fundamentals', room: 'LAB-004', type: 'Lab', colour: 'bg-blue-100 border-blue-300' },
  { day: 2, startHour: 11, duration: 2, title: 'MA4001 — Calculus', room: 'LT-002', type: 'Lecture', colour: 'bg-green-100 border-green-300' },
  { day: 3, startHour: 10, duration: 1, title: 'PS4001 — Intro to Psychology', room: 'LT-003', type: 'Lecture', colour: 'bg-pink-100 border-pink-300' },
  { day: 3, startHour: 13, duration: 2, title: 'CS4002 — Computer Architecture', room: 'LAB-003', type: 'Lab', colour: 'bg-blue-100 border-blue-300' },
  { day: 4, startHour: 9, duration: 1, title: 'EN4001 — Shakespeare', room: 'SR-004', type: 'Seminar', colour: 'bg-amber-100 border-amber-300' },
  { day: 4, startHour: 11, duration: 2, title: 'NU4001 — Nursing Fundamentals', room: 'LAB-005', type: 'Lab', colour: 'bg-red-100 border-red-300' },
];

export default function TimetableView() {
  const [weekOffset, setWeekOffset] = useState(0);
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7);

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
              <>
                <div key={`h-${hour}`} className="border-b p-2 text-xs text-muted-foreground text-right pr-3">
                  {String(hour).padStart(2, '0')}:00
                </div>
                {DAYS.map((_, di) => {
                  const event = SAMPLE_EVENTS.find(e => e.day === di && e.startHour === hour);
                  return (
                    <div key={`${di}-${hour}`} className="border-b border-l relative min-h-[48px]">
                      {event && (
                        <div className={`absolute inset-x-1 top-1 rounded border p-1.5 ${event.colour} cursor-pointer hover:shadow-sm transition-shadow`}
                          style={{ height: `${event.duration * 48 - 8}px`, zIndex: 1 }}>
                          <p className="text-xs font-semibold truncate">{event.title}</p>
                          <p className="text-[10px] text-muted-foreground">{event.room} · {event.type}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
