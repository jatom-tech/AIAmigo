import { useState } from "react";

export default function Login({ setLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const res = await fetch("http://localhost:8000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (data.access_token) {
      localStorage.setItem("token", `Bearer ${data.access_token}`);
      setLoggedIn(true);
    } else {
      alert("Login fejlede");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto flex flex-col gap-4">
      <input className="border p-2" placeholder="Brugernavn" onChange={e => setUsername(e.target.value)} />
      <input className="border p-2" placeholder="Adgangskode" type="password" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2">Login</button>
    </div>
  );
}
