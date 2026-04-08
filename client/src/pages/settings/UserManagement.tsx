import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UserManagement() {
  return (
    <div className="space-y-6">
      <PageHeader title="User Management" breadcrumbs={[{label:'Admin',href:'/admin'},{label:'Settings'},{label:'Users'}]} />
      <Card><CardHeader><CardTitle>User Accounts</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Manage Keycloak user accounts — create, disable, reset passwords, assign roles, and link to Person records.</p></CardContent></Card>
    </div>
  );
}
