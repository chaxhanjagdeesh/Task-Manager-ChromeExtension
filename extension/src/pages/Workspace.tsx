import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyWorkspaces, getMyInvitations } from "../api/workspace";
import CreateWorkspace from "../components/workspace/CreateWorkspace";
import InvitationModal from "../components/workspace/InvitationModal";
import ProfileMenu from "../components/ProfileMenu";
interface Workspace {
  _id: string;
  name: string;
  description?: string;
  role: "admin" | "user";
}

export default function Workspace() {
  const navigate = useNavigate();
  const [showCreateWorkspace, setShowCreateWorkspace] =
    useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showInvitations, setShowInvitations] =
    useState(false);

  const [invitationCount, setInvitationCount] =
    useState(0);


  async function loadInvitationCount() {
    try {
      const result =
        await getMyInvitations();

      const invitations =
        Array.isArray(result)
          ? result
          : (result as any)?.invitations || [];

      setInvitationCount(invitations.length);
    } catch (error) {
      console.error(
        "Failed to load invitation count:",
        error
      );

      setInvitationCount(0);
    }
  }



  async function loadWorkspaces() {
    try {
      setLoading(true);
      setError("");

      const data = await getMyWorkspaces();

      setWorkspaces(data);
    } catch (error: any) {
      console.error(
        "Failed to load workspaces:",
        error
      );

      setError(
        error?.response?.data?.message ||
        "Failed to load workspaces"
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadInvitationCount();
    loadWorkspaces();
  }, []);
  function openWorkspace(workspaceId: string) {
    navigate(`/workspace/${workspaceId}`);
  }

  function getInitial(name: string) {
    return name.trim().charAt(0).toUpperCase();
  }

    return (
      <div className="relative box-border h-[580px] w-[760px] overflow-hidden bg-white px-6 py-6">

        {/* ------------------------------------------------ */}
        {/* Header */}
        {/* ------------------------------------------------ */}

        <div className="flex items-start justify-between">

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Workspaces
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your personal and team workspaces.
            </p>
          </div>

        </div>
        <div className="absolute right-6 top-6 z-20 flex items-center gap-2">
    {/* Profile */}
    <ProfileMenu />

    {/* Invitations */}
    <button
      type="button"
      onClick={() => setShowInvitations(true)}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
      title="Invitations"
    >
      <span className="text-lg">🔔</span>

      {invitationCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
          {invitationCount > 99 ? "99+" : invitationCount}
        </span>
      )}
    </button>
  </div>
        {/* ------------------------------------------------ */}
        {/* Main Workspace Actions */}
        {/* ------------------------------------------------ */}

        <div className="mt-7 grid grid-cols-2 gap-4">

          {/* Personal Workspace */}
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="group rounded-2xl border border-gray-200 bg-white p-5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-sm"
          >
            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xl">
                📝
              </div>

              <div className="min-w-0">
                <h2 className="text-base font-semibold text-gray-900">
                  Personal Workspace
                </h2>

                <p className="mt-1 text-sm leading-5 text-gray-500">
                  Your personal notes and tasks
                </p>
              </div>

            </div>

            <div className="mt-5 text-xs font-medium text-gray-400 transition group-hover:text-gray-600">
              Open workspace →
            </div>
          </button>

          {/* Create Workspace */}
          <button
            type="button"
            onClick={() => setShowCreateWorkspace(true)}
            className="group rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-gray-400 hover:bg-gray-50 hover:shadow-sm"
          >
            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-xl">
                +
              </div>

              <div className="min-w-0">
                <h2 className="text-base font-semibold text-gray-900">
                  Create Workspace
                </h2>

                <p className="mt-1 text-sm leading-5 text-gray-500">
                  Create a workspace for your team
                </p>
              </div>

            </div>

            <div className="mt-5 text-xs font-medium text-gray-400 transition group-hover:text-gray-600">
              Create workspace →
            </div>
          </button>

        </div>

        {/* ------------------------------------------------ */}
        {/* Team Workspaces */}
        {/* ------------------------------------------------ */}

        <div className="mt-8">

          <div className="mb-3 flex items-center justify-between">

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                Your Workspaces
              </h2>
            </div>

            {!loading && workspaces.length > 0 && (
              <span className="text-xs text-gray-400">
                {workspaces.length}{" "}
                {workspaces.length === 1
                  ? "workspace"
                  : "workspaces"}
              </span>
            )}

          </div>

          {/* Loading */}
          {loading && (
            <div className="flex h-32 items-center justify-center rounded-2xl border border-gray-200">
              <p className="text-sm text-gray-500">
                Loading workspaces...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex h-32 flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/30">

              <p className="text-sm text-red-500">
                {error}
              </p>

              <button
                type="button"
                onClick={loadWorkspaces}
                className="mt-3 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
              >
                Try again
              </button>

            </div>
          )}

          {/* Empty */}
          {!loading &&
            !error &&
            workspaces.length === 0 && (
              <div className="flex h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm">
                  👥
                </div>

                <p className="mt-3 text-sm font-medium text-gray-700">
                  No team workspaces yet
                </p>

                <p className="mt-1 max-w-md text-center text-xs text-gray-400">
                  Workspaces you create or are invited to will appear here.
                </p>

              </div>
            )}

          {/* Workspace Grid */}
          {!loading &&
            !error &&
            workspaces.length > 0 && (
              <div className="grid grid-cols-2 gap-4">

                {workspaces.map((workspace) => (
                  <button
                    key={workspace._id}
                    type="button"
                    onClick={() =>
                      openWorkspace(workspace._id)
                    }
                    className="group rounded-2xl border border-gray-200 bg-white p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-sm"
                  >

                    <div className="flex items-start gap-3">

                      {/* Workspace icon */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-sm font-semibold text-gray-700">
                        {getInitial(workspace.name)}
                      </div>

                      <div className="min-w-0 flex-1">

                        {/* Name + role */}
                        <div className="flex items-start justify-between gap-2">

                          <h3 className="truncate text-sm font-semibold text-gray-900">
                            {workspace.name}
                          </h3>

                          <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium capitalize text-gray-500">
                            {workspace.role}
                          </span>

                        </div>

                        {/* Description */}
                        {workspace.description ? (
                          <p className="mt-1 line-clamp-2 text-xs leading-4 text-gray-500">
                            {workspace.description}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-gray-400">
                            Team workspace
                          </p>
                        )}

                      </div>

                    </div>

                    {/* Open */}
                    <div className="mt-4 text-xs font-medium text-gray-400 transition group-hover:text-gray-700">
                      Open workspace →
                    </div>

                  </button>
                ))}

              </div>
            )}

        </div>
        {showCreateWorkspace && (
          <CreateWorkspace
            onClose={() => setShowCreateWorkspace(false)}
            onCreated={(workspace) => {
              console.log(
                "Workspace created successfully:",
                workspace
              );

              setShowCreateWorkspace(false);

              loadWorkspaces();
            }}
          />
        )}

        {showInvitations && (
  <InvitationModal
    onClose={() =>
      setShowInvitations(false)
    }
    onChanged={() => {
      loadInvitationCount();
      loadWorkspaces();
    }}
  />
)}
      </div>
    );
}