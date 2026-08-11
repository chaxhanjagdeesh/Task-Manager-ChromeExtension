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

export async function getProfile() {
  const token = await getToken();

  const { data } = await api.get("/user/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function updateProfile(user: {
  name: string;
  email: string;
}) {
  const token = await getToken();

  const { data } = await api.put(
    "/user/profile",
    user,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
}

export async function changePassword(passwords: {
  currentPassword: string;
  newPassword: string;
}) {
  const token = await getToken();

  const { data } = await api.put(
    "/user/password",
    passwords,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
}

export async function deleteAccount() {
  const token = await getToken();

  const { data } = await api.delete("/user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

