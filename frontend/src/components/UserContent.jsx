import { useEffect, useState } from "react";
import LogoutButton from "./LogoutButton"; // Husk korrekt sti!

export default function UserContent() {
  const [submitted, setSubmitted] = useState(false);
  const [selected, setSelected] = useState([]);

  const platforms = [
    { name: "ChatGPT", url: "https://chat.openai.com/" },
    { name: "Microsoft Copilot", url: "https://copilot.microsoft.com/" },
    { name: "GitHub Copilot", url: "https://github.com/features/copilot" },
    { name: "Deepseek", url: "https://www.deepseek.com/" },
  ];

  useEffect(() => {
    if (!document.querySelector('script[src="/content.js"]')) {
      const script = document.createElement("script");
      script.src = "/content.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const togglePlatform = (name) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  const handleSubmit = () => setSubmitted(true);

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Velkommen til AIAmigo</h2>
      <p className="text-gray-600 mb-4">Skriv frit – skjoldet passer på dig.</p>

      {!submitted ? (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2 text-gray-700">
            Hvilke er dine favorit AI platforme?
          </h3>
          <div className="space-y-2">
            {platforms.map((p) => (
              <label key={p.name} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selected.includes(p.name)}
                  onChange={() => togglePlatform(p.name)}
                  className="accent-blue-600 w-5 h-5"
                />
                <span className="text-gray-800">{p.name}</span>
              </label>
            ))}
          </div>
          <button
            onClick={handleSubmit}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            OK / Accepter
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Dine valgte platforme:</h3>
          <ul className="list-disc list-inside space-y-1">
            {platforms
              .filter((p) => selected.includes(p.name))
              .map((p) => (
                <li key={p.name}>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {p.name}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Logud-knap placeres her, så den ALTID vises */}
      <div className="mt-6">
        <LogoutButton />
      </div>
    </div>
  );
}
