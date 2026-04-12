import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Appeals() {
  return (
    <div className="space-y-6">
      <PageHeader title="Appeals" breadcrumbs={[{ label: 'Staff', href: '/admin' },{label:'EC & Appeals'},{label:'Appeals'}]} />
      <Card><CardHeader><CardTitle>Academic Appeals</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Assessment, progression, award, and disciplinary appeals management. Track hearings and outcomes.</p></CardContent></Card>
    </div>
  );
}
