import PageHeader from '@/components/shared/PageHeader';
import ComingSoon from '@/components/ComingSoon';

export default function HomeOfficeReports() {
  return (
    <div className="space-y-6">
      <PageHeader title="Home Office Reports" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Compliance' }, { label: 'Reports' }]} />
      <ComingSoon title="Home Office Reporting" description="Home Office reporting generation (no-shows, withdrawals, suspensions, non-compliance) requires the UKVI API integration and compliance module, scheduled for Phase 12." />
    </div>
  );
}
