import PageHeader from '@/components/shared/PageHeader';
import ComingSoon from '@/components/ComingSoon';

export default function MyPaymentPlan() {
  return (
    <div className="space-y-6">
      <PageHeader title="My Payment Plan"
        breadcrumbs={[{ label: 'Student', href: '/student' }, { label: 'Payment Plan' }]} />
      <ComingSoon title="Payment Plan Details" description="Payment plan details (instalment schedule, amounts, payment status) will be available once the finance integration layer is live. Payment plans are currently managed by the finance office." />
    </div>
  );
}
