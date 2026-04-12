import React from "react";
import PortalShell, { studentNavItems } from "./PortalShell";

interface StudentLayoutProps {
  children: React.ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  return (
    <PortalShell portalName="Student Portal" navItems={studentNavItems}>
      {children}
    </PortalShell>
  );
}
