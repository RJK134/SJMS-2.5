import { useRoute } from 'wouter';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export default function TuteeProfile() {
  const [, params] = useRoute('/academic/tutees/:studentId');
  return (<div className="space-y-6"><PageHeader title="Tutee Profile" subtitle={params?.studentId} breadcrumbs={[{ label: 'My Tutees', href: '/academic/tutees' }, { label: 'Profile' }]} /><Card><CardHeader><CardTitle>Academic Summary</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Limited tutee view — academic progress, attendance, support history, and wellbeing indicators.</p></CardContent></Card></div>);
}
