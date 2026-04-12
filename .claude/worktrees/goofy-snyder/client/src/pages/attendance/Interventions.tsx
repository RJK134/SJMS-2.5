import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Interventions() {
  return (
    <div className="space-y-6">
      <PageHeader title="Intervention Tracking" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Attendance' }, { label: 'Interventions' }]} />
      <Card>
        <CardHeader><CardTitle>Active Interventions</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">Track email, phone, meeting, and referral interventions for at-risk students. Record outcomes and escalations.</p></CardContent>
      </Card>
    </div>
  );
}
