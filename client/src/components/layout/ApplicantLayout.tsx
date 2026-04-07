import React from "react";
import PortalShell, { applicantNavItems } from "./PortalShell";

interface ApplicantLayoutProps {
  children: React.ReactNode;
}

export default function ApplicantLayout({ children }: ApplicantLayoutProps) {
  return (
    <PortalShell portalName="Applicant Portal" navItems={applicantNavItems}>
      {children}
    </PortalShell>
  );
}
