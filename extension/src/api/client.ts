import api from "./api";

export const getClients = async () => {
  const token = await new Promise<string | null>((resolve) => {
    chrome.storage.local.get("token", (result) => {
      resolve(result.token || null);
    });
  });

  const { data } = await api.get("/clients", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};