import { useRoute } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import StatCard from '@/components/shared/StatCard';
import { useDetail } from '@/hooks/useApi';
import type { Module } from '@/types/api';

export default function ModuleDetail() {
  const [, params] = useRoute('/admin/modules/:id');
  const { data, isLoading } = useDetail<Module>('modules', '/v1/modules', params?.id);
  const mod = data?.data;

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!mod) return <div className="text-center py-12 text-muted-foreground">Module not found</div>;

  return (
    <div className="space-y-6">
      <PageHeader title={mod.title} subtitle={mod.moduleCode}
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Modules', href: '/admin/modules' }, { label: mod.moduleCode }]}>
        <StatusBadge status={mod.status} />
      </PageHeader>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Module Code" value={mod.moduleCode} />
        <StatCard label="Credits" value={mod.credits} />
        <StatCard label="Level" value={mod.level} />
        <StatCard label="Semester" value={mod.semester ?? '—'} />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader><CardTitle>Module Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Department:</span> <span className="ml-2">{mod.department?.title ?? '—'}</span></div>
              <div><span className="text-muted-foreground">Status:</span> <span className="ml-2">{mod.status}</span></div>
              <div><span className="text-muted-foreground">Credits:</span> <span className="ml-2">{mod.credits}</span></div>
              <div><span className="text-muted-foreground">Level:</span> <span className="ml-2">{mod.level}</span></div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="assessments"><Card><CardContent className="py-8 text-center text-muted-foreground">Assessment data loads from the assessments API</CardContent></Card></TabsContent>
        <TabsContent value="students"><Card><CardContent className="py-8 text-center text-muted-foreground">Student registrations load from the module-registrations API</CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}
