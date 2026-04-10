import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AcademicYears() {
  return (
    <div className="space-y-6">
      <PageHeader title="Academic Years" breadcrumbs={[{ label: 'Staff', href: '/admin' },{label:'Settings'},{label:'Academic Years'}]} />
      <Card><CardHeader><CardTitle>Academic Year Configuration</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Configure academic years — start/end dates, enrolment windows, and current year designation.</p></CardContent></Card>
    </div>
  );
}
