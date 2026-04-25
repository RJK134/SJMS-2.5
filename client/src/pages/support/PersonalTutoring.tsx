import PageHeader from '@/components/shared/PageHeader';
import ComingSoon from '@/components/ComingSoon';

export default function PersonalTutoring() {
  return (
    <div className="space-y-6">
      <PageHeader title="Personal Tutoring" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Support' }, { label: 'Personal Tutoring' }]} />
      <ComingSoon title="Personal Tutoring Records" description="Personal tutor meeting records, action items, and review scheduling require a dedicated tutoring API. Tutoring interactions are currently recorded as support tickets. A structured tutoring module is planned for Phase 12." />
    </div>
  );
}
