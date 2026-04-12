import React from "react";
import PortalShell, { adminNavItems } from "./PortalShell";

interface StaffLayoutProps {
  children: React.ReactNode;
}

export default function StaffLayout({ children }: StaffLayoutProps) {
  return (
    <PortalShell portalName="Staff Portal" navItems={adminNavItems}>
      {children}
    </PortalShell>
  );
}
