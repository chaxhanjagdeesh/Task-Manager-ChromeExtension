import api from "@/api/api";

export interface ChatUser {
  _id: string;
  name?: string;
  email?: string;
}

export interface WorkspaceMessage {
  _id: string;
  workspace: string;
  sender: ChatUser;
  content: string;
  createdAt: string;
  updatedAt: string;
}

async function getToken(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get("token", (result) => {
      resolve((result.token as string) || null);
    });
  });
}

export async function getWorkspaceMessages(
  workspaceId: string
): Promise<WorkspaceMessage[]> {
  const token = await getToken();

  const { data } = await api.get(
    `/workspaces/${workspaceId}/messages`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data?.messages || [];
}

export async function sendWorkspaceMessage(
  workspaceId: string,
  content: string
): Promise<WorkspaceMessage> {
  const token = await getToken();

  const { data } = await api.post(
    `/workspaces/${workspaceId}/messages`,
    {
      content,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data.message;
}