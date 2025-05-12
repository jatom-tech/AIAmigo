import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";

// STYLING
import "./styles/input.css";  // Tailwind CSS

console.log("Root element:", document.getElementById("root"));

console.log("React forsøger at montere appen...");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

