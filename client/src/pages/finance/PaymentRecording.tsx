import PageHeader from '@/components/shared/PageHeader';
import ComingSoon from '@/components/ComingSoon';

export default function PaymentRecording() {
  return (
    <div className="space-y-6">
      <PageHeader title="Payment Recording" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Finance' }, { label: 'Payments' }]} />
      <ComingSoon title="Payment Recording" description="Payment recording (bank transfer, card, direct debit, cash) requires a dedicated payments API with reconciliation support. Finance currently tracks student accounts and balances. Payment entry is planned for Phase 12." />
    </div>
  );
}
