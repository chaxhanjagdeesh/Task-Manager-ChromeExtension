import { useEffect, useState } from "react";
import {
  acceptInvitation,
  getMyInvitations,
  rejectInvitation,
} from "@/api/workspace";

interface InvitationModalProps {
  onClose: () => void;
  onChanged?: () => void;
}

export default function InvitationModal({
  onClose,
  onChanged,
}: InvitationModalProps) {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(
    null
  );
  const [error, setError] = useState("");

  useEffect(() => {
    loadInvitations();
  }, []);

  async function loadInvitations() {
    try {
      setLoading(true);
      setError("");
      const data: any = await getMyInvitations();
      console.log("INVITATIONS:", data);
      const list = Array.isArray(data)
      ? data
      : data?.invitations || [];

      setInvitations(list);
    } catch (error: any) {
      console.error(
        "Failed to load invitations:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to load invitations"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(id: string) {
    try {
      setActionId(id);
      setError("");

      await acceptInvitation(id);

      setInvitations((current) =>
        current.filter(
          (invitation) =>
            invitation._id !== id
        )
      );

      onChanged?.();
    } catch (error: any) {
      console.error(
        "Failed to accept invitation:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to accept invitation"
      );
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(id: string) {
    try {
      setActionId(id);
      setError("");

      await rejectInvitation(id);

      setInvitations((current) =>
        current.filter(
          (invitation) =>
            invitation._id !== id
        )
      );

      onChanged?.();
    } catch (error: any) {
      console.error(
        "Failed to reject invitation:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to reject invitation"
      );
    } finally {
      setActionId(null);
    }
  }

  function getDaysRemaining(expiresAt: string) {
    if (!expiresAt) return null;

    const difference =
      new Date(expiresAt).getTime() -
      Date.now();

    return Math.max(
      0,
      Math.ceil(
        difference /
          (1000 * 60 * 60 * 24)
      )
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-[3px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        {/* Header */}
        <div className="relative overflow-hidden border-b border-gray-100 px-6 py-5">
          <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-gray-100" />

          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-900 text-lg text-white">
                🔔
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-gray-900">
                    Invitations
                  </h2>

                  {invitations.length > 0 && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                      {invitations.length} pending
                    </span>
                  )}
                </div>

                <p className="mt-0.5 text-xs text-gray-500">
                  Workspace invitations waiting for you
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="max-h-[430px] overflow-y-auto px-5 py-5">
          {loading ? (
            <div className="flex flex-col items-center py-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-xl">
                🔔
              </div>

              <p className="mt-4 text-sm font-medium text-gray-700">
                Loading invitations...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          ) : invitations.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-50 text-3xl">
                📨
              </div>

              <h3 className="mt-5 text-sm font-semibold text-gray-900">
                You're all caught up
              </h3>

              <p className="mt-1 max-w-[260px] text-xs leading-5 text-gray-400">
                You don't have any pending workspace
                invitations right now.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((invitation) => {
                const busy =
                  actionId === invitation._id;

                const daysRemaining =
                  getDaysRemaining(
                    invitation.expiresAt
                  );

                return (
                  <div
                    key={invitation._id}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:border-gray-300 hover:shadow-md"
                  >
                    <div className="h-1 bg-gray-900" />

                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-xl">
                          🏢
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="truncate text-sm font-semibold text-gray-900">
                                {invitation.workspace
                                  ?.name ||
                                  invitation.workspaceName ||
                                  "Workspace"}
                              </h3>

                              {invitation.workspace
                                ?.description && (
                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                                  {
                                    invitation
                                      .workspace
                                      .description
                                  }
                                </p>
                              )}
                            </div>

                            <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-500">
                              Pending
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center rounded-xl bg-gray-50 px-3 py-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs shadow-sm">
                          👤
                        </div>

                        <div className="ml-2 min-w-0">
                          <p className="text-[10px] text-gray-400">
                            Invitation from
                          </p>

                          <p className="truncate text-xs font-medium text-gray-700">
                            {invitation.invitedBy
                              ?.name ||
                              invitation.invitedBy
                                ?.email ||
                              invitation.inviter?.name ||
                              invitation.inviter?.email ||
                              "Workspace admin"}
                          </p>
                        </div>

                        {daysRemaining !== null && (
                          <div className="ml-auto text-right">
                            <p className="text-[10px] text-gray-400">
                              Expires
                            </p>

                            <p
                              className={`text-[10px] font-medium ${
                                daysRemaining <= 1
                                  ? "text-red-500"
                                  : "text-gray-500"
                              }`}
                            >
                              {daysRemaining === 0
                                ? "Today"
                                : `${daysRemaining} day${
                                    daysRemaining !==
                                    1
                                      ? "s"
                                      : ""
                                  }`}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            handleReject(
                              invitation._id
                            )
                          }
                          className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Decline
                        </button>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            handleAccept(
                              invitation._id
                            )
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                        >
                          {busy
                            ? "Processing..."
                            : "Join Workspace →"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 bg-gray-50/70 px-5 py-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-gray-400">
              Invitations expire after 7 days
            </p>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-[11px] font-medium text-gray-500 hover:bg-white hover:text-gray-700"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}