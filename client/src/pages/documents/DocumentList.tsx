import { useState } from 'react';
import { useLocation } from 'wouter';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import FilterPanel, { type FilterConfig } from '@/components/shared/FilterPanel';
import { useList, type QueryParams } from '@/hooks/useApi';

interface SjmsDocument {
  id: string;
  documentType: string;
  fileName: string;
  verificationStatus?: string;
  status: string;
  createdAt: string;
  student?: { person?: { firstName: string; lastName: string }; studentNumber?: string };
}

const columns: Column<SjmsDocument>[] = [
  { key: 'student', label: 'Student', render: r => r.student?.person ? `${r.student.person.firstName} ${r.student.person.lastName}` : '—' },
  { key: 'fileName', label: 'File Name', sortable: true },
  { key: 'documentType', label: 'Type', render: r => r.documentType.replace(/_/g, ' ') },
  { key: 'verificationStatus', label: 'Verification', render: r => r.verificationStatus ? <StatusBadge status={r.verificationStatus} /> : '—' },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
  { key: 'createdAt', label: 'Uploaded', render: r => new Date(r.createdAt).toLocaleDateString('en-GB') },
];

const filterConfig: FilterConfig[] = [
  { key: 'documentType', label: 'Type', options: [
    { value: 'TRANSCRIPT', label: 'Transcript' }, { value: 'CERTIFICATE', label: 'Certificate' },
    { value: 'ID_DOCUMENT', label: 'ID Document' }, { value: 'OTHER', label: 'Other' },
  ]},
  { key: 'status', label: 'Status', options: [
    { value: 'UPLOADED', label: 'Uploaded' }, { value: 'VERIFIED', label: 'Verified' },
    { value: 'REJECTED', label: 'Rejected' },
  ]},
];

export default function DocumentList() {
  const [, navigate] = useLocation();
  const [params, setParams] = useState<QueryParams>({ limit: 25, sort: 'createdAt', order: 'desc' });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const queryParams = { ...params, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
  const { data, isLoading } = useList<SjmsDocument>('documents', '/v1/documents', queryParams);

  return (
    <div className="space-y-6">
      <PageHeader title="Documents" subtitle={`${data?.pagination?.total ?? '—'} document records`}
        breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Documents' }, { label: 'All Documents' }]} />
      <FilterPanel filters={filterConfig} values={filters} onChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))} onClear={() => setFilters({})} />
      <DataTable<SjmsDocument> columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
        onPageChange={cursor => setParams(p => ({ ...p, cursor: cursor ?? undefined }))} onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))}
        onRowClick={row => navigate(`/admin/documents/${row.id}`)} currentSort={params.sort} currentOrder={params.order} />
    </div>
  );
}
