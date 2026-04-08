import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PersonalTutoring() {
  return (
    <div className="space-y-6">
      <PageHeader title="Personal Tutoring" breadcrumbs={[{label:'Admin',href:'/admin'},{label:'Support'},{label:'Personal Tutoring'}]} />
      <Card><CardHeader><CardTitle>Tutoring Records</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Personal tutor meeting records, action items, and review scheduling.</p></CardContent></Card>
    </div>
  );
}
