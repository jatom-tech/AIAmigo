export default function LiteVsPro() {
  return (
    <div className="max-w-5xl mx-auto p-4 bg-white rounded-2xl shadow-md dark:bg-gray-900">
      <h2 className="text-2xl font-bold text-center mb-6 text-blue-600 dark:text-blue-400">🛡️ AIAmigo™ Lite vs Pro</h2>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border border-gray-300 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-3 text-left border border-gray-300 dark:border-gray-700">Funktion</th>
              <th className="p-3 text-center border border-gray-300 dark:border-gray-700">Lite (Gratis)</th>
              <th className="p-3 text-center border border-gray-300 dark:border-gray-700">Pro (Betalt)</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {[
              ["Skjold vises altid", "✅", "✅"],
              ["Lokal promptovervågning", "Hardcoded blacklist", "Dynamisk model & blacklist"],
              ["Farveindikator (grøn/gul/rød)", "✅", "✅"],
              ["Popup ved klik på skjold", "Antal prompts (grøn/gul/rød)", "Score + detaljer + forslag"],
              ["Auto-luk af panel", "✅ (5 sek)", "✅ (konfigurerbar)"],
              ["Lys/mørk tilstand", "Systemdetektion", "System + brugerindstilling"],
              ["Fil-upload & Enter-detektion", "Grundlæggende", "Avanceret (inkl. tale & multimodal input)"],
              ["Debug i konsol", "✅", "✅ + supportdata"],
              ["Login / brugerdata", "❌", "✅"],
              ["Admin-dashboard", "❌", "✅"],
              ["Organisationstilpasning", "❌", "✅"],
              ["Modelopslag / lookup", "❌", "✅"],
              ["Compliance-score", "❌", "✅"],
              ["Flere sprog", "❌", "✅"],
              ["Blokeringsfunktion (admin)", "❌", "✅"],
              ["Rapporteksport", "❌", "✅ (CSV/PDF)"],
              ["Integration (Copilot/DeepSeek)", "❌", "✅"],
              ["Support og opdateringer", "Community", "Prioriteret"],
            ].map(([feature, lite, pro], i) => (
              <tr key={i} className="border-t border-gray-300 dark:border-gray-700">
                <td className="p-2 border-r border-gray-300 dark:border-gray-700">{feature}</td>
                <td className="p-2 text-center border-r border-gray-300 dark:border-gray-700">{lite}</td>
                <td className="p-2 text-center">{pro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
