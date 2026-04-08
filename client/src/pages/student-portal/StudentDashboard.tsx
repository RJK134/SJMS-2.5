import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, GraduationCap, PoundSterling, ClipboardCheck, Calendar, Percent } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome, ${user?.firstName ?? 'Student'}`} subtitle="Student Dashboard" />
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Current Modules" value="4" icon={BookOpen} />
        <StatCard label="Attendance" value="92%" icon={Percent} changeType="positive" change="Above threshold" />
        <StatCard label="Upcoming Deadlines" value="3" icon={ClipboardCheck} changeType="negative" change="This month" />
        <StatCard label="Account Balance" value="£0.00" icon={PoundSterling} changeType="positive" change="Clear" />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>My Modules</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { code: 'CS5001', title: 'Data Structures & Algorithms', mark: '68%' },
              { code: 'CS5002', title: 'Software Design Patterns', mark: 'Pending' },
              { code: 'SE5001', title: 'Requirements Engineering', mark: '72%' },
              { code: 'CS4002', title: 'Computer Architecture', mark: '65%' },
            ].map(m => (
              <div key={m.code} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div><p className="font-medium text-sm">{m.code}</p><p className="text-xs text-muted-foreground">{m.title}</p></div>
                <span className="text-sm font-mono">{m.mark}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Upcoming Deadlines</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: 'CS5001 Coursework', due: '15 Jan 2026', type: 'COURSEWORK' },
              { title: 'SE5001 Group Presentation', due: '22 Jan 2026', type: 'PRESENTATION' },
              { title: 'CS5002 Portfolio', due: '30 Jan 2026', type: 'PORTFOLIO' },
            ].map((d, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div><p className="font-medium text-sm">{d.title}</p><p className="text-xs text-muted-foreground">Due: {d.due}</p></div>
                <StatusBadge status={d.type} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Announcements</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="border-b pb-2"><p className="font-medium">Term 2 Registration Open</p><p className="text-muted-foreground">Module registration for Term 2 is now open. Please register by 15 December.</p></div>
            <div><p className="font-medium">Library Extended Hours</p><p className="text-muted-foreground">The library will operate extended hours during the exam period: 08:00 — 23:00.</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
