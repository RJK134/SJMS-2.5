import PageHeader from '@/components/shared/PageHeader';
import ComingSoon from '@/components/ComingSoon';

export default function TemplateManagement() {
  return (
    <div className="space-y-6">
      <PageHeader title="Communication Templates" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Communications' }, { label: 'Templates' }]} />
      <ComingSoon title="Template Management" description="Communication template management (email, SMS, portal, letter templates with variable substitution) will be enabled alongside the bulk communications engine in Phase 12." />
    </div>
  );
}
