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


export async function createClient(client: any) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["token"], async (result) => {
      try {
        const { data } = await api.post(
          "/clients",
          client,
          {
            headers: {
              Authorization: `Bearer ${result.token}`,
            },
          }
        );

        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  });
}