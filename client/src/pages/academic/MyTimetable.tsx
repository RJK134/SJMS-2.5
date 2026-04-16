import PageHeader from '@/components/shared/PageHeader';
import ComingSoon from '@/components/ComingSoon';

export default function MyTimetable() {
  return (
    <div className="space-y-6">
      <PageHeader title="My Timetable" subtitle="Your teaching schedule"
        breadcrumbs={[{ label: 'Academic', href: '/academic' }, { label: 'Timetable' }]} />
      <ComingSoon title="Teaching Timetable" description="The teaching timetable requires a staff-scoped timetable API that filters sessions by teaching assignments. The current timetable endpoint is student-scoped and cannot reliably display an academic's teaching schedule. This will be available once the staff-to-module assignment model is implemented." />
    </div>
  );
}
