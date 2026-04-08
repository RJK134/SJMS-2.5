import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, CheckCircle, Calendar, Mail } from 'lucide-react';

export default function ApplicantDashboard() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome, ${user?.firstName ?? 'Applicant'}`} subtitle="Application Portal" />
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Application Status" value="Submitted" icon={FileText} />
        <StatCard label="Conditions" value="2 pending" icon={CheckCircle} changeType="neutral" />
        <StatCard label="Next Event" value="Open Day" icon={Calendar} change="15 Jan 2026" />
        <StatCard label="Messages" value="1 unread" icon={Mail} />
      </div>
      <Card>
        <CardHeader><CardTitle>My Application</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Programme</span><span>BSc (Hons) Computer Science</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Academic Year</span><span>2026/27</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Route</span><span>UCAS</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Status</span><StatusBadge status="SUBMITTED" /></div>
        </CardContent>
      </Card>
    </div>
  );
}
