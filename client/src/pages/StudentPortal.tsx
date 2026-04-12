import StudentLayout from '@/components/layout/StudentLayout';
import StudentRouter from './student-portal/StudentRouter';
import AuthLoadingOrError from '@/components/shared/AuthLoadingOrError';
import { STUDENT_ROLES } from '@/constants/roles';
import { usePortalGuard } from '@/hooks/usePortalGuard';

export default function StudentPortal() {
  const guardState = usePortalGuard('student', STUDENT_ROLES);

  if (guardState !== 'allowed') {
    return <AuthLoadingOrError />;
  }

  return (
    <StudentLayout>
      <StudentRouter />
    </StudentLayout>
  );
}
