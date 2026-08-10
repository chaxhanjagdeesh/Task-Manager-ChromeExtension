import api from "./api";

export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  role: "admin" | "user";
}


export async function getMyWorkspaces(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["token"], async (result) => {
      try {
        const { data } = await api.get(
          "/workspaces",
          {
            headers: {
              Authorization: `Bearer ${result.token}`,
            },
          }
        );

        resolve(data.workspaces);
      } catch (err) {
        reject(err);
      }
    });
  });
}

export async function createWorkspace(workspace: {
  name: string;
  description?: string;
}): Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["token"], async (result) => {
      try {
        if (!result.token) {
          reject(new Error("Authentication token not found"));
          return;
        }

        const { data } = await api.post(
          "/workspaces",
          workspace,
          {
            headers: {
              Authorization: `Bearer ${result.token}`,
            },
          }
        );

        console.log(
          "POST /workspaces response:",
          data
        );

        resolve(data.workspace);
      } catch (err) {
        console.error(
          "Create workspace API error:",
          err
        );

        reject(err);
      }
    });
  });
}
export async function getWorkspace(workspaceId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["token"], async (result) => {
      try {
        const { data } = await api.get(
          `/workspaces/${workspaceId}`,
          {
            headers: {
              Authorization: `Bearer ${result.token}`,
            },
          }
        );

        resolve(data.workspace);
      } catch (err) {
        reject(err);
      }
    });
  });
}

export async function getWorkspaceTasks(
  workspaceId: string
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["token"], async (result) => {
      try {
        const { data } = await api.get(
          `/workspaces/${workspaceId}/tasks`,
          {
            headers: {
              Authorization: `Bearer ${result.token}`,
            },
          }
        );

        resolve(data.tasks);
      } catch (err) {
        reject(err);
      }
    });
  });
}

export async function getWorkspaceMembers(
  workspaceId: string
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["token"], async (result) => {
      try {
        const { data } = await api.get(
          `/workspaces/${workspaceId}/members`,
          {
            headers: {
              Authorization: `Bearer ${result.token}`,
            },
          }
        );

        resolve(data.members);
      } catch (err) {
        reject(err);
      }
    });
  });
}


export async function createInvitation(
  workspaceId: string,
  email: string
) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["token"], async (result) => {
      try {
        if (!result.token) {
          reject(
            new Error("Authentication token not found")
          );
          return;
        }

        const { data } = await api.post(
          `/workspaces/${workspaceId}/invitations`,
          { email },
          {
            headers: {
              Authorization: `Bearer ${result.token}`,
            },
          }
        );

        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  });
}


export async function getWorkspaceInvitations(
  workspaceId: string
) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["token"], async (result) => {
      try {
        if (!result.token) {
          reject(
            new Error("Authentication token not found")
          );
          return;
        }

        const { data } = await api.get(
          `/workspaces/${workspaceId}/invitations`,
          {
            headers: {
              Authorization: `Bearer ${result.token}`,
            },
          }
        );

        resolve(data.invitations);
      } catch (error) {
        reject(error);
      }
    });
  });
}


export async function revokeInvitation(
  workspaceId: string,
  invitationId: string
) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["token"], async (result) => {
      try {
        if (!result.token) {
          reject(
            new Error("Authentication token not found")
          );
          return;
        }

        const { data } = await api.delete(
          `/workspaces/${workspaceId}/invitations/${invitationId}`,
          {
            headers: {
              Authorization: `Bearer ${result.token}`,
            },
          }
        );

        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  });
}


export async function getMyInvitations() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["token"], async (result) => {
      try {
        const { data } = await api.get(
          "/workspaces/invitations",
          {
            headers: {
              Authorization: `Bearer ${result.token}`,
            },
          }
        );

        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  });
}


export async function acceptInvitation(
  invitationId: string
) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["token"], async (result) => {
      try {
        const { data } = await api.post(
          `/workspaces/invitations/${invitationId}/accept`,
          {},
          {
            headers: {
              Authorization: `Bearer ${result.token}`,
            },
          }
        );

        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  });
}


export async function rejectInvitation(
  invitationId: string
) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["token"], async (result) => {
      try {
        const { data } = await api.post(
          `/workspaces/invitations/${invitationId}/reject`,
          {},
          {
            headers: {
              Authorization: `Bearer ${result.token}`,
            },
          }
        );

        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  });
}