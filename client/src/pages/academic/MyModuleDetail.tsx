import { useRoute } from 'wouter';
import PageHeader from '@/components/shared/PageHeader';
import ComingSoon from '@/components/ComingSoon';

export default function MyModuleDetail() {
  const [, params] = useRoute('/academic/modules/:id');
  return (
    <div className="space-y-6">
      <PageHeader title="Module Detail" subtitle={params?.id}
        breadcrumbs={[{ label: 'Academic', href: '/academic' }, { label: 'My Modules', href: '/academic/modules' }, { label: params?.id ?? '' }]} />
      <ComingSoon title="Module Detail" description="Module detail view (registered students, assessment management, attendance records) requires the academic-scoped module API. This is planned for Phase 12 alongside academic module scoping." />
    </div>
  );
}
