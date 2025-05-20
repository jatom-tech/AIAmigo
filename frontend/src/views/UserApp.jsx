import React, { useEffect, useState } from "react";

export default function UserApp() {
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    // Indlæs risk-module.js hvis ikke allerede indlæst
    if (!document.querySelector('script[src="/chrome_extension/utils/risk-module.js"]')) {
      const riskScript = document.createElement("script");
      riskScript.src = "/chrome_extension/utils/risk-module.js";
      riskScript.async = true;
      document.body.appendChild(riskScript);
    }

    // Indlæs DialogModul.js hvis ikke allerede indlæst
    if (!document.querySelector('script[src="/chrome_extension/utils/DialogModul.js"]')) {
      const dialogScript = document.createElement("script");
      dialogScript.src = "/chrome_extension/utils/DialogModul.js";
      dialogScript.async = true;
      document.body.appendChild(dialogScript);
    }
  }, []);

  const handleTestSubmit = () => {
    const event = new CustomEvent("aiamigo-prompt", { detail: prompt });
    window.dispatchEvent(event);
    setPrompt("");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-green-700 mb-4">🧪 Test AIAmigo</h2>
      <p className="mb-2 text-sm text-gray-600">
        Indtast en prompt og klik "Test" for at aktivere risikovurdering:
      </p>

      <div className="flex gap-2">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Skriv fx: Hvad er CPR for Jens?"
          className="flex-grow border px-3 py-2 rounded text-sm"
        />
        <button
          onClick={handleTestSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Test
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Moduler indlæses og skjold/popup aktiveres automatisk.
      </p>
    </div>
  );
}



