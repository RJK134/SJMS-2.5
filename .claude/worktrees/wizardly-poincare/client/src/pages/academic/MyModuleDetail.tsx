import { useRoute } from 'wouter';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MyModuleDetail() {
  const [, params] = useRoute('/academic/modules/:id');
  return (
    <div className="space-y-6">
      <PageHeader title="Module Detail" subtitle={params?.id} breadcrumbs={[{ label: 'My Modules', href: '/academic/modules' }, { label: params?.id ?? '' }]} />
      <Tabs defaultValue="students"><TabsList><TabsTrigger value="students">Students</TabsTrigger><TabsTrigger value="assessments">Assessments</TabsTrigger><TabsTrigger value="attendance">Attendance</TabsTrigger></TabsList>
        <TabsContent value="students"><Card><CardContent className="py-6"><p className="text-muted-foreground">Student list for this module loads from the API.</p></CardContent></Card></TabsContent>
        <TabsContent value="assessments"><Card><CardContent className="py-6"><p className="text-muted-foreground">Assessments and marks entry for this module.</p></CardContent></Card></TabsContent>
        <TabsContent value="attendance"><Card><CardContent className="py-6"><p className="text-muted-foreground">Attendance records for teaching events.</p></CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}
