import { Route, Switch, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import StaffLayout from '@/components/layout/StaffLayout';
import Dashboard from './Dashboard';
import StudentList from './students/StudentList';
import StudentCreate from './students/StudentCreate';
import StudentProfile from './students/StudentProfile';
import ProgrammeList from './programmes/ProgrammeList';
import ProgrammeCreate from './programmes/ProgrammeCreate';
import ProgrammeDetail from './programmes/ProgrammeDetail';
import ModuleList from './modules/ModuleList';
import ModuleDetail from './modules/ModuleDetail';
import EnrolmentList from './enrolments/EnrolmentList';
import EnrolmentCreate from './enrolments/EnrolmentCreate';
import EnrolmentDetail from './enrolments/EnrolmentDetail';

function AdminContent() {
  return (
    <Switch>
      <Route path="/admin/students/new" component={StudentCreate} />
      <Route path="/admin/students/:id" component={StudentProfile} />
      <Route path="/admin/students" component={StudentList} />
      <Route path="/admin/programmes/new" component={ProgrammeCreate} />
      <Route path="/admin/programmes/:id" component={ProgrammeDetail} />
      <Route path="/admin/programmes" component={ProgrammeList} />
      <Route path="/admin/modules/:id" component={ModuleDetail} />
      <Route path="/admin/modules" component={ModuleList} />
      <Route path="/admin/enrolments/new" component={EnrolmentCreate} />
      <Route path="/admin/enrolments/:id" component={EnrolmentDetail} />
      <Route path="/admin/enrolments" component={EnrolmentList} />
      <Route>
        <DashboardHome />
      </Route>
    </Switch>
  );
}

function DashboardHome() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground">Welcome to the SJMS 2.5 administration portal.</p>
    </div>
  );
}

export default function AdminRouter() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/login');
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
      </div>
    );
  }

  return (
    <StaffLayout>
      <AdminContent />
    </StaffLayout>
  );
}
