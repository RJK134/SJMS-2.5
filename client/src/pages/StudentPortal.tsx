import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import StudentLayout from '@/components/layout/StudentLayout';
import StudentRouter from './student-portal/StudentRouter';
import AuthLoadingOrError from '@/components/shared/AuthLoadingOrError';

export default function StudentPortal() {
  const { isAuthenticated, isLoading, authError } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/login');
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || authError) {
    return <AuthLoadingOrError />;
  }

  return (
    <StudentLayout>
      <StudentRouter />
    </StudentLayout>
  );
}
