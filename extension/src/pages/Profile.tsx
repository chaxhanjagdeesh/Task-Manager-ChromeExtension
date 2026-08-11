import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from "@/api/user";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface StoredUser {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
}

export default function Profile() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const user = await getProfile();

      setName(user.name);
      setEmail(user.email);
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  }

  async function saveProfile() {
    try {
      await updateProfile({
        name,
        email,
      });

chrome.storage.local.get(["user"], (result) => {
  const storedUser =
    result.user as StoredUser | undefined;

  chrome.storage.local.set({
    user: {
      ...(storedUser || {}),
      name,
      email,
    },
  });
});

      alert("Profile updated.");
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          "Something went wrong"
      );
    }
  }

  async function updatePassword() {
    if (!currentPassword || !newPassword) {
      return alert("Fill both password fields.");
    }

    try {
      await changePassword({
        currentPassword,
        newPassword,
      });

      alert("Password changed.");

      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          "Something went wrong"
      );
    }
  }

  async function removeAccount() {
    const ok = confirm(
      "Delete your account permanently?"
    );

    if (!ok) return;

    try {
      await deleteAccount();

      chrome.storage.local.clear();

      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  }

  function logout() {
    chrome.storage.local.clear(() => {
      navigate("/login");
    });
  }

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-5">

      <Card className="w-[760px] space-y-6 p-6">

<div className="flex items-center gap-3">

  <button
    onClick={() => navigate("/dashboard")}
    className="rounded-full p-2 hover:bg-gray-100"
  >
    <ArrowLeft size={22} />
  </button>

<div className="flex items-center gap-3">

  <button
    onClick={() => navigate(-1)}
    className="rounded-full p-2 hover:bg-gray-100"
  >
  </button>

  <h1 className="text-2xl font-bold">
    My Profile
  </h1>

</div>

</div>

        <div className="space-y-3">

          <Input
            placeholder="Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

          <Input
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <Button
            className="w-full"
            onClick={saveProfile}
          >
            Save Changes
          </Button>

        </div>

        <hr />

        <div className="space-y-3">

          <Input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) =>
              setCurrentPassword(
                e.target.value
              )
            }
          />

          <Input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
          />

          <Button
            className="w-full"
            onClick={updatePassword}
          >
            Change Password
          </Button>

        </div>

        <hr />

        <Button
          variant="outline"
          className="w-full"
          onClick={logout}
        >
          Logout
        </Button>

        <Button
          variant="destructive"
          className="w-full"
          onClick={removeAccount}
        >
          Delete Account
        </Button>

      </Card>

    </div>
  );
}