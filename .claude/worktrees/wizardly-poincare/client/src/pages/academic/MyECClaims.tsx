import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export default function MyECClaims() {
  return (<div className="space-y-6"><PageHeader title="EC Claims (My Modules)" subtitle="Extenuating circumstances claims affecting your modules" /><Card><CardHeader><CardTitle>Claims Summary</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Read-only view of EC decisions that affect marks and progression for students on your modules.</p></CardContent></Card></div>);
}
