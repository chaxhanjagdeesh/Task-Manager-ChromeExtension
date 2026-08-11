import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyWorkspaces,
  getMyInvitations,
} from "../api/workspace";
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
      const result = await getMyInvitations();

      const invitations = Array.isArray(result)
        ? result
        : (result as any)?.invitations || [];

      setInvitationCount(invitations.length);
    } catch (error) {
      console.error(
        "Failed to load invitation count:",
        error,
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
        error,
      );

      setError(
        error?.response?.data?.message ||
          "Failed to load workspaces",
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
{/* Large bottom-right green leaf decoration */}
<div
  className="pointer-events-none absolute bottom-0 right-0 z-0 h-[330px] w-[420px] overflow-hidden opacity-35"
  aria-hidden="true"
>
  <svg
    viewBox="0 0 420 330"
    className="absolute bottom-0 right-0 h-full w-full"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Main stems */}
    <path
      d="M420 330C355 260 325 205 260 160C195 115 120 85 35 20"
      stroke="#22c55e"
      strokeWidth="3"
      strokeLinecap="round"
    />

    <path
      d="M400 330C365 260 375 190 335 125C305 78 265 40 215 8"
      stroke="#16a34a"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    <path
      d="M340 330C285 255 225 225 155 190C100 162 55 120 12 65"
      stroke="#4ade80"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    <path
      d="M420 300C360 275 310 275 250 300"
      stroke="#22c55e"
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* Large leaves */}
    <path
      d="M305 225C270 190 268 160 282 140C315 153 329 187 305 225Z"
      fill="#22c55e"
    />

    <path
      d="M235 170C202 138 198 108 212 85C243 99 258 133 235 170Z"
      fill="#4ade80"
    />

    <path
      d="M160 118C126 94 120 65 133 43C165 54 180 88 160 118Z"
      fill="#16a34a"
    />

    <path
      d="M90 75C60 56 52 32 63 15C93 23 108 51 90 75Z"
      fill="#4ade80"
    />

    <path
      d="M330 265C365 235 392 236 410 253C389 280 356 285 330 265Z"
      fill="#16a34a"
    />

    <path
      d="M315 190C350 160 378 162 393 180C371 204 340 210 315 190Z"
      fill="#22c55e"
    />

    <path
      d="M285 105C318 78 345 81 358 98C338 122 308 125 285 105Z"
      fill="#4ade80"
    />

    <path
      d="M220 55C250 30 276 33 288 50C270 73 241 76 220 55Z"
      fill="#16a34a"
    />

    <path
      d="M180 205C145 180 116 183 102 202C124 227 157 229 180 205Z"
      fill="#22c55e"
    />

    <path
      d="M105 150C75 130 47 133 34 150C54 174 84 174 105 150Z"
      fill="#4ade80"
    />

    <path
      d="M55 105C31 89 12 91 2 105C18 124 41 124 55 105Z"
      fill="#16a34a"
    />

    {/* Small accent leaves */}
    <path
      d="M370 315C390 298 407 300 417 311C403 327 385 329 370 315Z"
      fill="#4ade80"
    />

    <path
      d="M250 285C225 267 204 270 195 284C211 302 234 302 250 285Z"
      fill="#16a34a"
    />
  </svg>
</div>
      {/* ================================================= */}
      {/* Decorative leaf pattern — bottom right */}
      {/* ================================================= */}

      

      {/* ================================================= */}
      {/* Header */}
      {/* ================================================= */}

      <div className="relative z-10 flex items-start justify-between">
  <div className="flex items-center gap-3">
    <img
      src="/worknestlogo.png"
      alt="Worknest"
      className="h-15 object-contain"
    />

    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
        Worknest Workspaces
      </h1>

      <p className="mt-1 text-sm text-gray-500">
        Manage your personal and team workspaces.
      </p>
    </div>
  </div>
</div>

      {/* ================================================= */}
      {/* Top right controls */}
      {/* ================================================= */}

      <div className="absolute right-6 top-6 z-20 flex items-center gap-2">

        {/* Profile */}
        <ProfileMenu />

        {/* Invitations */}
        <button
          type="button"
          onClick={() => setShowInvitations(true)}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
          title="Invitations"
        >
          <span className="text-lg">🔔</span>

          {invitationCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white shadow-sm">
              {invitationCount > 99
                ? "99+"
                : invitationCount}
            </span>
          )}
        </button>

      </div>

      {/* ================================================= */}
      {/* Main Workspace Actions */}
      {/* ================================================= */}

      <div className="relative z-10 mt-7 grid grid-cols-2 gap-4">

        {/* Personal Workspace */}
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="group rounded-2xl border border-gray-200 bg-white/95 p-5 text-left shadow-sm backdrop-blur-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
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
          onClick={() =>
            setShowCreateWorkspace(true)
          }
          className="group rounded-2xl border border-dashed border-gray-300 bg-white/90 p-5 text-left backdrop-blur-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-gray-400 hover:bg-white hover:shadow-md"
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

      {/* ================================================= */}
      {/* Team Workspaces */}
      {/* ================================================= */}

      <div className="relative z-10 mt-8">

        <div className="mb-3 flex items-center justify-between">

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
              Your Workspaces
            </h2>
          </div>

          {!loading &&
            workspaces.length > 0 && (
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
          <div className="flex h-32 items-center justify-center rounded-2xl border border-gray-200 bg-white/80">
            <p className="text-sm text-gray-500">
              Loading workspaces...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex h-32 flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/50">

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
            <div className="flex h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white/70">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm">
                👥
              </div>

              <p className="mt-3 text-sm font-medium text-gray-700">
                No team workspaces yet
              </p>

              <p className="mt-1 max-w-md text-center text-xs text-gray-400">
                Workspaces you create or are
                invited to will appear here.
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
                  className="group rounded-2xl border border-gray-200 bg-white/95 p-4 text-left shadow-sm backdrop-blur-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
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

      {/* ================================================= */}
      {/* Modals */}
      {/* ================================================= */}

      {showCreateWorkspace && (
        <CreateWorkspace
          onClose={() =>
            setShowCreateWorkspace(false)
          }
          onCreated={(workspace) => {
            console.log(
              "Workspace created successfully:",
              workspace,
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