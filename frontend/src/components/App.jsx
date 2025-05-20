import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import Dashboard from "./Dashboard";  // Admin Panel
import UserApp from "./views/UserApp";  // Opdateret sti til views
import Login from "./Login";  // Login komponent

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');

    if (token && userRole) {
      setLoggedIn(true);
      setRole(userRole);
    } else {
      setLoggedIn(false);
    }
  }, []);

  return (
    <Router>
      <Switch>
        {/* Login route */}
        <Route path="/login">
          <Login setLoggedIn={setLoggedIn} setRole={setRole} />
        </Route>

        {/* Beskyttede ruter */}
        <PrivateRoute path="/admin" roleRequired="admin">
          <Dashboard />
        </PrivateRoute>
        <PrivateRoute path="/chatgpt" roleRequired="user">
          <UserApp />
        </PrivateRoute>

        {/* Default redirect */}
        <Redirect from="/" to={loggedIn ? (role === "admin" ? "/admin" : "/chatgpt") : "/login"} />
      </Switch>
    </Router>
  );
}

// PrivateRoute - Beskytter de ruter, der kræver en bestemt rolle
function PrivateRoute({ children, roleRequired, ...rest }) {
  const token = localStorage.getItem('authToken');
  const role = localStorage.getItem('userRole');

  return (
    <Route
      {...rest}
      render={({ location }) =>
        token ? (
          role === roleRequired ? (children) : (
            <Redirect to={{ pathname: "/", state: { from: location } }} />
          )
        ) : (
          <Redirect to={{ pathname: "/login", state: { from: location } }} />
        )
      }
    />
  );
}

export default App;
