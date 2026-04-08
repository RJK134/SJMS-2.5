import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
export default function MyTutees() {
  return (<div className="space-y-6"><PageHeader title="My Tutees" subtitle="Personal tutee list and meeting records" /><Card><CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Assigned Tutees</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Your assigned personal tutees with meeting history, action items, and wellbeing indicators.</p></CardContent></Card></div>);
}
