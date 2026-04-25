import PageHeader from '@/components/shared/PageHeader';
import ComingSoon from '@/components/ComingSoon';

export default function RoleManagement() {
  return (
    <div className="space-y-6">
      <PageHeader title="Role Management" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Settings' }, { label: 'Roles' }]} />
      <ComingSoon title="Roles & Permissions" description="The 36-role composite hierarchy is defined and maintained in Keycloak. SJMS displays role-based access controls but does not manage role definitions directly. A role viewer is planned for Phase 12." />
    </div>
  );
}
