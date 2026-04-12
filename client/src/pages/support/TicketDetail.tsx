import { useRoute } from 'wouter';
import StatusBadge from '@/components/shared/StatusBadge';
import { useDetail } from '@/hooks/useApi';
import { Loader2, MessageSquare } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TicketDetail() {
  return (
    <div className="space-y-6">
      <PageHeader title="Ticket Detail" breadcrumbs={[{ label: 'Staff', href: '/admin' },{label:'Support',href:'/admin/support/tickets'},{label:'Ticket'}]} />
      {(() => {
        const [, params] = useRoute('/admin/support/tickets/:id');
        const { data, isLoading } = useDetail<any>('tickets', '/v1/support', params?.id);
        const t = data?.data;
        if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
        if (!t) return <p className="text-muted-foreground">Ticket not found</p>;
        return (<>
          <div className="flex items-center gap-3 mb-4"><StatusBadge status={t.priority} /><StatusBadge status={t.status} /></div>
          <Card><CardHeader><CardTitle>{t.subject}</CardTitle></CardHeader><CardContent><p className="text-sm">{t.description}</p></CardContent></Card>
          {/* TODO: Wire interaction timeline when SupportInteraction relation is included in /v1/support/:id response */}
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Interactions</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground text-center py-4">No interactions recorded. The interaction timeline will appear here once support correspondence is logged.</p></CardContent></Card>
        </>);
      })()}
    </div>
  );
}
