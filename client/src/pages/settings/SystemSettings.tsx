import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SystemSettings() {
  return (
    <div className="space-y-6">
      <PageHeader title="System Settings" breadcrumbs={[{ label: 'Staff', href: '/admin' },{label:'Settings'},{label:'System'}]} />
      <Card><CardHeader><CardTitle>System Configuration</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Institution-wide settings — default academic year, fee rates, retention policies, email configuration, and integration endpoints.</p></CardContent></Card>
    </div>
  );
}
