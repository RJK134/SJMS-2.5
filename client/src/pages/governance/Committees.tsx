import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Committees() {
  return (
    <div className="space-y-6">
      <PageHeader title="Committees" breadcrumbs={[{label:'Admin',href:'/admin'},{label:'Governance'},{label:'Committees'}]} />
      <Card><CardHeader><CardTitle>Committee Management</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Senate, academic board, faculty boards, exam boards, and quality committees. Members, terms of reference, and meeting schedules.</p></CardContent></Card>
    </div>
  );
}
