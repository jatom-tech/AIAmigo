import React, { useEffect, useState } from "react";

const initialUsers = [
  { navn: "Admin", kilde: "CP", score: 90 },
  { navn: "Bruger 1", kilde: "DS", score: 73 },
  { navn: "Bruger 2", kilde: "ChatGPT", score: 63 },
  { navn: "Bruger 3", kilde: "GPT", score: 83 },
];

const initialBlacklist = ["cpr", "afskedigelse", "seksualitet", "diskrimination", "vold"];

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [language] = useState("🇩🇰");
  const [segment] = useState("Public");
  const [blacklist, setBlacklist] = useState(initialBlacklist);
  const [newWord, setNewWord] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:8000/admin/users", {
      headers: { Authorization: token },
    })
      .then((res) => res.ok ? res.json() : Promise.reject("Fejl"))
      .then((data) => setUsers(data))
      .catch(() => setUsers(initialUsers));
  }, []);

  const toggleWord = (word) => {
    setBlacklist((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]
    );
  };

  const handleAddWord = () => {
    if (newWord && !blacklist.includes(newWord.toLowerCase())) {
      setBlacklist([...blacklist, newWord.toLowerCase()]);
      setNewWord("");
    }
  };

  const gennemsnit = users.length
    ? Math.round(users.reduce((acc, u) => acc + u.score, 0) / users.length)
    : 0;

  const handleExport = () => {
    const csv = [
      ["Bruger", "Primær kilde", "Score"],
      ...users.map((u) => [u.navn, u.kilde, u.score]),
      ["Gennemsnit", "-", gennemsnit],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "aiamigo_scores.csv");
    link.click();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const today = "13-05-2025";
  const time = "06:54";

  return (
    <div className="p-4 bg-white rounded shadow text-sm max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-4">
        <div />
        <div className="text-right text-sm">
          <div className="text-base font-semibold text-gray-800">
            Sprog: {language}
          </div>
          <div className="text-base font-semibold text-gray-800">
            Segment: {segment}
          </div>
        </div>
      </div>

      <div className="flex justify-center mb-2">
        <img src="/logo.png" alt="AIAmigo logo" className="h-16 max-w-[180px]" />
      </div>

      <h2 className="text-2xl font-bold text-red-700 text-center mb-4">
        Admin Dashboard v2.7 ({language})
      </h2>

      <div className="flex justify-center">
        <table className="table-auto mb-4 border-collapse">
          <thead className="bg-gray-100 text-gray-700 text-left">
            <tr>
              <th className="px-2 py-1 whitespace-nowrap">Bruger</th>
              <th className="px-2 py-1 whitespace-nowrap">Primær kilde</th>
              <th className="px-2 py-1 whitespace-nowrap">Score</th>
              <th className="px-2 py-1 w-[160px]">Graf</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={idx} className="border-b">
                <td className="px-2 py-1 whitespace-nowrap">{user.navn}</td>
                <td className="px-2 py-1 whitespace-nowrap">{user.kilde}</td>
                <td className="px-2 py-1 whitespace-nowrap">{user.score}%</td>
                <td className="px-2 py-1">
                  <div className="w-[160px] bg-gray-200 h-2 rounded">
                    <div
                      className="h-2 bg-green-600 rounded"
                      style={{ width: `${user.score}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
            <tr className="font-semibold">
              <td className="px-2 py-1">Gennemsnit</td>
              <td className="px-2 py-1">–</td>
              <td className="px-2 py-1">{gennemsnit}%</td>
              <td className="px-2 py-1">
                <div className="w-[160px] bg-gray-200 h-2 rounded">
                  <div
                    className="h-2 bg-green-600 rounded"
                    style={{ width: `${gennemsnit}%` }}
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row sm:gap-4 mb-6 justify-end">
        <button
          onClick={handleExport}
          className="border border-red-600 text-red-600 px-4 py-2 rounded"
        >
          Eksporter CSV
        </button>
        <button
          onClick={handleLogout}
          className="border border-blue-600 text-blue-600 px-4 py-2 rounded"
        >
          Log ud
        </button>
      </div>

      <div className="mb-6 mx-auto max-w-sm">
        <h3 className="text-lg font-semibold text-red-700 mb-2">
          Blokerede emner
        </h3>
        <div className="flex flex-col items-start gap-1">
          {blacklist.map((word) => (
            <label
              key={word}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={blacklist.includes(word)}
                onChange={() => toggleWord(word)}
              />
              <span className="capitalize text-sm text-gray-700">{word}</span>
            </label>
          ))}
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="Tilføj nyt emne"
              className="border px-2 py-1 text-sm rounded"
            />
            <button
              onClick={handleAddWord}
              className="border border-gray-400 text-gray-700 px-3 py-1 rounded"
            >
              Tilføj
            </button>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-400 text-right mt-6">
        Sidst opdateret: {today} kl. {time}
      </div>
    </div>
  );
}




