import { useEffect, useState } from "react";
import {
  acceptInvitation,
  getMyInvitations,
  rejectInvitation,
} from "../../api/workspace";

interface InvitationUser {
  _id: string;
  name?: string;
  email?: string;
}

interface InvitationWorkspace {
  _id: string;
  name: string;
  description?: string;
}

interface Invitation {
  _id: string;
  workspace: InvitationWorkspace;
  invitedBy: InvitationUser;
  invitedEmail?: string;
  status: "pending" | "accepted" | "rejected" | "expired";
  expiresAt: string;
  createdAt?: string;
}

interface InvitationModalProps {
  onClose: () => void;
  onInvitationChanged?: () => void;
}

export default function InvitationModal({
  onClose,
  onInvitationChanged,
}: InvitationModalProps) {
  const [invitations, setInvitations] =
    useState<Invitation[]>([]);

  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] =
    useState<string | null>(null);

  const [error, setError] = useState("");

  useEffect(() => {
    loadInvitations();
  }, []);

  async function loadInvitations() {
    try {
      setLoading(true);
      setError("");

      const result =
        await getMyInvitations();

      /*
       * Your backend may return:
       *
       * { invitations: [...] }
       *
       * or directly [...]
       *
       * Handle both.
       */
      const data =
        Array.isArray(result)
          ? result
          : (result as any)?.invitations || [];

      setInvitations(data);
    } catch (error: any) {
      console.error(
        "Failed to load invitations:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to load invitations."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(
    invitationId: string
  ) {
    try {
      setProcessingId(invitationId);
      setError("");

      await acceptInvitation(invitationId);

      setInvitations((current) =>
        current.filter(
          (invitation) =>
            invitation._id !== invitationId
        )
      );

      onInvitationChanged?.();
    } catch (error: any) {
      console.error(
        "Failed to accept invitation:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to accept invitation."
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(
    invitationId: string
  ) {
    try {
      setProcessingId(invitationId);
      setError("");

      await rejectInvitation(invitationId);

      setInvitations((current) =>
        current.filter(
          (invitation) =>
            invitation._id !== invitationId
        )
      );

      onInvitationChanged?.();
    } catch (error: any) {
      console.error(
        "Failed to reject invitation:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to reject invitation."
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-5">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Invitations
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              Workspace invitations waiting for you
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[420px] overflow-y-auto p-5">

          {loading && (
            <div className="py-10 text-center">
              <p className="text-sm text-gray-500">
                Loading invitations...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-lg bg-red-50 px-3 py-2">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

          {!loading &&
            !error &&
            invitations.length === 0 && (
              <div className="py-10 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
                  ✓
                </div>

                <p className="text-sm font-medium text-gray-900">
                  No pending invitations
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  You're all caught up.
                </p>
              </div>
            )}

          {!loading &&
            invitations.length > 0 && (
              <div className="space-y-3">
                {invitations.map(
                  (invitation) => {
                    const processing =
                      processingId ===
                      invitation._id;

                    return (
                      <div
                        key={invitation._id}
                        className="rounded-xl border border-gray-200 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">

                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">
                              {invitation.workspace
                                ?.name ||
                                "Workspace"}
                            </h3>

                            <p className="mt-1 text-xs text-gray-500">
                              Invited by{" "}
                              <span className="font-medium text-gray-700">
                                {invitation
                                  .invitedBy
                                  ?.name ||
                                  invitation
                                    .invitedBy
                                    ?.email ||
                                  "Workspace admin"}
                              </span>
                            </p>

                            {invitation
                              .workspace
                              ?.description && (
                              <p className="mt-2 text-xs text-gray-400">
                                {
                                  invitation
                                    .workspace
                                    .description
                                }
                              </p>
                            )}
                          </div>

                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={processing}
                            onClick={() =>
                              handleReject(
                                invitation._id
                              )
                            }
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Reject
                          </button>

                          <button
                            type="button"
                            disabled={processing}
                            onClick={() =>
                              handleAccept(
                                invitation._id
                              )
                            }
                            className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {processing
                              ? "Processing..."
                              : "Accept"}
                          </button>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
        </div>

      </div>
    </div>
  );
}