import PageHeader from '@/components/shared/PageHeader';
import ComingSoon from '@/components/ComingSoon';

export default function FlagManagement() {
  return (
    <div className="space-y-6">
      <PageHeader title="Student Flags" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Support' }, { label: 'Flags' }]} />
      <ComingSoon title="Student Flag Management" description="Student flag management (at-risk indicators, wellbeing concerns, academic alerts) requires a dedicated list API endpoint. Flags are currently managed per-student via the student detail view. A consolidated flag dashboard is planned for Phase 12." />
    </div>
  );
}
