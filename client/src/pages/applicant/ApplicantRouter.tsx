import { Route, Switch } from 'wouter';
import ApplicantDashboard from './ApplicantDashboard';
import MyApplication from './MyApplication';
import EditApplication from './EditApplication';
import MyOffers from './MyOffers';
import UploadDocuments from './UploadDocuments';
import CourseSearch from './CourseSearch';
import ApplicantEvents from './Events';
import ContactAdmissions from './ContactAdmissions';
import ComingSoon from '@/components/ComingSoon';
import PortalNotFound from '@/components/shared/PortalNotFound';

export default function ApplicantRouter() {
  return (
    <Switch>
      <Route path="/applicant/application/edit" component={EditApplication} />
      <Route path="/applicant/application" component={MyApplication} />
      {/* Plural alias — external links and admin-side URLs use
          /applications/:id (plural). Applicant only has one application,
          so both the list and detail routes render MyApplication. */}
      <Route path="/applicant/applications/:id" component={MyApplication} />
      <Route path="/applicant/applications" component={MyApplication} />
      <Route path="/applicant/offers" component={MyOffers} />
      <Route path="/applicant/documents" component={UploadDocuments} />
      <Route path="/applicant/courses" component={CourseSearch} />
      <Route path="/applicant/events" component={ApplicantEvents} />
      <Route path="/applicant/contact" component={ContactAdmissions} />
      {/* Applicant landing — explicit so /applicant renders the
          dashboard via a real route rather than the catch-all, which is
          now the portal-scoped 404. */}
      <Route path="/applicant" component={ApplicantDashboard} />
      <Route path="/applicant/dashboard" component={ApplicantDashboard} />
      {/* ── Coming Soon landing ─────────────────────────────────────────
          The applicant sidebar links "Programmes" at /applicant/programmes
          but that page isn't yet built — use Courses from the sidebar
          until this lands. Registered so the path doesn't fall through
          to the portal-scoped 404 below. */}
      <Route path="/applicant/programmes">
        <ComingSoon title="Programmes" description="A dedicated programme directory for applicants is planned. In the meantime, use Courses from the sidebar to search the programme catalogue." />
      </Route>
      {/* Portal-scoped 404 — unknown /applicant/* paths render a
          deliberate NotFound card inside the ApplicantLayout instead of
          the dashboard fallback that previously masked typos. */}
      <Route>
        <PortalNotFound portalHref="/applicant" portalLabel="Applicant Portal" />
      </Route>
    </Switch>
  );
}
