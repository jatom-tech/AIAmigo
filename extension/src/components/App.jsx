import React from "react";
import { analyzeText } from "./risk-module.js"; // Korrekt sti til risk-module.js

const App = () => {
  const testText = "Denne tekst indeholder CPR og løn.";
  const result = analyzeText(testText);

  console.log("Testresultat:", result);

  return (
    <div>
      <h1>Velkommen til AIAmigo Admin Panel!</h1>
      <p>Analyseret tekst: {testText}</p>
      <p>Resultat: {JSON.stringify(result)}</p>
    </div>
  );
};

export default App;