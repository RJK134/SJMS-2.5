import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Bursaries() {
  return (
    <div className="space-y-6">
      <PageHeader title="Bursary Management" breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Finance' }, { label: 'Bursaries' }]} />
      <Card><CardHeader><CardTitle>Bursary Funds</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">Manage bursary, scholarship, and hardship funds. Review applications, allocate awards, and track budgets.</p></CardContent>
      </Card>
    </div>
  );
}
