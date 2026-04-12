import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, ClipboardCheck, Users, AlertCircle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useList } from '@/hooks/useApi';

interface AcademicStats {
  modules: { total: number };
  pendingMarks: { total: number };
}

interface Assessment {
  id: string;
  title: string;
  dueDate?: string;
  module?: { moduleCode: string; title: string };
}

export default function AcademicDashboard() {
  const { user } = useAuth();

  const { data: statsData, isLoading: statsLoading, isError: statsError } = useQuery<{ success: boolean; data: AcademicStats }>({
    queryKey: ['dashboard-academic'],
    queryFn: async () => {
      const { data } = await api.get('/v1/reports/dashboard/academic');
      return data;
    },
  });

  const { data: assessments, isLoading: assessmentsLoading } = useList<Assessment>('academic-assessments', '/v1/assessments', { limit: 5, sort: 'dueDate', order: 'asc' });

  const stats = statsData?.data;

  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome, ${user?.firstName ?? 'Academic'}`} subtitle="Teaching Dashboard" />

      <div className="grid grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><div className="h-16 animate-pulse bg-muted rounded" /></CardContent></Card>
          ))
        ) : statsError ? (
          <Card className="col-span-4">
            <CardContent className="p-6 text-center text-destructive flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4" /> Unable to load dashboard statistics
            </CardContent>
          </Card>
        ) : (
          <>
            <StatCard label="Modules" value={stats?.modules.total ?? 0} icon={BookOpen} change="This term" />
            <StatCard label="Marks to Submit" value={stats?.pendingMarks.total ?? 0} icon={ClipboardCheck} changeType={stats?.pendingMarks.total ? 'negative' : 'positive'} change={stats?.pendingMarks.total ? 'Pending' : 'All submitted'} />
            <StatCard label="My Tutees" value="—" icon={Users} change="Not yet configured" />
            <StatCard label="Teaching Hours" value="—" change="Not yet configured" />
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Upcoming Deadlines</CardTitle></CardHeader>
          <CardContent>
            {assessmentsLoading ? (
              <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : (assessments?.data?.length ?? 0) > 0 ? (
              <div className="space-y-2 text-sm">
                {assessments!.data.map(a => (
                  <div key={a.id} className="flex justify-between">
                    <span>{a.module?.moduleCode ? `${a.module.moduleCode} — ` : ''}{a.title}</span>
                    <span className="text-muted-foreground">{a.dueDate ? `Due ${new Date(a.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : '—'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-2 text-center">No upcoming deadlines</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground py-2 text-center">Module marks, tutee meetings, and attendance records will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
