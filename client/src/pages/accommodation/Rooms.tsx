import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Rooms() {
  return (
    <div className="space-y-6">
      <PageHeader title="Accommodation Rooms" breadcrumbs={[{label:'Admin',href:'/admin'},{label:'Accommodation'},{label:'Rooms'}]} />
      <Card><CardHeader><CardTitle>Room Management</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Individual room records — type, rent, contract length, availability, and occupancy status.</p></CardContent></Card>
    </div>
  );
}
