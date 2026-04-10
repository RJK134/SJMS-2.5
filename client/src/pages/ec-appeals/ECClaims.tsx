import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ECClaims() {
  return (
    <div className="space-y-6">
      <PageHeader title="EC Claims" breadcrumbs={[{ label: 'Staff', href: '/admin' },{label:'EC & Appeals'},{label:'EC Claims'}]} />
      <Card><CardHeader><CardTitle>Extenuating Circumstances Claims</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Manage EC claim submissions, evidence review, panel decisions, and outcome notifications.</p></CardContent></Card>
    </div>
  );
}
