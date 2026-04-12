import { Route, Switch } from 'wouter';
import StaffLayout from '@/components/layout/StaffLayout';
import { DashboardContent } from './Dashboard';
import { ADMIN_STAFF_ROLES } from '@/constants/roles';
import AuthLoadingOrError from '@/components/shared/AuthLoadingOrError';
import { usePortalGuard } from '@/hooks/usePortalGuard';
import ComingSoon from '@/components/ComingSoon';
import PortalNotFound from '@/components/shared/PortalNotFound';

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
import BulkModuleRegistration from './enrolments/BulkModuleRegistration';
import StatusChanges from './enrolments/StatusChanges';

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

// Phase 5C — Support
import TicketList from './support/TicketList';
import TicketDetail from './support/TicketDetail';
import FlagManagement from './support/FlagManagement';
import PersonalTutoring from './support/PersonalTutoring';
import WellbeingRecords from './support/WellbeingRecords';
import DisabilityRecords from './support/DisabilityRecords';

// Phase 5C — Compliance
import UKVIDashboard from './compliance/UKVIDashboard';
import UKVIDetail from './compliance/UKVIDetail';
import ContactPoints from './compliance/ContactPoints';
import HomeOfficeReports from './compliance/HomeOfficeReports';

// Phase 5C — EC/Appeals
import ECClaims from './ec-appeals/ECClaims';
import Appeals from './ec-appeals/Appeals';
import AcademicMisconduct from './ec-appeals/AcademicMisconduct';

// Phase 5C — Documents & Comms
import DocumentList from './documents/DocumentList';
import LetterGeneration from './documents/LetterGeneration';
import CommunicationLog from './documents/CommunicationLog';
import TemplateManagement from './documents/TemplateManagement';
import BulkCommunication from './documents/BulkCommunication';

// Phase 5C — Governance & Accommodation
import Committees from './governance/Committees';
import Meetings from './governance/Meetings';
import AccomBlocks from './accommodation/Blocks';
import AccomRooms from './accommodation/Rooms';
import AccomBookings from './accommodation/Bookings';

// Phase 5C — Settings
import SystemSettings from './settings/SystemSettings';
import UserManagement from './settings/UserManagement';
import RoleManagement from './settings/RoleManagement';
import AuditLogViewer from './settings/AuditLogViewer';
import AcademicCalendar from './settings/AcademicCalendar';
import AcademicYears from './settings/AcademicYears';

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
      <Route path="/admin/enrolments/module-registration" component={BulkModuleRegistration} />
      <Route path="/admin/enrolments/status-changes" component={StatusChanges} />
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
      <Route path="/admin/admissions/applicants">
        <ComingSoon title="Applicants" description="A flat applicant list for registry workflows is planned. In the meantime, use the Applications Pipeline to view and manage applicants by status." />
      </Route>
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
      <Route path="/admin/finance/transactions">
        <ComingSoon title="Transactions" description="A cross-account transaction search for the finance team is planned. In the meantime, open a student account to view its transaction history." />
      </Route>

      {/* Attendance */}
      <Route path="/admin/attendance/records" component={AttendanceRecords} />
      <Route path="/admin/attendance/engagement" component={EngagementDashboard} />
      <Route path="/admin/attendance/alerts" component={AlertsList} />
      <Route path="/admin/attendance/interventions" component={Interventions} />

      {/* Timetable — sub-routes before parent */}
      <Route path="/admin/timetable/rooms" component={RoomManagement} />
      <Route path="/admin/timetable/clashes" component={ClashDetection} />
      <Route path="/admin/timetable" component={TimetableView} />

      {/* Reports */}
      <Route path="/admin/reports/hesa" component={HESAReturn} />
      <Route path="/admin/reports/statutory" component={StatutoryReturns} />
      <Route path="/admin/reports/custom" component={CustomReports} />
      <Route path="/admin/reports/dashboards" component={ManagementDashboards} />

      {/* Support */}
      <Route path="/admin/support/tickets/:id" component={TicketDetail} />
      <Route path="/admin/support/tickets" component={TicketList} />
      <Route path="/admin/support/flags" component={FlagManagement} />
      <Route path="/admin/support/personal-tutoring" component={PersonalTutoring} />
      <Route path="/admin/support/wellbeing" component={WellbeingRecords} />
      <Route path="/admin/support/disability" component={DisabilityRecords} />

      {/* Compliance */}
      <Route path="/admin/compliance/ukvi/:studentId" component={UKVIDetail} />
      <Route path="/admin/compliance/ukvi" component={UKVIDashboard} />
      <Route path="/admin/compliance/contact-points" component={ContactPoints} />
      <Route path="/admin/compliance/reports" component={HomeOfficeReports} />

      {/* EC & Appeals */}
      <Route path="/admin/ec-claims" component={ECClaims} />
      <Route path="/admin/appeals" component={Appeals} />
      <Route path="/admin/academic-misconduct" component={AcademicMisconduct} />

      {/* Documents & Comms */}
      <Route path="/admin/documents/letters" component={LetterGeneration} />
      <Route path="/admin/documents" component={DocumentList} />
      <Route path="/admin/communications/templates" component={TemplateManagement} />
      <Route path="/admin/communications/bulk" component={BulkCommunication} />
      <Route path="/admin/communications" component={CommunicationLog} />

      {/* Governance & Accommodation */}
      <Route path="/admin/governance/committees" component={Committees} />
      <Route path="/admin/governance/meetings" component={Meetings} />
      <Route path="/admin/accommodation/blocks" component={AccomBlocks} />
      <Route path="/admin/accommodation/rooms" component={AccomRooms} />
      <Route path="/admin/accommodation/bookings" component={AccomBookings} />

      {/* Settings */}
      <Route path="/admin/settings/system" component={SystemSettings} />
      <Route path="/admin/settings/users" component={UserManagement} />
      <Route path="/admin/settings/roles" component={RoleManagement} />
      <Route path="/admin/settings/audit-log" component={AuditLogViewer} />
      <Route path="/admin/settings/academic-calendar" component={AcademicCalendar} />
      <Route path="/admin/settings/academic-years" component={AcademicYears} />

      {/* Admin landing — bare /admin renders the real dashboard content.
          `/admin/dashboard` is an explicit alias because several layouts
          and external links use it as a canonical deep link (Comet smoke
          test round 1 finding F4 — previously fell through to the old
          catch-all, making it ambiguous whether the dashboard was "real"
          or a fallback). Both paths render the same component. */}
      <Route path="/admin" component={DashboardContent} />
      <Route path="/admin/dashboard" component={DashboardContent} />

      {/* ── Coming Soon landings (Comet round 1 finding F2) ────────────
          Parent paths for sidebar categories whose landing pages are not
          yet built out. Previously these fell through to the catch-all
          and silently showed the dashboard, which the Comet smoke test
          flagged as "11 admin sidebar items silently redirect". Each
          renders a labelled ComingSoon card so the user sees a
          deliberate placeholder instead of a fake dashboard.

          Note: deeper routes under these parents (e.g. /admin/finance/accounts,
          /admin/assessment/marks-entry) are already registered above and
          continue to render their real implementations — only the bare
          parent path was broken. */}
      <Route path="/admin/admissions">
        <ComingSoon title="Admissions" description="Pick an Admissions sub-section from the sidebar to continue — the landing page is on the roadmap. Applications, offers, interviews, events, and agents are all wired." />
      </Route>
      <Route path="/admin/assessment">
        <ComingSoon title="Assessment" description="Choose an Assessment sub-section from the sidebar. Marks entry, moderation, exam boards, external examiners, and grade distribution are all wired." />
      </Route>
      <Route path="/admin/finance">
        <ComingSoon title="Finance" description="Choose a Finance sub-section from the sidebar. Accounts, invoicing, payments, payment plans, sponsors, bursaries, debt, and refunds are all wired." />
      </Route>
      <Route path="/admin/attendance">
        <ComingSoon title="Attendance" description="Choose an Attendance sub-section from the sidebar. Records, engagement, alerts, and interventions are all wired." />
      </Route>
      <Route path="/admin/support">
        <ComingSoon title="Support" description="Choose a Support sub-section from the sidebar. Tickets, flags, personal tutoring, wellbeing, and disability are all wired." />
      </Route>
      <Route path="/admin/compliance">
        <ComingSoon title="Compliance" description="Choose a Compliance sub-section from the sidebar. UKVI, contact points, and Home Office reports are all wired." />
      </Route>
      <Route path="/admin/ec-appeals">
        <ComingSoon title="EC & Appeals" description="Choose an EC & Appeals sub-section from the sidebar. EC claims, appeals, and academic misconduct are all wired." />
      </Route>
      <Route path="/admin/governance">
        <ComingSoon title="Governance" description="Choose a Governance sub-section from the sidebar. Committees and meetings are wired." />
      </Route>
      <Route path="/admin/accommodation">
        <ComingSoon title="Accommodation" description="Choose an Accommodation sub-section from the sidebar. Blocks, rooms, and bookings are wired." />
      </Route>
      <Route path="/admin/reports">
        <ComingSoon title="Reports" description="Choose a Reports sub-section from the sidebar. HESA, statutory returns, custom reports, and management dashboards are wired." />
      </Route>
      <Route path="/admin/settings">
        <ComingSoon title="Settings" description="Choose a Settings sub-section from the sidebar. System configuration, user management, roles, audit log, academic calendar, and academic years are wired." />
      </Route>

      {/* Default — any unknown /admin/* path is a portal-scoped 404
          rendered inside the StaffLayout. Previously the catch-all
          silently re-rendered the dashboard, which the Comet smoke test
          flagged as finding F3 — typos and stale bookmarks looked like
          successful navigation to the dashboard. */}
      <Route>
        <PortalNotFound portalHref="/admin" portalLabel="Staff Portal" />
      </Route>
    </Switch>
  );
}

export default function AdminRouter() {
  const guardState = usePortalGuard('admin', ADMIN_STAFF_ROLES);

  if (guardState !== 'allowed') {
    return <AuthLoadingOrError />;
  }

  return (
    <StaffLayout>
      <AdminContent />
    </StaffLayout>
  );
}
