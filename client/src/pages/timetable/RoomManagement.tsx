import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList } from '@/hooks/useApi';
import { useState } from 'react';
import type { QueryParams } from '@/hooks/useApi';

interface Room { id: string; roomCode: string; building: string; capacity: number; roomType: string; isAccessible: boolean; status: string }

const columns: Column<Room>[] = [
  { key: 'roomCode', label: 'Room Code', sortable: true },
  { key: 'building', label: 'Building' },
  { key: 'roomType', label: 'Type', render: r => r.roomType.replace(/_/g, ' ') },
  { key: 'capacity', label: 'Capacity' },
  { key: 'isAccessible', label: 'Accessible', render: r => r.isAccessible ? 'Yes' : 'No' },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
];

export default function RoomManagement() {
  const [params] = useState<QueryParams>({ page: 1, limit: 50, sort: 'roomCode', order: 'asc' });
  const { data, isLoading } = useList<Room>('rooms', '/v1/rooms', params);

  return (
    <div className="space-y-6">
      <PageHeader title="Room Management" breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Timetable' }, { label: 'Rooms' }]} />
      <DataTable<Room> columns={columns} data={data?.data ?? []} isLoading={isLoading} emptyMessage="No rooms configured" />
    </div>
  );
}
