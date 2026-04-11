import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
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
    // Gate applicant portal entry on the applicant role. Non-applicant
    // authenticated users are redirected to /dashboard, where the role-aware
    // Dashboard wrapper picks the correct portal layout for them. Mirrors
    // the AdminRouter guard pattern.
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
