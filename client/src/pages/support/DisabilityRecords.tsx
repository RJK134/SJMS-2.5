import PageHeader from '@/components/shared/PageHeader';
import ComingSoon from '@/components/ComingSoon';

export default function DisabilityRecords() {
  return (
    <div className="space-y-6">
      <PageHeader title="Disability Support" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Support' }, { label: 'Disability' }]} />
      <ComingSoon title="Disability Records & Adjustments" description="Disability registrations, reasonable adjustments, and DSA funding tracking will be available once the disability support workflow is built in Phase 12." />
    </div>
  );
}
