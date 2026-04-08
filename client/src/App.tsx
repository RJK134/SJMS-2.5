import { Route, Switch, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import AdminRouter from "@/pages/AdminRouter";

export default function App() {
  return (
    <Router hook={useHashLocation}>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/admin/:rest*" component={AdminRouter} />
        <Route path="/academic/:rest*" component={Dashboard} />
        <Route path="/student/:rest*" component={Dashboard} />
        <Route path="/applicant/:rest*" component={Dashboard} />
        <Route>
          <Login />
        </Route>
      </Switch>
    </Router>
  );
}
