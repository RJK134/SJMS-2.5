import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save } from 'lucide-react';
import { useList, useUpdate } from '@/hooks/useApi';

interface Application {
  id: string;
  programmeId: string;
  academicYear: string;
  applicationRoute: string;
  personalStatement?: string;
  status: string;
  programme?: { title: string };
}

export default function EditApplication() {
  const { data: apps, isLoading } = useList<Application>('my-applications', '/v1/applications', { limit: 1 });
  const app = apps?.data?.[0];
  const updateApp = useUpdate('my-applications', '/v1/applications');
  const [, navigate] = useLocation();

  const [personalStatement, setPersonalStatement] = useState('');
  const [academicYear, setAcademicYear] = useState('');

  useEffect(() => {
    if (app) {
      setPersonalStatement(app.personalStatement ?? '');
      setAcademicYear(app.academicYear ?? '');
    }
  }, [app]);

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!app) return (
    <div className="space-y-6">
      <PageHeader title="Edit Application" />
      <Card><CardContent className="py-8 text-center text-muted-foreground">No application found to edit.</CardContent></Card>
    </div>
  );

  const canEdit = ['DRAFT', 'SUBMITTED'].includes(app.status);

  const handleSave = () => {
    updateApp.mutate(
      { id: app.id, personalStatement, academicYear },
      { onSuccess: () => navigate('/applicant/application') },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Application" subtitle={app.programme?.title ?? 'Application'} />

      {!canEdit && (
        <Alert><AlertDescription>This application cannot be edited in its current status ({app.status}).</AlertDescription></Alert>
      )}

      <Card>
        <CardHeader><CardTitle>Application Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Programme</label>
            <Input value={app.programme?.title ?? app.programmeId} disabled className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Application Route</label>
            <Input value={app.applicationRoute.replace(/_/g, ' ')} disabled className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Academic Year</label>
            <Input value={academicYear} onChange={e => setAcademicYear(e.target.value)} disabled={!canEdit} placeholder="2025/26" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Personal Statement</label>
            <textarea
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mt-1"
              rows={8} value={personalStatement} onChange={e => setPersonalStatement(e.target.value)} disabled={!canEdit}
              placeholder="Write your personal statement..." />
          </div>
        </CardContent>
      </Card>

      {canEdit && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate('/applicant/application')}>Cancel</Button>
          <Button onClick={handleSave} disabled={updateApp.isPending}>
            {updateApp.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      )}

      {updateApp.isError && <Alert variant="destructive"><AlertDescription>Failed to save changes. Please try again.</AlertDescription></Alert>}
    </div>
  );
}
