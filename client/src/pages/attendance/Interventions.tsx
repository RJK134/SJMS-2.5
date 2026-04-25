import PageHeader from '@/components/shared/PageHeader';
import ComingSoon from '@/components/ComingSoon';

export default function Interventions() {
  return (
    <div className="space-y-6">
      <PageHeader title="Intervention Tracking" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Attendance' }, { label: 'Interventions' }]} />
      <ComingSoon title="Intervention Tracking" description="Intervention tracking requires integration with the engagement scoring engine to automatically trigger and track email, phone, meeting, and referral interventions for at-risk students. This is planned for Phase 12." />
    </div>
  );
}
