import { useEffect, useState } from "react";

import {
  getWorkspaceMembers,
  createInvitation,
  getWorkspaceInvitations,
  revokeInvitation,
} from "../../api/workspace";

interface MemberUser {
  _id: string;
  name?: string;
  email?: string;
  lastSeen?: string | null;
}

interface WorkspaceMember {
  _id: string;
  user: MemberUser | string;
  role: "admin" | "user";
  createdAt?: string;
}

interface WorkspaceMembersProps {
  workspaceId: string;
  isAdmin: boolean;
}

interface WorkspaceInvitation {
  _id: string;

  invitedUser: {
    _id: string;
    name?: string;
    email?: string;
  };

  invitedEmail?: string;

  status: "pending" | "accepted" | "rejected" | "expired";

  expiresAt: string;

  createdAt: string;
}

export default function WorkspaceMembers({
  workspaceId,
  isAdmin,
}: WorkspaceMembersProps) {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");

  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  const [invitations, setInvitations] =
    useState<WorkspaceInvitation[]>([]);

  const [invitationsOpen, setInvitationsOpen] =
    useState(false);

  const [invitationsLoading, setInvitationsLoading] =
    useState(false);

  const [revokeLoading, setRevokeLoading] =
    useState<string | null>(null);

  /*
   * =====================================================
   * CHECK ONLINE STATUS
   * =====================================================
   *
   * A user is considered online if their last heartbeat
   * was received within the last 60 seconds.
   */
  function isUserOnline(lastSeen?: string | null) {
    if (!lastSeen) {
      return false;
    }

    const lastSeenTime = new Date(lastSeen).getTime();

    if (Number.isNaN(lastSeenTime)) {
      return false;
    }

    return Date.now() - lastSeenTime < 60_000;
  }


  function getLastSeenText(lastSeen?: string | null) {
  if (!lastSeen) {
    return "Never";
  }

  const lastSeenTime = new Date(lastSeen).getTime();

  if (Number.isNaN(lastSeenTime)) {
    return "Unknown";
  }

  const difference = Date.now() - lastSeenTime;

  const seconds = Math.floor(difference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) {
    return "just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  if (weeks < 5) {
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }

  return `${months} month${months === 1 ? "" : "s"} ago`;
}
  /*
   * =====================================================
   * LOAD INVITATIONS
   * =====================================================
   */

  async function loadInvitations() {
    if (!isAdmin) {
      return;
    }

    try {
      setInvitationsLoading(true);

      const data: any =
        await getWorkspaceInvitations(workspaceId);

      setInvitations(
        Array.isArray(data)
          ? data
          : data?.invitations || []
      );
    } catch (error) {
      console.error(
        "Failed to load workspace invitations:",
        error
      );

      setInvitations([]);
    } finally {
      setInvitationsLoading(false);
    }
  }

  /*
   * =====================================================
   * LOAD MEMBERS
   * =====================================================
   */

  async function loadMembers() {
    try {
      setLoading(true);
      setError("");

      const data: any =
        await getWorkspaceMembers(workspaceId);

      const memberList = Array.isArray(data)
        ? data
        : data?.members || [];

      setMembers(memberList);
    } catch (error: any) {
      console.error(
        "Failed to load workspace members:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to load members"
      );

      setMembers([]);
    } finally {
      setLoading(false);
    }
  }

  /*
   * =====================================================
   * INITIAL LOAD
   * =====================================================
   */

  useEffect(() => {
    loadMembers();
    loadInvitations();
  }, [workspaceId, isAdmin]);

  /*
   * =====================================================
   * REFRESH MEMBER PRESENCE
   * =====================================================
   *
   * Refresh the member list every 30 seconds so that
   * online/offline status stays reasonably current.
   */

  useEffect(() => {
    const interval = window.setInterval(() => {
      loadMembers();
    }, 30_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [workspaceId]);

  /*
   * =====================================================
   * REVOKE INVITATION
   * =====================================================
   */

  async function handleRevokeInvitation(
    invitationId: string
  ) {
    try {
      setRevokeLoading(invitationId);

      await revokeInvitation(
        workspaceId,
        invitationId
      );

      setInvitations((current) =>
        current.filter(
          (invitation) =>
            invitation._id !== invitationId
        )
      );
    } catch (error: any) {
      console.error(
        "Failed to revoke invitation:",
        error
      );

      setInviteError(
        error?.response?.data?.message ||
          "Failed to revoke invitation"
      );
    } finally {
      setRevokeLoading(null);
    }
  }

  /*
   * =====================================================
   * INVITE MEMBER
   * =====================================================
   */

  async function handleInvite(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setInviteError("Email is required.");
      return;
    }

    try {
      setInviteLoading(true);
      setInviteError("");
      setInviteSuccess("");

      await createInvitation(
        workspaceId,
        normalizedEmail
      );

      setInviteSuccess(
        "Invitation created successfully."
      );

      setEmail("");

      await loadInvitations();

      setTimeout(() => {
        setShowInvite(false);
        setInviteSuccess("");
      }, 1200);
    } catch (error: any) {
      console.error(
        "Failed to create invitation:",
        error
      );

      setInviteError(
        error?.response?.data?.message ||
          "Failed to create invitation"
      );
    } finally {
      setInviteLoading(false);
    }
  }

  /*
   * =====================================================
   * USER HELPERS
   * =====================================================
   */

  function getUserName(
    user: MemberUser | string
  ) {
    if (typeof user === "string") {
      return user;
    }

    return user.name || "Unknown user";
  }

  function getUserEmail(
    user: MemberUser | string
  ) {
    if (typeof user === "string") {
      return "";
    }

    return user.email || "";
  }

  function getInitial(
    user: MemberUser | string
  ) {
    const name = getUserName(user);

    return (
      name.trim().charAt(0).toUpperCase() || "U"
    );
  }

  /*
   * =====================================================
   * LOADING
   * =====================================================
   */

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-gray-500">
          Loading members...
        </p>
      </div>
    );
  }

  /*
   * =====================================================
   * ERROR
   * =====================================================
   */

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-red-500">
          {error}
        </p>

        <button
          type="button"
          onClick={loadMembers}
          className="mt-3 rounded-lg border border-gray-200 px-3 py-1.5 text-xs hover:bg-gray-50"
        >
          Try again
        </button>
      </div>
    );
  }

  /*
   * =====================================================
   * RENDER
   * =====================================================
   */

  return (
    <div className="p-5">

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Members
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            People who are part of this workspace.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              setShowInvite(true);
              setInviteError("");
              setInviteSuccess("");
            }}
            className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-gray-800"
          >
            + Invite Member
          </button>
        )}
      </div>

      {/* Invite Form */}
      {showInvite && (
        <form
          onSubmit={handleInvite}
          className="mb-5 rounded-xl border border-gray-200 bg-gray-50 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Invite a member
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Enter the email address of the person
                you want to invite.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowInvite(false)}
              className="text-xs text-gray-400 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>

          <div className="mt-4 flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="user@example.com"
              disabled={inviteLoading}
              className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
            />

            <button
              type="submit"
              disabled={
                inviteLoading ||
                !email.trim()
              }
              className="rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {inviteLoading
                ? "Inviting..."
                : "Invite"}
            </button>
          </div>

          {inviteError && (
            <p className="mt-2 text-xs text-red-500">
              {inviteError}
            </p>
          )}

          {inviteSuccess && (
            <p className="mt-2 text-xs text-green-600">
              {inviteSuccess}
            </p>
          )}
        </form>
      )}

      {/* Pending Invitations */}
      {isAdmin && (
        <div className="mb-5 w-full">
          <button
            type="button"
            onClick={() =>
              setInvitationsOpen(
                (current) => !current
              )
            }
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left transition hover:bg-gray-100"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-gray-800">
                  Pending Invitations
                </h3>

                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
                  {invitations.length}
                </span>
              </div>

              <p className="mt-1 text-xs text-gray-500">
                People who have been invited but
                haven't joined yet.
              </p>
            </div>

            <span className="text-sm text-gray-400">
              {invitationsOpen ? "▲" : "▼"}
            </span>
          </button>

          {invitationsOpen && (
            <div className="mt-2 overflow-hidden rounded-xl border border-gray-200">
              {invitationsLoading ? (
                <div className="p-5 text-center">
                  <p className="text-xs text-gray-500">
                    Loading invitations...
                  </p>
                </div>
              ) : invitations.length === 0 ? (
                <div className="p-5 text-center">
                  <p className="text-sm text-gray-500">
                    No pending invitations.
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Invitations will appear here
                    until they are accepted or
                    revoked.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation._id}
                      className="flex items-center justify-between gap-4 bg-white px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-800">
                          {invitation.invitedUser?.name ||
                            invitation.invitedEmail}
                        </p>

                        <p className="truncate text-xs text-gray-500">
                          {invitation.invitedUser?.email ||
                            invitation.invitedEmail}
                        </p>

                        <p className="mt-1 text-[11px] text-gray-400">
                          Expires{" "}
                          {new Date(
                            invitation.expiresAt
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleRevokeInvitation(
                            invitation._id
                          )
                        }
                        disabled={
                          revokeLoading ===
                          invitation._id
                        }
                        className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {revokeLoading ===
                        invitation._id
                          ? "Revoking..."
                          : "Revoke"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Members */}
      {members.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
          <p className="text-sm text-gray-500">
            No members found.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((member) => {
            /*
             * The user can either be:
             * - a populated user object
             * - a string user ID
             */
            const user =
              typeof member.user === "string"
                ? null
                : member.user;

            const online = isUserOnline(
              user?.lastSeen
            );

            return (
              <div
                key={member._id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 transition hover:border-gray-300 hover:shadow-sm"
              >
                <div className="flex min-w-0 items-center gap-3">

                  {/* Avatar + online indicator */}
                  <div className="relative">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-sm font-semibold text-gray-700">
                      {getInitial(member.user)}
                    </div>

                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                        online
                          ? "bg-emerald-500"
                          : "bg-gray-300"
                      }`}
                    />
                  </div>

                  {/* User information */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {getUserName(member.user)}
                      </p>

                      {online && (
                        <span className="shrink-0 text-[10px] font-medium text-emerald-600">
                          Online
                        </span>
                      )}
                    </div>

                    {getUserEmail(member.user) && (
                      <p className="truncate text-xs text-gray-500">
                        {getUserEmail(member.user)}
                      </p>
                    )}

                   {!online && user?.lastSeen && (
  <p className="mt-0.5 text-[10px] text-gray-400">
    Last seen {getLastSeenText(user.lastSeen)}
  </p>
)}
                  </div>
                </div>

                {/* Role */}
                <span
                  className={`ml-3 shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium capitalize ${
                    member.role === "admin"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {member.role}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}