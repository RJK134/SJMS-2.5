import { useRoute } from 'wouter';
import PageHeader from '@/components/shared/PageHeader';
import ComingSoon from '@/components/ComingSoon';

export default function StudentModuleDetail() {
  const [, params] = useRoute('/student/modules/:id');
  return (
    <div className="space-y-6">
      <PageHeader title="Module Detail" subtitle={params?.id}
        breadcrumbs={[{ label: 'Student', href: '/student' }, { label: 'My Modules', href: '/student/modules' }, { label: params?.id ?? '' }]} />
      <ComingSoon title="Module Detail" description="Module detail view (assessments, marks, feedback, teaching events) requires the student-scoped module registration API with assessment attempt data. This is planned as part of the student self-service expansion." />
    </div>
  );
}
