import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FlagManagement() {
  return (
    <div className="space-y-6">
      <PageHeader title="Student Flags" breadcrumbs={[{ label: 'Staff', href: '/admin' },{label:'Support'},{label:'Flags'}]} />
      <Card><CardHeader><CardTitle>Active Student Flags</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Manage at-risk, Tier 4, debt, disciplinary, safeguarding, and wellbeing flags. Track resolution and escalation.</p></CardContent></Card>
    </div>
  );
}
