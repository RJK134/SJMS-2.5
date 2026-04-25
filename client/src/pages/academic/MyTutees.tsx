import PageHeader from '@/components/shared/PageHeader';
import ComingSoon from '@/components/ComingSoon';

export default function MyTutees() {
  return (
    <div className="space-y-6">
      <PageHeader title="My Tutees" subtitle="Personal tutee list and meeting records"
        breadcrumbs={[{ label: 'Academic', href: '/academic' }, { label: 'My Tutees' }]} />
      <ComingSoon title="Tutee Management" description="Personal tutee assignments require the tutoring allocation API, which links academic staff to students via the personal tutoring model. This is planned for Phase 12." />
    </div>
  );
}
