import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DisabilityRecords() {
  return (
    <div className="space-y-6">
      <PageHeader title="Disability Support" breadcrumbs={[{label:'Admin',href:'/admin'},{label:'Support'},{label:'Disability'}]} />
      <Card><CardHeader><CardTitle>Disability Records & Adjustments</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Disability registrations, reasonable adjustments, DSA funding, and review scheduling.</p></CardContent></Card>
    </div>
  );
}
