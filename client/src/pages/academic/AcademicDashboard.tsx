import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, ClipboardCheck, Users, Calendar } from 'lucide-react';

export default function AcademicDashboard() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome, ${user?.firstName ?? 'Academic'}`} subtitle="Teaching Dashboard" />
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="My Modules" value="4" icon={BookOpen} change="This term" />
        <StatCard label="Marks to Submit" value="12" icon={ClipboardCheck} changeType="negative" change="Overdue" />
        <StatCard label="My Tutees" value="18" icon={Users} />
        <StatCard label="Teaching Hours" value="16" icon={Calendar} change="This week" />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle>Upcoming Deadlines</CardTitle></CardHeader><CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>CS4001 Coursework marks</span><span className="text-destructive font-medium">Due 15 Jan 2026</span></div>
            <div className="flex justify-between"><span>SE5001 Exam marks</span><span className="text-muted-foreground">Due 30 Jan 2026</span></div>
            <div className="flex justify-between"><span>CS6001 Project marks</span><span className="text-muted-foreground">Due 15 Feb 2026</span></div>
          </div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader><CardContent>
          <p className="text-sm text-muted-foreground">Module marks, tutee meetings, and attendance records will appear here.</p>
        </CardContent></Card>
      </div>
    </div>
  );
}
