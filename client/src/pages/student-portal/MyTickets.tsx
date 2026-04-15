import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList, type QueryParams } from '@/hooks/useApi';

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
}

const columns: Column<Ticket>[] = [
  { key: 'subject', label: 'Subject', sortable: true },
  { key: 'category', label: 'Category', render: r => r.category.replace(/_/g, ' ') },
  { key: 'priority', label: 'Priority', render: r => <StatusBadge status={r.priority} /> },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
  { key: 'createdAt', label: 'Raised', sortable: true, render: r => new Date(r.createdAt).toLocaleDateString('en-GB') },
];

export default function MyTickets() {
  const [, navigate] = useLocation();
  const [params, setParams] = useState<QueryParams>({ limit: 25, sort: 'createdAt', order: 'desc' });
  const { data, isLoading } = useList<Ticket>('my-tickets', '/v1/support', params);

  return (
    <div className="space-y-6">
      <PageHeader title="My Support Tickets" breadcrumbs={[{ label: 'Student', href: '/student' }, { label: 'Support Tickets' }]}>
        <Button onClick={() => navigate('/student/support/tickets/new')}><Plus className="h-4 w-4 mr-2" /> Raise Ticket</Button>
      </PageHeader>
      <DataTable<Ticket>
        columns={columns}
        data={data?.data ?? []}
        pagination={data?.pagination}
        isLoading={isLoading}
        onPageChange={cursor => setParams(p => ({ ...p, cursor: cursor ?? undefined }))}
        currentSort={params.sort}
        currentOrder={params.order}
        onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))}
        emptyMessage="No support tickets raised yet. Use the button above to raise a new ticket."
      />
    </div>
  );
}
