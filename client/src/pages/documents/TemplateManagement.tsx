import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TemplateManagement() {
  return (
    <div className="space-y-6">
      <PageHeader title="Communication Templates" breadcrumbs={[{ label: 'Staff', href: '/admin' },{label:'Communications'},{label:'Templates'}]} />
      <Card><CardHeader><CardTitle>Templates</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Create and manage email, SMS, portal, and letter templates with variable substitution.</p></CardContent></Card>
    </div>
  );
}
