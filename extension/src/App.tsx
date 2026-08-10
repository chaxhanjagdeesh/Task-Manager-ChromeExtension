import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Workspace from "./pages/Workspace";
import WorkspaceDetails from "./pages/WorkspaceDetails";

import { getToken } from "./utils/storage";

function App() {
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    checkLogin();
  }, [location.pathname]);

  async function checkLogin() {
    try {
      setLoading(true);

      const token = await getToken();

      setLoggedIn(Boolean(token));
    } catch (error) {
      console.error(
        "Failed to check login:",
        error
      );

      setLoggedIn(false);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[580px] w-[760px] items-center justify-center bg-white">
        <p className="text-sm text-gray-500">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Root */}
      <Route
        path="/"
        element={
          <Navigate
            to={
              loggedIn
                ? "/workspace"
                : "/login"
            }
            replace
          />
        }
      />

      {/* Login */}
      <Route
        path="/login"
        element={
          loggedIn ? (
            <Navigate
              to="/workspace"
              replace
            />
          ) : (
            <Login />
          )
        }
      />

      {/* Register */}
      <Route
        path="/register"
        element={
          loggedIn ? (
            <Navigate
              to="/workspace"
              replace
            />
          ) : (
            <Register />
          )
        }
      />

      {/* Workspace home */}
      <Route
        path="/workspace"
        element={
          loggedIn ? (
            <Workspace />
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />

      {/* Individual workspace */}
      <Route
        path="/workspace/:workspaceId"
        element={
          loggedIn ? (
            <WorkspaceDetails />
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          loggedIn ? (
            <Dashboard />
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />

      {/* Profile */}
      <Route
        path="/profile"
        element={
          loggedIn ? (
            <Profile />
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />

      {/* Unknown route */}
      <Route
        path="*"
        element={
          <Navigate
            to={
              loggedIn
                ? "/workspace"
                : "/login"
            }
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;