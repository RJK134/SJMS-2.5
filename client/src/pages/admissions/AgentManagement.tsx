import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AgentManagement() {
  return (
    <div className="space-y-6">
      <PageHeader title="Agent Management" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Admissions' }, { label: 'Agents' }]} />
      <Card>
        <CardHeader><CardTitle>Recruitment Agents</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">Agent management interface — commission tracking, territory assignments, and application referrals.</p></CardContent>
      </Card>
    </div>
  );
}
