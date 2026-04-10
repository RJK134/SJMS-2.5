import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import ApplicantLayout from '@/components/layout/ApplicantLayout';
import ApplicantRouter from './applicant/ApplicantRouter';
import AuthLoadingOrError from '@/components/shared/AuthLoadingOrError';

export default function ApplicantPortal() {
  const { isAuthenticated, isLoading, authError } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/login');
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || authError) {
    return <AuthLoadingOrError />;
  }

  return (
    <ApplicantLayout>
      <ApplicantRouter />
    </ApplicantLayout>
  );
}
