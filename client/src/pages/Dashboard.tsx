import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";
import StaffLayout from "@/components/layout/StaffLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/shared/StatCard";
import AuthLoadingOrError from "@/components/shared/AuthLoadingOrError";
import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  Calendar,
  Bell,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  category: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  eventType: string;
}

function NotificationsCard() {
  const { data, isLoading } = useQuery<{ success: boolean; data: Notification[]; pagination: any }>({
    queryKey: ['dashboard-notifications'],
    queryFn: async () => {
      const { data } = await api.get('/v1/communications/notifications', { params: { limit: 5, isRead: 'false' } });
      return data;
    },
  });
  const notifications = data?.data ?? [];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5 text-accent" />
          Recent Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map(n => (
              <div key={n.id} className="flex justify-between items-start text-sm border-b last:border-0 pb-3 last:pb-0">
                <span>{n.title}</span>
                <span className="text-muted-foreground text-xs whitespace-nowrap ml-4">
                  {new Date(n.createdAt).toLocaleDateString('en-GB')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">No recent notifications</p>
        )}
      </CardContent>
    </Card>
  );
}

function CalendarEventsCard() {
  const { data, isLoading } = useQuery<{ success: boolean; data: CalendarEvent[]; pagination: any }>({
    queryKey: ['dashboard-calendar'],
    queryFn: async () => {
      const { data } = await api.get('/v1/attendance/calendar/events', { params: { limit: 5, fromDate: new Date().toISOString() } });
      return data;
    },
  });
  const events = data?.data ?? [];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : events.length > 0 ? (
          <div className="space-y-3">
            {events.map(e => (
              <div key={e.id} className="flex justify-between items-start text-sm border-b last:border-0 pb-3 last:pb-0">
                <span>{e.title}</span>
                <Badge variant="outline" className="text-xs whitespace-nowrap ml-4">
                  {new Date(e.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">No upcoming events</p>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardStats {
  students: { total: number };
  programmes: { total: number };
  modules: { total: number };
  enrolments: { active: number };
  assessments: { pending: number };
  applications: { total: number };
}

export function DashboardContent() {
  const { user, roles } = useAuth();
  const { data, isLoading, isError } = useQuery<{ success: boolean; data: DashboardStats }>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/v1/reports/dashboard/stats');
      return data;
    },
  });

  const stats = data?.data;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.firstName}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your Student Journey Management System
        </p>
        <div className="flex gap-2 mt-2">
          {roles.slice(0, 3).map((role) => (
            <Badge key={role} variant="secondary" className="text-xs">
              {role.replace(/_/g, " ")}
            </Badge>
          ))}
          {roles.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{roles.length - 3} more
            </Badge>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><div className="h-16 animate-pulse bg-muted rounded" /></CardContent></Card>
          ))
        ) : isError ? (
          <Card className="col-span-4">
            <CardContent className="p-6 text-center text-destructive flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4" /> Unable to load dashboard statistics
            </CardContent>
          </Card>
        ) : (
          <>
            <StatCard label="Total Students" value={stats?.students.total ?? 0} icon={Users} />
            <StatCard label="Active Programmes" value={stats?.programmes.total ?? 0} icon={GraduationCap} />
            <StatCard label="Modules" value={stats?.modules.total ?? 0} icon={BookOpen} />
            <StatCard label="Active Enrolments" value={stats?.enrolments.active ?? 0} icon={ClipboardCheck} />
          </>
        )}
      </div>

      {/* Notifications + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NotificationsCard />
        <CalendarEventsCard />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { roles, isAuthenticated, isLoading, authError } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Redirect non-staff roles to their portal-specific dashboards so they
  // never see institution-wide KPIs (Total Students, Active Programmes, etc.)
  //
  // PRIORITY ORDER (BugBot fix fc25deae): admin check MUST run first because
  // the admin persona also holds 'dean' which overlaps with academic roles.
  // A user who holds ANY admin role stays on the institutional dashboard.
  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    // 1. Admin/staff → stay here (no redirect). Checked first because admin
    //    personas may also hold academic roles like 'dean'.
    const hasAdminRole = roles.some((r) =>
      [
        "super_admin", "system_admin", "registrar",
        "senior_registry_officer", "registry_officer",
        "admissions_manager", "admissions_officer",
        "assessment_officer", "progression_officer", "graduation_officer",
        "finance_director", "finance_manager", "finance_officer",
        "quality_director", "quality_officer", "compliance_officer",
        "student_support_manager", "student_support_officer",
        "international_officer", "accommodation_officer",
      ].includes(r)
    );
    if (hasAdminRole) return; // ← institutional KPI dashboard

    // 2. Academic-only (no admin overlap) → academic portal
    const hasAcademicRole = roles.some((r) =>
      ["dean", "associate_dean", "head_of_department", "programme_leader", "module_leader", "academic_staff", "lecturer", "senior_lecturer", "professor", "personal_tutor"].includes(r)
    );
    if (hasAcademicRole) {
      navigate("/academic/dashboard");
      return;
    }

    // 3. Student → student portal
    const hasStudentRole = roles.includes("student") || roles.includes("student_rep");
    if (hasStudentRole) {
      navigate("/student/dashboard");
      return;
    }

    // 4. Applicant → applicant portal
    const hasApplicantRole = roles.includes("applicant");
    if (hasApplicantRole) {
      navigate("/applicant/dashboard");
      return;
    }

    // 5. Fallback → stay on default dashboard (no redirect)
  }, [isLoading, isAuthenticated, roles, navigate]);

  if (isLoading || authError) {
    return <AuthLoadingOrError />;
  }

  // Only admin/staff roles reach this point — institutional KPIs are appropriate
  return <StaffLayout><DashboardContent /></StaffLayout>;
}
