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

  async function loadInvitations() {
    if (!isAdmin) return;

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


  useEffect(() => {
    loadMembers();
    loadInvitations();
  }, [workspaceId, isAdmin]);

  async function handleRevokeInvitation(
    invitationId: string
  ) {
    try {
      setRevokeLoading(invitationId);

      await revokeInvitation(
        workspaceId,
        invitationId
      );

      // Immediately remove it from UI
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

  async function handleInvite(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

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

  useEffect(() => {
    loadMembers();
  }, [workspaceId]);

  async function loadMembers() {
    try {
      setLoading(true);
      setError("");

      const data = await getWorkspaceMembers(workspaceId);

      setMembers(data);
    } catch (error: any) {
      console.error(
        "Failed to load workspace members:",
        error
      );

      setError(
        error?.response?.data?.message ||
        "Failed to load members"
      );
    } finally {
      setLoading(false);
    }
  }

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

    return name
      .trim()
      .charAt(0)
      .toUpperCase();
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-gray-500">
          Loading members...
        </p>
      </div>
    );
  }

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
            className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-gray-800"
          >
            + Invite Member
          </button>
        )}
      </div>

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
                Enter the email address of the person you want
                to invite.
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
                inviteLoading || !email.trim()
              }
              className="rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
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

      {isAdmin && (
        <div className="mb-5 w-full">
          <button
            type="button"
            onClick={() =>
              setInvitationsOpen(
                (current) => !current
              )
            }
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left hover:bg-gray-100"
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
                People who have been invited but haven't
                joined yet.
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
                    Invitations will appear here until they
                    are accepted or revoked.
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
                        className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
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

      {/* Empty */}
      {members.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
          <p className="text-sm text-gray-500">
            No members found.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member._id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3"
            >
              <div className="flex min-w-0 items-center gap-3">

                {/* Avatar */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-700">
                  {getInitial(member.user)}
                </div>

                {/* User */}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {getUserName(member.user)}
                  </p>

                  {getUserEmail(member.user) && (
                    <p className="truncate text-xs text-gray-500">
                      {getUserEmail(member.user)}
                    </p>
                  )}
                </div>

              </div>

              {/* Role */}
              <span
                className={`ml-3 shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium capitalize ${member.role === "admin"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600"
                  }`}
              >
                {member.role}
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}