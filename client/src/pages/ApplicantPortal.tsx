import ApplicantLayout from '@/components/layout/ApplicantLayout';
import ApplicantRouter from './applicant/ApplicantRouter';
import AuthLoadingOrError from '@/components/shared/AuthLoadingOrError';
import { APPLICANT_ROLES } from '@/constants/roles';
import { usePortalGuard } from '@/hooks/usePortalGuard';

export default function ApplicantPortal() {
  const guardState = usePortalGuard('applicant', APPLICANT_ROLES);

  if (guardState !== 'allowed') {
    return <AuthLoadingOrError />;
  }

  return (
    <ApplicantLayout>
      <ApplicantRouter />
    </ApplicantLayout>
  );
}
