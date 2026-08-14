import api from "@/api/api";

export async function sendHeartbeat() {
  const token = await new Promise<string | null>((resolve) => {
    chrome.storage.local.get("token", (result) => {
      resolve((result.token as string) || null);
    });
  });

  if (!token) {
    return;
  }

  const { data } = await api.post(
    "/auth/heartbeat",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
}