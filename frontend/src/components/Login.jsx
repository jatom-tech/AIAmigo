import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAndRedirect } from "../utils/auth";

export default function Login({ setLoggedIn, setRole }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.access_token) {
        // Opdater auth-state og brug React-router navigation
        loginAndRedirect(
          `Bearer ${data.access_token}`,
          data.username,
          data.role,
          data.is_pro,
          navigate
        );
        setLoggedIn(true);
        if (typeof setRole === "function") setRole(data.role);
      } else {
        alert("Login fejlede (forkerte oplysninger eller manglende data)");
      }
    } catch (err) {
      alert("Der opstod en fejl under login – prøv igen!");
      console.error("Login-fejl:", err);
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="p-6 max-w-md mx-auto flex flex-col gap-4"
    >
      <input
        className="border p-2"
        placeholder="Brugernavn"
        value={username}
        onChange={e => setUsername(e.target.value)}
        autoComplete="username"
      />
      <input
        className="border p-2"
        placeholder="Adgangskode"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        autoComplete="current-password"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2"
      >
        Login
      </button>
    </form>
  );
}