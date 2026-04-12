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
      <Route component={StudentDashboard} />
    </Switch>
  );
}
