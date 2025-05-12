import React from "react";

const LogoutSection = ({ onLogout }) => {
  return (
    <div className="section">
      <h2>🔓 Log ud</h2>
      <button className="green" onClick={onLogout}>
        Log ud
      </button>
    </div>
  );
};

export default LogoutSection;