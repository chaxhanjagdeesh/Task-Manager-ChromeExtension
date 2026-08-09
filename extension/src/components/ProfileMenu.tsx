import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

function logout() {
  chrome.storage.local.clear(() => {
   window.location.href = "/";
  });
}
useEffect(() => {
  chrome.storage.local.get(["user"], (result) => {
    setUser(result.user);
  });
}, []);
  return (
    <div className="relative">

      <Button
  variant="outline"
  onClick={() => setOpen(!open)}
>
  👤 {user?.name || "Profile"}
</Button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 rounded-lg border bg-white shadow-lg">

          <button
            onClick={() => {
              setOpen(false);
              navigate("/profile");
            }}
            className="block w-full px-4 py-3 text-left hover:bg-gray-100"
          >
            ⚙️ Manage Profile
          </button>

          <button
            onClick={logout}
            className="block w-full px-4 py-3 text-left text-red-600 hover:bg-red-50"
          >
            🚪 Logout
          </button>

        </div>
      )}

    </div>
  );
}