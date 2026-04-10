import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CommunicationLog() {
  return (
    <div className="space-y-6">
      <PageHeader title="Communication Log" breadcrumbs={[{ label: 'Staff', href: '/admin' },{label:'Communications'},{label:'Log'}]} />
      <Card><CardHeader><CardTitle>Communication History</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">View all sent communications — emails, SMS, portal messages, and letters with delivery status tracking.</p></CardContent></Card>
    </div>
  );
}
