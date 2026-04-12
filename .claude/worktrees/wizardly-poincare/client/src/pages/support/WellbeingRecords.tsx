import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function WellbeingRecords() {
  return (
    <div className="space-y-6">
      <PageHeader title="Wellbeing" breadcrumbs={[{ label: 'Staff', href: '/admin' },{label:'Support'},{label:'Wellbeing'}]} />
      <Card><CardHeader><CardTitle>Wellbeing Referrals</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Wellbeing referrals, risk assessments, action plans, and support coordination.</p></CardContent></Card>
    </div>
  );
}
