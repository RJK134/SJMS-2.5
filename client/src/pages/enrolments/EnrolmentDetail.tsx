import { useRoute } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import StatCard from '@/components/shared/StatCard';
import { useDetail } from '@/hooks/useApi';
import type { Enrolment } from '@/types/api';

export default function EnrolmentDetail() {
  const [, params] = useRoute('/admin/enrolments/:id');
  const { data, isLoading } = useDetail<Enrolment>('enrolments', '/v1/enrolments', params?.id);
  const enr = data?.data;

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!enr) return <div className="text-center py-12 text-muted-foreground">Enrolment not found</div>;

  const studentName = enr.student?.person ? `${enr.student.person.firstName} ${enr.student.person.lastName}` : enr.studentId;

  return (
    <div className="space-y-6">
      <PageHeader title={`Enrolment — ${studentName}`} subtitle={`${enr.programme?.title ?? enr.programmeId} · ${enr.academicYear}`}
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Enrolments', href: '/admin/enrolments' }, { label: studentName }]}>
        <StatusBadge status={enr.status} />
      </PageHeader>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Academic Year" value={enr.academicYear} />
        <StatCard label="Year of Study" value={enr.yearOfStudy} />
        <StatCard label="Mode" value={enr.modeOfStudy.replace(/_/g, ' ')} />
        <StatCard label="Fee Status" value={enr.feeStatus.replace(/_/g, ' ')} />
      </div>

      <Tabs defaultValue="registrations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="registrations">Module Registrations</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="registrations">
          <Card>
            <CardHeader><CardTitle>Module Registrations</CardTitle></CardHeader>
            <CardContent>
              {enr.moduleRegistrations && enr.moduleRegistrations.length > 0 ? (
                <Table>
                  <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Attempt</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {enr.moduleRegistrations.map(mr => (
                      <TableRow key={mr.id}>
                        <TableCell className="font-mono">{mr.module?.moduleCode ?? '—'}</TableCell>
                        <TableCell>{mr.module?.title ?? '—'}</TableCell>
                        <TableCell>{mr.registrationType}</TableCell>
                        <TableCell>{mr.attempt}</TableCell>
                        <TableCell><StatusBadge status={mr.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : <p className="text-muted-foreground">No module registrations</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader><CardTitle>Enrolment Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Start Date:</span> <span className="ml-2">{new Date(enr.startDate).toLocaleDateString('en-GB')}</span></div>
              <div><span className="text-muted-foreground">Expected End:</span> <span className="ml-2">{enr.expectedEndDate ? new Date(enr.expectedEndDate).toLocaleDateString('en-GB') : '—'}</span></div>
              <div><span className="text-muted-foreground">Created:</span> <span className="ml-2">{new Date(enr.createdAt).toLocaleString('en-GB')}</span></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
