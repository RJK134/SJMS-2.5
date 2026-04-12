import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { AUTH_MODE, getCurrentDevPersona } from '@/lib/auth';
import ApplicantLayout from '@/components/layout/ApplicantLayout';
import ApplicantRouter from './applicant/ApplicantRouter';
import AuthLoadingOrError from '@/components/shared/AuthLoadingOrError';
import { APPLICANT_ROLES } from '@/constants/roles';

export default function ApplicantPortal() {
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
      if (getCurrentDevPersona() !== 'applicant') navigate('/dashboard');
      return;
    }
    // Production (Keycloak): roles come from the JWT token.
    if (!hasAnyRole([...APPLICANT_ROLES])) {
      navigate('/dashboard');
      return;
    }
  }, [isLoading, isAuthenticated, hasAnyRole, navigate]);

  if (isLoading || authError) {
    return <AuthLoadingOrError />;
  }

  return (
    <ApplicantLayout>
      <ApplicantRouter />
    </ApplicantLayout>
  );
}
