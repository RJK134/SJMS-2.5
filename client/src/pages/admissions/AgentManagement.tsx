import PageHeader from '@/components/shared/PageHeader';
import ComingSoon from '@/components/ComingSoon';

export default function AgentManagement() {
  return (
    <div className="space-y-6">
      <PageHeader title="Agent Management" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Admissions' }, { label: 'Agents' }]} />
      <ComingSoon title="Recruitment Agent Management" description="Agent management (commission tracking, territory assignments, application referrals) requires the recruitment agent API module. This is planned for Phase 12." />
    </div>
  );
}
