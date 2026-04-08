import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ExternalExaminers() {
  return (
    <div className="space-y-6">
      <PageHeader title="External Examiners" breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Assessment' }, { label: 'External Examiners' }]} />
      <Card>
        <CardHeader><CardTitle>External Examiner Appointments</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">Manage external examiner appointments, programme assignments, and annual reports.</p></CardContent>
      </Card>
    </div>
  );
}
