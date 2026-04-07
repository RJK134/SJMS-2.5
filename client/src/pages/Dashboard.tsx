import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";
import StaffLayout from "@/components/layout/StaffLayout";
import AcademicLayout from "@/components/layout/AcademicLayout";
import StudentLayout from "@/components/layout/StudentLayout";
import ApplicantLayout from "@/components/layout/ApplicantLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  Calendar,
  Bell,
  FileText,
} from "lucide-react";

function DashboardContent() {
  const { user, roles } = useAuth();

  const stats = [
    { label: "Total Students", value: "2,847", icon: Users, change: "+12%" },
    { label: "Active Programmes", value: "45", icon: GraduationCap, change: "+3" },
    { label: "Modules Running", value: "312", icon: BookOpen, change: "Term 2" },
    { label: "Pending Assessments", value: "156", icon: ClipboardCheck, change: "Due this week" },
  ];

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
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-success" />
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick actions + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-accent" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { text: "Exam board meeting scheduled for 15 April", time: "2h ago" },
                { text: "3 new applications received for MSc Data Science", time: "4h ago" },
                { text: "Module feedback deadline approaching for CS201", time: "1d ago" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-start text-sm border-b last:border-0 pb-3 last:pb-0">
                  <span>{item.text}</span>
                  <span className="text-muted-foreground text-xs whitespace-nowrap ml-4">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { text: "Term 2 Assessment Period Begins", date: "14 Apr 2025" },
                { text: "Academic Board Meeting", date: "18 Apr 2025" },
                { text: "Graduation Ceremony", date: "12 Jul 2025" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-start text-sm border-b last:border-0 pb-3 last:pb-0">
                  <span>{item.text}</span>
                  <Badge variant="outline" className="text-xs whitespace-nowrap ml-4">
                    {item.date}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { roles, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Route to appropriate layout based on roles
  const hasAdminRole = roles.some((r) =>
    ["system_admin", "registry_manager", "registry_officer", "admissions_manager", "admissions_officer", "finance_manager", "finance_officer", "qa_manager"].includes(r)
  );
  const hasAcademicRole = roles.some((r) =>
    ["dean", "associate_dean", "programme_leader", "module_leader", "lecturer", "personal_tutor"].includes(r)
  );
  const hasStudentRole = roles.includes("student") || roles.includes("student_rep");
  const hasApplicantRole = roles.includes("applicant");

  if (hasAdminRole) {
    return <StaffLayout><DashboardContent /></StaffLayout>;
  }
  if (hasAcademicRole) {
    return <AcademicLayout><DashboardContent /></AcademicLayout>;
  }
  if (hasStudentRole) {
    return <StudentLayout><DashboardContent /></StudentLayout>;
  }
  if (hasApplicantRole) {
    return <ApplicantLayout><DashboardContent /></ApplicantLayout>;
  }

  // Default fallback
  return <StaffLayout><DashboardContent /></StaffLayout>;
}
