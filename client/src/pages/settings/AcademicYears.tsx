import PageHeader from '@/components/shared/PageHeader';
import ComingSoon from '@/components/ComingSoon';

export default function AcademicYears() {
  return (
    <div className="space-y-6">
      <PageHeader title="Academic Years" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Settings' }, { label: 'Academic Years' }]} />
      <ComingSoon title="Academic Year Configuration" description="Academic year configuration (start/end dates, enrolment windows, current year designation) is managed through system settings. A dedicated academic year management interface is planned for Phase 12." />
    </div>
  );
}
