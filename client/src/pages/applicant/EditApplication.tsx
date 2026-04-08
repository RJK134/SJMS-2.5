import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export default function EditApplication() { return (<div className="space-y-6"><PageHeader title="Edit Application" /><Card><CardHeader><CardTitle>Update Application</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Edit your application details while it is in draft or submitted status.</p></CardContent></Card></div>); }
