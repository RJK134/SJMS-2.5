import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentPlans() {
  return (
    <div className="space-y-6">
      <PageHeader title="Payment Plans" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Finance' }, { label: 'Payment Plans' }]} />
      <Card><CardHeader><CardTitle>Active Payment Plans</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">Manage instalment plans, track payments against schedule, and identify defaulting plans.</p></CardContent>
      </Card>
    </div>
  );
}
