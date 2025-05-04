import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // Sørg for, at App.jsx findes i src/
import "./App.css"; // Hvis du har en CSS-fil

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);