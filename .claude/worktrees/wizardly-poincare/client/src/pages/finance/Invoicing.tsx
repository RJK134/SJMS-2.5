import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Send } from 'lucide-react';

export default function Invoicing() {
  return (
    <div className="space-y-6">
      <PageHeader title="Invoice Generation" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Finance' }, { label: 'Invoicing' }]}>
        <div className="flex gap-2">
          <Button variant="outline"><FileText className="h-4 w-4 mr-2" /> Generate Individual</Button>
          <Button><Send className="h-4 w-4 mr-2" /> Bulk Generate</Button>
        </div>
      </PageHeader>
      <Card><CardHeader><CardTitle>Invoice Queue</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">Select students or cohorts to generate invoices. Invoices can be sent individually or in bulk.</p></CardContent>
      </Card>
    </div>
  );
}
