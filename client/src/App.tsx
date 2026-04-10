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
        {/* wouter v3 + regexparam v3: `/admin/:rest*` is parsed as a single-segment
            parameter literally named "rest*" and only matches `/admin/students`-style
            paths. `/admin/*?` compiles to `^/admin(?:/(.*))?/?$` which matches
            `/admin`, `/admin/foo`, and `/admin/foo/bar` — what we want for a
            nested portal. */}
        <Route path="/admin/*?">{() => <AdminRouter />}</Route>
        <Route path="/academic/*?">{() => <AcademicPortal />}</Route>
        <Route path="/student/*?">{() => <StudentPortal />}</Route>
        <Route path="/applicant/*?">{() => <ApplicantPortal />}</Route>
        <Route>
          <Login />
        </Route>
      </Switch>
    </Router>
  );
}
