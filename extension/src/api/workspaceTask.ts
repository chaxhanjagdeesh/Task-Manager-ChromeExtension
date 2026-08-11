import api from "./api";

function getToken(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["token"], (result) => {
      const token =
        typeof result.token === "string"
          ? result.token
          : "";

      resolve(token);
    });
  });
}

/**
 * Get all tasks visible to the current user
 * inside a workspace.
 */
export async function getWorkspaceTasks(
  workspaceId: string
) {
  const token = await getToken();

  const { data } = await api.get(
    `/workspaces/${workspaceId}/tasks`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data.tasks || [];
}

/**
 * Get one workspace task.
 */
export async function getWorkspaceTask(
  workspaceId: string,
  taskId: string
) {
  const token = await getToken();

  const { data } = await api.get(
    `/workspaces/${workspaceId}/tasks/${taskId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data.task;
}

/**
 * Create a new task.
 */
export async function createWorkspaceTask(
  workspaceId: string,
  task: {
  title: string;
  description?: string;
  participants: string[];
  priority?: "low" | "medium" | "high";
  dueDate?: string;
  }
) {
  const token = await getToken();

  const { data } = await api.post(
    `/workspaces/${workspaceId}/tasks`,
    task,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data.task;
}

/**
 * Update a task.
 *
 * Status can be changed by the assigned user.
 * Other task details will be controlled by the backend.
 */
export async function updateWorkspaceTask(
  workspaceId: string,
  taskId: string,
  updates: {
    title?: string;
    description?: string;
    status?: "pending" | "in_progress" | "completed";
    priority?: "low" | "medium" | "high";
    dueDate?: string | null;
    assignedTo?: string;
  }
) {
  const token = await getToken();

  const { data } = await api.put(
    `/workspaces/${workspaceId}/tasks/${taskId}`,
    updates,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data.task;
}

/**
 * Delete a task.
 */
export async function deleteWorkspaceTask(
  workspaceId: string,
  taskId: string
) {
  const token = await getToken();

  const { data } = await api.delete(
    `/workspaces/${workspaceId}/tasks/${taskId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
}