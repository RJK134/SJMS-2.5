import PageHeader from '@/components/shared/PageHeader';
import ComingSoon from '@/components/ComingSoon';

export default function ClashDetection() {
  return (
    <div className="space-y-6">
      <PageHeader title="Clash Detection" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Timetable' }, { label: 'Clashes' }]} />
      <ComingSoon title="Timetable Clash Detection" description="Clash detection (room, staff, and student group conflicts) requires the timetabling algorithm engine. The timetable module currently supports session viewing. Automated clash detection is planned for Phase 12." />
    </div>
  );
}
