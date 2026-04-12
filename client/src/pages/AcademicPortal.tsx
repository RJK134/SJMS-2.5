import AcademicLayout from '@/components/layout/AcademicLayout';
import AcademicRouter from './academic/AcademicRouter';
import AuthLoadingOrError from '@/components/shared/AuthLoadingOrError';
import { ACADEMIC_STAFF_ROLES } from '@/constants/roles';
import { usePortalGuard } from '@/hooks/usePortalGuard';

export default function AcademicPortal() {
  const guardState = usePortalGuard('academic', ACADEMIC_STAFF_ROLES);

  if (guardState !== 'allowed') {
    return <AuthLoadingOrError />;
  }

  return (
    <AcademicLayout>
      <AcademicRouter />
    </AcademicLayout>
  );
}
