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
import MyStudents from './MyStudents';
import ComingSoon from '@/components/ComingSoon';
import PortalNotFound from '@/components/shared/PortalNotFound';

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
      {/* Academic landing — explicit so /academic renders the dashboard
          via a real route rather than the catch-all, which is now the
          portal-scoped 404. */}
      <Route path="/academic" component={AcademicDashboard} />
      <Route path="/academic/dashboard" component={AcademicDashboard} />
      {/* ── Coming Soon landings (Comet round 1 finding F2) ────────────
          The academic sidebar links "My Students" and "Assessments" at
          top-level paths that aren't yet built out. Render a labelled
          ComingSoon card instead of silently falling through to the
          dashboard. */}
      <Route path="/academic/students" component={MyStudents} />
      <Route path="/academic/assessments">
        <ComingSoon title="Assessments" description="A cross-module assessments view for teaching staff is planned. In the meantime, use Marks Entry and Moderation from the sidebar to review component-level work." />
      </Route>
      <Route path="/academic/reports">
        <ComingSoon title="Reports" description="Academic reports including module statistics, grade distributions, and cohort analytics are planned. Management dashboards and HESA extracts will be available from the admin portal." />
      </Route>
      {/* Portal-scoped 404 — unknown /academic/* paths render a
          deliberate NotFound card inside the AcademicLayout instead of
          the dashboard fallback that previously masked typos. */}
      <Route>
        <PortalNotFound portalHref="/academic" portalLabel="Academic Portal" />
      </Route>
    </Switch>
  );
}
