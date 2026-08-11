import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getWorkspaceTasks,
  updateWorkspaceTask,
  deleteWorkspaceTask,
} from "@/api/workspaceTask";

interface User {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
}

interface WorkspaceTask {
  _id: string;
  title: string;
  description?: string;

  createdBy: User | string;

  // IMPORTANT:
  // We use participants, not assignedTo.
  participants: (User | string)[];

  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";

  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;

  completedAt?: string | null;
}

interface WorkspaceTasksProps {
  workspaceId: string;
  onCreateTask: () => void;
}

export default function WorkspaceTasks({
  workspaceId,
  onCreateTask,
}: WorkspaceTasksProps) {
  const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingTask, setUpdatingTask] =
    useState<string | null>(null);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] =
    useState<User | null>(null);

  /*
   * Used to automatically scroll the task
   * conversation to the bottom.
   */
  const tasksContainerRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (!workspaceId) return;

    loadTasks();
  }, [workspaceId]);

  /*
   * Automatically scroll to the newest task.
   *
   * requestAnimationFrame makes sure the task
   * cards have already rendered before scrolling.
   */
  useEffect(() => {
    if (loading) return;

    const container = tasksContainerRef.current;

    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }, [loading, tasks.length]);

  async function loadCurrentUser() {
    chrome.storage.local.get(["user"], (result) => {
      if (result.user) {
        setCurrentUser(result.user);
      }
    });
  }

  async function loadTasks() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getWorkspaceTasks(workspaceId);

      setTasks(data || []);
    } catch (error: any) {
      console.error(
        "Failed to load workspace tasks:",
        error,
      );

      setError(
        error?.response?.data?.message ||
          "Failed to load tasks",
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Get an ID regardless of whether API returns:
   *
   * { _id: "..." }
   *
   * { id: "..." }
   *
   * or:
   *
   * "..."
   */
  function getUserId(
    user: User | string | undefined | null,
  ): string {
    if (!user) return "";

    if (typeof user === "string") {
      return user;
    }

    return user._id || user.id || "";
  }

  function getCurrentUserId(): string {
    if (!currentUser) return "";

    return (
      currentUser._id ||
      currentUser.id ||
      ""
    );
  }

  function getUserName(
    user: User | string | undefined | null,
  ): string {
    if (!user) {
      return "Unknown user";
    }

    if (typeof user === "string") {
      return "Workspace member";
    }

    return (
      user.name ||
      user.email ||
      "Workspace member"
    );
  }

  /*
   * Determines LEFT vs RIGHT.
   *
   * Created by me  -> RIGHT
   * Created by user -> LEFT
   */
  function isMyTask(task: WorkspaceTask) {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      return false;
    }

    const creatorId = getUserId(
      task.createdBy,
    );

    return creatorId === currentUserId;
  }

  /*
   * Check whether current user is included
   * in participants.
   */
  function isParticipant(task: WorkspaceTask) {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      return false;
    }

    return (task.participants || []).some(
      (participant) =>
        getUserId(participant) === currentUserId,
    );
  }

  /*
   * Only a participant can mark a task
   * completed/incomplete.
   */
  async function handleToggleComplete(
    task: WorkspaceTask,
  ) {
    if (!currentUser) return;

    if (!isParticipant(task)) {
      return;
    }

    try {
      setUpdatingTask(task._id);
      setError("");

      const newStatus =
        task.status === "completed"
          ? "pending"
          : "completed";

      const updatedTask =
        await updateWorkspaceTask(
          workspaceId,
          task._id,
          {
            status: newStatus,
          },
        );

      setTasks((previousTasks) =>
        previousTasks.map((item) =>
          item._id === task._id
            ? updatedTask
            : item,
        ),
      );
    } catch (error: any) {
      console.error(
        "Failed to update task:",
        error,
      );

      setError(
        error?.response?.data?.message ||
          "Failed to update task",
      );
    } finally {
      setUpdatingTask(null);
    }
  }

  /*
   * Only the creator can delete their task.
   */
  async function handleDelete(
    task: WorkspaceTask,
  ) {
    if (!currentUser) return;

    if (!isMyTask(task)) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this task?",
    );

    if (!confirmed) return;

    try {
      setUpdatingTask(task._id);
      setError("");

      await deleteWorkspaceTask(
        workspaceId,
        task._id,
      );

      setTasks((previousTasks) =>
        previousTasks.filter(
          (item) => item._id !== task._id,
        ),
      );
    } catch (error: any) {
      console.error(
        "Failed to delete task:",
        error,
      );

      setError(
        error?.response?.data?.message ||
          "Failed to delete task",
      );
    } finally {
      setUpdatingTask(null);
    }
  }

  /*
   * Completed tasks first.
   *
   * Incomplete tasks underneath.
   */
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (
        a.status === "completed" &&
        b.status !== "completed"
      ) {
        return -1;
      }

      if (
        a.status !== "completed" &&
        b.status === "completed"
      ) {
        return 1;
      }

      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      );
    });
  }, [tasks]);

  const completedTasks =
    sortedTasks.filter(
      (task) => task.status === "completed",
    );

  const incompleteTasks =
    sortedTasks.filter(
      (task) => task.status !== "completed",
    );

  function formatDate(
    date?: string | null,
  ) {
    if (!date) return null;

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return null;
    }

    return value.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function isOverdue(
    task: WorkspaceTask,
  ) {
    if (!task.dueDate) return false;

    if (task.status === "completed") {
      return false;
    }

    return (
      new Date(task.dueDate).getTime() <
      Date.now()
    );
  }

  function priorityClass(
    priority: WorkspaceTask["priority"],
  ) {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";

      case "medium":
        return "bg-amber-100 text-amber-700";

      case "low":
        return "bg-emerald-100 text-emerald-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  /*
   * Get initials for participant avatar.
   */
  function getInitials(
    user: User | string | undefined | null,
  ) {
    const name = getUserName(user);

    if (!name) return "?";

    const parts = name
      .trim()
      .split(/\s+/);

    if (parts.length >= 2) {
      return (
        parts[0][0] +
        parts[parts.length - 1][0]
      ).toUpperCase();
    }

    return name
      .slice(0, 1)
      .toUpperCase();
  }

  /*
   * Render the people assigned to the task.
   */
  function renderParticipants(
    task: WorkspaceTask,
  ) {
    const participants =
      task.participants || [];

    if (participants.length === 0) {
      return null;
    }

    const visibleParticipants =
      participants.slice(0, 3);

    const remaining =
      participants.length - 3;

    return (
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] font-medium text-gray-500">
          Assigned to
        </span>

        <div className="flex -space-x-1">
          {visibleParticipants.map(
            (person, index) => (
              <div
                key={`${getUserId(
                  person,
                )}-${index}`}
                title={getUserName(person)}
                className="flex h-4 w-4 items-center justify-center rounded-full border border-white bg-gray-200 text-[7px] font-semibold text-gray-600"
              >
                {getInitials(person)}
              </div>
            ),
          )}
        </div>

        <span className="max-w-[180px] truncate text-[9px] text-gray-500">
          {participants
            .map((person) =>
              getUserName(person),
            )
            .join(", ")}

          {remaining > 0
            ? ` +${remaining}`
            : ""}
        </span>
      </div>
    );
  }

  function renderTask(
    task: WorkspaceTask,
  ) {
    const mine = isMyTask(task);
    const participant =
      isParticipant(task);
    const completed =
      task.status === "completed";
    const overdue = isOverdue(task);

    /*
     * Color hierarchy:
     *
     * Completed -> Green
     * Overdue   -> Red
     * Mine      -> Blue
     * Others    -> Purple
     */
    let cardClass = "";
    let titleClass = "";

    if (completed) {
      cardClass =
        "border-emerald-200 bg-emerald-50/80";
      titleClass =
        "text-emerald-800 line-through";
    } else if (overdue) {
      cardClass =
        "border-red-200 bg-red-50/80";
      titleClass = "text-red-800";
    } else if (mine) {
      cardClass =
        "border-blue-200 bg-blue-50/70";
      titleClass = "text-blue-900";
    } else {
      cardClass =
        "border-purple-200 bg-purple-50/70";
      titleClass = "text-purple-900";
    }

    return (
      <div
        key={task._id}
        className={`flex w-full ${
          mine
            ? "justify-end"
            : "justify-start"
        }`}
      >
        <div
          className={`group relative w-[60%] rounded-xl border px-3 py-2.5 shadow-sm transition ${cardClass}`}
        >
          <div className="flex items-start gap-2.5">
            {/* Checkbox */}
            <button
              type="button"
              disabled={
                !participant ||
                updatingTask === task._id
              }
              onClick={() =>
                handleToggleComplete(task)
              }
              title={
                participant
                  ? completed
                    ? "Mark incomplete"
                    : "Mark completed"
                  : "Only participants can complete this task"
              }
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                completed
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : participant
                    ? "border-gray-300 bg-white hover:border-gray-500"
                    : "cursor-not-allowed border-gray-200 bg-gray-100"
              }`}
            >
              {completed && (
                <span className="text-[9px]">
                  ✓
                </span>
              )}
            </button>

            {/* Content */}
            <div className="min-w-0 flex-1">
              {/* Title */}
              <div className="flex items-start justify-between gap-2">
                <h3
                  className={`text-xs font-semibold ${titleClass}`}
                >
                  {task.title}
                </h3>

                {mine && (
                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(task)
                    }
                    disabled={
                      updatingTask ===
                      task._id
                    }
                    className="hidden text-[11px] text-gray-400 hover:text-red-500 group-hover:block"
                    title="Delete task"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Description */}
              {task.description && (
                <p
                  className={`mt-0.5 text-[10px] leading-4 ${
                    completed
                      ? "text-emerald-700"
                      : overdue
                        ? "text-red-700"
                        : mine
                          ? "text-blue-700"
                          : "text-purple-700"
                  }`}
                >
                  {task.description}
                </p>
              )}

              {/* Metadata */}
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium capitalize ${priorityClass(
                    task.priority,
                  )}`}
                >
                  {task.priority}
                </span>

                {task.dueDate && (
                  <span
                    className={`text-[9px] ${
                      overdue
                        ? "font-semibold text-red-600"
                        : completed
                          ? "text-emerald-600"
                          : "text-gray-500"
                    }`}
                  >
                    {overdue
                      ? "Overdue · "
                      : "Due · "}

                    {formatDate(
                      task.dueDate,
                    )}
                  </span>
                )}
              </div>

              {/* Assignment information */}
              <div className="mt-2 space-y-1 border-t border-black/5 pt-1.5">
                {/* Assigned To */}
                {renderParticipants(task)}

                {/* Assigned By */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-medium text-gray-500">
                    Assigned by
                  </span>

                  <div className="flex items-center gap-1">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-[7px] font-semibold text-gray-600">
                      {getInitials(
                        task.createdBy,
                      )}
                    </div>

                    <span className="max-w-[150px] truncate text-[9px] text-gray-500">
                      {mine
                        ? "You"
                        : getUserName(
                            task.createdBy,
                          )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timestamp */}
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[8px] text-gray-400">
                  {formatDate(
                    task.createdAt,
                  )}
                </span>

                {completed && (
                  <span className="text-[8px] font-medium text-emerald-600">
                    ✓ Completed
                    {task.completedAt
                      ? ` · ${formatDate(
                          task.completedAt,
                        )}`
                      : ""}
                  </span>
                )}
              </div>

              {/* Not assigned to current user */}
              {!participant &&
                !completed && (
                  <div className="mt-1 text-[8px] text-gray-400">
                    You are not assigned to
                    this task.
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-700" />

          <p className="mt-2 text-xs text-gray-500">
            Loading tasks...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[430px] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Tasks
          </h2>

          <p className="mt-0.5 text-[10px] text-gray-400">
            {tasks.length}{" "}
            {tasks.length === 1
              ? "task"
              : "tasks"}
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateTask}
          className="rounded-lg bg-gray-900 px-3 py-1.5 text-[11px] font-medium text-white transition hover:bg-gray-800"
        >
          + New Task
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-5 mt-2 flex items-center justify-between rounded-lg bg-red-50 px-3 py-2">
          <p className="text-[10px] text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-xs text-red-400"
          >
            ×
          </button>
        </div>
      )}

      {/* Task area */}
      <div
        ref={tasksContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        {tasks.length === 0 ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xl">
              ✓
            </div>

            <h3 className="mt-3 text-sm font-semibold text-gray-800">
              No tasks yet
            </h3>

            <p className="mt-1 max-w-xs text-[11px] leading-5 text-gray-400">
              Create a task and assign it
              to yourself or another
              workspace member.
            </p>

            <button
              type="button"
              onClick={onCreateTask}
              className="mt-3 rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
            >
              Create your first task
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Completed */}
            {completedTasks.length > 0 && (
              <section>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-600">
                    Completed
                  </span>

                  <div className="h-px flex-1 bg-gray-100" />

                  <span className="text-[9px] text-gray-400">
                    {completedTasks.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {completedTasks.map(
                    renderTask,
                  )}
                </div>
              </section>
            )}

            {/* Pending */}
            {incompleteTasks.length > 0 && (
              <section>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">
                    Pending
                  </span>

                  <div className="h-px flex-1 bg-gray-100" />

                  <span className="text-[9px] text-gray-400">
                    {incompleteTasks.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {incompleteTasks.map(
                    renderTask,
                  )}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}