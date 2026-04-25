import PageHeader from '@/components/shared/PageHeader';
import ComingSoon from '@/components/ComingSoon';

export default function LetterGeneration() {
  return (
    <div className="space-y-6">
      <PageHeader title="Letter Generation" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Documents' }, { label: 'Letters' }]} />
      <ComingSoon title="Letter Generation" description="Letter generation (template selection, recipient matching, variable substitution) requires the letter template API and document generation service. This is planned for Phase 12 alongside the bulk communications engine." />
    </div>
  );
}
