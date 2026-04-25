import PageHeader from '@/components/shared/PageHeader';
import ComingSoon from '@/components/ComingSoon';

export default function BulkCommunication() {
  return (
    <div className="space-y-6">
      <PageHeader title="Bulk Communication" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Communications' }, { label: 'Bulk' }]} />
      <ComingSoon title="Bulk Communications" description="Bulk messaging to cohorts, programmes, or custom recipient lists requires the batch processing queue and template engine. This is planned for Phase 12." />
    </div>
  );
}
