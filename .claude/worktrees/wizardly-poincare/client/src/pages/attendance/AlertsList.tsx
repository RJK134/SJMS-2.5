import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function AlertsList() {
  return (
    <div className="space-y-6">
      <PageHeader title="Attendance Alerts" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Attendance' }, { label: 'Alerts' }]} />
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" /> Active Alerts</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">Attendance alerts requiring action — low attendance, consecutive absences, Tier 4 compliance risks.</p></CardContent>
      </Card>
    </div>
  );
}
