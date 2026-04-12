import { Route, Switch } from 'wouter';
import ApplicantDashboard from './ApplicantDashboard';
import MyApplication from './MyApplication';
import EditApplication from './EditApplication';
import MyOffers from './MyOffers';
import UploadDocuments from './UploadDocuments';
import CourseSearch from './CourseSearch';
import ApplicantEvents from './Events';
import ContactAdmissions from './ContactAdmissions';

export default function ApplicantRouter() {
  return (
    <Switch>
      <Route path="/applicant/application/edit" component={EditApplication} />
      <Route path="/applicant/application" component={MyApplication} />
      <Route path="/applicant/offers" component={MyOffers} />
      <Route path="/applicant/documents" component={UploadDocuments} />
      <Route path="/applicant/courses" component={CourseSearch} />
      <Route path="/applicant/events" component={ApplicantEvents} />
      <Route path="/applicant/contact" component={ContactAdmissions} />
      <Route component={ApplicantDashboard} />
    </Switch>
  );
}
