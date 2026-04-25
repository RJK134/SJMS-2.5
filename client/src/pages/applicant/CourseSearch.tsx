import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, GraduationCap } from 'lucide-react';
import { useList, type QueryParams } from '@/hooks/useApi';
import StatusBadge from '@/components/shared/StatusBadge';

interface Programme {
  id: string;
  programmeCode: string;
  title: string;
  level: number;
  credits: number;
  duration: string;
  modeOfStudy: string;
  status: string;
}

export default function CourseSearch() {
  const [search, setSearch] = useState('');
  const [params] = useState<QueryParams>({ limit: 50, sort: 'title', order: 'asc' });
  const { data, isLoading } = useList<Programme>('pub-programmes', '/v1/programmes', { ...params, search: search || undefined, status: 'APPROVED' });
  const programmes = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Course Search" subtitle="Browse available programmes at Future Horizons Education" />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search programmes..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : programmes.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No programmes found matching your search.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {programmes.map(p => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary flex-shrink-0" />
                    {p.title}
                  </CardTitle>
                  <StatusBadge status={p.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline">{p.programmeCode}</Badge>
                  <Badge variant="outline">Level {p.level}</Badge>
                  <Badge variant="outline">{p.credits} credits</Badge>
                  {p.duration && <Badge variant="outline">{p.duration}</Badge>}
                  {p.modeOfStudy && <Badge variant="outline">{p.modeOfStudy.replace(/_/g, ' ')}</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
