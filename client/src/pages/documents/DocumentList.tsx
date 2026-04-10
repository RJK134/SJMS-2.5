import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DocumentList() {
  return (
    <div className="space-y-6">
      <PageHeader title="Documents" breadcrumbs={[{ label: 'Staff', href: '/admin' },{label:'Documents'}]} />
      <Card><CardHeader><CardTitle>Document Management</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Upload, verify, and manage student documents — transcripts, certificates, evidence, letters, passports, and qualifications.</p></CardContent></Card>
    </div>
  );
}
