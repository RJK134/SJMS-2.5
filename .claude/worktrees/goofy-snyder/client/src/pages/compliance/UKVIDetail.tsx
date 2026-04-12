import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UKVIDetail() {
  return (
    <div className="space-y-6">
      <PageHeader title="UKVI Student Detail" breadcrumbs={[{ label: 'Staff', href: '/admin' },{label:'Compliance',href:'/admin/compliance/ukvi'},{label:'Student'}]} />
      <Card><CardHeader><CardTitle>UKVI Record</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Detailed UKVI record — CAS, visa, BRP, sponsorship dates, contact points, and Home Office reports.</p></CardContent></Card>
    </div>
  );
}
