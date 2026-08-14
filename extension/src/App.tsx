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
import { sendHeartbeat } from "./api/presence";
import { getToken } from "./utils/storage";

function App() {
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    checkLogin();
  }, [location.pathname]);


  useEffect(() => {
    sendHeartbeat().catch((error) => {
      console.error("Initial heartbeat failed:", error);
    });
    const heartbeatInterval = window.setInterval(() => {
      sendHeartbeat().catch((error) => {
        console.error("Heartbeat failed:", error);
      });
    }, 30_000);
    return () => {
      window.clearInterval(heartbeatInterval);
    };
  }, []);
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