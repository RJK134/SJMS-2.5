import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RoleManagement() {
  return (
    <div className="space-y-6">
      <PageHeader title="Role Management" breadcrumbs={[{label:'Admin',href:'/admin'},{label:'Settings'},{label:'Roles'}]} />
      <Card><CardHeader><CardTitle>Roles & Permissions</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">View and manage the 36-role hierarchy. Composite roles automatically inherit child permissions via Keycloak.</p></CardContent></Card>
    </div>
  );
}
