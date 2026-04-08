import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Plus } from 'lucide-react';
export default function MyTickets() { const [, navigate] = useLocation(); return (<div className="space-y-6"><PageHeader title="My Support Tickets"><Button onClick={() => navigate('/student/support/tickets/new')}><Plus className="h-4 w-4 mr-2" /> Raise Ticket</Button></PageHeader><Card><CardHeader><CardTitle>My Tickets</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Your support requests — academic, financial, wellbeing, accommodation, and IT queries.</p></CardContent></Card></div>); }
