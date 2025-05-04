import React from "react";

const Header = ({ lang, setLang }) => {
  return (
    <div className="section">
      <h1>🛡️ AIAmigo Admin Dashboard v2.6</h1>
      <div style={{ float: "right" }}>
        🌐 Sprog: 
        <select value={lang} onChange={(e) => setLang(e.target.value)}>
          <option value="da">🇩🇰</option>
          <option value="en">🇬🇧</option>
          <option value="es">🇪🇸</option>
        </select>
      </div>
    </div>
  );
};

export default Header;