import { useState } from 'react';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList, type QueryParams } from '@/hooks/useApi';
import { useLocation } from 'wouter';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TicketList() {
  return (
    <div className="space-y-6">
      <PageHeader title="Support Tickets" breadcrumbs={[{label:'Admin',href:'/admin'},{label:'Support'},{label:'Tickets'}]} />
      {(() => {
        const [, navigate] = useLocation();
        const [params, setParams] = useState<QueryParams>({ page: 1, limit: 25, sort: 'createdAt', order: 'desc' });
        const { data, isLoading } = useList<any>('tickets', '/v1/support', params);
        const columns: Column<any>[] = [
          { key: 'subject', label: 'Subject', sortable: true },
          { key: 'category', label: 'Category' },
          { key: 'priority', label: 'Priority', render: (r: any) => <StatusBadge status={r.priority} /> },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          { key: 'createdAt', label: 'Created', render: (r: any) => new Date(r.createdAt).toLocaleDateString('en-GB') },
        ];
        return <DataTable columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
          onRowClick={(row: any) => navigate('/admin/support/tickets/' + row.id)} onPageChange={page => setParams(p => ({...p, page}))}
          searchPlaceholder="Search tickets..." onSearch={s => setParams(p => ({...p, search: s, page: 1}))}
          currentSort={params.sort} currentOrder={params.order} />;
      })()}
    </div>
  );
}
