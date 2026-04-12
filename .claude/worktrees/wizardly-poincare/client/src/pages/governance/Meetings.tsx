import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Meetings() {
  return (
    <div className="space-y-6">
      <PageHeader title="Meetings" breadcrumbs={[{ label: 'Staff', href: '/admin' },{label:'Governance'},{label:'Meetings'}]} />
      <Card><CardHeader><CardTitle>Meeting Management</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Schedule meetings, manage agendas, record minutes, and track action items.</p></CardContent></Card>
    </div>
  );
}
