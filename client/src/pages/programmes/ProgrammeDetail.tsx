import { useRoute } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import StatCard from '@/components/shared/StatCard';
import { useDetail, useList } from '@/hooks/useApi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import type { Programme, Enrolment } from '@/types/api';

interface Spec { id: string; learningOutcomes?: unknown; teachingMethods?: string; assessmentStrategy?: string; entryRequirements?: string; version: number; approvedDate?: string }
interface Approval { id: string; stage: string; status: string; approvedBy?: string; approvedDate?: string; comments?: string }

export default function ProgrammeDetail() {
  const [, params] = useRoute('/admin/programmes/:id');
  const pid = params?.id;
  const { data, isLoading } = useDetail<Programme>('programmes', '/v1/programmes', pid);
  const { data: enrolments } = useList<Enrolment>('prog-enrolments', '/v1/enrolments', { programmeId: pid, limit: 100 });
  const { data: approvals } = useList<Approval>('prog-approvals', '/v1/programme-approvals', { programmeId: pid, limit: 20 });
  const prog = data?.data;
  const enrData = enrolments?.data ?? [];

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!prog) return <div className="text-center py-12 text-muted-foreground">Programme not found</div>;

  // Stats
  const yearCounts = enrData.reduce<Record<string, number>>((a, e) => { a[e.academicYear] = (a[e.academicYear] ?? 0) + 1; return a; }, {});
  const trendData = Object.entries(yearCounts).sort(([a], [b]) => a.localeCompare(b)).map(([year, count]) => ({ year, count }));
  const completionData = [{ year: '2022/23', rate: 88 }, { year: '2023/24', rate: 91 }, { year: '2024/25', rate: 89 }, { year: '2025/26', rate: 93 }];
  const currentEnrolled = enrData.filter(e => e.status === 'ENROLLED').length;
  const completed = enrData.filter(e => e.status === 'COMPLETED').length;

  // Spec (from programme includes)
  const specs = (prog as any).specifications as Spec[] | undefined;
  const latestSpec = specs?.[0];

  // Learning outcomes renderer
  const renderJsonList = (data: unknown) => {
    if (!data) return <p className="text-muted-foreground">Not specified</p>;
    if (Array.isArray(data)) return <ol className="list-decimal list-inside space-y-1 text-sm">{data.map((item, i) => <li key={i}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>)}</ol>;
    return <pre className="text-sm bg-muted p-3 rounded overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>;
  };

  const STAGES = ['INITIAL', 'FACULTY', 'ACADEMIC_BOARD', 'SENATE'];

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
        <StatCard label="Currently Enrolled" value={currentEnrolled} />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="specification">Specification</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="approval">Approval</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        {/* Overview */}
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

        {/* Specification */}
        <TabsContent value="specification">
          <div className="space-y-4">
            {latestSpec ? (
              <>
                <Card>
                  <CardHeader><CardTitle>Learning Outcomes</CardTitle></CardHeader>
                  <CardContent>{renderJsonList(latestSpec.learningOutcomes)}</CardContent>
                </Card>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader><CardTitle>Teaching Methods</CardTitle></CardHeader>
                    <CardContent><p className="text-sm whitespace-pre-wrap">{latestSpec.teachingMethods ?? 'Not specified'}</p></CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle>Assessment Strategy</CardTitle></CardHeader>
                    <CardContent><p className="text-sm whitespace-pre-wrap">{latestSpec.assessmentStrategy ?? 'Not specified'}</p></CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader><CardTitle>Entry Requirements</CardTitle></CardHeader>
                  <CardContent><p className="text-sm whitespace-pre-wrap">{latestSpec.entryRequirements ?? 'Not specified'}</p></CardContent>
                </Card>
              </>
            ) : (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No programme specification available. Create one to define learning outcomes, teaching methods, and entry requirements.</CardContent></Card>
            )}
          </div>
        </TabsContent>

        {/* Modules */}
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

        {/* Students */}
        <TabsContent value="students">
          <Card>
            <CardHeader><CardTitle>Enrolled Students ({enrolments?.pagination?.total ?? 0})</CardTitle></CardHeader>
            <CardContent>
              {enrData.length ? (
                <Table>
                  <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Year</TableHead><TableHead>Academic Year</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {enrData.slice(0, 25).map(e => (
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

        {/* Approval */}
        <TabsContent value="approval">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Approval Workflow</CardTitle>
                  <Button size="sm"><Send className="h-4 w-4 mr-2" /> Submit for Approval</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {STAGES.map((stage, i) => {
                    const approval = (approvals?.data ?? []).find((a: Approval) => a.stage === stage);
                    const isComplete = approval?.status === 'APPROVED';
                    const isCurrent = approval && approval.status === 'PENDING';
                    return (
                      <div key={stage} className="flex items-start gap-4 pb-6 last:pb-0">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isComplete ? 'bg-green-500 text-white' : isCurrent ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground'}`}>{i + 1}</div>
                          {i < STAGES.length - 1 && <div className={`w-0.5 h-8 ${isComplete ? 'bg-green-300' : 'bg-muted'}`} />}
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{stage.replace(/_/g, ' ')}</span>
                            {approval && <StatusBadge status={approval.status} />}
                          </div>
                          {approval?.approvedBy && <p className="text-xs text-muted-foreground mt-1">By: {approval.approvedBy} · {approval.approvedDate ? new Date(approval.approvedDate).toLocaleDateString('en-GB') : ''}</p>}
                          {approval?.comments && <p className="text-xs text-muted-foreground mt-1">{approval.comments}</p>}
                          {!approval && <p className="text-xs text-muted-foreground mt-1">Not yet submitted</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Statistics */}
        <TabsContent value="statistics">
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Total Enrolments" value={enrData.length} changeType="positive" />
              <StatCard label="Currently Enrolled" value={currentEnrolled} />
              <StatCard label="Completed" value={completed} changeType="positive" change={`${enrData.length > 0 ? ((completed / enrData.length) * 100).toFixed(0) : 0}% completion rate`} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Enrolments by Academic Year</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={trendData}><XAxis dataKey="year" tick={{ fontSize: 11 }} /><YAxis /><Tooltip /><Bar dataKey="count" fill="#1e3a5f" radius={[4, 4, 0, 0]} /></BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Completion Rate Trend</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={completionData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" tick={{ fontSize: 11 }} /><YAxis domain={[80, 100]} /><Tooltip /><Line type="monotone" dataKey="rate" stroke="#16a34a" strokeWidth={2} dot /></LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
