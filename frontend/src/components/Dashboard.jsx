import { logoutAndRedirect } from "../utils/logout";
import React, { useEffect, useState } from "react";
// import { Bar } from "react-chartjs-2"; // Uncomment hvis du bruger Chart.js

const initialUsers = [
  { navn: "Admin", kilde: "CP", score: 90, chats: 42 },
  { navn: "Bruger 1", kilde: "DS", score: 73, chats: 12 },
  { navn: "Bruger 2", kilde: "ChatGPT", score: 63, chats: 9 },
  { navn: "Bruger 3", kilde: "GPT", score: 83, chats: 29 },
];

const initialBlacklist = ["cpr", "afskedigelse", "seksualitet", "diskrimination", "vold"];

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [language] = useState("🇩🇰");
  const [segment] = useState("Public");
  const [blacklist, setBlacklist] = useState(initialBlacklist);
  const [newWord, setNewWord] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    fetch("http://localhost:8000/admin/users", {
      headers: { Authorization: token },
    })
      .then((res) => res.ok ? res.json() : Promise.reject("Fejl"))
      .then((data) => setUsers(data))
      .catch(() => setUsers(initialUsers));
    // ...eventuel script-loading
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
      ["Bruger", "Primær kilde", "Score", "Antal chats"],
      ...users.map((u) => [u.navn, u.kilde, u.score, u.chats]),
      ["Gennemsnit", "-", gennemsnit, ""],
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

  // Nu bruger vi best practice logout!
  const handleLogout = () => {
    logoutAndRedirect();
  };

  const today = "13-05-2025";
  const time = "06:54";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-200 py-8 px-2">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg px-8 pb-8 pt-6 relative">
        <div className="flex justify-between items-center mb-2">
          <img src="/logo.png" alt="AIAmigo logo" className="h-14" />
          <div className="text-right">
            <div className="font-bold text-black">Sprog: {language}</div>
            <div className="font-bold text-black">Segment: {segment}</div>
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-red-700 text-center tracking-tight mb-8 drop-shadow">
          Admin Dashboard
        </h2>

        {/* Bruger-kort */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {users.map((user, idx) => (
            <div
              key={idx}
              className="bg-gray-900 rounded-xl shadow p-6 flex flex-col gap-3 border-2 border-red-600"
            >
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-white">{user.navn}</span>
                <span className="bg-red-700 text-white rounded px-2 py-1 text-xs font-mono">
                  {user.kilde}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-red-400">{user.score}%</span>
                <div className="flex-1">
                  <div className="w-full bg-gray-700 rounded h-2">
                    <div
                      className="h-2 bg-red-600 rounded"
                      style={{ width: `${user.score}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-200">
                <span className="font-light">Chats:</span>
                <span className="font-semibold text-white">{user.chats ?? "?"}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Gennemsnit og graf */}
        <div className="mb-8">
          <div className="bg-red-50 border border-red-200 rounded-xl py-4 px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xl font-semibold text-red-800">Gennemsnitlig score:</span>
              <span className="text-2xl font-extrabold text-black">{gennemsnit}%</span>
            </div>
            <div className="w-full max-w-xs md:max-w-sm">
              {/* 
              <Bar data={barData} options={{ plugins: { legend: { display: false }}}}/>
              */}
              <div className="text-sm text-red-800 italic">[Plads til graf over brugerforbrug]</div>
            </div>
          </div>
        </div>

        {/* Knapper */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <button
            onClick={handleExport}
            className="bg-white border-2 border-red-700 text-red-700 font-bold px-6 py-2 rounded-lg hover:bg-red-50 transition"
          >
            Eksporter CSV
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-700 text-white font-bold px-6 py-2 rounded-lg hover:bg-black hover:text-red-400 border-2 border-red-700 transition"
          >
            Log ud
          </button>
        </div>

        {/* Blacklist */}
        <div className="mx-auto max-w-md bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-inner">
          <h3 className="text-lg font-bold text-red-700 mb-3">
            Blokerede emner
          </h3>
          <div className="flex flex-col items-start gap-2">
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
            <div className="mt-3 flex gap-2 w-full">
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder="Tilføj nyt emne"
                className="border px-3 py-2 text-sm rounded flex-1"
              />
              <button
                onClick={handleAddWord}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-400 hover:bg-red-700 transition"
              >
                Tilføj
              </button>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-400 text-right mt-8">
          Sidst opdateret: {today} kl. {time}
        </div>
      </div>
    </div>
  );
}