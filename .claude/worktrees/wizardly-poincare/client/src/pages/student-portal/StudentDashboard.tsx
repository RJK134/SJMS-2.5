import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, PoundSterling, ClipboardCheck, Calendar, Percent, AlertCircle, Loader2 } from 'lucide-react';
import { useList } from '@/hooks/useApi';

interface ModuleReg {
  id: string;
  status: string;
  module?: { moduleCode: string; title: string; credits: number };
}

interface Assessment {
  id: string;
  title: string;
  dueDate?: string;
  assessmentType?: string;
  module?: { moduleCode: string };
}

export default function StudentDashboard() {
  const { user } = useAuth();

  const { data: moduleRegs, isLoading: modsLoading } = useList<ModuleReg>('student-module-regs', '/v1/module-registrations', { limit: 10, status: 'REGISTERED' });
  const { data: assessments, isLoading: assessLoading } = useList<Assessment>('student-assessments', '/v1/assessments', { limit: 5, sort: 'dueDate', order: 'asc' });
  const { data: attendanceData } = useList<{ id: string; status: string }>('student-attendance', '/v1/attendance', { limit: 200 });

  const modules = moduleRegs?.data ?? [];
  const deadlines = assessments?.data ?? [];
  const attRecords = attendanceData?.data ?? [];
  const attPresent = attRecords.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
  const attRate = attRecords.length > 0 ? Math.round((attPresent / attRecords.length) * 100) : 0;

  const isLoading = modsLoading;

  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome, ${user?.firstName ?? 'Student'}`} subtitle="Student Dashboard" />

      <div className="grid grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><div className="h-16 animate-pulse bg-muted rounded" /></CardContent></Card>
          ))
        ) : (
          <>
            <StatCard label="Current Modules" value={modules.length} icon={BookOpen} />
            <StatCard label="Attendance" value={attRecords.length > 0 ? `${attRate}%` : '—'} icon={Percent} changeType={attRate >= 80 ? 'positive' : attRate > 0 ? 'negative' : 'neutral'} change={attRate >= 80 ? 'Above threshold' : attRecords.length > 0 ? 'Below threshold' : 'No records'} />
            <StatCard label="Upcoming Deadlines" value={deadlines.length} icon={ClipboardCheck} changeType={deadlines.length > 0 ? 'negative' : 'positive'} change={deadlines.length > 0 ? 'Due soon' : 'None pending'} />
            <StatCard label="Account Balance" value="—" icon={PoundSterling} change="View account" />
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>My Modules</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {modsLoading ? (
              <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : modules.length > 0 ? (
              modules.map(m => (
                <div key={m.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div><p className="font-medium text-sm">{m.module?.moduleCode}</p><p className="text-xs text-muted-foreground">{m.module?.title}</p></div>
                  <StatusBadge status={m.status} />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">No modules registered for the current term</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Upcoming Deadlines</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {assessLoading ? (
              <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : deadlines.length > 0 ? (
              deadlines.map(d => (
                <div key={d.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div><p className="font-medium text-sm">{d.module?.moduleCode ? `${d.module.moduleCode} — ` : ''}{d.title}</p><p className="text-xs text-muted-foreground">{d.dueDate ? `Due: ${new Date(d.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : '—'}</p></div>
                  {d.assessmentType && <StatusBadge status={d.assessmentType} />}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">No upcoming deadlines</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Announcements</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-2">No announcements at this time. Institutional notices will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
