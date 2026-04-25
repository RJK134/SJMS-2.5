import PageHeader from '@/components/shared/PageHeader';
import ComingSoon from '@/components/ComingSoon';

export default function WellbeingRecords() {
  return (
    <div className="space-y-6">
      <PageHeader title="Wellbeing" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Support' }, { label: 'Wellbeing' }]} />
      <ComingSoon title="Wellbeing Records" description="Wellbeing referrals, risk assessments, and action plans require a dedicated confidential data store with restricted access controls. This is planned for Phase 12." />
    </div>
  );
}
