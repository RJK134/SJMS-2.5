import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContactPoints() {
  return (
    <div className="space-y-6">
      <PageHeader title="Contact Points" breadcrumbs={[{label:'Admin',href:'/admin'},{label:'Compliance'},{label:'Contact Points'}]} />
      <Card><CardHeader><CardTitle>Contact Point Schedule</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Schedule and track mandatory UKVI contact points — registration, attendance, and meeting verification.</p></CardContent></Card>
    </div>
  );
}
