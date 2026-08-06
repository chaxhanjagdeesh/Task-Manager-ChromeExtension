import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { getToken } from "./utils/storage.ts";

function App() {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    checkLogin();
  }, []);

  async function checkLogin() {
    const token = await getToken();

    setLoggedIn(!!token);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="w-[760px] h-[580px] flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={loggedIn ? <Dashboard /> : <Login />}
      />

      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;