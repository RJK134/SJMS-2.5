import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export default function StudentMyECClaims() { return (<div className="space-y-6"><PageHeader title="My EC Claims" subtitle="Submit and track extenuating circumstances claims" /><Card><CardHeader><CardTitle>My Claims</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Submit new claims, upload evidence, and track the status of existing claims.</p></CardContent></Card></div>); }
