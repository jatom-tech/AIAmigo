import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import UserContent from "./UserContent";
import Login from "./Login";

// Hent login-status og rolle fra localStorage
function getAuthState() {
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("role");
  return {
    loggedIn: !!token && !!role,
    role: role || "",
  };
}

function App() {
  const [loggedIn, setLoggedIn] = useState(getAuthState().loggedIn);
  const [role, setRole] = useState(getAuthState().role);

  // Hold login-status og rolle synkroniseret med localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const { loggedIn: freshLoggedIn, role: freshRole } = getAuthState();
      setLoggedIn(freshLoggedIn);
      setRole(freshRole);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Ved første load: hent auth-status
  useEffect(() => {
    const { loggedIn: freshLoggedIn, role: freshRole } = getAuthState();
    setLoggedIn(freshLoggedIn);
    setRole(freshRole);
  }, []);

  // Injicer content-pro.js kun for Pro-brugere OG kun hvis chrome.runtime findes
  useEffect(() => {
    if (
      localStorage.getItem("aiamigoPro") === "true" &&
      typeof chrome !== "undefined" &&
      chrome.runtime &&
      chrome.runtime.getURL
    ) {
      const script = document.createElement("script");
      script.src = chrome.runtime.getURL("content-pro.js");
      script.type = "text/javascript";
      script.async = true;
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [loggedIn, role]);

  // PrivateRoute: check login og evt. rolle
  const PrivateRoute = ({ children, roleRequired }) => {
    if (!loggedIn) return <Navigate to="/login" replace />;
    if (roleRequired && role !== roleRequired) return <Navigate to="/" replace />;
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setLoggedIn={setLoggedIn} setRole={setRole} />} />
        <Route
          path="/admin"
          element={
            <PrivateRoute roleRequired="admin">
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/chatgpt"
          element={
            <PrivateRoute roleRequired="user">
              <UserContent />
            </PrivateRoute>
          }
        />
        <Route
          path="/"
          element={
            loggedIn
              ? role === "admin"
                ? <Navigate to="/admin" replace />
                : <Navigate to="/chatgpt" replace />
              : <Navigate to="/login" replace />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;