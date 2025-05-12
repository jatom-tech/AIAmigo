import React from "react";

function Blacklist({ blacklist }) {
  // Kontroller, om blacklist er en gyldig liste
  if (!Array.isArray(blacklist) || blacklist.length === 0) {
    return <p>Ingen blacklist-elementer fundet</p>;
  }

  return (
    <ul>
      {blacklist.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export default Blacklist;