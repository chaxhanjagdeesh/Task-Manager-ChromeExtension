import { useEffect, useState } from "react";
import { getWorkspaceTasks } from "../../api/workspace";

interface TaskUser {
  _id: string;
  name?: string;
  email?: string;
}

interface Task {
  _id: string;

  workspace: string;

  createdBy: TaskUser | string;

  participants: (TaskUser | string)[];

  title: string;

  description: string;

  status: "pending" | "in_progress" | "completed";

  priority: "low" | "medium" | "high";

  dueDate: string | null;

  createdAt?: string;
  updatedAt?: string;
}

interface WorkspaceTasksProps {
  workspaceId: string;
  onCreateTask: () => void;
}

export default function WorkspaceTasks({
  workspaceId,
  onCreateTask,
}: WorkspaceTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTasks();
  }, [workspaceId]);

  async function loadTasks() {
    try {
      setLoading(true);
      setError("");

      const data = await getWorkspaceTasks(workspaceId);

      setTasks(data);
    } catch (error: any) {
      console.error("Failed to load workspace tasks:", error);

      setError(
        error?.response?.data?.message ||
          "Failed to load tasks"
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading tasks...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-red-500">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">
            Tasks
          </h2>

          <p className="text-xs text-gray-500">
            Tasks you're involved in
          </p>
        </div>

        <button
  type="button"
  onClick={onCreateTask}
  className="rounded-md border px-3 py-1.5 text-xs hover:bg-gray-50"
>
  + New Task
</button>
      </div>

      {/* Empty state */}
      {tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="text-sm text-gray-500">
            No tasks yet.
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Tasks assigned to you or involving you will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="rounded-xl border bg-white p-4"
            >
              {/* Task title + status */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold">
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="mt-1 text-xs text-gray-500">
                      {task.description}
                    </p>
                  )}
                </div>

                <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-xs capitalize">
                  {task.status.replace("_", " ")}
                </span>
              </div>

              {/* Task information */}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                <span className="capitalize">
                  Priority: {task.priority}
                </span>

                <span>
                  {task.participants.length}{" "}
                  {task.participants.length === 1
                    ? "participant"
                    : "participants"}
                </span>

                {task.dueDate && (
                  <span>
                    Due:{" "}
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}