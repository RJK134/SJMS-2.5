import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AcademicMisconduct() {
  return (
    <div className="space-y-6">
      <PageHeader title="Academic Misconduct" breadcrumbs={[{label:'Admin',href:'/admin'},{label:'EC & Appeals'},{label:'Misconduct'}]} />
      <Card><CardHeader><CardTitle>Plagiarism & Disciplinary Cases</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Manage academic misconduct investigations, hearings, penalties, and appeal tracking.</p></CardContent></Card>
    </div>
  );
}
