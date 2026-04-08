import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Bookings() {
  return (
    <div className="space-y-6">
      <PageHeader title="Accommodation Bookings" breadcrumbs={[{label:'Admin',href:'/admin'},{label:'Accommodation'},{label:'Bookings'}]} />
      <Card><CardHeader><CardTitle>Booking Management</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Student accommodation bookings — applications, offers, acceptances, and vacancy management.</p></CardContent></Card>
    </div>
  );
}
