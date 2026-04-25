import PageHeader from '@/components/shared/PageHeader';
import ComingSoon from '@/components/ComingSoon';

export default function ExternalExaminers() {
  return (
    <div className="space-y-6">
      <PageHeader title="External Examiners" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Assessment' }, { label: 'External Examiners' }]} />
      <ComingSoon title="External Examiner Management" description="External examiner appointment management, programme assignments, and annual report tracking will be built alongside the exam board ratification workflow in Phase 12." />
    </div>
  );
}
