import PageHeader from '@/components/shared/PageHeader';
import ComingSoon from '@/components/ComingSoon';

export default function UserManagement() {
  return (
    <div className="space-y-6">
      <PageHeader title="User Management" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Settings' }, { label: 'Users' }]} />
      <ComingSoon title="User Management" description="User accounts are managed directly in Keycloak. A read-only SJMS user directory with linked Person records and role assignments is planned for Phase 12." />
    </div>
  );
}
