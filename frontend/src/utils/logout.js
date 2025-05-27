export function logoutAndRedirect() {
  localStorage.clear();
  // Du kan evt. også cleare sessionStorage, cookies mm. hvis nødvendigt
  window.location.href = "https://aiamigo.carrd.co/";
}
