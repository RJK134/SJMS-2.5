import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import { useList, type QueryParams } from '@/hooks/useApi';

interface AdmEvent { id: string; title: string; eventType: string; date: string; venue?: string; capacity?: number; registeredCount: number }

const columns: Column<AdmEvent>[] = [
  { key: 'title', label: 'Event', sortable: true },
  { key: 'eventType', label: 'Type' },
  { key: 'date', label: 'Date', sortable: true, render: r => new Date(r.date).toLocaleDateString('en-GB') },
  { key: 'venue', label: 'Venue', render: r => r.venue ?? '—' },
  { key: 'capacity', label: 'Capacity', render: r => r.capacity ? `${r.registeredCount}/${r.capacity}` : '—' },
];

export default function EventsManagement() {
  const [params, setParams] = useState<QueryParams>({ page: 1, limit: 25, sort: 'date', order: 'asc' });
  const { data, isLoading } = useList<AdmEvent>('admissions-events', '/v1/admissions-events', params);

  return (
    <div className="space-y-6">
      <PageHeader title="Admissions Events" breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Admissions' }, { label: 'Events' }]}>
        <Button><Plus className="h-4 w-4 mr-2" /> New Event</Button>
      </PageHeader>
      <DataTable<AdmEvent> columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
        onPageChange={page => setParams(p => ({ ...p, page }))} currentSort={params.sort} currentOrder={params.order}
        onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))} searchPlaceholder="Search events..."
        onSearch={s => setParams(p => ({ ...p, search: s, page: 1 }))} />
    </div>
  );
}
