import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomeOfficeReports() {
  return (
    <div className="space-y-6">
      <PageHeader title="Home Office Reports" breadcrumbs={[{label:'Admin',href:'/admin'},{label:'Compliance'},{label:'Reports'}]} />
      <Card><CardHeader><CardTitle>Home Office Reporting</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Generate and track reports to the Home Office — no-shows, withdrawals, suspensions, and non-compliance.</p></CardContent></Card>
    </div>
  );
}
