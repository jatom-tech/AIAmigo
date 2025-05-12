import React from "react";

const ExportSection = () => {
  const exportCSV = () => {
    const csv = "Blacklist\n" + ["cpr", "sygdom", "afskedigelse"].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aiamigo_blacklist.csv";
    a.click();
  };

  return (
    <div className="section">
      <h2>📤 Export</h2>
      <button className="blue" onClick={exportCSV}>
        📤 Exportér CSV
      </button>
      <button className="red" onClick={() => alert("🗑️ Alt slettet!")}>
        🗑️ Slet alt
      </button>
    </div>
  );
};

export default ExportSection;