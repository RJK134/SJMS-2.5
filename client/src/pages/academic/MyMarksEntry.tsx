import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MyMarksEntry() {
  return (
    <div className="space-y-6">
      <PageHeader title="Marks Entry" subtitle="Enter marks for your assigned modules" />
      <Card><CardHeader><CardTitle>Select Module</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Choose one of your assigned modules to enter or review marks. The marks grid supports inline editing with auto-calculation.</p></CardContent></Card>
    </div>
  );
}
