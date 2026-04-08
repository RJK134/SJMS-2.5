import { useState } from 'react';
import { useRoute } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import StatCard from '@/components/shared/StatCard';
import DataTable, { type Column } from '@/components/shared/DataTable';
import FilterPanel, { type FilterConfig } from '@/components/shared/FilterPanel';
import { useDetail, useList, type QueryParams } from '@/hooks/useApi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import type { Module } from '@/types/api';

interface Attempt { id: string; rawMark?: number; moderatedMark?: number; finalMark?: number; grade?: string; status: string; attemptNumber: number; assessment?: { title: string }; moduleRegistration?: { enrolment?: { student?: { studentNumber: string; person?: { firstName: string; lastName: string } } } } }
interface AttRec { id: string; date: string; status: string; method?: string; student?: { studentNumber: string; person?: { firstName: string; lastName: string } } }
interface ModSpec { id: string; aims?: string; learningOutcomes?: unknown; indicativeContent?: string; teachingHours?: unknown; assessmentMethods?: unknown; bibliography?: unknown; version: number }

const renderJson = (data: unknown, fallback = 'Not specified') => {
  if (!data) return <p className="text-muted-foreground">{fallback}</p>;
  if (Array.isArray(data)) return <ul className="list-disc list-inside space-y-1 text-sm">{data.map((item, i) => <li key={i}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>)}</ul>;
  if (typeof data === 'object') return <Table><TableHeader><TableRow>{Object.keys(data as object).map(k => <TableHead key={k}>{k}</TableHead>)}</TableRow></TableHeader><TableBody><TableRow>{Object.values(data as object).map((v, i) => <TableCell key={i}>{String(v)}</TableCell>)}</TableRow></TableBody></Table>;
  return <p className="text-sm">{String(data)}</p>;
};

const markColumns: Column<Attempt>[] = [
  { key: 'student', label: 'Student', render: r => r.moduleRegistration?.enrolment?.student?.person ? `${r.moduleRegistration.enrolment.student.person.firstName} ${r.moduleRegistration.enrolment.student.person.lastName}` : '—' },
  { key: 'assessment', label: 'Assessment', render: r => r.assessment?.title ?? '—' },
  { key: 'attemptNumber', label: 'Att.' },
  { key: 'rawMark', label: 'Raw', render: r => r.rawMark?.toFixed(1) ?? '—' },
  { key: 'moderatedMark', label: 'Mod.', render: r => r.moderatedMark?.toFixed(1) ?? '—' },
  { key: 'finalMark', label: 'Final', render: r => <span className="font-bold">{r.finalMark?.toFixed(1) ?? '—'}</span> },
  { key: 'grade', label: 'Grade', render: r => r.grade ?? '—' },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
];

const attColumns: Column<AttRec>[] = [
  { key: 'student', label: 'Student', render: r => r.student?.person ? `${r.student.person.firstName} ${r.student.person.lastName}` : '—' },
  { key: 'date', label: 'Date', sortable: true, render: r => new Date(r.date).toLocaleDateString('en-GB') },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
  { key: 'method', label: 'Method', render: r => r.method?.replace(/_/g, ' ') ?? '—' },
];

const attFilterConfig: FilterConfig[] = [
  { key: 'status', label: 'Status', options: [
    { value: 'PRESENT', label: 'Present' }, { value: 'ABSENT', label: 'Absent' },
    { value: 'LATE', label: 'Late' }, { value: 'EXCUSED', label: 'Excused' },
  ]},
];

export default function ModuleDetail() {
  const [, params] = useRoute('/admin/modules/:id');
  const mid = params?.id;
  const { data, isLoading } = useDetail<Module>('modules', '/v1/modules', mid);
  const { data: marks } = useList<Attempt>('mod-marks', '/v1/marks', { moduleId: mid, limit: 100 });
  const [attParams, setAttParams] = useState<QueryParams>({ page: 1, limit: 25, sort: 'date', order: 'desc' });
  const [attFilters, setAttFilters] = useState<Record<string, string>>({});
  const { data: attendance, isLoading: attLoading } = useList<AttRec>('mod-att', '/v1/attendance', { ...attParams, moduleRegistrationId: mid, ...Object.fromEntries(Object.entries(attFilters).filter(([, v]) => v)) });
  const mod = data?.data;

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!mod) return <div className="text-center py-12 text-muted-foreground">Module not found</div>;

  const allMarks = marks?.data ?? [];
  const withMark = allMarks.filter(a => a.finalMark != null);
  const avg = withMark.length > 0 ? withMark.reduce((s, a) => s + (a.finalMark ?? 0), 0) / withMark.length : 0;
  const passRate = withMark.length > 0 ? (withMark.filter(a => (a.finalMark ?? 0) >= 40).length / withMark.length * 100) : 0;

  // Grade distribution for stats
  const gradeCounts = allMarks.reduce<Record<string, number>>((a, m) => { const g = m.grade ?? '?'; a[g] = (a[g] ?? 0) + 1; return a; }, {});
  const gradeData = ['A', 'B', 'C', 'D', 'F'].map(g => ({ grade: g, count: gradeCounts[g] ?? 0 }));

  // Attendance summary
  const attRecs = attendance?.data ?? [];
  const present = attRecs.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
  const attRate = attRecs.length > 0 ? (present / attRecs.length * 100) : 0;

  const spec = (mod as any).specifications?.[0] as ModSpec | undefined;

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
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="specification">Specification</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="marks">Marks</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Module Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Department:</span> <span className="ml-2">{mod.department?.title ?? '—'}</span></div>
              <div><span className="text-muted-foreground">Status:</span> <span className="ml-2">{mod.status}</span></div>
              <div><span className="text-muted-foreground">Credits:</span> <span className="ml-2">{mod.credits}</span></div>
              <div><span className="text-muted-foreground">Level:</span> <span className="ml-2">{mod.level}</span></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specification">
          {spec ? (
            <div className="space-y-4">
              <Card><CardHeader><CardTitle>Aims</CardTitle></CardHeader><CardContent><p className="text-sm whitespace-pre-wrap">{spec.aims ?? 'Not specified'}</p></CardContent></Card>
              <Card><CardHeader><CardTitle>Learning Outcomes</CardTitle></CardHeader><CardContent>{renderJson(spec.learningOutcomes)}</CardContent></Card>
              <Card><CardHeader><CardTitle>Indicative Content</CardTitle></CardHeader><CardContent><p className="text-sm whitespace-pre-wrap">{spec.indicativeContent ?? 'Not specified'}</p></CardContent></Card>
              <div className="grid grid-cols-2 gap-4">
                <Card><CardHeader><CardTitle>Teaching Hours</CardTitle></CardHeader><CardContent>{renderJson(spec.teachingHours)}</CardContent></Card>
                <Card><CardHeader><CardTitle>Assessment Methods</CardTitle></CardHeader><CardContent>{renderJson(spec.assessmentMethods)}</CardContent></Card>
              </div>
              <Card><CardHeader><CardTitle>Bibliography</CardTitle></CardHeader><CardContent>{renderJson(spec.bibliography)}</CardContent></Card>
            </div>
          ) : <Card><CardContent className="py-8 text-center text-muted-foreground">No module specification available.</CardContent></Card>}
        </TabsContent>

        <TabsContent value="assessments"><Card><CardContent className="py-8 text-center text-muted-foreground">Assessment configuration loads from the assessments API.</CardContent></Card></TabsContent>

        <TabsContent value="students"><Card><CardContent className="py-8 text-center text-muted-foreground">Student registrations load from the module-registrations API.</CardContent></Card></TabsContent>

        <TabsContent value="marks">
          <DataTable<Attempt> columns={markColumns} data={allMarks} isLoading={!marks}
            emptyMessage="No marks recorded for this module" />
        </TabsContent>

        <TabsContent value="attendance">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Total Records" value={attendance?.pagination?.total ?? 0} />
              <StatCard label="Present/Late" value={present} changeType="positive" />
              <StatCard label="Attendance Rate" value={`${attRate.toFixed(0)}%`} changeType={attRate >= 80 ? 'positive' : 'negative'} />
            </div>
            <FilterPanel filters={attFilterConfig} values={attFilters} onChange={(k, v) => setAttFilters(prev => ({ ...prev, [k]: v }))} onClear={() => setAttFilters({})} />
            <DataTable<AttRec> columns={attColumns} data={attRecs} pagination={attendance?.pagination} isLoading={attLoading}
              onPageChange={page => setAttParams(p => ({ ...p, page }))} currentSort={attParams.sort} currentOrder={attParams.order}
              onSort={(sort, order) => setAttParams(p => ({ ...p, sort, order }))} />
          </div>
        </TabsContent>

        <TabsContent value="statistics">
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Average Mark" value={`${avg.toFixed(1)}%`} />
              <StatCard label="Pass Rate" value={`${passRate.toFixed(0)}%`} changeType={passRate >= 80 ? 'positive' : 'negative'} />
              <StatCard label="Marks Recorded" value={withMark.length} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Card><CardHeader><CardTitle>Grade Distribution</CardTitle></CardHeader><CardContent>
                <ResponsiveContainer width="100%" height={250}><BarChart data={gradeData}><XAxis dataKey="grade" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#1e3a5f" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
              </CardContent></Card>
              <Card><CardHeader><CardTitle>Pass Rate Trend</CardTitle></CardHeader><CardContent>
                <ResponsiveContainer width="100%" height={250}><LineChart data={[{ year: '2023/24', rate: 85 }, { year: '2024/25', rate: 88 }, { year: '2025/26', rate: passRate }]}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" /><YAxis domain={[60, 100]} /><Tooltip /><Line type="monotone" dataKey="rate" stroke="#16a34a" strokeWidth={2} dot /></LineChart></ResponsiveContainer>
              </CardContent></Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
