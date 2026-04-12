import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, CheckCircle, Calendar, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { useList } from '@/hooks/useApi';

interface Application {
  id: string;
  status: string;
  academicYear: string;
  entryRoute: string;
  programme?: { title: string; programmeCode: string };
  offers?: Array<{ id: string; status: string }>;
}

export default function ApplicantDashboard() {
  const { user } = useAuth();

  const { data, isLoading, isError } = useList<Application>('my-applications', '/v1/applications', { limit: 1, sort: 'createdAt', order: 'desc' });

  const application = data?.data?.[0];
  const pendingConditions = application?.offers?.filter(o => o.status === 'CONDITIONAL')?.length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome, ${user?.firstName ?? 'Applicant'}`} subtitle="Application Portal" />

      <div className="grid grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><div className="h-16 animate-pulse bg-muted rounded" /></CardContent></Card>
          ))
        ) : isError ? (
          <Card className="col-span-4">
            <CardContent className="p-6 text-center text-destructive flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4" /> Unable to load application data
            </CardContent>
          </Card>
        ) : (
          <>
            <StatCard label="Application Status" value={application?.status?.replace(/_/g, ' ') ?? 'None'} icon={FileText} />
            <StatCard label="Conditions" value={pendingConditions > 0 ? `${pendingConditions} pending` : 'None'} icon={CheckCircle} changeType={pendingConditions > 0 ? 'neutral' : 'positive'} />
            <StatCard label="Next Event" value="—" icon={Calendar} change="No events scheduled" />
            <StatCard label="Messages" value="—" icon={Mail} change="No unread messages" />
          </>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle>My Application</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : application ? (
            <>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Programme</span><span>{application.programme?.title ?? '—'}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Academic Year</span><span>{application.academicYear}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Route</span><span>{application.entryRoute?.replace(/_/g, ' ')}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Status</span><StatusBadge status={application.status} /></div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No application found. Submit an application to get started.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
