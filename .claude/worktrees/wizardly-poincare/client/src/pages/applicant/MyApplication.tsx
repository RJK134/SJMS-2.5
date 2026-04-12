import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export default function MyApplication() { return (<div className="space-y-6"><PageHeader title="My Application" subtitle="View your submitted application" /><Card><CardHeader><CardTitle>Application Details</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Your personal statement, qualifications, and references as submitted.</p></CardContent></Card></div>); }
