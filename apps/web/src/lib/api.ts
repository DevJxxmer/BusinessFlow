const API_URL = "https://businessflow-zifa.onrender.com/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("accessToken") : null;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;

    try {
      const errorBody = await response.json();
      if (typeof errorBody?.message === "string") {
        message = errorBody.message;
      }
    } catch {
      // Ignore JSON parse errors and keep the fallback message.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const api = {
  auth: {
    login: (payload: { email: string; password: string }) => request<{ accessToken: string; user: { id: string; email: string; name: string; role: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
    register: (payload: { email: string; password: string; name: string }) => request<{ accessToken: string; user: { id: string; email: string; name: string; role: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  },
  businesses: {
    list: () => request<{ business: { id: string; name: string; slug: string } }[]>('/businesses'),
  },
};
