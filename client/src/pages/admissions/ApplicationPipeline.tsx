import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutGrid, List } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList, type QueryParams } from '@/hooks/useApi';

interface Application {
  id: string; applicantId: string; programmeId: string; academicYear: string;
  applicationRoute: string; status: string; createdAt: string;
  applicant?: { person?: { firstName: string; lastName: string } };
  programme?: { title: string; programmeCode: string };
}

// Mirror of the canonical ApplicationStatus enum and the
// service-side state machine in
// server/src/api/applications/applications.service.ts. INTERVIEW and
// INSURANCE were previously omitted, which silently dropped any
// application currently in those states from the kanban view; the
// terminal states (DECLINED / WITHDRAWN / REJECTED) are kept on the
// board for visibility but coloured red.
const PIPELINE_STAGES = [
  { key: 'SUBMITTED', label: 'Submitted', colour: 'bg-slate-100' },
  { key: 'UNDER_REVIEW', label: 'Under Review', colour: 'bg-blue-50' },
  { key: 'INTERVIEW', label: 'Interview', colour: 'bg-indigo-50' },
  { key: 'CONDITIONAL_OFFER', label: 'Conditional Offer', colour: 'bg-amber-50' },
  { key: 'UNCONDITIONAL_OFFER', label: 'Unconditional Offer', colour: 'bg-green-50' },
  { key: 'FIRM', label: 'Firm', colour: 'bg-green-100' },
  { key: 'INSURANCE', label: 'Insurance', colour: 'bg-emerald-50' },
  { key: 'DECLINED', label: 'Declined', colour: 'bg-red-50' },
  { key: 'WITHDRAWN', label: 'Withdrawn', colour: 'bg-zinc-100' },
  { key: 'REJECTED', label: 'Rejected', colour: 'bg-rose-50' },
];

const tableColumns: Column<Application>[] = [
  { key: 'applicant', label: 'Applicant', render: r => r.applicant?.person ? `${r.applicant.person.firstName} ${r.applicant.person.lastName}` : '—' },
  { key: 'programme', label: 'Programme', render: r => r.programme?.title ?? '—' },
  { key: 'academicYear', label: 'Year', sortable: true },
  { key: 'applicationRoute', label: 'Route' },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
  { key: 'createdAt', label: 'Applied', render: r => new Date(r.createdAt).toLocaleDateString('en-GB') },
];

export default function ApplicationPipeline() {
  const [, navigate] = useLocation();
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [params, setParams] = useState<QueryParams>({ limit: 100, sort: 'createdAt', order: 'desc' });
  const { data, isLoading } = useList<Application>('applications', '/v1/applications', params);
  const apps = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Applications Pipeline" subtitle={`${data?.pagination?.total ?? '—'} applications`}
        breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Admissions' }, { label: 'Applications' }]}>
        <div className="flex gap-2">
          <Button variant={view === 'kanban' ? 'default' : 'outline'} size="sm" onClick={() => setView('kanban')}><LayoutGrid className="h-4 w-4 mr-1" /> Kanban</Button>
          <Button variant={view === 'table' ? 'default' : 'outline'} size="sm" onClick={() => setView('table')}><List className="h-4 w-4 mr-1" /> Table</Button>
        </div>
      </PageHeader>

      {view === 'kanban' ? (
        // 10 canonical lifecycle stages now render. Use fixed-width
        // columns inside a horizontally scrollable flex strip so each
        // status remains readable; the previous grid-cols-6 layout
        // truncated INTERVIEW / INSURANCE / WITHDRAWN / REJECTED.
        <div className="flex gap-3 overflow-x-auto pb-2">
          {PIPELINE_STAGES.map(stage => {
            const stageApps = apps.filter(a => a.status === stage.key);
            return (
              <div key={stage.key} className={`rounded-lg p-3 min-h-[400px] w-56 flex-shrink-0 ${stage.colour}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">{stage.label}</h3>
                  <span className="text-xs bg-white rounded-full px-2 py-0.5 font-medium">{stageApps.length}</span>
                </div>
                <div className="space-y-2">
                  {stageApps.map(app => (
                    <Card key={app.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/admin/admissions/applications/${app.id}`)}>
                      <CardContent className="p-3">
                        <p className="font-medium text-sm">{app.applicant?.person ? `${app.applicant.person.firstName} ${app.applicant.person.lastName}` : 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground mt-1">{app.programme?.programmeCode ?? ''}</p>
                        <p className="text-xs text-muted-foreground">{app.applicationRoute} · {app.academicYear}</p>
                      </CardContent>
                    </Card>
                  ))}
                  {stageApps.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No applications</p>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <DataTable<Application> columns={tableColumns} data={apps} pagination={data?.pagination} isLoading={isLoading}
          onRowClick={row => navigate(`/admin/admissions/applications/${row.id}`)}
          onPageChange={cursor => setParams(p => ({ ...p, cursor: cursor ?? undefined }))} currentSort={params.sort} currentOrder={params.order} />
      )}
    </div>
  );
}
