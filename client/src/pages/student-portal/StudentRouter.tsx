import { Route, Switch } from 'wouter';
import StudentDashboard from './StudentDashboard';
import MyProgramme from './MyProgramme';
import StudentMyModules from './MyModules';
import StudentModuleDetail from './StudentModuleDetail';
import MyMarks from './MyMarks';
import StudentMyTimetable from './MyTimetable';
import MyAccount from './MyAccount';
import MakePayment from './MakePayment';
import MyPaymentPlan from './MyPaymentPlan';
import MyAttendance from './MyAttendance';
import MyDocuments from './MyDocuments';
import MyTickets from './MyTickets';
import RaiseTicket from './RaiseTicket';
import StudentMyECClaims from './MyECClaims';
import StudentProfile from './StudentProfile';
import ComingSoon from '@/components/ComingSoon';
import PortalNotFound from '@/components/shared/PortalNotFound';

export default function StudentRouter() {
  return (
    <Switch>
      <Route path="/student/programme" component={MyProgramme} />
      <Route path="/student/modules/:id" component={StudentModuleDetail} />
      <Route path="/student/modules" component={StudentMyModules} />
      <Route path="/student/marks" component={MyMarks} />
      <Route path="/student/timetable" component={StudentMyTimetable} />
      <Route path="/student/finance/account" component={MyAccount} />
      <Route path="/student/finance/payments" component={MakePayment} />
      <Route path="/student/finance/payment-plan" component={MyPaymentPlan} />
      <Route path="/student/attendance" component={MyAttendance} />
      <Route path="/student/documents" component={MyDocuments} />
      <Route path="/student/support/tickets/new" component={RaiseTicket} />
      <Route path="/student/support/tickets" component={MyTickets} />
      <Route path="/student/ec-claims" component={StudentMyECClaims} />
      <Route path="/student/profile" component={StudentProfile} />
      {/* Student landing — explicit so /student renders the dashboard
          via a real route rather than the catch-all, which is now the
          portal-scoped 404. */}
      <Route path="/student" component={StudentDashboard} />
      <Route path="/student/dashboard" component={StudentDashboard} />
      {/* ── Coming Soon landing (Comet round 1 finding F2) ─────────────
          The student sidebar links "Assessments" at /student/assessments
          but that page isn't yet built. Use "My Marks" for marks and
          assignments until this view lands. */}
      <Route path="/student/assessments">
        <ComingSoon title="Assessments" description="A unified view of your current and upcoming assessments is planned. In the meantime, use My Marks from the sidebar to see marks and feedback for completed assessments, and open a module to see its component breakdown." />
      </Route>
      {/* Portal-scoped 404 — unknown /student/* paths render a
          deliberate NotFound card inside the StudentLayout instead of
          the dashboard fallback that previously masked typos. */}
      <Route>
        <PortalNotFound portalHref="/student" portalLabel="Student Portal" />
      </Route>
    </Switch>
  );
}
