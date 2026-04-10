import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import AcademicLayout from '@/components/layout/AcademicLayout';
import AcademicRouter from './academic/AcademicRouter';
import AuthLoadingOrError from '@/components/shared/AuthLoadingOrError';

export default function AcademicPortal() {
  const { isAuthenticated, isLoading, authError } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/login');
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || authError) {
    return <AuthLoadingOrError />;
  }

  return (
    <AcademicLayout>
      <AcademicRouter />
    </AcademicLayout>
  );
}
