import { useRoute } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import StatCard from '@/components/shared/StatCard';
import { useDetail, useList } from '@/hooks/useApi';
import type { Programme, Enrolment } from '@/types/api';

export default function ProgrammeDetail() {
  const [, params] = useRoute('/admin/programmes/:id');
  const { data, isLoading } = useDetail<Programme>('programmes', '/v1/programmes', params?.id);
  const { data: enrolments } = useList<Enrolment>('prog-enrolments', '/v1/enrolments', { programmeId: params?.id, limit: 50 });
  const prog = data?.data;

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!prog) return <div className="text-center py-12 text-muted-foreground">Programme not found</div>;

  return (
    <div className="space-y-6">
      <PageHeader title={prog.title} subtitle={prog.programmeCode}
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Programmes', href: '/admin/programmes' }, { label: prog.programmeCode }]}>
        <StatusBadge status={prog.status} />
      </PageHeader>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Level" value={prog.level.replace('LEVEL_', '')} />
        <StatCard label="Credits" value={prog.creditTotal} />
        <StatCard label="Duration" value={`${prog.duration} year${prog.duration > 1 ? 's' : ''}`} />
        <StatCard label="Enrolled" value={enrolments?.pagination?.total ?? 0} />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader><CardTitle>Programme Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">UCAS Code:</span> <span className="ml-2">{prog.ucasCode ?? '—'}</span></div>
              <div><span className="text-muted-foreground">Mode of Study:</span> <span className="ml-2">{prog.modeOfStudy.replace(/_/g, ' ')}</span></div>
              <div><span className="text-muted-foreground">Awarding Body:</span> <span className="ml-2">{prog.awardingBody}</span></div>
              <div><span className="text-muted-foreground">Department:</span> <span className="ml-2">{prog.department?.title ?? '—'}</span></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules">
          <Card>
            <CardHeader><CardTitle>Linked Modules</CardTitle></CardHeader>
            <CardContent>
              {prog.programmeModules && prog.programmeModules.length > 0 ? (
                <Table>
                  <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Year</TableHead><TableHead>Credits</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {prog.programmeModules.map(pm => (
                      <TableRow key={pm.id}>
                        <TableCell className="font-mono">{pm.module?.moduleCode}</TableCell>
                        <TableCell>{pm.module?.title}</TableCell>
                        <TableCell><StatusBadge status={pm.moduleType} /></TableCell>
                        <TableCell>{pm.yearOfStudy}</TableCell>
                        <TableCell>{pm.module?.credits}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : <p className="text-muted-foreground">No modules linked</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardHeader><CardTitle>Enrolled Students ({enrolments?.pagination?.total ?? 0})</CardTitle></CardHeader>
            <CardContent>
              {enrolments?.data?.length ? (
                <Table>
                  <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Year</TableHead><TableHead>Academic Year</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {enrolments.data.slice(0, 25).map(e => (
                      <TableRow key={e.id}>
                        <TableCell>{e.student?.person ? `${e.student.person.firstName} ${e.student.person.lastName}` : e.studentId}</TableCell>
                        <TableCell>{e.yearOfStudy}</TableCell>
                        <TableCell>{e.academicYear}</TableCell>
                        <TableCell><StatusBadge status={e.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : <p className="text-muted-foreground">No enrolled students</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
