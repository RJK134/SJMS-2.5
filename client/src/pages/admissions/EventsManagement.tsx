import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import { useList, useCreate, type QueryParams } from '@/hooks/useApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AdmEvent { id: string; title: string; eventType: string; date: string; venue?: string; capacity?: number; registeredCount: number }

const columns: Column<AdmEvent>[] = [
  { key: 'title', label: 'Event', sortable: true },
  { key: 'eventType', label: 'Type' },
  { key: 'date', label: 'Date', sortable: true, render: r => new Date(r.date).toLocaleDateString('en-GB') },
  { key: 'venue', label: 'Venue', render: r => r.venue ?? '—' },
  { key: 'capacity', label: 'Capacity', render: r => r.capacity ? `${r.registeredCount}/${r.capacity}` : '—' },
];

const EVENT_TYPES = ['OPEN_DAY', 'CAMPUS_TOUR', 'VIRTUAL_VISIT', 'TASTER_SESSION', 'CLEARING_EVENT', 'OTHER'];

export default function EventsManagement() {
  const [params, setParams] = useState<QueryParams>({ limit: 25, sort: 'date', order: 'asc' });
  const { data, isLoading } = useList<AdmEvent>('admissions-events', '/v1/admissions-events', params);
  const createEvent = useCreate('admissions-events', '/v1/admissions-events');

  const [showDialog, setShowDialog] = useState(false);
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('OPEN_DAY');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [capacity, setCapacity] = useState('');

  const resetForm = () => { setTitle(''); setEventType('OPEN_DAY'); setDate(''); setVenue(''); setCapacity(''); };

  const handleCreate = () => {
    createEvent.mutate(
      { title, eventType, date, venue: venue || undefined, capacity: capacity ? parseInt(capacity, 10) : undefined },
      { onSuccess: () => { setShowDialog(false); resetForm(); } },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Admissions Events" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Admissions' }, { label: 'Events' }]}>
        <Button onClick={() => setShowDialog(true)}><Plus className="h-4 w-4 mr-2" /> New Event</Button>
      </PageHeader>
      <DataTable<AdmEvent> columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
        onPageChange={cursor => setParams(p => ({ ...p, cursor: cursor ?? undefined }))} currentSort={params.sort} currentOrder={params.order}
        onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))} searchPlaceholder="Search events..."
        onSearch={s => setParams(p => ({ ...p, search: s, cursor: undefined }))} />

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Event</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Spring Open Day 2026" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Event Type</label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Venue</label>
              <Input value={venue} onChange={e => setVenue(e.target.value)} placeholder="Main Campus" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Capacity</label>
              <Input type="number" value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="e.g. 200" className="mt-1" />
            </div>
            {createEvent.isError && <Alert variant="destructive"><AlertDescription>Failed to create event. Please check all fields and try again.</AlertDescription></Alert>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!title || !date || createEvent.isPending}>
              {createEvent.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
