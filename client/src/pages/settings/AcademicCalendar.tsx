import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AcademicCalendar() {
  return (
    <div className="space-y-6">
      <PageHeader title="Academic Calendar" breadcrumbs={[{label:'Admin',href:'/admin'},{label:'Settings'},{label:'Calendar'}]} />
      <Card><CardHeader><CardTitle>Academic Calendar 2025/26</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Manage term dates, exam periods, reading weeks, graduation ceremonies, bank holidays, and teaching weeks.</p></CardContent></Card>
    </div>
  );
}
