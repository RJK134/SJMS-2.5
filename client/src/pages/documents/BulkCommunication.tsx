import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BulkCommunication() {
  return (
    <div className="space-y-6">
      <PageHeader title="Bulk Communication" breadcrumbs={[{label:'Admin',href:'/admin'},{label:'Communications'},{label:'Bulk'}]} />
      <Card><CardHeader><CardTitle>Bulk Messaging</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Send communications to cohorts, programmes, or custom recipient lists. Schedule sends and track delivery.</p></CardContent></Card>
    </div>
  );
}
