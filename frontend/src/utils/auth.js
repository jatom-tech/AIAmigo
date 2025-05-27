// Central auth utility: login, logout, session helpers

// Gemmer auth-data og bruger-flag i localStorage
export function persistAuth(token, user, role, isPro) {
  localStorage.setItem("authToken", token);
  localStorage.setItem("user", user);
  localStorage.setItem("role", role);
  localStorage.setItem("aiamigoPro", isPro ? "true" : "false");
}

// Rydder auth-data fra localStorage
export function clearAuth() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  localStorage.removeItem("aiamigoPro");
}

// Brug React-router navigate til navigation
export function loginAndRedirect(token, user, role, isPro, navigate) {
  persistAuth(token, user, role, isPro);
  navigate("/dashboard");
}

export function logoutAndRedirect(navigate) {
  clearAuth();
  navigate("/login");
}

// Er bruger logget ind?
export function isLoggedIn() {
  return !!localStorage.getItem("authToken");
}

// Er bruger pro?
export function isProUser() {
  return localStorage.getItem("aiamigoPro") === "true";
}

// Hent rolle
export function getUserRole() {
  return localStorage.getItem("role");
}