import React from "react";

function ComplianceTable({ data }) {
  console.log("Modtaget data i ComplianceTable:", data);

  if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
    return <p>Ingen data tilgængelige</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Nøgle</th>
          <th>Værdi</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(data).map(([key, value]) => (
          <tr key={key}>
            <td>{key}</td>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ComplianceTable;
