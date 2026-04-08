import { Route, Switch } from 'wouter';
import AcademicDashboard from './AcademicDashboard';
import MyModules from './MyModules';
import MyModuleDetail from './MyModuleDetail';
import MyMarksEntry from './MyMarksEntry';
import MyModeration from './MyModeration';
import MyAttendance from './MyAttendance';
import MyTutees from './MyTutees';
import TuteeProfile from './TuteeProfile';
import MyTimetable from './MyTimetable';
import MyExamBoards from './MyExamBoards';
import MyECClaims from './MyECClaims';
import MyProfile from './MyProfile';

export default function AcademicRouter() {
  return (
    <Switch>
      <Route path="/academic/modules/:id" component={MyModuleDetail} />
      <Route path="/academic/modules" component={MyModules} />
      <Route path="/academic/marks-entry" component={MyMarksEntry} />
      <Route path="/academic/moderation" component={MyModeration} />
      <Route path="/academic/attendance" component={MyAttendance} />
      <Route path="/academic/tutees/:studentId" component={TuteeProfile} />
      <Route path="/academic/tutees" component={MyTutees} />
      <Route path="/academic/timetable" component={MyTimetable} />
      <Route path="/academic/exam-boards" component={MyExamBoards} />
      <Route path="/academic/ec-claims" component={MyECClaims} />
      <Route path="/academic/profile" component={MyProfile} />
      <Route component={AcademicDashboard} />
    </Switch>
  );
}
