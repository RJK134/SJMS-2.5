import PageHeader from '@/components/shared/PageHeader';
import ComingSoon from '@/components/ComingSoon';

export default function UKVIDetail() {
  return (
    <div className="space-y-6">
      <PageHeader title="UKVI Student Detail" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Compliance', href: '/admin/compliance/ukvi' }, { label: 'Student' }]} />
      <ComingSoon title="UKVI Student Detail" description="Detailed UKVI record view (CAS, visa, BRP, sponsorship dates) requires the compliance API module, which is planned for Phase 12 alongside Home Office reporting integration." />
    </div>
  );
}
