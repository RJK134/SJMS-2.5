import { useRoute } from 'wouter';
import PageHeader from '@/components/shared/PageHeader';
import ComingSoon from '@/components/ComingSoon';

export default function TuteeProfile() {
  const [, params] = useRoute('/academic/tutees/:studentId');
  return (
    <div className="space-y-6">
      <PageHeader title="Tutee Profile" subtitle={params?.studentId}
        breadcrumbs={[{ label: 'Academic', href: '/academic' }, { label: 'My Tutees', href: '/academic/tutees' }, { label: 'Profile' }]} />
      <ComingSoon title="Tutee Profile" description="The tutee profile view (academic progress, attendance summary, support history, wellbeing indicators) requires the tutoring relationship API. This is planned for Phase 12." />
    </div>
  );
}
