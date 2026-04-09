import { Route, Switch, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import AdminRouter from "@/pages/AdminRouter";
import AcademicPortal from "@/pages/AcademicPortal";
import StudentPortal from "@/pages/StudentPortal";
import ApplicantPortal from "@/pages/ApplicantPortal";

export default function App() {
  return (
    <Router hook={useHashLocation}>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/admin/:rest*">{() => <AdminRouter />}</Route>
        <Route path="/academic/:rest*">{() => <AcademicPortal />}</Route>
        <Route path="/student/:rest*">{() => <StudentPortal />}</Route>
        <Route path="/applicant/:rest*">{() => <ApplicantPortal />}</Route>
        <Route>
          <Login />
        </Route>
      </Switch>
    </Router>
  );
}
