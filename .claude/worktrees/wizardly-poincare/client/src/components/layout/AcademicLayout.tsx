import React from "react";
import PortalShell, { academicNavItems } from "./PortalShell";

interface AcademicLayoutProps {
  children: React.ReactNode;
}

export default function AcademicLayout({ children }: AcademicLayoutProps) {
  return (
    <PortalShell portalName="Academic Portal" navItems={academicNavItems}>
      {children}
    </PortalShell>
  );
}
