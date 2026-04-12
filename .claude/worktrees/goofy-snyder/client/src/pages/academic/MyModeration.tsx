import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export default function MyModeration() {
  return (<div className="space-y-6"><PageHeader title="My Moderation Queue" subtitle="Marks assigned to you for moderation" /><Card><CardHeader><CardTitle>Moderation Items</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Marks submitted for your modules that require moderation review.</p></CardContent></Card></div>);
}
