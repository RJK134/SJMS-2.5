import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentRecording() {
  return (
    <div className="space-y-6">
      <PageHeader title="Payment Recording" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Finance' }, { label: 'Payments' }]} />
      <Card><CardHeader><CardTitle>Record Payment</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">Record payments from students, SLC, sponsors, and other sources. Supports bank transfer, card, direct debit, and cash.</p></CardContent>
      </Card>
    </div>
  );
}
