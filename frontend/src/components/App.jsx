import React, { useState } from "react";
import Dashboard from "./Dashboard";
import Login from "./Login";

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4 text-green-700">AIAmigo test</h1>
      {loggedIn ? (
        <Dashboard />
      ) : (
        <Login setLoggedIn={setLoggedIn} />
      )}
    </div>
  );
}

export default App;
