import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, MapPin, Users } from 'lucide-react';
import { useList } from '@/hooks/useApi';

interface AdmissionsEvent {
  id: string;
  title: string;
  eventType: string;
  date: string;
  venue?: string;
  capacity?: number;
  registeredCount?: number;
}

export default function ApplicantEvents() {
  const { data, isLoading } = useList<AdmissionsEvent>('applicant-events', '/v1/admissions-events', { limit: 20, sort: 'date', order: 'asc' });
  const events = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Events" subtitle="Open days and visit events" />

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : events.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No upcoming events at this time. Please check back later.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map(ev => (
            <Card key={ev.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{ev.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(ev.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                {ev.venue && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />{ev.venue}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{ev.eventType.replace(/_/g, ' ')}</Badge>
                  {ev.capacity != null && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />{ev.registeredCount ?? 0}/{ev.capacity} places
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
