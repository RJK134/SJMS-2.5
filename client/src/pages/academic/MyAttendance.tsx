import PageHeader from '@/components/shared/PageHeader';
import ComingSoon from '@/components/ComingSoon';

export default function MyAttendance() {
  return (
    <div className="space-y-6">
      <PageHeader title="Record Attendance" subtitle="Mark attendance for your teaching events"
        breadcrumbs={[{ label: 'Academic', href: '/academic' }, { label: 'Attendance' }]} />
      <ComingSoon title="Attendance Recording" description="Attendance recording by teaching event requires the event-scoped attendance API to filter sessions by the authenticated academic's module assignments. This is planned for Phase 12." />
    </div>
  );
}
