export const saveToken = (token: string) => {
  chrome.storage.local.set({ token });
};

export const getToken = (): Promise<string | null> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(["token"], (result) => {
      resolve(result.token || null);
    });
  });
};

export const removeToken = () => {
  chrome.storage.local.remove("token");
};