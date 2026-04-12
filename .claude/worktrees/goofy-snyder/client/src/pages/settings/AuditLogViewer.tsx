import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DateRangePicker from '@/components/shared/DateRangePicker';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DataTable, { type Column } from '@/components/shared/DataTable';
import { useList, type QueryParams } from '@/hooks/useApi';

interface AuditEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  userId?: string;
  userRole?: string;
  ipAddress?: string;
  timestamp: string;
}

const columns: Column<AuditEntry>[] = [
  { key: 'timestamp', label: 'Date', sortable: true, render: r => new Date(r.timestamp).toLocaleString('en-GB') },
  { key: 'entityType', label: 'Entity' },
  { key: 'entityId', label: 'Entity ID', render: r => r.entityId?.slice(0, 8) ?? '—' },
  { key: 'action', label: 'Action' },
  { key: 'userId', label: 'User', render: r => r.userId ?? 'system' },
  { key: 'userRole', label: 'Role', render: r => r.userRole?.replace(/_/g, ' ') ?? '—' },
  { key: 'ipAddress', label: 'IP', render: r => r.ipAddress ?? '—' },
];

export default function AuditLogViewer() {
  const [params, setParams] = useState<QueryParams>({ page: 1, limit: 25, sort: 'timestamp', order: 'desc' });
  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const queryParams = {
    ...params,
    ...(entityType ? { entityType } : {}),
    ...(action ? { action } : {}),
    ...(fromDate ? { fromDate } : {}),
    ...(toDate ? { toDate } : {}),
  };

  const { data, isLoading } = useList<AuditEntry>('audit-logs', '/v1/audit-logs', queryParams);

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Log" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Settings' }, { label: 'Audit Log' }]} />

      <Card>
        <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Entity Type</label>
              <Select value={entityType} onValueChange={setEntityType}>
                <SelectTrigger><SelectValue placeholder="All entities" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="Enrolment">Enrolment</SelectItem>
                  <SelectItem value="Programme">Programme</SelectItem>
                  <SelectItem value="Module">Module</SelectItem>
                  <SelectItem value="Mark">Mark</SelectItem>
                  <SelectItem value="AttendanceRecord">Attendance</SelectItem>
                  <SelectItem value="StudentAccount">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Action</label>
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger><SelectValue placeholder="All actions" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <DateRangePicker fromDate={fromDate} toDate={toDate} onFromChange={setFromDate} onToChange={setToDate} label="Date Range" />
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable<AuditEntry>
        columns={columns}
        data={data?.data ?? []}
        pagination={data?.pagination}
        isLoading={isLoading}
        onPageChange={page => setParams(p => ({ ...p, page }))}
        onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))}
        currentSort={params.sort}
        currentOrder={params.order}
        emptyMessage="No audit log entries found"
      />
    </div>
  );
}
