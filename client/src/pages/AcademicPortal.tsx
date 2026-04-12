import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { AUTH_MODE, getCurrentDevPersona } from '@/lib/auth';
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
    // Dev mode: the hash URL is the canonical persona signal. Check it
    // synchronously to avoid a race between wouter's sync re-render and
    // AuthContext's async role state update.
    if (AUTH_MODE === 'dev') {
      if (getCurrentDevPersona() !== 'academic') navigate('/dashboard');
      return;
    }
    // Production (Keycloak): roles come from the JWT token.
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
