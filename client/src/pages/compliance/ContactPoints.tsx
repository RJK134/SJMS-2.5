import PageHeader from '@/components/shared/PageHeader';
import ComingSoon from '@/components/ComingSoon';

export default function ContactPoints() {
  return (
    <div className="space-y-6">
      <PageHeader title="Contact Points" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Compliance' }, { label: 'Contact Points' }]} />
      <ComingSoon title="UKVI Contact Points" description="UKVI contact point scheduling and tracking will be available once the attendance monitoring workflow is fully operational. Contact points are currently recorded via the attendance module." />
    </div>
  );
}
