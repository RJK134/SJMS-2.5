import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { AUTH_MODE, getCurrentDevPersona } from '@/lib/auth';
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
    // Dev mode: the hash URL is the canonical persona signal. Check it
    // synchronously to avoid a race between wouter's sync re-render and
    // AuthContext's async role state update — without this, navigating
    // from /admin to /student sees stale admin roles and redirects away.
    if (AUTH_MODE === 'dev') {
      if (getCurrentDevPersona() !== 'student') navigate('/dashboard');
      return;
    }
    // Production (Keycloak): roles come from the JWT token.
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
