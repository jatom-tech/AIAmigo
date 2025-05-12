import React from "react";

function HighRiskList({ risks = [] }) {
  // Debugging
  console.log("Modtagne risici:", risks);

  if (!Array.isArray(risks) || risks.length === 0) {
    return <p>⚠️ Ingen risikoelementer fundet</p>;
  }

  return (
    <div>
      <h2>⚠️ High-Risk Prompts</h2>
      <ul>
        {risks.map((risk, index) => (
          <li key={index}>{risk}</li>
        ))}
      </ul>
    </div>
  );
}

export default HighRiskList;

