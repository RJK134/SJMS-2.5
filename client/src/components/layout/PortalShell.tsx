import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  Calendar,
  Building2,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  Wallet,
  UserCheck,
  Shield,
  AlertTriangle,
  FolderOpen,
  Building,
  Hotel,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

interface PortalShellProps {
  children: React.ReactNode;
  portalName: string;
  navItems: NavItem[];
}

export default function PortalShell({ children, portalName, navItems }: PortalShellProps) {
  const { user, logout, hasAnyRole } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const filteredNav = navItems.filter(
    (item) => !item.roles || hasAnyRole(item.roles)
  );

  // Fetch unread notification count from real API
  const { data: notifData } = useQuery<{ success: boolean; data: unknown[]; pagination: { total: number } }>({
    queryKey: ['unread-notification-count'],
    queryFn: async () => {
      const { data } = await api.get('/v1/communications/notifications', { params: { limit: 1, isRead: 'false' } });
      return data;
    },
    refetchInterval: 60_000, // refresh every 60 seconds
    staleTime: 30_000,
  });
  const unreadCount = notifData?.pagination?.total ?? 0;

  // Dismiss the mobile sidebar when the user navigates to a new route. Without
  // this, tapping a nav link on mobile would change the route but leave the
  // sidebar covering the content — making the destination page unreachable.
  useEffect(() => {
    setSidebarOpen(false);
    setProfileOpen(false);
  }, [location]);

  // Escape key closes the mobile sidebar and the profile dropdown. Standard
  // WCAG 2.1 dismissible pattern — no focus trap yet, which is Phase 5
  // accessibility hardening work.
  useEffect(() => {
    if (!sidebarOpen && !profileOpen) return;
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen, profileOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-primary-700 text-white transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-primary-600">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent font-bold text-white text-sm">
              FH
            </div>
            <div>
              <div className="font-semibold text-sm">Future Horizons</div>
              <div className="text-xs text-primary-200">{portalName}</div>
            </div>
          </div>
          <button
            className="lg:hidden text-primary-200 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || location.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <span
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-primary-600 text-white"
                      : "text-primary-100 hover:bg-primary-600/50 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-primary-600 p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-primary-200 hover:bg-primary-600/50 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-secondary-500 hover:text-secondary-700"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={sidebarOpen}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="w-64 pl-9"
                placeholder="Search students, modules..."
                type="search"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-muted transition-colors"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-medium">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-md border bg-white py-1 shadow-lg z-50">
                  <Link href="/profile">
                    <span className="block px-4 py-2 text-sm hover:bg-muted cursor-pointer">
                      My Profile
                    </span>
                  </Link>
                  <Link href="/settings">
                    <span className="block px-4 py-2 text-sm hover:bg-muted cursor-pointer">
                      Settings
                    </span>
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={logout}
                    className="block w-full px-4 py-2 text-left text-sm text-destructive hover:bg-muted"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

// Default nav items for each portal type
export const adminNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Students", href: "/admin/students", icon: Users },
  { label: "Programmes", href: "/admin/programmes", icon: GraduationCap },
  { label: "Modules", href: "/admin/modules", icon: BookOpen },
  { label: "Enrolments", href: "/admin/enrolments", icon: UserCheck },
  { label: "Admissions", href: "/admin/admissions/dashboard", icon: Building2 },
  { label: "Assessment", href: "/admin/assessment/marks-entry", icon: ClipboardCheck },
  { label: "Finance", href: "/admin/finance/accounts", icon: Wallet },
  { label: "Attendance", href: "/admin/attendance/records", icon: Calendar },
  { label: "Timetable", href: "/admin/timetable", icon: Calendar },
  { label: "Support", href: "/admin/support/tickets", icon: Users },
  { label: "Compliance", href: "/admin/compliance/ukvi", icon: Shield },
  { label: "EC & Appeals", href: "/admin/ec-claims", icon: AlertTriangle },
  { label: "Documents", href: "/admin/documents", icon: FolderOpen },
  { label: "Governance", href: "/admin/governance/committees", icon: Building },
  { label: "Accommodation", href: "/admin/accommodation/blocks", icon: Hotel },
  { label: "Reports", href: "/admin/reports/dashboards", icon: FileText },
  { label: "Settings", href: "/admin/settings/system", icon: Settings },
];

export const academicNavItems: NavItem[] = [
  { label: "Dashboard", href: "/academic", icon: LayoutDashboard },
  { label: "My Modules", href: "/academic/modules", icon: BookOpen },
  { label: "My Students", href: "/academic/students", icon: Users },
  { label: "Assessments", href: "/academic/assessments", icon: ClipboardCheck },
  { label: "Timetable", href: "/academic/timetable", icon: Calendar },
  { label: "Reports", href: "/academic/reports", icon: FileText },
];

export const studentNavItems: NavItem[] = [
  { label: "Dashboard", href: "/student", icon: LayoutDashboard },
  { label: "My Programme", href: "/student/programme", icon: GraduationCap },
  { label: "Modules", href: "/student/modules", icon: BookOpen },
  { label: "Marks", href: "/student/marks", icon: ClipboardCheck },
  { label: "Timetable", href: "/student/timetable", icon: Calendar },
  { label: "Finance", href: "/student/finance", icon: Wallet },
  { label: "Attendance", href: "/student/attendance", icon: UserCheck },
  { label: "Documents", href: "/student/documents", icon: FileText },
];

export const applicantNavItems: NavItem[] = [
  { label: "Dashboard", href: "/applicant", icon: LayoutDashboard },
  { label: "My Application", href: "/applicant/application", icon: FileText },
  { label: "Programmes", href: "/applicant/programmes", icon: GraduationCap },
  { label: "Documents", href: "/applicant/documents", icon: FileText },
];
