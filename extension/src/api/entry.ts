import api from "./api";

export async function getEntries(clientId: string) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["token"], async (result) => {
      try {
        const { data } = await api.get(
          `/entries/${clientId}`,
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


export async function createEntry(
  clientId: string,
  entry: any
) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["token"], async (result) => {
      try {
        const { data } = await api.post(
          `/entries/${clientId}`,
          entry,
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