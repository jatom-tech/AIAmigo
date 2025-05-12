import React from "react";

const TestDataSection = ({ onInsertTestData }) => {
  return (
    <div className="section">
      <h2>🧪 Testdata</h2>
      <button className="green" onClick={onInsertTestData}>
        Indsæt testdata
      </button>
    </div>
  );
};

export default TestDataSection;