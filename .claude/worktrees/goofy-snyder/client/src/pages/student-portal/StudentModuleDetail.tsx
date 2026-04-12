import { useRoute } from 'wouter';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export default function StudentModuleDetail() { const [, params] = useRoute('/student/modules/:id'); return (<div className="space-y-6"><PageHeader title="Module Detail" subtitle={params?.id} breadcrumbs={[{ label: 'My Modules', href: '/student/modules' }, { label: params?.id ?? '' }]} /><Card><CardHeader><CardTitle>Assessments & Marks</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Your assessments, marks, feedback, and teaching events for this module.</p></CardContent></Card></div>); }
