import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Refunds() {
  return (
    <div className="space-y-6">
      <PageHeader title="Refund Approvals" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Finance' }, { label: 'Refunds' }]} />
      <Card><CardHeader><CardTitle>Refund Queue</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">Review and approve refund requests. Track processing status and completion.</p></CardContent>
      </Card>
    </div>
  );
}
