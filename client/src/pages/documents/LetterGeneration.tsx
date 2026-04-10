import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LetterGeneration() {
  return (
    <div className="space-y-6">
      <PageHeader title="Letter Generation" breadcrumbs={[{ label: 'Staff', href: '/admin' },{label:'Documents'},{label:'Letters'}]} />
      <Card><CardHeader><CardTitle>Generate Letter</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Select a template, choose recipients, personalise variables, and generate letters for printing or email.</p></CardContent></Card>
    </div>
  );
}
