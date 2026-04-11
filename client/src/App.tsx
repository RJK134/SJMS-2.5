import { Route, Switch, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import AdminRouter from "@/pages/AdminRouter";
import AcademicPortal from "@/pages/AcademicPortal";
import StudentPortal from "@/pages/StudentPortal";
import ApplicantPortal from "@/pages/ApplicantPortal";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import NotFound from "@/components/shared/NotFound";

export default function App() {
  // Top-level ErrorBoundary catches render errors from any portal/page so a
  // broken route cannot unmount the whole SPA and leave the user with a
  // blank white screen. Previously, navigating to an unimplemented portal
  // then back to /admin crashed the entire tree — the boundary now shows a
  // recoverable fallback card with retry + dashboard navigation options.
  return (
    <ErrorBoundary>
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
          {/* Top-level 404 — any unmatched path shows the NotFound page with
              back/dashboard recovery actions. Previously we fell through to
              <Login />, which was confusing for authenticated users. */}
          <Route>
            <NotFound />
          </Route>
        </Switch>
      </Router>
    </ErrorBoundary>
  );
}
