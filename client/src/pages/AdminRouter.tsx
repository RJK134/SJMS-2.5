import { Route, Switch, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import StaffLayout from '@/components/layout/StaffLayout';

// Phase 5A — Core entity pages
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

// Phase 5B — Admissions
import ApplicationPipeline from './admissions/ApplicationPipeline';
import ApplicationDetail from './admissions/ApplicationDetail';
import OffersDashboard from './admissions/OffersDashboard';
import InterviewSchedule from './admissions/InterviewSchedule';
import EventsManagement from './admissions/EventsManagement';
import AgentManagement from './admissions/AgentManagement';
import AdmissionsDashboard from './admissions/AdmissionsDashboard';

// Phase 5B — Assessment
import MarksEntry from './assessment/MarksEntry';
import ModerationQueue from './assessment/ModerationQueue';
import ExamBoards from './assessment/ExamBoards';
import ExamBoardDetail from './assessment/ExamBoardDetail';
import ExternalExaminers from './assessment/ExternalExaminers';
import GradeDistribution from './assessment/GradeDistribution';

// Phase 5B — Finance
import AccountList from './finance/AccountList';
import AccountDetail from './finance/AccountDetail';
import Invoicing from './finance/Invoicing';
import PaymentRecording from './finance/PaymentRecording';
import PaymentPlans from './finance/PaymentPlans';
import Sponsors from './finance/Sponsors';
import Bursaries from './finance/Bursaries';
import DebtManagement from './finance/DebtManagement';
import Refunds from './finance/Refunds';

// Phase 5B — Attendance
import AttendanceRecords from './attendance/AttendanceRecords';
import EngagementDashboard from './attendance/EngagementDashboard';
import AlertsList from './attendance/AlertsList';
import Interventions from './attendance/Interventions';

// Phase 5B — Timetable
import TimetableView from './timetable/TimetableView';
import RoomManagement from './timetable/RoomManagement';
import ClashDetection from './timetable/ClashDetection';

// Phase 5B — Reports
import HESAReturn from './reports/HESAReturn';
import StatutoryReturns from './reports/StatutoryReturns';
import CustomReports from './reports/CustomReports';
import ManagementDashboards from './reports/ManagementDashboards';

function AdminContent() {
  return (
    <Switch>
      {/* Students */}
      <Route path="/admin/students/new" component={StudentCreate} />
      <Route path="/admin/students/:id" component={StudentProfile} />
      <Route path="/admin/students" component={StudentList} />

      {/* Programmes */}
      <Route path="/admin/programmes/new" component={ProgrammeCreate} />
      <Route path="/admin/programmes/:id" component={ProgrammeDetail} />
      <Route path="/admin/programmes" component={ProgrammeList} />

      {/* Modules */}
      <Route path="/admin/modules/:id" component={ModuleDetail} />
      <Route path="/admin/modules" component={ModuleList} />

      {/* Enrolments */}
      <Route path="/admin/enrolments/new" component={EnrolmentCreate} />
      <Route path="/admin/enrolments/:id" component={EnrolmentDetail} />
      <Route path="/admin/enrolments" component={EnrolmentList} />

      {/* Admissions */}
      <Route path="/admin/admissions/applications/:id" component={ApplicationDetail} />
      <Route path="/admin/admissions/applications" component={ApplicationPipeline} />
      <Route path="/admin/admissions/offers" component={OffersDashboard} />
      <Route path="/admin/admissions/interviews" component={InterviewSchedule} />
      <Route path="/admin/admissions/events" component={EventsManagement} />
      <Route path="/admin/admissions/agents" component={AgentManagement} />
      <Route path="/admin/admissions/dashboard" component={AdmissionsDashboard} />

      {/* Assessment */}
      <Route path="/admin/assessment/marks-entry" component={MarksEntry} />
      <Route path="/admin/assessment/moderation" component={ModerationQueue} />
      <Route path="/admin/assessment/exam-boards/:id" component={ExamBoardDetail} />
      <Route path="/admin/assessment/exam-boards" component={ExamBoards} />
      <Route path="/admin/assessment/external-examiners" component={ExternalExaminers} />
      <Route path="/admin/assessment/grade-distribution" component={GradeDistribution} />

      {/* Finance */}
      <Route path="/admin/finance/accounts/:studentId" component={AccountDetail} />
      <Route path="/admin/finance/accounts" component={AccountList} />
      <Route path="/admin/finance/invoicing" component={Invoicing} />
      <Route path="/admin/finance/payments" component={PaymentRecording} />
      <Route path="/admin/finance/payment-plans" component={PaymentPlans} />
      <Route path="/admin/finance/sponsors" component={Sponsors} />
      <Route path="/admin/finance/bursaries" component={Bursaries} />
      <Route path="/admin/finance/debt-management" component={DebtManagement} />
      <Route path="/admin/finance/refunds" component={Refunds} />

      {/* Attendance */}
      <Route path="/admin/attendance/records" component={AttendanceRecords} />
      <Route path="/admin/attendance/engagement" component={EngagementDashboard} />
      <Route path="/admin/attendance/alerts" component={AlertsList} />
      <Route path="/admin/attendance/interventions" component={Interventions} />

      {/* Timetable */}
      <Route path="/admin/timetable" component={TimetableView} />
      <Route path="/admin/timetable/rooms" component={RoomManagement} />
      <Route path="/admin/timetable/clashes" component={ClashDetection} />

      {/* Reports */}
      <Route path="/admin/reports/hesa" component={HESAReturn} />
      <Route path="/admin/reports/statutory" component={StatutoryReturns} />
      <Route path="/admin/reports/custom" component={CustomReports} />
      <Route path="/admin/reports/dashboards" component={ManagementDashboards} />

      {/* Default */}
      <Route>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome to the SJMS 2.5 administration portal.</p>
        </div>
      </Route>
    </Switch>
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
