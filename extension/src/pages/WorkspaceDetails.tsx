import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import WorkspaceMembers from "../components/workspace/WorkspaceMembers";
import WorkspaceTasks from "../components/workspace/WorkspaceTasks";
import CreateWorkspaceTask from "../components/workspace/CreateWorkspaceTask";

import {
  getWorkspace,
  getWorkspaceMembers,
} from "../api/workspace";

interface Workspace {
  _id: string;
  name: string;
  description?: string;
  role: "admin" | "user";
}

interface WorkspaceMember {
  _id: string;
  user:
    | {
        _id: string;
        name?: string;
        email?: string;
      }
    | string;
  role: "admin" | "user";
}

export default function WorkspaceDetails() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    "tasks" | "notes" | "members"
  >("tasks");

  const [workspace, setWorkspace] =
    useState<Workspace | null>(null);

  const [members, setMembers] = useState<
    WorkspaceMember[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [showCreateTask, setShowCreateTask] =
    useState(false);

  /*
   * Load workspace
   */
  useEffect(() => {
    if (!workspaceId) return;

    loadWorkspace(workspaceId);
  }, [workspaceId]);

  /*
   * Load members for task creation.
   *
   * WorkspaceMembers has its own member loading,
   * but CreateWorkspaceTask also needs the member list.
   */
  useEffect(() => {
    if (!workspaceId) return;

    loadMembers(workspaceId);
  }, [workspaceId]);

  async function loadWorkspace(id: string) {
    try {
      setLoading(true);
      setError("");

      const data = await getWorkspace(id);

      setWorkspace(data);
    } catch (error: any) {
      console.error(
        "Failed to load workspace:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to load workspace"
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadMembers(id: string) {
    try {
      setMembersLoading(true);

      const data = await getWorkspaceMembers(id);

      setMembers(data);
    } catch (error) {
      console.error(
        "Failed to load workspace members:",
        error
      );

      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  }

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div className="box-border flex h-[580px] w-[760px] items-center justify-center overflow-hidden bg-white">
        <p className="text-sm text-gray-500">
          Loading workspace...
        </p>
      </div>
    );
  }

  /*
   * Error state
   */
  if (error || !workspace) {
    return (
      <div className="box-border flex h-[580px] w-[760px] flex-col items-center justify-center overflow-hidden bg-white">
        <p className="text-sm text-red-500">
          {error || "Workspace not found"}
        </p>

        <button
          type="button"
          onClick={() => navigate("/workspace")}
          className="mt-3 rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Back to Workspaces
        </button>
      </div>
    );
  }

  return (
    <div className="box-border flex h-[580px] w-[760px] min-w-0 flex-col overflow-hidden bg-white">

      {/* =========================
          Header
      ========================= */}
      <div className="flex w-full shrink-0 items-center justify-between border-b px-6 py-4">

        <div className="flex min-w-0 items-center gap-3">

          <button
            type="button"
            onClick={() => navigate("/workspace")}
            className="shrink-0 rounded-md px-2 py-1 text-sm hover:bg-gray-100"
          >
            ←
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-gray-900">
              {workspace.name}
            </h1>

            {workspace.description && (
              <p className="truncate text-xs text-gray-500">
                {workspace.description}
              </p>
            )}
          </div>

        </div>

        <span className="ml-4 shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs capitalize text-gray-600">
          {workspace.role}
        </span>

      </div>

      {/* =========================
          Workspace Navigation
      ========================= */}
      <div className="flex w-full shrink-0 border-b">

        <button
          type="button"
          onClick={() => setActiveTab("tasks")}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === "tasks"
              ? "border-b-2 border-gray-900 text-gray-900"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          Tasks
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("notes")}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === "notes"
              ? "border-b-2 border-gray-900 text-gray-900"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          Notes
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("members")}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === "members"
              ? "border-b-2 border-gray-900 text-gray-900"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          Members
        </button>

      </div>

      {/* =========================
          Main Content
      ========================= */}
      <div className="min-h-0 w-full min-w-0 flex-1 overflow-y-auto overflow-x-hidden">

        {/* Tasks */}
        {activeTab === "tasks" && (
          <div className="w-full min-w-0">
            <WorkspaceTasks
              workspaceId={workspace._id}
              onCreateTask={() =>
                setShowCreateTask(true)
              }
            />
          </div>
        )}

        {/* Notes */}
        {activeTab === "notes" && (
          <div className="w-full p-6 text-center">
            <p className="text-sm text-gray-500">
              Workspace notes coming next.
            </p>
          </div>
        )}

        {/* Members */}
        {activeTab === "members" && (
          <div className="w-full min-w-0">
            <WorkspaceMembers
              workspaceId={workspace._id}
              isAdmin={workspace.role === "admin"}
            />
          </div>
        )}

      </div>

      {/* =========================
          Create Task Modal
      ========================= */}
      {showCreateTask && (
        <CreateWorkspaceTask
          members={members}
          onClose={() =>
            setShowCreateTask(false)
          }
          onCreated={(task) => {
            console.log(
              "New task:",
              task
            );

            setShowCreateTask(false);
          }}
        />
      )}

    </div>
  );
}