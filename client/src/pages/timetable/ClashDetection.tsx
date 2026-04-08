import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function ClashDetection() {
  return (
    <div className="space-y-6">
      <PageHeader title="Clash Detection" breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Timetable' }, { label: 'Clashes' }]} />
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Clash Status</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Timetable clash detection scans for room, staff, and student group conflicts. Run detection to identify and resolve scheduling conflicts.</p>
        </CardContent>
      </Card>
    </div>
  );
}
