import { useRoute } from 'wouter';
import StatusBadge from '@/components/shared/StatusBadge';
import { useDetail } from '@/hooks/useApi';
import { Loader2, MessageSquare, Mail, Phone, FileText, Users, StickyNote } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const INTERACTION_ICONS: Record<string, React.ReactNode> = {
  NOTE: <StickyNote className="h-4 w-4" />,
  EMAIL_MSG: <Mail className="h-4 w-4" />,
  PHONE_CALL: <Phone className="h-4 w-4" />,
  MEETING_NOTE: <Users className="h-4 w-4" />,
  LETTER: <FileText className="h-4 w-4" />,
};

const INTERACTION_LABELS: Record<string, string> = {
  NOTE: 'Note',
  EMAIL_MSG: 'Email',
  PHONE_CALL: 'Phone Call',
  MEETING_NOTE: 'Meeting Note',
  LETTER: 'Letter',
};

interface Interaction {
  id: string;
  interactionType: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  createdBy: string | null;
}

interface SupportTicketDetail {
  subject: string;
  description: string;
  priority: string;
  status: string;
  interactions?: Interaction[];
}

export default function TicketDetail() {
  const [, params] = useRoute('/admin/support/tickets/:id');
  const { data, isLoading } = useDetail<SupportTicketDetail>('tickets', '/v1/support', params?.id);
  const ticket = data?.data;
  const interactions: Interaction[] = ticket?.interactions ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Ticket Detail" breadcrumbs={[{ label: 'Staff', href: '/admin' },{label:'Support',href:'/admin/support/tickets'},{label:'Ticket'}]} />
      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : null}
      {!isLoading && !ticket ? <p className="text-muted-foreground">Ticket not found</p> : null}
      {!isLoading && ticket ? (
        <>
          <div className="flex items-center gap-3 mb-4"><StatusBadge status={ticket.priority} /><StatusBadge status={ticket.status} /></div>
          <Card><CardHeader><CardTitle>{ticket.subject}</CardTitle></CardHeader><CardContent><p className="text-sm">{ticket.description}</p></CardContent></Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Interactions ({interactions.length})</CardTitle></CardHeader>
            <CardContent>
              {interactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No interactions recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {interactions.map((ix) => (
                    <div key={ix.id} className="flex gap-3 border-l-2 border-slate-200 pl-4 py-2">
                      <div className="flex-shrink-0 mt-0.5 text-slate-500">
                        {INTERACTION_ICONS[ix.interactionType] ?? <MessageSquare className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{INTERACTION_LABELS[ix.interactionType] ?? ix.interactionType}</span>
                          {ix.isInternal && <Badge variant="outline" className="text-xs">Internal</Badge>}
                          <span className="text-xs text-muted-foreground ml-auto">{new Date(ix.createdAt).toLocaleString('en-GB')}</span>
                        </div>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{ix.content}</p>
                        {ix.createdBy && <p className="text-xs text-muted-foreground mt-1">By: {ix.createdBy}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
