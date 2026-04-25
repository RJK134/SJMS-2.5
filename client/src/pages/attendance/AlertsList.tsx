import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import FilterPanel, { type FilterConfig } from '@/components/shared/FilterPanel';
import { useList, type QueryParams } from '@/hooks/useApi';

interface AttendanceAlert {
  id: string;
  alertType: string;
  threshold?: number;
  currentValue?: number;
  status: string;
  triggerDate?: string;
  createdAt: string;
  student?: { person?: { firstName: string; lastName: string }; studentNumber?: string };
}

const columns: Column<AttendanceAlert>[] = [
  { key: 'student', label: 'Student', render: r => r.student?.person ? `${r.student.person.firstName} ${r.student.person.lastName}` : '—' },
  { key: 'alertType', label: 'Alert Type', render: r => r.alertType.replace(/_/g, ' ') },
  { key: 'currentValue', label: 'Value', render: r => r.currentValue != null ? `${r.currentValue}%` : '—' },
  { key: 'threshold', label: 'Threshold', render: r => r.threshold != null ? `${r.threshold}%` : '—' },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
  { key: 'createdAt', label: 'Raised', render: r => new Date(r.createdAt).toLocaleDateString('en-GB') },
];

const filterConfig: FilterConfig[] = [
  { key: 'alertType', label: 'Alert Type', options: [
    { value: 'LOW_ATTENDANCE', label: 'Low Attendance' }, { value: 'CONSECUTIVE_ABSENCE', label: 'Consecutive Absence' },
    { value: 'TIER4_RISK', label: 'Tier 4 Risk' }, { value: 'ENGAGEMENT_DROP', label: 'Engagement Drop' },
    { value: 'DEBT', label: 'Debt' },
  ]},
  { key: 'status', label: 'Status', options: [
    { value: 'ACTIVE', label: 'Active' }, { value: 'ACKNOWLEDGED', label: 'Acknowledged' },
    { value: 'RESOLVED', label: 'Resolved' },
  ]},
];

export default function AlertsList() {
  const [params, setParams] = useState<QueryParams>({ limit: 25, sort: 'createdAt', order: 'desc' });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const queryParams = { ...params, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
  const { data, isLoading } = useList<AttendanceAlert>('attendance-alerts', '/v1/attendance/alerts', queryParams);

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance Alerts" subtitle={`${data?.pagination?.total ?? '—'} active alerts`}
        breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Attendance' }, { label: 'Alerts' }]} />
      <FilterPanel filters={filterConfig} values={filters} onChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))} onClear={() => setFilters({})} />
      <DataTable<AttendanceAlert> columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
        onPageChange={cursor => setParams(p => ({ ...p, cursor: cursor ?? undefined }))} onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))}
        currentSort={params.sort} currentOrder={params.order} />
    </div>
  );
}
