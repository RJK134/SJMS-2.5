import { useState } from 'react';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList, type QueryParams } from '@/hooks/useApi';
import { useLocation } from 'wouter';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
}

export default function TicketList() {
  const [, navigate] = useLocation();
  const [params, setParams] = useState<QueryParams>({ limit: 25, sort: 'createdAt', order: 'desc' });
  const { data, isLoading } = useList<SupportTicket>('tickets', '/v1/support', params);
  const columns: Column<SupportTicket>[] = [
    { key: 'subject', label: 'Subject', sortable: true },
    { key: 'category', label: 'Category' },
    { key: 'priority', label: 'Priority', render: (row) => <StatusBadge status={row.priority} /> },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'createdAt', label: 'Created', render: (row) => new Date(row.createdAt).toLocaleDateString('en-GB') },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Support Tickets" breadcrumbs={[{ label: 'Staff', href: '/admin' },{label:'Support'},{label:'Tickets'}]} />
      <DataTable columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
        onRowClick={(row) => navigate('/admin/support/tickets/' + row.id)} onPageChange={cursor => setParams(p => ({...p, cursor: cursor ?? undefined}))}
        searchPlaceholder="Search tickets..." onSearch={s => setParams(p => ({...p, search: s, cursor: undefined}))}
        currentSort={params.sort} currentOrder={params.order} />
    </div>
  );
}
