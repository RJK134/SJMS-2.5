import { Route, Switch, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";

export default function App() {
  return (
    <Router hook={useHashLocation}>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/admin/:rest*" component={Dashboard} />
        <Route path="/academic/:rest*" component={Dashboard} />
        <Route path="/student/:rest*" component={Dashboard} />
        <Route path="/applicant/:rest*" component={Dashboard} />
        {/* Default redirect to login */}
        <Route>
          <Login />
        </Route>
      </Switch>
    </Router>
  );
}
