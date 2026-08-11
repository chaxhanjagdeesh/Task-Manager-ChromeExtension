import { useEffect, useState } from "react";
import {
  updateProfile,
  changePassword,
} from "@/api/user";

interface User {
  _id?: string;
  name?: string;
  email?: string;
}

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] =
    useState(false);

  const [user, setUser] = useState<User | null>(null);

  // Profile fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Password fields
  const [currentPassword, setCurrentPassword] =
    useState("");
  const [newPassword, setNewPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  // Loading states
  const [savingProfile, setSavingProfile] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  // Messages
  const [profileError, setProfileError] =
    useState("");

  const [profileSuccess, setProfileSuccess] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  const [passwordSuccess, setPasswordSuccess] =
    useState("");

  useEffect(() => {
    loadUser();
  }, []);

  function loadUser() {
    chrome.storage.local.get(
      ["user"],
      (result) => {
        const storedUser =
          result.user || null;

        setUser(storedUser);

        setName(
          storedUser?.name || ""
        );

        setEmail(
          storedUser?.email || ""
        );
      }
    );
  }

  function openProfile() {
    setOpen(false);

    setProfileError("");
    setProfileSuccess("");

    setPasswordError("");
    setPasswordSuccess("");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    loadUser();

    setShowProfileModal(true);
  }

  function closeProfile() {
    if (
      savingProfile ||
      changingPassword
    ) {
      return;
    }

    setShowProfileModal(false);
  }

  async function handleProfileSave(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setProfileError("");
    setProfileSuccess("");

    const trimmedName = name.trim();
    const trimmedEmail =
      email.trim().toLowerCase();

    if (!trimmedName) {
      setProfileError(
        "Name is required."
      );
      return;
    }

    if (!trimmedEmail) {
      setProfileError(
        "Email is required."
      );
      return;
    }

    try {
      setSavingProfile(true);

      const result: any =
        await updateProfile({
          name: trimmedName,
          email: trimmedEmail,
        });

      /*
       * Your backend should return:
       *
       * {
       *   message: "...",
       *   user: {...}
       * }
       */

      const updatedUser =
        result?.user || {
          ...user,
          name: trimmedName,
          email: trimmedEmail,
        };

      setUser(updatedUser);

      // Keep the updated user in extension storage
      await new Promise<void>(
        (resolve) => {
          chrome.storage.local.set(
            {
              user: updatedUser,
            },
            () => resolve()
          );
        }
      );

      setName(
        updatedUser.name || ""
      );

      setEmail(
        updatedUser.email || ""
      );

      setProfileSuccess(
        result?.message ||
          "Profile updated successfully."
      );
    } catch (error: any) {
      console.error(
        "Failed to update profile:",
        error
      );

      setProfileError(
        error?.response?.data?.message ||
          "Failed to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordChange(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError(
        "Current password is required."
      );
      return;
    }

    if (!newPassword) {
      setPasswordError(
        "New password is required."
      );
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        "New password must be at least 6 characters."
      );
      return;
    }

    if (
      newPassword !== confirmPassword
    ) {
      setPasswordError(
        "Passwords do not match."
      );
      return;
    }

    if (
      currentPassword === newPassword
    ) {
      setPasswordError(
        "New password must be different from your current password."
      );
      return;
    }

    try {
      setChangingPassword(true);

      const result: any =
        await changePassword({
          currentPassword,
          newPassword,
        });

      // Clear password fields after success
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordSuccess(
        result?.message ||
          "Password changed successfully."
      );
    } catch (error: any) {
      console.error(
        "Failed to change password:",
        error
      );

      setPasswordError(
        error?.response?.data?.message ||
          "Failed to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  }

  function logout() {
    chrome.storage.local.clear(() => {
      window.location.href = "/";
    });
  }

  return (
    <>
      {/* Profile button */}
      <div className="relative">
        <button
          type="button"
          onClick={() =>
            setOpen((value) => !value)
          }
          className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          title="Profile"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-xs">
            👤
          </span>

          <span className="max-w-[120px] truncate">
            {user?.name || "Profile"}
          </span>

          <span className="text-[10px] text-gray-400">
            ▼
          </span>
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
            {/* User information */}
            {/* <div className="border-b border-gray-100 px-4 py-3">
              <p className="truncate text-sm font-semibold text-gray-900">
                {user?.name || "User"}
              </p>

              {user?.email && (
                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {user.email}
                </p>
              )}
            </div> */}

            {/* Manage Profile */}
            <button
              type="button"
              onClick={openProfile}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 transition hover:bg-gray-50"
            >
              <span>⚙️</span>

              <span>
                <span className="block font-medium">
                  Account
                </span>

                {/* <span className="block text-xs text-gray-400">
                  Account settings
                </span> */}
              </span>
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 border-t border-gray-100 px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
            >
              <span>🚪</span>

              <span className="font-medium">
                Logout
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4"
          onClick={closeProfile}
        >
          <div
            className="max-h-[560px] w-full max-w-md overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* Modal header */}
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Manage Profile
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Update your account details and password.
                </p>
              </div>

              <button
                type="button"
                onClick={closeProfile}
                disabled={
                  savingProfile ||
                  changingPassword
                }
                className="rounded-lg px-2 py-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            {/* Account details */}
            <div className="px-6 py-5">
              <h3 className="text-sm font-semibold text-gray-900">
                Account Details
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Update your name or email address.
              </p>

              <form
                onSubmit={handleProfileSave}
                className="mt-4 space-y-4"
              >
                {/* Name */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">
                    Name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value
                      )
                    }
                    maxLength={100}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">
                    Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                  />
                </div>

                {/* Error */}
                {profileError && (
                  <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                    {profileError}
                  </div>
                )}

                {/* Success */}
                {profileSuccess && (
                  <div className="rounded-lg bg-green-50 px-3 py-2 text-xs text-green-600">
                    {profileSuccess}
                  </div>
                )}

                {/* Save */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingProfile
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>

            {/* Password */}
            <div className="border-t border-gray-100 px-6 py-5">
              <h3 className="text-sm font-semibold text-gray-900">
                Change Password
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Change the password you use to sign in.
              </p>

              <form
                onSubmit={
                  handlePasswordChange
                }
                className="mt-4 space-y-4"
              >
                {/* Current password */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">
                    Current Password
                  </label>

                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(
                        event.target.value
                      )
                    }
                    autoComplete="current-password"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                  />
                </div>

                {/* New password */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">
                    New Password
                  </label>

                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value
                      )
                    }
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                  />

                  <p className="mt-1 text-[11px] text-gray-400">
                    Minimum 6 characters.
                  </p>
                </div>

                {/* Confirm password */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">
                    Confirm New Password
                  </label>

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                  />
                </div>

                {/* Password error */}
                {passwordError && (
                  <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                    {passwordError}
                  </div>
                )}

                {/* Password success */}
                {passwordSuccess && (
                  <div className="rounded-lg bg-green-50 px-3 py-2 text-xs text-green-600">
                    {passwordSuccess}
                  </div>
                )}

                {/* Change password */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {changingPassword
                      ? "Changing..."
                      : "Change Password"}
                  </button>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={closeProfile}
                disabled={
                  savingProfile ||
                  changingPassword
                }
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}