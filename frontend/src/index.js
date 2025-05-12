import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App"; // Sørg for, at stien er korrekt
import "./styles/App.css"; // Importér CSS, hvis nødvendigt

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);