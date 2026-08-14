import { useEffect, useMemo, useRef, useState } from "react";
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
  participants: (User | string)[];
  createdBy: User | string;
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
  const [updatingTask, setUpdatingTask] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const tasksContainerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (!workspaceId) return;

    loadTasks();
  }, [workspaceId]);

  useEffect(() => {
    if (loading || tasks.length === 0) return;

    const scrollToBottom = () => {
      bottomRef.current?.scrollIntoView({
        behavior: "auto",
        block: "end",
      });
    };

    const timer1 = window.setTimeout(scrollToBottom, 50);
    const timer2 = window.setTimeout(scrollToBottom, 200);
    const timer3 = window.setTimeout(scrollToBottom, 500);

    return () => {
      window.clearTimeout(timer1);
      window.clearTimeout(timer2);
      window.clearTimeout(timer3);
    };
  }, [loading, tasks]);

  useEffect(() => {
    if (loading || tasks.length === 0) return;

    const container = tasksContainerRef.current;

    if (!container) return;

    const observer = new ResizeObserver(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "auto",
        block: "end",
      });
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
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

      const data = await getWorkspaceTasks(workspaceId);

      setTasks(data || []);
    } catch (error: any) {
      console.error("Failed to load workspace tasks:", error);

      setError(
        error?.response?.data?.message ||
          "Failed to load tasks",
      );
    } finally {
      setLoading(false);
    }
  }

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

    return currentUser._id || currentUser.id || "";
  }

  function getUserName(
    user: User | string | undefined | null,
  ) {
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

  function isMyTask(task: WorkspaceTask) {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      return false;
    }

    const creatorId = getUserId(task.createdBy);

    return creatorId === currentUserId;
  }

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

  const completedTasks = sortedTasks.filter(
    (task) => task.status === "completed",
  );

  const incompleteTasks = sortedTasks.filter(
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
        return "bg-gray-100 text-gray-500";
    }
  }

  function renderTask(
    task: WorkspaceTask,
  ) {
    const mine = isMyTask(task);
    const participant = isParticipant(task);
    const completed =
      task.status === "completed";
    const overdue = isOverdue(task);

    let cardClass = "";

    if (completed) {
      cardClass =
        "border-emerald-200 bg-emerald-50/90";
    } else if (overdue) {
      cardClass =
        "border-red-200 bg-red-50/90";
    } else if (mine) {
      cardClass =
        "border-blue-200 bg-blue-50/80";
    } else {
      cardClass =
        "border-purple-200 bg-purple-50/80";
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
                  : "Only assigned participants can complete this task"
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
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3
                  className={`text-xs font-semibold ${
                    completed
                      ? "text-emerald-700 line-through"
                      : "text-gray-900"
                  }`}
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
                      updatingTask === task._id
                    }
                    className="hidden text-[11px] text-gray-400 hover:text-red-500 group-hover:block"
                    title="Delete task"
                  >
                    ×
                  </button>
                )}
              </div>
              {task.description && (
                <p
                  className={`mt-0.5 text-[10px] leading-4 ${
                    completed
                      ? "text-emerald-700/60"
                      : "text-gray-600"
                  }`}
                >
                  {task.description}
                </p>
              )}
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
                          : "text-gray-400"
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
              {task.participants?.length > 0 && (
                <div className="mt-1.5 flex items-center gap-1 text-[9px] text-gray-500">
                  <span className="font-medium text-gray-600">
                    Assigned to:
                  </span>

                  <span className="truncate">
                    {task.participants
                      .map((person) =>
                        getUserName(person),
                      )
                      .join(", ")}
                  </span>
                </div>
              )}
              <div className="mt-0.5 text-[9px] text-gray-500">
                <span className="font-medium text-gray-600">
                  Assigned by:
                </span>{" "}
                {mine
                  ? "You"
                  : getUserName(
                      task.createdBy,
                    )}
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <span className="text-[8px] text-gray-400">
                  {formatDate(
                    task.createdAt,
                  )}
                </span>

                {completed && (
                  <span className="text-[8px] font-medium text-emerald-700/70">
                    ✓ Completed
                    {task.completedAt
                      ? ` · ${formatDate(
                          task.completedAt,
                        )}`
                      : ""}
                  </span>
                )}
              </div>
              {!participant &&
                !completed && (
                  <div className="mt-1 text-[8px] text-gray-400">
                    You are not assigned to this task.
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
      <div className="flex h-full min-h-[430px] items-center justify-center">
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
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between border-b px-5 py-3">
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
      {error && (
        <div className="mx-5 mt-2 flex shrink-0 items-center justify-between rounded-lg bg-red-50 px-3 py-2">
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
      <div
        ref={tasksContainerRef}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-4"
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
              Create a task and assign it to
              yourself or another workspace
              member.
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
            {completedTasks.length > 0 && (
              <section>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-600">
                    Completed
                  </span>

                  <div className="h-px flex-1 bg-emerald-100" />

                  <span className="text-[9px] text-emerald-600">
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
            <div
              ref={bottomRef}
              className="h-px w-full"
              aria-hidden="true"
            />
          </div>
        )}
      </div>
    </div>
  );
}