import PageHeader from '@/components/shared/PageHeader';
import ComingSoon from '@/components/ComingSoon';

export default function AcademicMisconduct() {
  return (
    <div className="space-y-6">
      <PageHeader title="Academic Misconduct" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'EC & Appeals' }, { label: 'Misconduct' }]} />
      <ComingSoon title="Academic Misconduct Cases" description="Academic misconduct case management (plagiarism investigations, hearings, penalties, appeals) is planned for Phase 12 alongside integration with plagiarism detection services." />
    </div>
  );
}
