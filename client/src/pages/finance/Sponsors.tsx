import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Sponsors() {
  return (
    <div className="space-y-6">
      <PageHeader title="Sponsor Agreements" breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Finance' }, { label: 'Sponsors' }]} />
      <Card><CardHeader><CardTitle>Sponsor Agreements</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">Manage SLC, employer, government, charity, and embassy sponsorship agreements. Track amounts agreed vs received.</p></CardContent>
      </Card>
    </div>
  );
}
