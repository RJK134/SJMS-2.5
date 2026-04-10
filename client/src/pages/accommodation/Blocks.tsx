import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Blocks() {
  return (
    <div className="space-y-6">
      <PageHeader title="Accommodation Blocks" breadcrumbs={[{ label: 'Staff', href: '/admin' },{label:'Accommodation'},{label:'Blocks'}]} />
      <Card><CardHeader><CardTitle>Accommodation Blocks</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Manage accommodation blocks, facilities, room types, and contact information.</p></CardContent></Card>
    </div>
  );
}
