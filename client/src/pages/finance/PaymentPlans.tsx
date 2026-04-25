import PageHeader from '@/components/shared/PageHeader';
import ComingSoon from '@/components/ComingSoon';

export default function PaymentPlans() {
  return (
    <div className="space-y-6">
      <PageHeader title="Payment Plans" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Finance' }, { label: 'Payment Plans' }]} />
      <ComingSoon title="Payment Plans" description="Instalment plan management, schedule tracking, and default monitoring require the payment plans API, which depends on the finance integration layer planned for Phase 12." />
    </div>
  );
}
