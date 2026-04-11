import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import StudentLayout from '@/components/layout/StudentLayout';
import StudentRouter from './student-portal/StudentRouter';
import AuthLoadingOrError from '@/components/shared/AuthLoadingOrError';
import { STUDENT_ROLES } from '@/constants/roles';

export default function StudentPortal() {
  const { isAuthenticated, isLoading, hasAnyRole, authError } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Gate student portal entry on the enrolled-student role. Non-student
    // authenticated users are redirected to /dashboard, where the role-aware
    // Dashboard wrapper picks the correct portal layout for them. Mirrors
    // the AdminRouter guard pattern.
    if (!hasAnyRole([...STUDENT_ROLES])) {
      navigate('/dashboard');
      return;
    }
  }, [isLoading, isAuthenticated, hasAnyRole, navigate]);

  if (isLoading || authError) {
    return <AuthLoadingOrError />;
  }

  return (
    <StudentLayout>
      <StudentRouter />
    </StudentLayout>
  );
}
