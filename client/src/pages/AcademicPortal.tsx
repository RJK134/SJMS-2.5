import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import AcademicLayout from '@/components/layout/AcademicLayout';
import AcademicRouter from './academic/AcademicRouter';
import AuthLoadingOrError from '@/components/shared/AuthLoadingOrError';
import { ACADEMIC_STAFF_ROLES } from '@/constants/roles';

export default function AcademicPortal() {
  const { isAuthenticated, isLoading, hasAnyRole, authError } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Gate academic portal entry on teaching role membership.
    // Non-academic authenticated users are redirected to /dashboard, where
    // the role-aware Dashboard wrapper picks the correct portal layout for
    // them. Mirrors the AdminRouter guard pattern.
    if (!hasAnyRole([...ACADEMIC_STAFF_ROLES])) {
      navigate('/dashboard');
      return;
    }
  }, [isLoading, isAuthenticated, hasAnyRole, navigate]);

  if (isLoading || authError) {
    return <AuthLoadingOrError />;
  }

  return (
    <AcademicLayout>
      <AcademicRouter />
    </AcademicLayout>
  );
}
