import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/shared/StatusBadge';
import { useLocation } from 'wouter';
import { useList } from '@/hooks/useApi';
import { Loader2, AlertCircle } from 'lucide-react';

interface Module {
  id: string;
  moduleCode: string;
  title: string;
  credits: number;
  status: string;
}

export default function MyModules() {
  const [, navigate] = useLocation();
  const { data, isLoading, isError } = useList<Module>('academic-my-modules', '/v1/modules', { limit: 20, sort: 'moduleCode', order: 'asc' });

  const modules = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="My Modules" subtitle="Modules assigned to you this academic year" />

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : isError ? (
        <Card>
          <CardContent className="p-6 text-center text-destructive flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4" /> Unable to load modules
          </CardContent>
        </Card>
      ) : modules.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {modules.map(m => (
            <Card key={m.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/academic/modules/${m.id}`)}>
              <CardHeader><CardTitle className="text-base">{m.moduleCode} — {m.title}</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{m.credits} credits</span>
                <StatusBadge status={m.status} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No modules assigned. Contact your programme leader if this is unexpected.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
