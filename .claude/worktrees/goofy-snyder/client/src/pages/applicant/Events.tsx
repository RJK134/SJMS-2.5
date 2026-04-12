import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export default function ApplicantEvents() { return (<div className="space-y-6"><PageHeader title="Events" subtitle="Open days and visit events" /><Card><CardHeader><CardTitle>Upcoming Events</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Browse and register for open days, campus tours, and virtual visit events.</p></CardContent></Card></div>); }
